import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL = process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash';

/**
 * ==========================================================================
 * REPORT_STRUCTURE
 * ==========================================================================
 * Single source of truth for the whole report. Derived + cleaned up from the
 * "Business Market Research Bible" master index (duplicate/legacy chapter
 * numbering from the old draft has been merged & de-duplicated here).
 *
 * 5 Volumes -> 28 Chapters + 1 Bonus Assets block.
 * Both the backend (prompting/merging) and frontend (tabs/UI) should import
 * this exact structure so nothing ever goes out of sync.
 * ==========================================================================
 */
export const REPORT_STRUCTURE = [
  {
    volume: 1,
    key: 'volume1',
    title: 'Foundations',
    subtitle: 'Idea validation, industry landscape, market sizing, customers & business model',
    chapters: [
      {
        key: 'ideaValidation',
        title: 'Chapter 1 — Business Idea Validation',
        subtopics: ['Problem Validation', 'Market Gap Analysis', 'Customer Pain Point Mapping', 'Opportunity Matrix', 'Validation Checklist', 'Why Existing Businesses Fail'],
        wantsDiagram: 'quadrantChart (Opportunity Matrix: Market Need vs Competitive Intensity)',
        wantsChart: false
      },
      {
        key: 'industryOverview',
        title: 'Chapter 2 — Industry Research',
        subtopics: ['Industry Definition', 'Industry Size', 'CAGR', 'Future Growth', 'Industry Life Cycle', 'Emerging Trends', 'AI Impact', 'Government Policies', 'Global vs India'],
        wantsDiagram: false,
        wantsChart: 'line (Industry size / CAGR trend, next 5 years)'
      },
      {
        key: 'marketSize',
        title: 'Chapter 3 — Market Size (TAM / SAM / SOM)',
        subtopics: ['TAM', 'SAM', 'SOM', 'Top-down Calculation', 'Bottom-up Calculation', 'Revenue Projection', 'Market Forecast'],
        wantsDiagram: 'flowchart funnel showing TAM -> SAM -> SOM narrowing',
        wantsChart: 'bar (TAM vs SAM vs SOM in currency value)'
      },
      {
        key: 'customerResearch',
        title: 'Chapter 4 — Customer Research',
        subtopics: ['Customer Persona', 'Buying Behaviour', 'Online Behaviour', 'Spending Habits', 'Pain Points', 'Motivation', 'Jobs To Be Done', 'Psychology', 'Emotional Triggers'],
        wantsDiagram: 'flowchart of the customer journey (Awareness -> Consideration -> Purchase -> Retention -> Advocacy)',
        wantsChart: false
      },
      {
        key: 'businessModel',
        title: 'Chapter 5 — Business Model',
        subtopics: ['Lean Canvas', 'Business Model Canvas', 'Revenue Models', 'Pricing Basics'],
        wantsDiagram: 'a 9-block Business Model Canvas represented as a grid/table',
        wantsChart: false
      }
    ]
  },
  {
    volume: 2,
    key: 'volume2',
    title: 'Strategy & Demand',
    subtitle: 'SWOT, PESTEL, Porter\u2019s Five Forces, demand & keyword & location research',
    chapters: [
      {
        key: 'swotAnalysis',
        title: 'Chapter 6 — SWOT Analysis',
        subtopics: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'],
        wantsDiagram: '2x2 SWOT quadrant grid',
        wantsChart: false
      },
      {
        key: 'pestelAnalysis',
        title: 'Chapter 7 — PESTEL Analysis',
        subtopics: ['Political', 'Economic', 'Social', 'Technological', 'Environmental', 'Legal'],
        wantsDiagram: false,
        wantsChart: false
      },
      {
        key: 'portersFiveForces',
        title: 'Chapter 8 — Porter\u2019s Five Forces',
        subtopics: ['Supplier Power', 'Buyer Power', 'New Entrants', 'Substitute Products', 'Competitive Rivalry'],
        wantsDiagram: 'radar/star chart scoring all 5 forces 1-10',
        wantsChart: 'radar (5 forces intensity score)'
      },
      {
        key: 'demandResearch',
        title: 'Chapter 9 — Demand Research',
        subtopics: ['Google Search Demand', 'Seasonal Demand', 'Geographic Demand', 'Future Trends', 'Search Intent'],
        wantsDiagram: false,
        wantsChart: 'line (12-month seasonal search demand index)'
      },
      {
        key: 'keywordResearch',
        title: 'Chapter 10 — Keyword Research',
        subtopics: ['High Volume Keywords', 'Low Competition Keywords', 'Informational', 'Commercial Keywords', 'Buyer Intent Keywords', 'Competitor Keywords', 'SEO Opportunity Mapping'],
        wantsDiagram: false,
        wantsChart: 'bar (top 8-10 keywords by monthly search volume)'
      },
      {
        key: 'locationResearch',
        title: 'Chapter 11 — Location Research',
        subtopics: ['Best City', 'Best State', 'Population', 'Income', 'Competition Density', 'Purchasing Power', 'Logistics'],
        wantsDiagram: false,
        wantsChart: 'bar (top candidate cities scored on opportunity)'
      }
    ]
  },
  {
    volume: 3,
    key: 'volume3',
    title: 'Competitor Intelligence',
    subtitle: 'Deep competitor mapping across web, SEO, social, ads, pricing & reviews',
    chapters: [
      {
        key: 'competitorIdentification',
        title: 'Chapter 12 — Competitor Identification',
        subtopics: ['Direct Competitors', 'Indirect Competitors', 'Hidden Competitors', 'Market Leaders', 'Startup Competitors'],
        wantsDiagram: 'quadrantChart competitive landscape map (Price vs Quality/Features)',
        wantsChart: false
      },
      {
        key: 'websiteAnalysis',
        title: 'Chapter 13 — Website Analysis',
        subtopics: ['UX/UI', 'Site Speed', 'Conversion Elements', 'Navigation', 'Trust Signals'],
        wantsDiagram: false,
        wantsChart: false
      },
      {
        key: 'seoAnalysis',
        title: 'Chapter 14 — SEO Analysis',
        subtopics: ['Domain Authority', 'Backlinks', 'On-page SEO', 'Ranking Keywords', 'Content Gaps'],
        wantsDiagram: false,
        wantsChart: 'bar (competitor SEO visibility / ranking keyword count comparison)'
      },
      {
        key: 'socialMediaAnalysis',
        title: 'Chapter 15 — Social Media Analysis',
        subtopics: ['Follower Count', 'Engagement Rate', 'Content Strategy', 'Posting Frequency', 'Platform Mix'],
        wantsDiagram: false,
        wantsChart: 'bar (follower count comparison across competitors)'
      },
      {
        key: 'paidAdsAnalysis',
        title: 'Chapter 16 — Paid Ads Analysis',
        subtopics: ['Ad Platforms Used', 'Ad Creative Themes', 'Estimated Spend', 'Landing Pages', 'Offer Strategy'],
        wantsDiagram: false,
        wantsChart: false
      },
      {
        key: 'pricingAnalysis',
        title: 'Chapter 17 — Competitor Pricing Analysis',
        subtopics: ['Price Points', 'Discounting Patterns', 'Bundling', 'Value Perception'],
        wantsDiagram: false,
        wantsChart: 'bar (price comparison across top competitors)'
      },
      {
        key: 'productUspAnalysis',
        title: 'Chapter 18 — Product & USP Analysis',
        subtopics: ['Feature Comparison', 'Differentiation', 'Gaps to Exploit'],
        wantsDiagram: false,
        wantsChart: false
      },
      {
        key: 'customerReviewMining',
        title: 'Chapter 19 — Customer Review Mining',
        subtopics: ['Common Complaints', 'Loved Features', 'Sentiment Trend', 'Unmet Needs'],
        wantsDiagram: false,
        wantsChart: 'pie (review sentiment split: positive/neutral/negative)'
      }
    ]
  },
  {
    volume: 4,
    key: 'volume4',
    title: 'Operations, Finance & Growth',
    subtitle: 'Financial modelling, marketing, sales, tech, legal, risk & execution roadmap',
    chapters: [
      {
        key: 'financialResearch',
        title: 'Chapter 20 — Financial Research',
        subtopics: ['Initial Investment', 'Fixed Cost', 'Variable Cost', 'Gross Margin', 'Net Margin', 'CAC', 'LTV', 'Break Even Point', 'ROI'],
        wantsDiagram: false,
        wantsChart: 'pie (cost breakdown: fixed vs variable vs marketing vs other)'
      },
      {
        key: 'marketingResearch',
        title: 'Chapter 21 — Marketing Research',
        subtopics: ['Organic Marketing', 'SEO', 'Social Media', 'Influencer Marketing', 'Paid Ads', 'Referral', 'Email Marketing', 'Affiliate Marketing'],
        wantsDiagram: false,
        wantsChart: 'pie (recommended budget allocation across channels)'
      },
      {
        key: 'salesResearch',
        title: 'Chapter 22 — Sales Research',
        subtopics: ['Sales Funnel', 'Lead Generation', 'Lead Qualification', 'Conversion Rate', 'Closing Strategy'],
        wantsDiagram: 'funnel flowchart (Awareness -> Lead -> MQL -> SQL -> Customer)',
        wantsChart: false
      },
      {
        key: 'technologyStack',
        title: 'Chapter 23 — Technology Research',
        subtopics: ['Website', 'Mobile App', 'CRM', 'ERP', 'AI Tools', 'Automation'],
        wantsDiagram: false,
        wantsChart: false
      },
      {
        key: 'legalCompliance',
        title: 'Chapter 24 — Legal Research',
        subtopics: ['Company Registration', 'GST', 'Trademark', 'Copyright', 'Patent', 'Licenses'],
        wantsDiagram: false,
        wantsChart: false
      },
      {
        key: 'riskAnalysis',
        title: 'Chapter 25 — Risk Analysis',
        subtopics: ['Market Risk', 'Operational Risk', 'Financial Risk', 'Technology Risk', 'Legal Risk'],
        wantsDiagram: 'a 5x5 risk matrix (Likelihood vs Impact) plotting each risk',
        wantsChart: false
      },
      {
        key: 'executionRoadmap',
        title: 'Chapter 26 — Execution Roadmap',
        subtopics: ['30 Days', '60 Days', '90 Days', '180 Days', '1 Year'],
        wantsDiagram: 'timeline/gantt-style flowchart across 30/60/90/180/365 day milestones',
        wantsChart: false
      }
    ]
  },
  {
    volume: 5,
    key: 'volume5',
    title: 'Toolkit & AI Assets',
    subtitle: 'Ready-to-use templates, AI prompt library & bonus brand assets',
    chapters: [
      {
        key: 'templatesLibrary',
        title: 'Chapter 27 — 100+ Ready-to-use Templates',
        subtopics: ['SWOT Template', 'Customer Persona', 'Interview Questions', 'Survey', 'Competitor Tracker', 'Pricing Sheet', 'Financial Sheet', 'Market Size Calculator', 'Business Canvas', 'Lean Canvas', 'Validation Checklist', 'Go/No-Go Scorecard'],
        wantsDiagram: false,
        wantsChart: false
      },
      {
        key: 'aiPromptLibrary',
        title: 'Chapter 28 — AI Prompt Library',
        subtopics: ['Business Validation Prompts', 'Competitor Research Prompts', 'SEO Prompts', 'Marketing Prompts', 'Finance Prompts', 'Customer Research Prompts', 'Investor Pitch Prompts'],
        wantsDiagram: false,
        wantsChart: false
      }
    ],
    // Volume 5 also produces the bonus brand-asset block (not a numbered chapter)
    hasBonusAssets: true
  }
];

