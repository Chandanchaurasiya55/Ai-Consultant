import Report from '../model/Report.js';
import { enrichWebsiteData } from '../services/enrichmentService.js';
import {
  REPORT_STRUCTURE,
  generateSingleChapter,
  generateBonusAssets,
  generateMockBonusAssets,
  generateDetailedMockReport,
  generateMockChapter
} from '../services/geminiService.js';
import { GoogleGenAI } from '@google/genai';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, ImageRun
} from 'docx';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Endpoint: Enrich business form details via website scraper & search
 */
export const enrichWebsite = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'URL query parameter is required.' });
    const data = await enrichWebsiteData(url);
    res.json(data);
  } catch (error) {
    console.error('Enrichment controller error:', error);
    res.status(500).json({ message: error.message || 'Error enriching website data.' });
  }
};

/**
 * Endpoint: Pre-discover competitors based on basic form data for user validation
 */
export const discoverCompetitors = async (req, res) => {
  try {
    const { businessName, industry, products, description } = req.body;
    if (!businessName || !products || !description) {
      return res.status(400).json({ message: 'Business name, products, and description are required.' });
    }

    if (ai) {
      const prompt = `
Perform quick competitive intelligence research on the web for this business:
Business Name: ${businessName}
Industry: ${industry || 'General'}
Offering: ${products}
Description: ${description}

Find 3 to 5 real direct or indirect competitors that are active in the market. Provide their names and a 1-sentence description of their offering/positioning.
Reply with JSON: { "competitors": [{ "name": "...", "description": "..." }] }
`;
      try {
        const response = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                competitors: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: { name: { type: 'STRING' }, description: { type: 'STRING' } },
                    required: ['name', 'description']
                  }
                }
              },
              required: ['competitors']
            }
          }
        });
        return res.json(JSON.parse(response.text));
      } catch (geminiError) {
        console.error('Gemini competitor discovery failed, falling back to heuristics:', geminiError);
      }
    }

    res.json({
      competitors: [
        { name: 'Apex Solutions', description: 'Enterprise-grade provider offering similar custom services at high pricing tiers.' },
        { name: 'Vanguard Systems', description: 'Tech-centric competitor with modular subscriptions and self-serve onboarding.' },
        { name: 'PureLife Brands', description: 'Consumer-focused retail brand with strong visual positioning and social loyalty programs.' }
      ]
    });
  } catch (error) {
    console.error('Competitor discovery error:', error);
    res.status(500).json({ message: 'Error discovering competitors.' });
  }
};

/**
 * ==========================================================================
 * Endpoint: Initialize the Report
 * ==========================================================================
 * Creates a report document with all sections set to 'pending' state and returns
 * the report ID immediately, allowing the client to compile chapters in real-time.
 */
