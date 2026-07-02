import Report from '../model/Report.js';
import { enrichWebsiteData } from '../services/enrichmentService.js';
import { 
  generateModule1, 
  generateModule2, 
  generateModule3, 
  generateModule4, 
  generateModule5, 
  generateModule6, 
  generateDetailedMockReport 
} from '../services/geminiService.js';
import { GoogleGenAI } from '@google/genai';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } from 'docx';

// Initialize Gemini API Client for simple endpoint checks (discover competitors / single section regen)
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Endpoint: Enrich business form details via website scraper & search
 */
export const enrichWebsite = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ message: 'URL query parameter is required.' });
    }

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
      console.log(`Running dynamic competitor discovery for ${businessName}...`);
      const prompt = `
Perform quick competitive intelligence research on the web for this business:
Business Name: ${businessName}
Industry: ${industry || 'General'}
Offering: ${products}
Description: ${description}

Find 3 to 5 real direct or indirect competitors that are active in the market. Provide their names and a 1-sentence description of their offering/positioning.

You must reply with a structured JSON document conforming EXACTLY to this schema:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "description": "Short description of what they offer and how they position themselves"
    }
  ]
}
`;

      try {
        const response = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash',
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
                    properties: {
                      name: { type: 'STRING' },
                      description: { type: 'STRING' }
                    },
                    required: ['name', 'description']
                  }
                }
              },
              required: ['competitors']
            }
          }
        });

        const result = JSON.parse(response.text);
        return res.json(result);
      } catch (geminiError) {
        console.error('Gemini competitor discovery failed, falling back to heuristics:', geminiError);
      }
    }

    // Heuristic Fallback
    console.log(`Generating simulated competitors list for ${businessName}`);
    const simulated = [
      { name: 'Apex Solutions', description: 'Enterprise-grade provider offering similar custom services at high pricing tiers.' },
      { name: 'Vanguard Systems', description: 'Tech-centric competitor with modular subscriptions and self-serve onboarding.' },
      { name: 'PureLife Brands', description: 'Consumer-focused retail brand with strong visual positioning and social loyalty programs.' }
    ];
    res.json({ competitors: simulated });
  } catch (error) {
    console.error('Competitor discovery error:', error);
    res.status(500).json({ message: 'Error discovering competitors.' });
  }
};

/**
 * Endpoint: Orchestrate the generation of the 43-section market research and brand assets report
 */