export const ALL_CHAPTER_KEYS = REPORT_STRUCTURE.flatMap(v => v.chapters.map(c => c.key));

/**
 * ==========================================================================
 * SCHEMA BUILDER
 * ==========================================================================
 * Every chapter comes back as an array item (NOT a dynamic object key) so
 * that Gemini's structured-output schema stays simple & reliable. We remap
 * the array -> { [chapterKey]: section } after parsing.
 * ==========================================================================
 */
const CHAPTER_ITEM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    key: { type: 'STRING', description: 'Must exactly match the chapter key given in the prompt.' },
    title: { type: 'STRING' },
    content: { type: 'STRING', description: 'Full markdown content: headings for each subtopic, tables where useful, at least 300-500 words of real researched analysis.' },
    diagram: {
      type: 'OBJECT',
      description: 'Optional. Only fill if a visual diagram genuinely helps this chapter.',
      properties: {
        type: { type: 'STRING', description: "Mermaid diagram type, e.g. 'flowchart TD', 'quadrantChart'" },
        mermaidCode: { type: 'STRING', description: 'Full valid Mermaid.js syntax, ready to render as-is.' },
        caption: { type: 'STRING' }
      }
    },
    charts: {
      type: 'ARRAY',
      description: 'Optional. 0-2 charts with REAL, chapter-specific numeric data (not placeholders like "X" or "Y").',
      items: {
        type: 'OBJECT',
        properties: {
          type: { type: 'STRING', description: "'bar' | 'line' | 'pie' | 'radar'" },
          title: { type: 'STRING' },
          labels: { type: 'ARRAY', items: { type: 'STRING' } },
          datasets: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                label: { type: 'STRING' },
                data: { type: 'ARRAY', items: { type: 'NUMBER' } }
              },
              required: ['label', 'data']
            }
          }
        },
        required: ['type', 'title', 'labels', 'datasets']
      }
    },
    imageSuggestions: {
      type: 'ARRAY',
      description: '1-2 short descriptive search queries for royalty-free reference images relevant to this chapter (e.g. "modern bakery storefront interior").',
      items: { type: 'STRING' }
    },
    recommendations: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          why: { type: 'STRING' },
          how: { type: 'STRING' },
          impact: { type: 'STRING', description: 'High / Medium / Low' },
          difficulty: { type: 'STRING', description: 'High / Medium / Low' },
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
        properties: { type: { type: 'STRING' }, label: { type: 'STRING' } },
        required: ['type', 'label']
      }
    }
  },
  required: ['key', 'title', 'content', 'recommendations', 'trustIndicators']
};

