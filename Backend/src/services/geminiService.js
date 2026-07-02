import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to define schema structure for a single section
const sectionSchema = {
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
          impact: { type: 'STRING' }, // High, Medium, Low
          difficulty: { type: 'STRING' }, // High, Medium, Low
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
          type: { type: 'STRING' }, // "source" or "assumption"
          label: { type: 'STRING' }
        },
        required: ['type', 'label']
      }
    },
    tableData: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          label: { type: 'STRING' },
          value: { type: 'STRING' }
        }
      }
    },
    chartData: {
      type: 'OBJECT',
      properties: {
        labels: { type: 'ARRAY', items: { type: 'STRING' } },
        values: { type: 'ARRAY', items: { type: 'NUMBER' } }
      }
    }
  },
  required: ['title', 'content', 'recommendations', 'trustIndicators']
};

/**
 * Builds the comprehensive intake metadata string
 */
function buildBusinessMetadata(details) {
  return `
--- BUSINESS IDENTITY ---
Name: ${details.businessName}
Idea: ${details.businessIdea || 'N/A'}
Category: ${details.businessCategory || 'N/A'}
Industry: ${details.industry}
Description: ${details.businessDescription || details.description || 'N/A'}
Model: ${details.businessModel}
Stage: ${details.businessStage || details.stage || 'N/A'}
Website: ${details.websiteUrl || details.website || 'N/A'}

--- GEOGRAPHY & LOGISTICS ---
Target Country: ${details.targetCountry || 'N/A'}
Target State: ${details.targetState || 'N/A'}
Target City: ${details.targetCity || 'N/A'}
Language: ${details.targetLanguage || 'N/A'}
Geo Location: ${details.geoLocation || 'N/A'}
Urban/Rural: ${details.urbanRural || 'N/A'}

--- TARGET AUDIENCE ---
Audience Profile: ${details.targetAudience}
Age Group: ${details.ageGroup || 'N/A'}
Gender: ${details.gender || 'N/A'}
Income Level: ${details.income || 'N/A'}
Education: ${details.education || 'N/A'}
Occupation: ${details.occupation || 'N/A'}
Interests: ${details.interests || 'N/A'}
Pain Points: ${details.painPoints || 'N/A'}
Buying Behaviour: ${details.buyingBehaviour || 'N/A'}
Customer Goals: ${details.customerGoals || 'N/A'}

--- PRODUCTS & FINANCIALS ---
Products: ${details.products}
Services: ${details.services || 'N/A'}
Price Range: ${details.priceRange || 'N/A'}
Unique Value Proposition: ${details.usp || 'N/A'}
Competitors Configured: ${(details.competitors || []).join(', ') || 'N/A'}
Operational Budget: ${details.budget || 'N/A'}
Expected Revenue: ${details.expectedRevenue || 'N/A'}
Marketing Budget: ${details.marketingBudget}
`;
}

/**
 * Helper to call Gemini model with structured JSON schema
 */
async function callGemini(prompt, schema, useSearch = false) {
  if (!ai) {
    throw new Error("Gemini Client not initialized due to missing API Key.");
  }

  const config = {
    responseMimeType: 'application/json',
    responseSchema: schema
  };

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config
  });

  return JSON.parse(response.text);
}

/**
 * MODULE 1: Executive & Industry Analysis
 */