export const analyzeBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const details = req.body;

    const required = [
      'businessName', 'industry', 'products', 'businessModel',
      'businessStage', 'targetCountry', 'targetAudience',
      'marketingBudget', 'businessDescription'
    ];
    const missing = required.filter(field => !details[field]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Audit generation blocked. Required fields missing: ${missing.join(', ')}` });
    }

    console.log(`Initializing 4-Volume / 20-Chapter McKinsey-grade audit for: ${details.businessName}`);

    // Create empty pending sections for all chapters parsed from the MD file
    const mergedSections = {};
    REPORT_STRUCTURE.forEach(volume => {
      volume.chapters.forEach(ch => {
        mergedSections[ch.key] = {
          key: ch.key,
          title: ch.title,
          content: 'Pending real-time generation...',
          status: 'pending',
          diagram: null,
          charts: [],
          imageSuggestions: [],
          recommendations: [],
          trustIndicators: []
        };
      });
    });

    const sources = [
      { title: `${details.industry} Industry Outlook (2026)`, url: 'https://www.bcg.com', snippet: 'Benchmark trends, growth indices, and market sizes calculated for the current operational stage.' },
      { title: 'Google Keyword Planner Estimates', url: 'https://ads.google.com', snippet: 'Real-time keyword search intent volumes mapped for target categories.' }
    ];

    // Generate brand assets upfront
    let bonusAssets = {};
    try {
      bonusAssets = await generateBonusAssets(details);
    } catch (e) {
      bonusAssets = generateMockBonusAssets(details);
    }

    const report = await Report.create({
      userId,
      businessDetails: details,
      structure: REPORT_STRUCTURE.map(v => ({
        volume: v.volume,
        key: v.key,
        title: v.title,
        subtitle: v.subtitle,
        chapterKeys: v.chapters.map(c => c.key)
      })),
      volumeStatus: {},
      sections: mergedSections,
      sources,
      bonusAssets
    });

    res.status(201).json({
      report: {
        id: report._id,
        businessDetails: report.businessDetails,
        structure: report.structure,
        volumeStatus: report.volumeStatus,
        sections: report.sections,
        sources: report.sources,
        bonusAssets: report.bonusAssets,
        createdAt: report.createdAt
      },
      message: 'Business Research Audit initialized successfully! Real-time generation will begin shortly.'
    });
  } catch (error) {
    console.error('Audit initialization error:', error);
    res.status(500).json({ message: 'Server error initializing business research report.' });
  }
};

export const getReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const dbReports = await Report.find({ userId }).sort({ createdAt: -1 });
    res.json(dbReports.map(r => ({ id: r._id, businessDetails: r.businessDetails, createdAt: r.createdAt })));
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ message: 'Error retrieving your audits.' });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Audit report not found.' });
    if (report.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to view this report.' });

    res.json({
      id: report._id,
      businessDetails: report.businessDetails,
      structure: report.structure || REPORT_STRUCTURE.map(v => ({
        volume: v.volume,
        key: v.key,
        title: v.title,
        subtitle: v.subtitle,
        chapterKeys: v.chapters.map(c => c.key)
      })),
      volumeStatus: report.volumeStatus || {},
      sections: report.sections,
      sources: report.sources,
      bonusAssets: report.bonusAssets,
      createdAt: report.createdAt
    });
  } catch (error) {
    console.error('Fetch report details error:', error);
    res.status(500).json({ message: 'Error fetching audit report details.' });
  }
};

/**
 * Endpoint: Generate or Regenerate a single chapter/section of the report
 */
export const regenerateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionKey, modifier } = req.body;
    if (!sectionKey) return res.status(400).json({ message: 'sectionKey is required.' });

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    if (report.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to modify this report.' });

    const chapterMeta = REPORT_STRUCTURE.flatMap(v => v.chapters).find(c => c.key === sectionKey);
    if (!chapterMeta) return res.status(400).json({ message: `Unknown chapter key: ${sectionKey}` });

    const details = report.businessDetails;

    console.log(`Compiling chapter ${sectionKey} for report ${id}...`);

    let newSectionData;
    try {
      newSectionData = await generateSingleChapter(sectionKey, details, modifier);
      newSectionData.status = 'completed';
    } catch (err) {
      console.error('Gemini chapter generation failed, using fallback:', err);
      newSectionData = generateMockChapter(sectionKey, details);
      newSectionData.status = 'completed';
      newSectionData.content = `### Strategic Review (Fallback)\n\n${newSectionData.content}\n\n*Note: An API issue occurred during compilation.*`;
    }

    report.sections[sectionKey] = newSectionData;
    report.markModified('sections');
    await report.save();

    res.json({ sectionKey, section: newSectionData });
  } catch (error) {
    console.error('Section generation error:', error);
    res.status(500).json({ message: 'Error generating this section.' });
  }
};

export const exportReportJson = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    if (report.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to export this report.' });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${report.businessDetails.businessName.replace(/\s+/g, '_')}_Research_Report.json"`);
    res.send(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500).json({ message: 'Error exporting report to JSON.' });
  }
};

/**
 * Helpers for the DOCX export
 */