function buildVolumeSchema() {
  return {
    type: 'OBJECT',
    properties: {
      sections: { type: 'ARRAY', items: CHAPTER_ITEM_SCHEMA }
    },
    required: ['sections']
  };
}

const BONUS_ASSETS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    mission: { type: 'STRING' },
    vision: { type: 'STRING' },
    uvp: { type: 'STRING' },
    elevatorPitch: { type: 'STRING' },
    investorPitch: { type: 'STRING' },
    businessCanvas: {
      type: 'OBJECT',
      properties: {
        keyPartners: { type: 'STRING' },
        keyActivities: { type: 'STRING' },
        keyResources: { type: 'STRING' },
        valuePropositions: { type: 'STRING' },
        customerRelationships: { type: 'STRING' },
        channels: { type: 'STRING' },
        customerSegments: { type: 'STRING' },
        costStructure: { type: 'STRING' },
        revenueStreams: { type: 'STRING' }
      }
    }
  },
  required: ['mission', 'vision', 'uvp', 'elevatorPitch', 'investorPitch', 'businessCanvas']
};

/**
 * ==========================================================================
 * PROMPT BUILDER
 * ==========================================================================
 */
function buildVolumePrompt(volume, details) {
  const chapterList = volume.chapters.map(c =>
    `- key: "${c.key}" | ${c.title}\n  Subtopics to cover in depth: ${c.subtopics.join(', ')}\n  ${c.wantsDiagram ? `Include a diagram: ${c.wantsDiagram}` : ''}\n  ${c.wantsChart ? `Include a chart: ${c.wantsChart}` : ''}`
  ).join('\n\n');

  return `
You are a McKinsey-grade market research consultant producing "Volume ${volume.volume} — ${volume.title}" of a full business research report.

BUSINESS CONTEXT
Business Name: ${details.businessName}
Industry: ${details.industry}
Offering / Products: ${details.products}
Business Model: ${details.businessModel}
Business Stage: ${details.businessStage}
Target Country/City: ${details.targetCity || ''}, ${details.targetState || ''}, ${details.targetCountry}
Target Audience: ${details.targetAudience}
Marketing Budget: ${details.marketingBudget}
Description: ${details.businessDescription}

TASK
Use web/search grounding to research REAL, current, industry-specific data (market sizes, CAGR %, real competitor names, real pricing, real keyword volumes wherever possible). Do not use generic placeholder numbers — ground every figure in the actual industry/geography given above.

Produce ALL of the following chapters for this volume. Do NOT skip any chapter and do NOT summarize/shorten to save space — every chapter must be complete, detailed (300-500+ words of real content), and self-contained:

${chapterList}

For every chapter:
1. Write full markdown content, organized by the subtopics listed, with tables where numeric comparisons help.
2. Only include a "diagram" (Mermaid.js code) if noted above, and make sure the Mermaid syntax is 100% valid and renderable.
3. Only include "charts" if noted above, with REAL researched numbers (never invented round numbers like 10/20/30 unless genuinely accurate).
4. Give 2-4 imageSuggestions (short descriptive search phrases) that would visually complement the chapter.
5. Give 3-5 recommendations per chapter with clear why/how/impact/difficulty/cost/timeframe.
6. Give 1-3 trustIndicators citing what grounded the section (e.g. "source: industry report", "source: search grounding").

Return ONLY the JSON object matching the required schema. No markdown fences, no preamble.
`.trim();
}