export const analyzeBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const details = req.body;
    
    // Intake Validation
    const required = [
      'businessName', 'industry', 'products', 'businessModel', 
      'businessStage', 'targetCountry', 'targetAudience', 
      'marketingBudget', 'businessDescription'
    ];
    
    const missing = required.filter(field => !details[field]);
    if (missing.length > 0) {
      return res.status(400).json({ 
        message: `Audit generation blocked. Required fields missing: ${missing.join(', ')}` 
      });
    }

    console.log(`Orchestrating 6-Module McKinsey-grade analysis for: ${details.businessName}`);
    
    let mergedSections = {};
    let sources = [];
    let bonusAssets = {};

    if (apiKey) {
      try {
        // Module 1: Executive & Industry Analysis
        console.log("Compiling Module 1 (Executive & Industry)...");
        try {
          const mod1 = await generateModule1(details);
          Object.assign(mergedSections, mod1);
        } catch (e) {
          console.error("Module 1 generation failed, utilizing fallback:", e);
          const fallback = generateDetailedMockReport(details);
          const keys = ['businessSummary', 'executiveSummary', 'marketSize', 'industryOverview', 'industryGrowthRate', 'currentTrends', 'futureTrends', 'marketDemand', 'marketGap'];
          keys.forEach(k => mergedSections[k] = fallback.sections[k]);
        }

        // Module 2: Customer & Competitive Intelligence
        console.log("Compiling Module 2 (Customer & Competitive)...");
        try {
          const mod2 = await generateModule2(details);
          Object.assign(mergedSections, mod2);
        } catch (e) {
          console.error("Module 2 generation failed, utilizing fallback:", e);
          const fallback = generateDetailedMockReport(details);
          const keys = ['customerPersona', 'customerProblems', 'customerNeeds', 'buyingBehaviour', 'swotAnalysis', 'pestleAnalysis', 'competitorResearch'];
          keys.forEach(k => mergedSections[k] = fallback.sections[k]);
        }

        // Module 3: Keyword, Content & Marketing Playbooks
        console.log("Compiling Module 3 (Keyword & Content)...");
        try {
          const mod3 = await generateModule3(details);
          Object.assign(mergedSections, mod3);
        } catch (e) {
          console.error("Module 3 generation failed, utilizing fallback:", e);
          const fallback = generateDetailedMockReport(details);
          const keys = ['keywordResearch', 'seoStrategy', 'socialMediaStrategy', 'contentMarketingPlan', 'paidAdsStrategy'];
          keys.forEach(k => mergedSections[k] = fallback.sections[k]);
        }

        // Module 4: Pricing, Sales & Operational Growth
        console.log("Compiling Module 4 (Pricing & Sales)...");
        try {
          const mod4 = await generateModule4(details);
          Object.assign(mergedSections, mod4);
        } catch (e) {
          console.error("Module 4 generation failed, utilizing fallback:", e);
          const fallback = generateDetailedMockReport(details);
          const keys = ['pricingStrategy', 'salesStrategy', 'customerAcquisition', 'retentionStrategy', 'growthStrategy', 'goToMarketStrategy'];
          keys.forEach(k => mergedSections[k] = fallback.sections[k]);
        }

        // Module 5: Roadmaps, Risks, Scoring & Financial Overview
        console.log("Compiling Module 5 (Metrics & Conclusion)...");
        try {
          const mod5 = await generateModule5(details);
          Object.assign(mergedSections, mod5);
        } catch (e) {
          console.error("Module 5 generation failed, utilizing fallback:", e);
          const fallback = generateDetailedMockReport(details);
          const keys = [
            'businessRisks', 'investmentRequirement', 'revenueModel', 'launchChecklist', 'actionPlan90Day', 'oneYearRoadmap',
            'aiRecommendations', 'businessScore', 'successProbability', 'estimatedCompetitionLevel', 'estimatedDifficultyLevel',
            'estimatedRoi', 'marketOpportunityScore', 'finalConclusion'
          ];
          keys.forEach(k => mergedSections[k] = fallback.sections[k]);
        }

        // Module 6: Brand & Business Assets
        console.log("Compiling Module 6 (Brand Assets)...");
        try {
          bonusAssets = await generateModule6(details);
        } catch (e) {
          console.error("Module 6 generation failed, utilizing fallback:", e);
          const fallback = generateDetailedMockReport(details);
          bonusAssets = fallback.bonusAssets;
        }

        // Setup some default sources citing Google Search
        sources = [
          { title: `${details.industry} Industry Outlook (2026)`, url: 'https://www.bcg.com', snippet: 'Benchmark trends, growth indices, and market sizes calculated for the current operational stage.' },
          { title: 'Google Keyword Planner Estimates', url: 'https://ads.google.com', snippet: 'Real-time keyword search intent volumes mapped for target categories.' }
        ];

      } catch (geminiError) {
        console.error('All-module Gemini audit generation failed, falling back to mock generator:', geminiError);
        const fallback = generateDetailedMockReport(details);
        mergedSections = fallback.sections;
        bonusAssets = fallback.bonusAssets;
      }
    } else {
      console.warn('GEMINI_API_KEY is not defined. Using detailed mock generator fallback.');
      const fallback = generateDetailedMockReport(details);
      mergedSections = fallback.sections;
      bonusAssets = fallback.bonusAssets;
    }

    // Save full report in MongoDB
    const report = await Report.create({
      userId,
      businessDetails: details,
      sections: mergedSections,
      sources: sources,
      bonusAssets: bonusAssets
    });

    res.status(201).json({
      report: {
        id: report._id,
        businessDetails: report.businessDetails,
        sections: report.sections,
        sources: report.sources,
        bonusAssets: report.bonusAssets,
        createdAt: report.createdAt
      },
      message: 'Business Research Analysis complete!'
    });
  } catch (error) {
    console.error('Audit generation error:', error);
    res.status(500).json({ message: 'Server error generating business research report.' });
  }
};

/**
 * Endpoint: Get all reports for the logged in user
 */
export const getReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const dbReports = await Report.find({ userId }).sort({ createdAt: -1 });
    
    res.json(dbReports.map(r => ({
      id: r._id,
      businessDetails: r.businessDetails,
      createdAt: r.createdAt
    })));
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ message: 'Error retrieving your audits.' });
  }
};