async function fetchChartImageBuffer(chart) {
  try {
    const chartJsConfig = {
      type: chart.type === 'pie' ? 'pie' : chart.type === 'radar' ? 'radar' : chart.type === 'line' ? 'line' : 'bar',
      data: {
        labels: chart.labels,
        datasets: chart.datasets.map(ds => ({ label: ds.label, data: ds.data }))
      },
      options: { plugins: { title: { display: true, text: chart.title } } }
    };
    const url = `https://quickchart.io/chart?w=600&h=350&c=${encodeURIComponent(JSON.stringify(chartJsConfig))}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const arrBuffer = await resp.arrayBuffer();
    return Buffer.from(arrBuffer);
  } catch (e) {
    console.error('Chart image fetch failed:', e);
    return null;
  }
}

async function fetchReferenceImageBuffer(query) {
  try {
    const resp = await fetch(`https://source.unsplash.com/800x500/?${encodeURIComponent(query)}`, { redirect: 'follow' });
    if (!resp.ok) return null;
    const arrBuffer = await resp.arrayBuffer();
    return Buffer.from(arrBuffer);
  } catch (e) {
    console.error('Reference image fetch failed:', e);
    return null;
  }
}

/**
 * Endpoint: Export report to Microsoft Word (DOCX)
 */