function buildBonusAssetsPrompt(details) {
  return `
You are a brand strategist. Based on this business, produce a concise, punchy set of brand assets:
Business Name: ${details.businessName}
Industry: ${details.industry}
Offering: ${details.products}
Target Audience: ${details.targetAudience}
Description: ${details.businessDescription}

Return ONLY JSON matching the schema: mission, vision, uvp (unique value proposition), elevatorPitch (2-3 sentences), investorPitch (McKinsey-standard, 4-6 sentences), and a full 9-block businessCanvas.
`.trim();
}

/**
 * ==========================================================================
 * REAL-TIME GENERATION (Gemini + Google Search grounding)
 * ==========================================================================
 * Each volume is ONE independent Gemini call. This is the key fix for data
 * loss: instead of one giant 28-chapter call (which risks truncation /
 * missed chapters), we ask for ~5-8 chapters per call, matching a
 * comfortable output-token budget.
 * ==========================================================================
 */
export async function generateVolume(volumeNumber, details) {
  if (!ai) throw new Error('GEMINI_API_KEY not configured');

  const volume = REPORT_STRUCTURE.find(v => v.volume === volumeNumber);
  if (!volume) throw new Error(`Unknown volume number: ${volumeNumber}`);

  const prompt = buildVolumePrompt(volume, details);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: buildVolumeSchema()
    }
  });

  const parsed = JSON.parse(response.text);

  // Safety net: make sure every expected chapter key came back.
  const expectedKeys = volume.chapters.map(c => c.key);
  const returnedKeys = (parsed.sections || []).map(s => s.key);
  const missingKeys = expectedKeys.filter(k => !returnedKeys.includes(k));

  const sectionsByKey = {};
  (parsed.sections || []).forEach(s => { sectionsByKey[s.key] = s; });

  // Fill any missing chapter with a mock so the report never has a hole.
  if (missingKeys.length > 0) {
    console.warn(`Volume ${volumeNumber}: Gemini missed chapters [${missingKeys.join(', ')}], patching with fallback content.`);
    const mockVolume = generateMockVolume(volumeNumber, details);
    missingKeys.forEach(k => { sectionsByKey[k] = mockVolume.sections[k]; });
  }

  let bonusAssets = null;
  if (volume.hasBonusAssets) {
    try {
      const bonusResponse = await ai.models.generateContent({
        model: MODEL,
        contents: buildBonusAssetsPrompt(details),
        config: { responseMimeType: 'application/json', responseSchema: BONUS_ASSETS_SCHEMA }
      });
      bonusAssets = JSON.parse(bonusResponse.text);
    } catch (e) {
      console.error('Bonus asset generation failed, using fallback:', e);
      bonusAssets = generateMockBonusAssets(details);
    }
  }

  return { sections: sectionsByKey, bonusAssets };
}