export async function generateModule1(details) {
  const metadata = buildBusinessMetadata(details);
  const prompt = `
You are a Market Research Expert and Startup Consultant from a top-tier firm like McKinsey.
Based on the following intake data, perform deep research on the target industry and compile Module 1: Executive & Industry Analysis.

${metadata}

Use Google Search Grounding to find actual stats, industry sizes, market growth rates, and trends for ${details.industry} in ${details.targetCountry || 'global markets'} for 2026.

You must reply with a structured JSON document containing exactly these keys:
1. "businessSummary": High-level synthesis of what the business does, its model, and strategy.
2. "executiveSummary": Strategic audit summary, main challenges, and key paths forward.
3. "marketSize": TAM, SAM, SOM calculations based on target demographics. MUST include a 'chartData' object with labels: ["TAM", "SAM", "SOM"] and values representing estimated currency amounts in USD.
4. "industryOverview": Narrative overview of the industry sector, regulations, and macro environment.
5. "industryGrowthRate": Growth rate stats and forecasts (CAGR). MUST include a 'chartData' object representing yearly growth rates or market volumes.
6. "currentTrends": Key technology, consumer behavior, and operational trends in the sector.
7. "futureTrends": 5-10 year outlook, disruptive technologies, or shift predictions.
8. "marketDemand": Evidence of demand for this business idea, search trends, or category interest.
9. "marketGap": Analysis of what current industry players are missing and how this business fills it.

Formatting Rules:
- Content fields should be in highly detailed, professional markdown format (with headers, lists, and clear text).
- Include realistic recommendations and citations in trustIndicators (e.g. citing real sources if grounding tools are used, or mapping assumptions).
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      businessSummary: sectionSchema,
      executiveSummary: sectionSchema,
      marketSize: sectionSchema,
      industryOverview: sectionSchema,
      industryGrowthRate: sectionSchema,
      currentTrends: sectionSchema,
      futureTrends: sectionSchema,
      marketDemand: sectionSchema,
      marketGap: sectionSchema
    },
    required: ['businessSummary', 'executiveSummary', 'marketSize', 'industryOverview', 'industryGrowthRate', 'currentTrends', 'futureTrends', 'marketDemand', 'marketGap']
  };

  return callGemini(prompt, schema, true);
}

/**
 * MODULE 2: Customer & Competitive Intelligence
 */
export async function generateModule2(details) {
  const metadata = buildBusinessMetadata(details);
  const prompt = `
You are a Customer Persona Researcher and Competitive Intelligence Analyst.
Analyze the intake data and generate Module 2: Customer & Competitive Intelligence.

${metadata}

Use Google Search Grounding to audit competitors in the ${details.industry} space, identifying top active players, their pricing models, and key weaknesses.

You must reply with a structured JSON document containing exactly these keys:
1. "customerPersona": A detailed customer profile based on target audience variables.
2. "customerProblems": Core friction points, challenges, and frustrations they experience.
3. "customerNeeds": Essential emotional and functional needs they look to satisfy.
4. "buyingBehaviour": How they research products, decision-making speed, and trigger events.
5. "swotAnalysis": Strengths, Weaknesses, Opportunities, and Threats analysis.
6. "pestleAnalysis": Political, Economic, Social, Technological, Environmental, and Legal audit factors.
7. "competitorResearch": Analysis of direct/indirect competitors. Include detailed profiles (products, pricing, website, strengths, weaknesses, traffic estimate, marketing strategies, SEO keywords, social channels, USP, and business model). Represent competitor names in tables.

Formatting Rules:
- Write comprehensive, McKinsey-style analysis.
- Include recommendations for acquisition and positioning.
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      customerPersona: sectionSchema,
      customerProblems: sectionSchema,
      customerNeeds: sectionSchema,
      buyingBehaviour: sectionSchema,
      swotAnalysis: sectionSchema,
      pestleAnalysis: sectionSchema,
      competitorResearch: sectionSchema
    },
    required: ['customerPersona', 'customerProblems', 'customerNeeds', 'buyingBehaviour', 'swotAnalysis', 'pestleAnalysis', 'competitorResearch']
  };

  return callGemini(prompt, schema, true);
}

/**
 * MODULE 3: Keyword, Content & Marketing Playbooks
 */
export async function generateModule3(details) {
  const metadata = buildBusinessMetadata(details);
  const prompt = `
You are an SEO Expert and Digital Marketing Consultant.
Analyze the business details and compile Module 3: Keyword, Content & Marketing Playbooks.

${metadata}

Use Google Search Grounding to research search terms, search volumes, and ad channel metrics related to ${details.industry}.

You must reply with a structured JSON document containing exactly these keys:
1. "keywordResearch": Specific search keywords, search intent (informational, commercial, local), search volume estimates, and long-tail recommendations. Provide keyword data in a table structure.
2. "seoStrategy": Actionable guides for On-Page, Off-Page, Technical SEO, Content Silos, and Backlink strategies.
3. "socialMediaStrategy": Target playbooks and messaging patterns for: Instagram, Facebook, LinkedIn, YouTube, Pinterest, X, and Threads.
4. "contentMarketingPlan": Highly creative editorial strategy containing Blog Ideas, Reels formats, LinkedIn posts, and Email campaigns.
5. "paidAdsStrategy": Complete playbooks for Google Ads, Meta Ads, LinkedIn Ads, YouTube Ads, with budget recommendations and target demographics.

Formatting Rules:
- Include lists of concrete content formats and copy titles.
- Recommendations must be hyper-specific and metric-driven.
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      keywordResearch: sectionSchema,
      seoStrategy: sectionSchema,
      socialMediaStrategy: sectionSchema,
      contentMarketingPlan: sectionSchema,
      paidAdsStrategy: sectionSchema
    },
    required: ['keywordResearch', 'seoStrategy', 'socialMediaStrategy', 'contentMarketingPlan', 'paidAdsStrategy']
  };

  return callGemini(prompt, schema, true);
}

/**
 * MODULE 4: Pricing, Sales & Operational Growth
 */
export async function generateModule4(details) {
  const metadata = buildBusinessMetadata(details);
  const prompt = `
You are a Business Strategist and Growth Marketer.
Generate Module 4: Pricing, Sales & Operational Growth based on the business details.

${metadata}

You must reply with a structured JSON document containing exactly these keys:
1. "pricingStrategy": Recommended pricing tiers, standard discounts, subscription versus transaction, AOV optimization, and competitive benchmarking.
2. "salesStrategy": Sales process, objection handling, follow-up flows, and pipeline stages.
3. "customerAcquisition": CAC optimization, organic referrals, partnerships, and viral loop design.
4. "retentionStrategy": LTV expansion, customer success playbooks, loyalty loops, and churn mitigation steps.
5. "growthStrategy": Expansion roadmaps, partnership frameworks, product extensions, and franchise/licensing analysis.
6. "goToMarketStrategy": Step-by-step launch sequencing, positioning pitch, and channel priority checklists.

Formatting Rules:
- Create professional, BCG/Bain style structures.
- Detail exactly how the business should monetize and optimize margin health.
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      pricingStrategy: sectionSchema,
      salesStrategy: sectionSchema,
      customerAcquisition: sectionSchema,
      retentionStrategy: sectionSchema,
      growthStrategy: sectionSchema,
      goToMarketStrategy: sectionSchema
    },
    required: ['pricingStrategy', 'salesStrategy', 'customerAcquisition', 'retentionStrategy', 'growthStrategy', 'goToMarketStrategy']
  };

  return callGemini(prompt, schema, false);
}