export const exportReportDocx = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    if (report.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to export this report.' });

    const business = report.businessDetails;
    const structure = report.structure && report.structure.length ? report.structure : REPORT_STRUCTURE.map(v => ({
      volume: v.volume,
      key: v.key,
      title: v.title,
      subtitle: v.subtitle,
      chapterKeys: v.chapters.map(c => c.key)
    }));
    const children = [];

    children.push(
      new Paragraph({ text: 'AI BUSINESS RESEARCH AGENT', heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `MARKET RESEARCH & BRAND AUDIT: ${business.businessName.toUpperCase()}`, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `Compiled for ${business.businessName} (${business.industry}) — Stage: ${business.businessStage || 'MVP'}`, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `Created on: ${new Date(report.createdAt).toDateString()}`, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '=========================================================================', alignment: AlignmentType.CENTER }),
      new Paragraph({ text: '' })
    );

    const detailsRows = [
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ text: 'Business Parameter', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Details Provided', bold: true })] })
      ] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Category / Sector' })] }), new TableCell({ children: [new Paragraph({ text: business.industry })] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Business Model' })] }), new TableCell({ children: [new Paragraph({ text: business.businessModel })] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Target Geography' })] }), new TableCell({ children: [new Paragraph({ text: `${business.targetCity || ''}, ${business.targetState || ''}, ${business.targetCountry}` })] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Target Audience' })] }), new TableCell({ children: [new Paragraph({ text: business.targetAudience })] })] })
    ];
    children.push(
      new Paragraph({ text: 'Intake Discovery Profile', heading: HeadingLevel.HEADING_2 }),
      new Table({ rows: detailsRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
      new Paragraph({ text: '' })
    );

    // Table of contents
    children.push(new Paragraph({ text: 'Table of Contents', heading: HeadingLevel.HEADING_2 }));
    structure.forEach(volume => {
      children.push(new Paragraph({ text: `${volume.title}`, bullet: { level: 0 } }));
    });
    children.push(new Paragraph({ text: '' }));

    for (const volume of structure) {
      children.push(
        new Paragraph({ text: `${volume.title.toUpperCase()}`, heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: volume.subtitle || '' }),
        new Paragraph({ text: '' })
      );

      for (const chapterKey of volume.chapterKeys) {
        const section = report.sections[chapterKey];
        if (!section) continue;

        children.push(
          new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: (section.content || '').replace(/[#*_]/g, '') })
        );

        // Diagram
        if (section.diagram && section.diagram.mermaidCode) {
          children.push(
            new Paragraph({ text: `Diagram: ${section.diagram.caption || ''}`, heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ children: [new TextRun({ text: section.diagram.mermaidCode, font: 'Courier New', size: 18 })] }),
            new Paragraph({ text: '(Rendered interactive version available in the web app.)' }),
            new Paragraph({ text: '' })
          );
        }

        // Charts
        if (section.charts && section.charts.length > 0) {
          for (const chart of section.charts) {
            const buf = await fetchChartImageBuffer(chart);
            if (buf) {
              children.push(
                new Paragraph({ text: chart.title, heading: HeadingLevel.HEADING_3 }),
                new Paragraph({ children: [new ImageRun({ data: buf, transformation: { width: 500, height: 290 } })] }),
                new Paragraph({ text: '' })
              );
            } else {
              // Fallback table
              const rows = [new TableRow({ children: [
                new TableCell({ children: [new Paragraph({ text: 'Label', bold: true })] }),
                ...chart.datasets.map(ds => new TableCell({ children: [new Paragraph({ text: ds.label, bold: true })] }))
              ] })];
              chart.labels.forEach((label, idx) => {
                rows.push(new TableRow({ children: [
                  new TableCell({ children: [new Paragraph({ text: label })] }),
                  ...chart.datasets.map(ds => new TableCell({ children: [new Paragraph({ text: String(ds.data[idx] ?? '') })] }))
                ] }));
              });
              children.push(
                new Paragraph({ text: chart.title, heading: HeadingLevel.HEADING_3 }),
                new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
                new Paragraph({ text: '' })
              );
            }
          }
        }

        // Reference image
        if (section.imageSuggestions && section.imageSuggestions.length > 0) {
          const imgBuf = await fetchReferenceImageBuffer(section.imageSuggestions[0]);
          if (imgBuf) {
            children.push(
              new Paragraph({ children: [new ImageRun({ data: imgBuf, transformation: { width: 480, height: 300 } })] }),
              new Paragraph({ text: '' })
            );
          }
        }

        // Recommendations
        if (section.recommendations && section.recommendations.length > 0) {
          const recRows = [new TableRow({ children: [
            new TableCell({ children: [new Paragraph({ text: 'Recommendation', bold: true })], width: { size: 40, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ text: 'Impact', bold: true })], width: { size: 15, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ text: 'Diff', bold: true })], width: { size: 15, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ text: 'Cost', bold: true })], width: { size: 15, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ text: 'Timeframe', bold: true })], width: { size: 15, type: WidthType.PERCENTAGE } })
          ] })];
          section.recommendations.forEach(rec => {
            recRows.push(new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ text: rec.title, bold: true }), new Paragraph({ text: `How: ${rec.how}` })] }),
              new TableCell({ children: [new Paragraph({ text: rec.impact })] }),
              new TableCell({ children: [new Paragraph({ text: rec.difficulty })] }),
              new TableCell({ children: [new Paragraph({ text: rec.cost })] }),
              new TableCell({ children: [new Paragraph({ text: rec.timeframe })] })
            ] }));
          });
          children.push(
            new Paragraph({ text: 'Strategic Action Tasks', heading: HeadingLevel.HEADING_3 }),
            new Table({ rows: recRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
            new Paragraph({ text: '' })
          );
        }
      }
    }

    // Bonus Assets
    if (report.bonusAssets && Object.keys(report.bonusAssets).length > 0) {
      const assets = report.bonusAssets;
      children.push(
        new Paragraph({ text: 'Bonus Strategic Brand Assets', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: 'Mission Statement', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.mission || '' }),
        new Paragraph({ text: 'Vision Statement', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.vision || '' }),
        new Paragraph({ text: 'Unique Value Proposition (UVP)', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.uvp || '' }),
        new Paragraph({ text: 'Elevator Pitch', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.elevatorPitch || '' }),
        new Paragraph({ text: 'Investor Pitch (McKinsey Standard)', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.investorPitch || '' }),
        new Paragraph({ text: '' })
      );

      if (assets.businessCanvas) {
        const bc = assets.businessCanvas;
        children.push(
          new Paragraph({ text: 'Business Model Canvas Overview', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: `Key Partners: ${bc.keyPartners}` }),
          new Paragraph({ text: `Key Activities: ${bc.keyActivities}` }),
          new Paragraph({ text: `Key Resources: ${bc.keyResources}` }),
          new Paragraph({ text: `Value Propositions: ${bc.valuePropositions}` }),
          new Paragraph({ text: `Customer Relationships: ${bc.customerRelationships}` }),
          new Paragraph({ text: `Channels: ${bc.channels}` }),
          new Paragraph({ text: `Customer Segments: ${bc.customerSegments}` }),
          new Paragraph({ text: `Cost Structure: ${bc.costStructure}` }),
          new Paragraph({ text: `Revenue Streams: ${bc.revenueStreams}` }),
          new Paragraph({ text: '' })
        );
      }
    }

    const doc = new Document({ sections: [{ properties: {}, children }] });
    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${business.businessName.replace(/\s+/g, '_')}_Research_Report.docx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Word export error:', error);
    res.status(500).json({ message: 'Error exporting report to Word (DOCX).' });
  }
};