/**
 * Regenerate a single chapter/section (used by the "Regenerate Section" button).
 */
export async function regenerateChapter(volumeNumber, chapterKey, details, currentSection, modifier) {
  const volume = REPORT_STRUCTURE.find(v => v.volume === volumeNumber);
  const chapterMeta = volume?.chapters.find(c => c.key === chapterKey);
  if (!ai || !chapterMeta) throw new Error('Cannot regenerate: missing AI client or chapter metadata');

  const prompt = `
You are an expert McKinsey consultant. Regenerate ONLY the "${chapterMeta.title}" chapter (key: "${chapterKey}") for:
Business Name: ${details.businessName}
Industry: ${details.industry}
Offering: ${details.products}
Target Audience: ${details.targetAudience}
Description: ${details.businessDescription}

Subtopics to cover: ${chapterMeta.subtopics.join(', ')}
${chapterMeta.wantsDiagram ? `Include a diagram: ${chapterMeta.wantsDiagram}` : ''}
${chapterMeta.wantsChart ? `Include a chart: ${chapterMeta.wantsChart}` : ''}

Current title: ${currentSection?.title || chapterMeta.title}
Modification instruction: "${modifier || 'Provide a fresh, more detailed strategic perspective with newer data.'}"

Return ONLY JSON for a single chapter matching the schema (key, title, content, diagram?, charts?, imageSuggestions?, recommendations, trustIndicators).
`.trim();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json', responseSchema: CHAPTER_ITEM_SCHEMA }
  });

  return JSON.parse(response.text);
}