/**
 * MODULE 5: Roadmaps, Risks, Scoring & Financial Overview
 */
export async function generateModule5(details) {
  const metadata = buildBusinessMetadata(details);
  const prompt = `
You are a Venture Capital Analyst and Financial Consultant.
Analyze the business details and compile Module 5: Roadmaps, Risks, Scoring & Financial Overview.

${metadata}

Perform calculations based on target demographics and budgets to outline financial and scoring indicators.

You must reply with a structured JSON document containing exactly these keys:
1. "businessRisks": Top financial, operational, and technical risks, with mitigation strategies.
2. "investmentRequirement": Capital needed to start/scale, allocation breakdown, and runways.
3. "revenueModel": Monetization channels, assumptions, margins, and projected transaction volumes.
4. "launchChecklist": Operational checkmarks for pre-launch, launch, and post-launch.
5. "actionPlan90Day": High-conviction, week-by-week checklist for the first 90 days.
6. "oneYearRoadmap": Month-by-month growth milestones.
7. "aiRecommendations": Immediate options for using AI tools and bots to automate marketing, support, and sales.
8. "businessScore": Overall rating out of 100, highlighting main drivers. MUST include a 'chartData' object with categories and numerical scores.
9. "successProbability": Assessment (Low, Med, High) with percentage and explanation.
10. "estimatedCompetitionLevel": Score (1-10) with analysis of market density.
11. "estimatedDifficultyLevel": Score (1-10) with operational challenges.
12. "estimatedRoi": Expected return on investment and breakeven timeline.
13. "marketOpportunityScore": Score (1-100) reflecting target market suitability.
14. "finalConclusion": Concluding guidance from the consulting team.

Formatting Rules:
- Provide highly descriptive, investor-ready summaries.
- Keep numbers logical and grounded in industry norms.
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      businessRisks: sectionSchema,
      investmentRequirement: sectionSchema,
      revenueModel: sectionSchema,
      launchChecklist: sectionSchema,
      actionPlan90Day: sectionSchema,
      oneYearRoadmap: sectionSchema,
      aiRecommendations: sectionSchema,
      businessScore: sectionSchema,
      successProbability: sectionSchema,
      estimatedCompetitionLevel: sectionSchema,
      estimatedDifficultyLevel: sectionSchema,
      estimatedRoi: sectionSchema,
      marketOpportunityScore: sectionSchema,
      finalConclusion: sectionSchema
    },
    required: [
      'businessRisks', 'investmentRequirement', 'revenueModel', 'launchChecklist', 'actionPlan90Day', 'oneYearRoadmap',
      'aiRecommendations', 'businessScore', 'successProbability', 'estimatedCompetitionLevel', 'estimatedDifficultyLevel',
      'estimatedRoi', 'marketOpportunityScore', 'finalConclusion'
    ]
  };

  return callGemini(prompt, schema, false);
}

/**
 * MODULE 6: Brand & Business Assets (Bonus Features)
 */
export async function generateModule6(details) {
  const metadata = buildBusinessMetadata(details);
  const prompt = `
You are a Branding Consultant, Product Manager, and Financial Advisor.
Generate Module 6: Premium Brand & Business Assets containing all 27 bonus assets.

${metadata}

You must reply with a structured JSON document conforming EXACTLY to this schema:
{
  "businessNameGenerator": ["Name option 1", "Name option 2", "Name option 3", "Name option 4", "Name option 5"],
  "domainSuggestions": ["domain1.com", "domain2.co", "domain3.io", "domain4.app"],
  "logoIdeas": ["Logo description 1: color palette, icon layout", "Logo description 2"],
  "brandColorSuggestions": ["#HEX1 - Primary Color", "#HEX2 - Secondary Color", "#HEX3 - Background Accent"],
  "mission": "Core Mission Statement",
  "vision": "Long term Vision Statement",
  "taglineGenerator": ["Tagline 1", "Tagline 2", "Tagline 3"],
  "uvp": "Unique Value Proposition summary",
  "elevatorPitch": "30-second elevator pitch",
  "investorPitch": "Investor pitch narrative (3 paragraphs)",
  "pitchDeckOutline": "Slide-by-slide structure (Slides 1-10)",
  "businessCanvas": {
    "keyPartners": "Key partners list",
    "keyActivities": "Key activities list",
    "keyResources": "Key resources list",
    "valuePropositions": "Value propositions",
    "customerRelationships": "Relationship types",
    "channels": "Channel list",
    "customerSegments": "Segment description",
    "costStructure": "Cost drivers",
    "revenueStreams": "Revenue channels"
  },
  "leanCanvas": {
    "problem": "Top 3 problems",
    "solution": "Top 3 solutions",
    "uniqueValueProposition": "Core UVP",
    "unfairAdvantage": "Competitive advantage",
    "customerSegments": "Target segments",
    "keyMetrics": "KPIs to track",
    "channels": "Launch channels",
    "costStructure": "Fixed & variable costs",
    "revenueStreams": "Pricing model & revenue streams"
  },
  "financialProjection": {
    "year1Revenue": "$XXXXX",
    "year2Revenue": "$XXXXX",
    "year3Revenue": "$XXXXX",
    "cogs": "Cost of Goods Sold description",
    "margins": "Gross margin targets"
  },
  "breakEvenAnalysis": {
    "fixedCosts": "Fixed expenses monthly",
    "variableCostsPerUnit": "Variable expense per sale",
    "sellingPricePerUnit": "AOV",
    "breakEvenUnits": "Units needed monthly to break even",
    "breakEvenRevenue": "Revenue threshold monthly"
  },
  "unitEconomics": {
    "cac": "Customer Acquisition Cost range",
    "clv": "Customer Lifetime Value range",
    "paybackPeriod": "Months to recover CAC",
    "marginPercent": "Gross margin percentage"
  },
  "customerJourney": {
    "awareness": "How they discover the brand",
    "consideration": "How they compare offerings",
    "purchase": "Frictionless purchase steps",
    "retention": "Retention loops and onboarding",
    "advocacy": "Referral trigger points"
  },
  "buyerPersona": {
    "demographics": "Age, occupation, city",
    "interests": "Hobbies, reading lists, forums",
    "goals": "Core goals",
    "challenges": "Friction points"
  },
  "contentCalendar": [
    { "week": 1, "topic": "Educational blog post on problem space", "channels": ["LinkedIn", "Instagram"] },
    { "week": 2, "topic": "UVP comparison and competitor callout", "channels": ["YouTube", "Email"] }
  ],
  "emailCampaignIdeas": [
    { "subject": "Welcome Offer + Core Problem solved", "intent": "Welcome sequence" },
    { "subject": "Why legacy alternatives fail", "intent": "Nurture sequence" }
  ],
  "influencerStrategy": "Micro-influencer strategies and outreach templates",
  "affiliateStrategy": "Commission splits and tracking templates",
  "referralStrategy": "Refer-a-friend loop design and incentive programs",
  "expansionStrategy": "Geographical expansion roadmap",
  "localizationStrategy": "Language and local pricing templates",
  "franchisePossibility": "Feasibility review of franchising the concept",
  "exitStrategy": "IPO, acquisition, or buyout targets"
}
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      businessNameGenerator: { type: 'ARRAY', items: { type: 'STRING' } },
      domainSuggestions: { type: 'ARRAY', items: { type: 'STRING' } },
      logoIdeas: { type: 'ARRAY', items: { type: 'STRING' } },
      brandColorSuggestions: { type: 'ARRAY', items: { type: 'STRING' } },
      mission: { type: 'STRING' },
      vision: { type: 'STRING' },
      taglineGenerator: { type: 'ARRAY', items: { type: 'STRING' } },
      uvp: { type: 'STRING' },
      elevatorPitch: { type: 'STRING' },
      investorPitch: { type: 'STRING' },
      pitchDeckOutline: { type: 'STRING' },
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
        },
        required: ['keyPartners', 'keyActivities', 'keyResources', 'valuePropositions', 'customerRelationships', 'channels', 'customerSegments', 'costStructure', 'revenueStreams']
      },
      leanCanvas: {
        type: 'OBJECT',
        properties: {
          problem: { type: 'STRING' },
          solution: { type: 'STRING' },
          uniqueValueProposition: { type: 'STRING' },
          unfairAdvantage: { type: 'STRING' },
          customerSegments: { type: 'STRING' },
          keyMetrics: { type: 'STRING' },
          channels: { type: 'STRING' },
          costStructure: { type: 'STRING' },
          revenueStreams: { type: 'STRING' }
        },
        required: ['problem', 'solution', 'uniqueValueProposition', 'unfairAdvantage', 'customerSegments', 'keyMetrics', 'channels', 'costStructure', 'revenueStreams']
      },
      financialProjection: {
        type: 'OBJECT',
        properties: {
          year1Revenue: { type: 'STRING' },
          year2Revenue: { type: 'STRING' },
          year3Revenue: { type: 'STRING' },
          cogs: { type: 'STRING' },
          margins: { type: 'STRING' }
        },
        required: ['year1Revenue', 'year2Revenue', 'year3Revenue', 'cogs', 'margins']
      },
      breakEvenAnalysis: {
        type: 'OBJECT',
        properties: {
          fixedCosts: { type: 'STRING' },
          variableCostsPerUnit: { type: 'STRING' },
          sellingPricePerUnit: { type: 'STRING' },
          breakEvenUnits: { type: 'STRING' },
          breakEvenRevenue: { type: 'STRING' }
        },
        required: ['fixedCosts', 'variableCostsPerUnit', 'sellingPricePerUnit', 'breakEvenUnits', 'breakEvenRevenue']
      },
      unitEconomics: {
        type: 'OBJECT',
        properties: {
          cac: { type: 'STRING' },
          clv: { type: 'STRING' },
          paybackPeriod: { type: 'STRING' },
          marginPercent: { type: 'STRING' }
        },
        required: ['cac', 'clv', 'paybackPeriod', 'marginPercent']
      },
      customerJourney: {
        type: 'OBJECT',
        properties: {
          awareness: { type: 'STRING' },
          consideration: { type: 'STRING' },
          purchase: { type: 'STRING' },
          retention: { type: 'STRING' },
          advocacy: { type: 'STRING' }
        },
        required: ['awareness', 'consideration', 'purchase', 'retention', 'advocacy']
      },
      buyerPersona: {
        type: 'OBJECT',
        properties: {
          demographics: { type: 'STRING' },
          interests: { type: 'STRING' },
          goals: { type: 'STRING' },
          challenges: { type: 'STRING' }
        },
        required: ['demographics', 'interests', 'goals', 'challenges']
      },
      contentCalendar: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            week: { type: 'INTEGER' },
            topic: { type: 'STRING' },
            channels: { type: 'ARRAY', items: { type: 'STRING' } }
          },
          required: ['week', 'topic', 'channels']
        }
      },
      emailCampaignIdeas: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            subject: { type: 'STRING' },
            intent: { type: 'STRING' }
          },
          required: ['subject', 'intent']
        }
      },
      influencerStrategy: { type: 'STRING' },
      affiliateStrategy: { type: 'STRING' },
      referralStrategy: { type: 'STRING' },
      expansionStrategy: { type: 'STRING' },
      localizationStrategy: { type: 'STRING' },
      franchisePossibility: { type: 'STRING' },
      exitStrategy: { type: 'STRING' }
    },
    required: [
      'businessNameGenerator', 'domainSuggestions', 'logoIdeas', 'brandColorSuggestions', 'mission', 'vision',
      'taglineGenerator', 'uvp', 'elevatorPitch', 'investorPitch', 'pitchDeckOutline', 'businessCanvas',
      'leanCanvas', 'financialProjection', 'breakEvenAnalysis', 'unitEconomics', 'customerJourney',
      'buyerPersona', 'contentCalendar', 'emailCampaignIdeas', 'influencerStrategy', 'affiliateStrategy',
      'referralStrategy', 'expansionStrategy', 'localizationStrategy', 'franchisePossibility', 'exitStrategy'
    ]
  };

  return callGemini(prompt, schema, false);
}