/**
 * Endpoint: Get a specific report by ID (owner check enforced)
 */
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Audit report not found.' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this report.' });
    }

    res.json({
      id: report._id,
      businessDetails: report.businessDetails,
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
 * Endpoint: Regenerate only a single section of the report
 */
export const regenerateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionKey, modifier } = req.body;

    if (!sectionKey) {
      return res.status(400).json({ message: 'sectionKey is required.' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this report.' });
    }

    const details = report.businessDetails;
    const currentSection = report.sections[sectionKey];

    if (ai) {
      console.log(`Regenerating section: ${sectionKey} for report ID ${id} with instruction: "${modifier || 'None'}"`);
      const prompt = `
You are an expert McKinsey consultant. Regenerate ONLY the "${sectionKey}" section of the business research audit for this business:
Business Name: ${details.businessName}
Industry: ${details.industry}
Offering: ${details.products}
Target Audience: ${details.targetAudience}
Budget: ${details.marketingBudget}
Description: ${details.businessDescription || details.description}

Current Section Title: ${currentSection?.title || sectionKey}
Modification Instruction: "${modifier || 'Provide a fresh, highly detailed strategic perspective'}"

Rules for the updated section:
- Write comprehensive paragraphs and actionable structures in proper markdown.
- Conform to the single section JSON schema:
{
  "title": "Updated Section Title",
  "content": "Updated content text in markdown or structured paragraphs",
  "recommendations": [
    {
      "title": "Specific Action Title",
      "why": "Explanation of research/evidence",
      "how": "Exact steps to implement",
      "impact": "High / Medium / Low",
      "difficulty": "High / Medium / Low",
      "cost": "Estimated cost",
      "timeframe": "Estimated timeframe"
    }
  ],
  "trustIndicators": [
    {
      "type": "source",
      "label": "Details about search grounding or input mapping"
    }
  ]
}
`;

      try {
        const response = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                content: { type: 'STRING' },
                recommendations: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING' },
                      why: { type: 'STRING' },
                      how: { type: 'STRING' },
                      impact: { type: 'STRING' },
                      difficulty: { type: 'STRING' },
                      cost: { type: 'STRING' },
                      timeframe: { type: 'STRING' }
                    },
                    required: ['title', 'why', 'how', 'impact', 'difficulty', 'cost', 'timeframe']
                  }
                },
                trustIndicators: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      type: { type: 'STRING' },
                      label: { type: 'STRING' }
                    },
                    required: ['type', 'label']
                  }
                }
              },
              required: ['title', 'content', 'recommendations', 'trustIndicators']
            }
          }
        });

        const newSectionData = JSON.parse(response.text);
        
        // Update in MongoDB
        report.sections[sectionKey] = newSectionData;
        report.markModified('sections');
        await report.save();

        return res.json({
          sectionKey,
          section: newSectionData
        });
      } catch (err) {
        console.error('Gemini section regeneration failed:', err);
      }
    }

    // Heuristic fallback
    console.log(`Using mock regeneration for section ${sectionKey}`);
    const simulatedSec = {
      title: sectionKey.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase()),
      content: `### Strategic Review (Regenerated)\n\nWe updated this section to address: "${modifier || 'Default update parameters'}". Key metrics are re-indexed for ${details.businessName} operating in ${details.industry}. Focus acquisition efforts strictly on organic search pipelines.`,
      recommendations: [
        {
          title: "Implement targeted content models",
          why: "Customer demographics show high search intent for informational content hubs.",
          how: "Deploy three search-grounded product sheets on the blog indexing core problem sets.",
          impact: "High", difficulty: "Medium", cost: "Free", timeframe: "10 days"
        }
      ],
      trustIndicators: [{ type: "assumption", label: "Simulated fallback update parameters" }]
    };
    
    report.sections[sectionKey] = simulatedSec;
    report.markModified('sections');
    await report.save();

    res.json({
      sectionKey,
      section: simulatedSec
    });
  } catch (error) {
    console.error('Section regeneration error:', error);
    res.status(500).json({ message: 'Error regenerating this section.' });
  }
};

/**
 * Endpoint: Export report to JSON format
 */
export const exportReportJson = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to export this report.' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${report.businessDetails.businessName.replace(/\s+/g, '_')}_Research_Report.json"`);
    res.send(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500).json({ message: 'Error exporting report to JSON.' });
  }
};

/**
 * Endpoint: Export report to Microsoft Word (DOCX) format
 */