/**
 * ==========================================================================
 * MOCK / FALLBACK GENERATORS (no API key, or API failure)
 * ==========================================================================
 */
export function generateMockVolume(volumeNumber, details) {
  const volume = REPORT_STRUCTURE.find(v => v.volume === volumeNumber);
  const sections = {};

  volume.chapters.forEach(chapter => {
    sections[chapter.key] = {
      key: chapter.key,
      title: chapter.title,
      content: `### ${chapter.title}\n\n${chapter.subtopics.map(t => `**${t}:** Preliminary analysis for ${details.businessName} (${details.industry}) covering ${t.toLowerCase()}. Replace with live Gemini research once GEMINI_API_KEY is configured.`).join('\n\n')}`,
      diagram: chapter.wantsDiagram ? {
        type: 'flowchart TD',
        mermaidCode: `flowchart TD\n  A[Start] --> B[${chapter.title.split('—')[1]?.trim() || 'Analysis'}]\n  B --> C[Insight]\n  C --> D[Action]`,
        caption: `Illustrative diagram for ${chapter.title}`
      } : null,
      charts: chapter.wantsChart ? [{
        type: chapter.wantsChart.split(' ')[0],
        title: `${chapter.title} — Sample Data`,
        labels: ['Segment A', 'Segment B', 'Segment C'],
        datasets: [{ label: details.businessName, data: [40, 35, 25] }]
      }] : [],
      imageSuggestions: [`${details.industry} ${chapter.title.split('—')[1]?.trim() || ''}`.trim()],
      recommendations: [{
        title: `Strengthen ${chapter.title.split('—')[1]?.trim() || 'this area'}`,
        why: 'Placeholder rationale — replace with live research.',
        how: 'Placeholder implementation steps.',
        impact: 'Medium', difficulty: 'Medium', cost: 'Low', timeframe: '2-4 weeks'
      }],
      trustIndicators: [{ type: 'assumption', label: 'Simulated fallback — GEMINI_API_KEY not active or request failed.' }]
    };
  });

  return { sections };
}

export function generateMockBonusAssets(details) {
  return {
    mission: `To deliver ${details.products} that genuinely solve problems for ${details.targetAudience}.`,
    vision: `To become a recognized name in ${details.industry} within ${details.targetCountry}.`,
    uvp: `${details.businessName} stands out by focusing on ${details.targetAudience} with a ${details.businessModel} model.`,
    elevatorPitch: `${details.businessName} helps ${details.targetAudience} with ${details.products}, solving real pain points in the ${details.industry} space.`,
    investorPitch: `${details.businessName} is targeting a growing segment of ${details.targetAudience} in ${details.industry}. With a ${details.businessModel} approach and a ${details.marketingBudget} initial marketing budget, the business is positioned to capture early market share.`,
    businessCanvas: {
      keyPartners: 'Suppliers, logistics partners, technology vendors',
      keyActivities: 'Product development, marketing, customer support',
      keyResources: 'Team, brand, technology stack',
      valuePropositions: details.products,
      customerRelationships: 'Direct support, community, self-serve',
      channels: 'Website, social media, marketplaces',
      customerSegments: details.targetAudience,
      costStructure: 'Product/service delivery, marketing, operations',
      revenueStreams: details.businessModel
    }
  };
}

/**
 * Full mock report across all 5 volumes — used when GEMINI_API_KEY is entirely absent.
 */
export function generateDetailedMockReport(details) {
  let sections = {};
  let bonusAssets = {};
  REPORT_STRUCTURE.forEach(volume => {
    const mock = generateMockVolume(volume.volume, details);
    sections = { ...sections, ...mock.sections };
    if (volume.hasBonusAssets) bonusAssets = generateMockBonusAssets(details);
  });
  return { sections, bonusAssets };
}