/**
 * HIGH-QUALITY MOCK GENERATOR FALLBACK (Generates simulated data if API limits hit or offline)
 */
export function generateDetailedMockReport(details) {
  const name = details.businessName;
  const ind = details.industry;
  const prod = details.products;
  const model = details.businessModel;

  const makeMockSection = (title, content, recs = [], chart = null) => ({
    title,
    content,
    recommendations: recs.length > 0 ? recs : [
      {
        title: `Execute foundational channel tests`,
        why: `Initial stage businesses must validate channel-market fit before allocating heavy spend.`,
        how: `Launch structured organic outlines and cold outreach campaigns to 50 prospective clients.`,
        impact: 'High', difficulty: 'Low', cost: 'Free', timeframe: '14 days'
      }
    ],
    trustIndicators: [
      { type: 'assumption', label: `Heuristic market calculations based on ${details.businessStage || 'MVP'} parameters` }
    ],
    chartData: chart
  });

  const sections = {
    businessSummary: makeMockSection("Business Summary", `**${name}** operates a premium **${model}** business within the **${ind}** industry. The company offers **${prod}** designed to resolve core target audience gaps. Operations are tailored for early scaling based on localized market structures.`),
    executiveSummary: makeMockSection("Executive Summary", `Comprehensive McKinsey-style strategic audit for **${name}**. To capture immediate market share, the business should optimize pricing tiers and initiate high-conviction keyword funnels. The market displays strong underlying demand, though initial brand awareness remains the primary bottleneck.`),
    marketSize: makeMockSection("Market Size (TAM, SAM, SOM)", `TAM is estimated based on the total addressable consumer base in ${details.targetCountry || 'the country'}. SAM represents the target segment interested in digital-first alternatives, and SOM reflects the initial capture target over year 1.`, [], {
      labels: ["TAM", "SAM", "SOM"],
      values: [120000000, 30000000, 4500000]
    }),
    industryOverview: makeMockSection("Industry Overview", `The ${ind} sector is undergoing digital consolidations. Consumers expect seamless integrations and fast support. Regulatory concerns focus on local privacy frameworks, which must be built into operations.`),
    industryGrowthRate: makeMockSection("Industry Growth Rate", `The industry exhibits a robust historical growth pattern. Standard forecasts project a stable CAGR of 8.2% through 2030, driven by customer habits and service upgrades.`, [], {
      labels: ["2023", "2024", "2025", "2026", "2027", "2028 (Proj)"],
      values: [4.8, 5.5, 6.2, 7.0, 7.8, 8.5]
    }),
    currentTrends: makeMockSection("Current Industry Trends", `1. Automation of service layers.\n2. Sustainable packaging and zero-carbon shipping footprints.\n3. Increased shift to mobile-first purchase pathways.`),
    futureTrends: makeMockSection("Future Trends", `In the coming decade, we project deep AI integration in personalization, predictive inventory management, and localization of supply chains.`),
    customerPersona: makeMockSection("Customer Persona", `Our primary target persona consists of tech-forward decision-makers seeking efficiency. They prioritize clear ROI benchmarks and responsive support systems.`),
    customerProblems: makeMockSection("Customer Problems", `1. High initial setups.\n2. Lack of transparent pricing options.\n3. Confusing user interfaces in legacy products.`),
    customerNeeds: makeMockSection("Customer Needs", `1. Direct value metrics.\n2. Fast integrations.\n3. Accessible customer success reps.`),
    buyingBehaviour: makeMockSection("Buying Behaviour", `Purchases are triggered by operational bottlenecks. Decisions are made within 14-30 days, following online comparison review audits.`),
    marketDemand: makeMockSection("Market Demand", `Search volumes for terms related to ${prod} have grown by 35% in the last 12 months, indicating a clear, growing consumer appetite.`),
    marketGap: makeMockSection("Market Gap", `Legacy competitors focus on enterprise solutions, leaving SMBs and direct consumers underserved with high pricing walls.`),
    opportunities: makeMockSection("Opportunities", `1. Untapped local search terms.\n2. Affiliate marketing relationships.\n3. Dynamic pricing models.`),
    threats: makeMockSection("Threats", `1. Rising CPC costs across Google/Meta.\n2. Low switching barriers for consumers.`),
    swotAnalysis: makeMockSection("SWOT Analysis", `- **Strengths**: Agile team, custom value offerings.\n- **Weaknesses**: Limited capital budget.\n- **Opportunities**: Rapid tech integrations.\n- **Threats**: Established competitors.`),
    pestleAnalysis: makeMockSection("PESTLE Analysis", `- **Political**: Low compliance barriers.\n- **Economic**: Inflationary cost pressures on buyers.\n- **Social**: Growing preference for eco-conscious brands.\n- **Technological**: AI automation.\n- **Environmental**: Compliance checks.\n- **Legal**: GDPR / CCPA compliance.`),
    competitorResearch: makeMockSection("Competitor Research", `Direct competitors include legacy brands. They utilize traditional sales teams and have slower feature update times, leaving a positioning space for ${name}.`),
    keywordResearch: makeMockSection("Keyword Research", `Top search terms include: "${name} reviews", "${ind} pricing", and "best ${prod}". Local keyword intent is high.`),
    seoStrategy: makeMockSection("SEO Strategy", `Establish technical SEO compliance, implement schema markup, and generate 10 blog hubs linking to conversion pages.`),
    socialMediaStrategy: makeMockSection("Social Media Strategy", `Deploy expert-led LinkedIn posts and visual Instagram reels showing product applications.`),
    contentMarketingPlan: makeMockSection("Content Marketing Plan", `Publish weekly case studies and distribute monthly newsletters highlighting operational cost reductions.`),
    paidAdsStrategy: makeMockSection("Paid Ads Strategy", `Run retargeting ads on Meta and search ads on Google matching high-intent keywords.`),
    pricingStrategy: makeMockSection("Pricing Strategy", `Implement a three-tier model: Starter (entry level), Professional (standard AOV), and Custom Enterprise.`),
    salesStrategy: makeMockSection("Sales Strategy", `Provide interactive product walkthroughs and handle price objections by highlighting long-term ROI.`),
    customerAcquisition: makeMockSection("Customer Acquisition", `Focus on organic content loops and cold outreach to targeted local lists.`),
    retentionStrategy: makeMockSection("Retention Strategy", `Design a 14-day customer success onboarding flow and check in quarterly for upgrades.`),
    businessRisks: makeMockSection("Business Risks", `Cash flow constraints and competitor advertising campaigns undercutting prices.`),
    investmentRequirement: makeMockSection("Investment Requirement", `Requires $25,000 for launch setup and 6 months of operational runway.`),
    revenueModel: makeMockSection("Revenue Model", `Subscription packages yielding a gross margin of 75%.`),
    growthStrategy: makeMockSection("Growth Strategy", `Acquire early traction, scale to adjacent geographies, and launch white-label offerings.`),
    goToMarketStrategy: makeMockSection("Go-To-Market Strategy", `Phase 1: Build organic SEO assets. Phase 2: Run micro-targeted PPC ads. Phase 3: Launch referral loops.`),
    launchChecklist: makeMockSection("Launch Checklist", `- Connect payment gateways.\n- Verify GA4 tracking.\n- Publish privacy policy.\n- Load landing page email forms.`),
    actionPlan90Day: makeMockSection("90-Day Action Plan", `- **Days 1-30**: Build assets and verify emails.\n- **Days 31-60**: Launch search ads.\n- **Days 61-90**: Roll out client referral systems.`),
    oneYearRoadmap: makeMockSection("One-Year Roadmap", `- **Month 3**: Secure first 20 clients.\n- **Month 6**: Launch secondary product.\n- **Month 12**: Reach target revenue.`),
    aiRecommendations: makeMockSection("AI Recommendations", `Deploy AI-powered support chat, automate email sequencing, and utilize LLMs for daily content drafting.`),
    businessScore: makeMockSection("Business Score", `The business scores highly on market potential but requires initial brand equity building.`, [], {
      labels: ["Market Demand", "Unit Economics", "Competition Risk", "Operational Feasibility"],
      values: [85, 78, 65, 82]
    }),
    successProbability: makeMockSection("Success Probability", `Estimated success probability is 78%, backed by strong industry trends and high unit economics.`),
    estimatedCompetitionLevel: makeMockSection("Estimated Competition Level", `Moderate. Primary competitors focus on general markets, leaving room for specialized local USPs.`),
    estimatedDifficultyLevel: makeMockSection("Estimated Difficulty Level", `Low to Medium. Startup requirements are digital-first with low physical logistic footprints.`),
    estimatedRoi: makeMockSection("Estimated ROI", `Breakeven projected in month 4, with 3x investment returns by year 2.`),
    marketOpportunityScore: makeMockSection("Market Opportunity Score", `The Market Opportunity Score is 88/100, indicating high readiness for target segments.`),
    finalConclusion: makeMockSection("Final Conclusion", `The proposed business showcases solid viability. Focus on immediate SEO keyword authority and clear value pricing to capture early customers.`)
  };

  const bonusAssets = {
    businessNameGenerator: [`${name} Peak`, `${name} Flow`, `Omni${name}`, `True${name}`, `${name} Logic`],
    domainSuggestions: [`get${name.toLowerCase()}.com`, `${name.toLowerCase()}app.co`, `try${name.toLowerCase()}.io`],
    logoIdeas: ["Minimalist sans-serif wordmark in slate gray", "Abstract circular logo signifying growth and sustainability"],
    brandColorSuggestions: ["#4F46E5 - Royal Indigo", "#10B981 - Emerald Green", "#F8FAF8 - Light Pearl Accent"],
    mission: `To empower target audience personas with reliable, premium, and sustainable ${prod} offerings.`,
    vision: `To become the leading digital-first brand trusted globally in the ${ind} space.`,
    taglineGenerator: ["Simplify your operations.", "The future of sustainability, today.", "Growth made effortless."],
    uvp: `Premium, carbon-neutral ${prod} engineered for modern convenience.`,
    elevatorPitch: `We help home businesses reduce friction and improve sustainability by delivering premium ${prod}. Unlike legacy players who use plastic wraps, our bamboo fiber solutions save money and the environment.`,
    investorPitch: `${name} is entering the rapidly expanding ${ind} sector. Our focus is zero-waste domestic accessories. With initial capital, we will secure logistics lines, scale Meta ads, and capture 15% SOM in North America.`,
    pitchDeckOutline: "Slide 1: Vision\nSlide 2: Problem\nSlide 3: Solution\nSlide 4: Product\nSlide 5: TAM/SAM\nSlide 6: Competition\nSlide 7: Business Model\nSlide 8: Financials\nSlide 9: Team\nSlide 10: Ask",
    businessCanvas: {
      keyPartners: "Local logistics networks, raw bamboo suppliers",
      keyActivities: "Manufacturing compliance, online marketing management",
      keyResources: "Proprietary molds, Shopify ecommerce platforms",
      valuePropositions: "Premium zero-waste household options",
      customerRelationships: "Automated support chats, newsletter communities",
      channels: "Direct D2C web portal, select retail boutiques",
      customerSegments: "Eco-conscious millennial homeowners",
      costStructure: "CPC marketing fees, raw logistics warehousing",
      revenueStreams: "Transactional orders, monthly subscriptions"
    },
    leanCanvas: {
      problem: "Eco-friendly goods are overpriced; packaging uses plastic; designs look cheap.",
      solution: "Provide affordable, beautifully designed bamboo goods in zero-waste parcels.",
      uniqueValueProposition: "Eco-friendly domestic accessories with high-end designer aesthetics.",
      unfairAdvantage: "Direct factory relationships reducing costs by 30%.",
      customerSegments: "Modern eco-focused homeowners aged 25-45.",
      keyMetrics: "LTV/CAC ratio, monthly active subscriptions, return rates.",
      channels: "Social Media Ads (Meta/Pinterest), SEO blog channels.",
      costStructure: "Manufacturing materials, shipping fulfillment, ad acquisition.",
      revenueStreams: "Single orders, quarterly kitchen refill subscriptions."
    },
    financialProjection: {
      year1Revenue: "$120,000",
      year2Revenue: "$350,000",
      year3Revenue: "$850,000",
      cogs: "Raw product cost: 22% of AOV",
      margins: "Target gross margin of 78%"
    },
    breakEvenAnalysis: {
      fixedCosts: "$3,500/mo",
      variableCostsPerUnit: "$8.50",
      sellingPricePerUnit: "$45.00",
      breakEvenUnits: "96 units/mo",
      breakEvenRevenue: "$4,320/mo"
    },
    unitEconomics: {
      cac: "$14.00",
      clv: "$135.00",
      paybackPeriod: "3 months",
      marginPercent: "78%"
    },
    customerJourney: {
      awareness: "Sees visual Instagram ad highlighting plastic-free packaging.",
      consideration: "Reads comparison article showing bamboo lifespan vs paper.",
      purchase: "Signs up for 10% first-order discount and checks out.",
      retention: "Receives onboarding recycling guide emails.",
      advocacy: "Shares referral code on social media to earn store credits."
    },
    buyerPersona: {
      demographics: "Sarah, 32, Marketing Director, San Francisco",
      interests: "Organic cooking, home organizing blogs, hiking",
      goals: "Minimize household waste, support local eco-brands",
      challenges: "Busy schedule leaves little time to research options"
    },
    contentCalendar: [
      { week: 1, topic: "The hidden plastics in your kitchen tools", channels: ["Instagram", "Pinterest"] },
      { week: 2, topic: "How switching to bamboo saves $200 a year", channels: ["Email", "Blog"] }
    ],
    emailCampaignIdeas: [
      { subject: "Ditch the paper: here is 10% off EcoSphere", intent: "Welcome Flow" },
      { subject: "Sarah, your kitchen deserves this upgrade", intent: "Cart Abandonment Flow" }
    ],
    influencerStrategy: "Partner with micro-influencers in home design and sustainable living niches, sending free starter bundles for review reels.",
    affiliateStrategy: "Offer lifestyle bloggers 12% commission on all referred sales with 30-day tracking cookies.",
    referralStrategy: "Refer a friend: both get $10 credit when they place their first subscription order.",
    expansionStrategy: "Expand shipping to Germany and the United Kingdom in year 2.",
    localizationStrategy: "Translate landing page to French/German and display localized pricing in Euros and British Pounds.",
    franchisePossibility: "Low feasibility for retail storefront franchise; high feasibility for localized online distribution licensing.",
    exitStrategy: "Targeted acquisition by large FMCG brands looking to expand their green portfolio by year 5."
  };

  return { sections, bonusAssets };
}