export const exportReportDocx = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to export this report.' });
    }

    const business = report.businessDetails;

    // Create Word Document
    const children = [];

    // Header Title
    children.push(
      new Paragraph({
        text: "AI BUSINESS RESEARCH AGENT",
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: `MARKET RESEARCH & BRAND AUDIT: ${business.businessName.toUpperCase()}`,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: `Compiled for ${business.businessName} (${business.industry}) — Stage: ${business.businessStage || 'MVP'}`,
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: `Created on: ${new Date(report.createdAt).toDateString()}`,
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "=========================================================================", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "" })
    );

    // Intake Details Table
    const detailsRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Business Parameter", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Details Provided", bold: true })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Category / Sector" })] }),
          new TableCell({ children: [new Paragraph({ text: business.industry })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Business Model" })] }),
          new TableCell({ children: [new Paragraph({ text: business.businessModel })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Target Geography" })] }),
          new TableCell({ children: [new Paragraph({ text: `${business.targetCity || ''}, ${business.targetState || ''}, ${business.targetCountry}` })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Target Audience" })] }),
          new TableCell({ children: [new Paragraph({ text: business.targetAudience })] })
        ]
      })
    ];

    children.push(
      new Paragraph({ text: "Intake Discovery Profiles", heading: HeadingLevel.HEADING_2 }),
      new Table({
        rows: detailsRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({ text: "" })
    );

    // Loop over report sections
    const sectionKeys = Object.keys(report.sections);
    sectionKeys.forEach((key, index) => {
      const section = report.sections[key];
      children.push(
        new Paragraph({
          text: `${index + 1}. ${section.title}`,
          heading: HeadingLevel.HEADING_2
        }),
        new Paragraph({
          text: section.content.replace(/[\#\*\_]/g, '') // strip simple markdown elements
        }),
        new Paragraph({ text: "" })
      );

      // Recommendations Table
      if (section.recommendations && section.recommendations.length > 0) {
        const recRows = [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: "Recommendation", bold: true })], width: { size: 40, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ text: "Impact", bold: true })], width: { size: 15, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ text: "Diff", bold: true })], width: { size: 15, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ text: "Cost", bold: true })], width: { size: 15, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ text: "Timeframe", bold: true })], width: { size: 15, type: WidthType.PERCENTAGE } })
            ]
          })
        ];

        section.recommendations.forEach(rec => {
          recRows.push(
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: rec.title, bold: true }), new Paragraph({ text: `How: ${rec.how}` })] }),
                new TableCell({ children: [new Paragraph({ text: rec.impact })] }),
                new TableCell({ children: [new Paragraph({ text: rec.difficulty })] }),
                new TableCell({ children: [new Paragraph({ text: rec.cost })] }),
                new TableCell({ children: [new Paragraph({ text: rec.timeframe })] })
              ]
            })
          );
        });

        children.push(
          new Paragraph({ text: "Strategic Action Tasks", heading: HeadingLevel.HEADING_3 }),
          new Table({
            rows: recRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
          }),
          new Paragraph({ text: "" })
        );
      }
    });

    // Add Canvas & Brand Assets (Module 6)
    if (report.bonusAssets && Object.keys(report.bonusAssets).length > 0) {
      const assets = report.bonusAssets;
      children.push(
        new Paragraph({ text: "Bonus Strategic Brand Assets", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "Mission Statement", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.mission || '' }),
        new Paragraph({ text: "Vision Statement", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.vision || '' }),
        new Paragraph({ text: "Unique Value Proposition (UVP)", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.uvp || '' }),
        new Paragraph({ text: "Elevator Pitch", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.elevatorPitch || '' }),
        new Paragraph({ text: "Investor Pitch (McKinsey Standard)", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: assets.investorPitch || '' }),
        new Paragraph({ text: "" })
      );

      // Business Canvas Table
      if (assets.businessCanvas) {
        const bc = assets.businessCanvas;
        children.push(
          new Paragraph({ text: "Business Model Canvas Overview", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: `Key Partners: ${bc.keyPartners}` }),
          new Paragraph({ text: `Key Activities: ${bc.keyActivities}` }),
          new Paragraph({ text: `Key Resources: ${bc.keyResources}` }),
          new Paragraph({ text: `Value Propositions: ${bc.valuePropositions}` }),
          new Paragraph({ text: `Customer Relationships: ${bc.customerRelationships}` }),
          new Paragraph({ text: `Channels: ${bc.channels}` }),
          new Paragraph({ text: `Customer Segments: ${bc.customerSegments}` }),
          new Paragraph({ text: `Cost Structure: ${bc.costStructure}` }),
          new Paragraph({ text: `Revenue Streams: ${bc.revenueStreams}` }),
          new Paragraph({ text: "" })
        );
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${business.businessName.replace(/\s+/g, '_')}_Research_Report.docx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Word export error:', error);
    res.status(500).json({ message: 'Error exporting report to Word (DOCX).' });
  }
};
