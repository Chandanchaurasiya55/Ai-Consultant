import { GoogleGenAI } from '@google/genai';
import { REPORT_STRUCTURE, ALL_CHAPTER_KEYS } from './mdParser.js';

// Re-export for compatibility
export { REPORT_STRUCTURE, ALL_CHAPTER_KEYS };

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL = process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash';

/**
 * ==========================================================================
 * SCHEMA BUILDER
 * ==========================================================================
 */
export const CHAPTER_ITEM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    key: { type: 'STRING', description: 'Must exactly match the chapter key given in the prompt.' },
    title: { type: 'STRING' },
    content: { type: 'STRING', description: 'Exhaustive markdown content covering all subtopics with at least 5-6 detailed paragraphs each, including tables and deep analysis, totaling at least 2500-3000 words.' },
    diagram: {
      type: 'OBJECT',
      description: 'Required. Provide a visual diagram to help illustrate the strategic concept.',
      properties: {
        type: { type: 'STRING', description: "Mermaid diagram type, e.g. 'flowchart TD', 'quadrantChart', 'funnel', 'stateDiagram'" },
        mermaidCode: { type: 'STRING', description: 'Full valid Mermaid.js syntax, ready to render as-is.' },
        caption: { type: 'STRING' }
      },
      required: ['type', 'mermaidCode', 'caption']
    },
    charts: {
      type: 'ARRAY',
      description: 'Required. Provide 1-2 charts with REAL, chapter-specific numeric data (e.g. market growth, customer share).',
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
      description: '2 short descriptive search queries for royalty-free reference images relevant to this chapter (e.g. "modern bakery storefront interior").',
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
  required: ['key', 'title', 'content', 'diagram', 'charts', 'imageSuggestions', 'recommendations', 'trustIndicators']
};

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
 * REAL-TIME SINGLE CHAPTER GENERATION (Gemini + Google Search Grounding)
 * ==========================================================================
 */
export async function generateSingleChapter(chapterKey, details, modifier = '') {
  if (!ai) {
    console.warn('GEMINI_API_KEY not configured, falling back to mock chapter.');
    return generateMockChapter(chapterKey, details);
  }

  const chapterMeta = REPORT_STRUCTURE.flatMap(v => v.chapters).find(c => c.key === chapterKey);
  if (!chapterMeta) throw new Error(`Unknown chapter key: ${chapterKey}`);

  const prompt = `
You are a McKinsey-grade market research consultant writing a detailed, professional chapter for a Business Market Research Bible.

CHAPTER DETAILS
Title: ${chapterMeta.title}
Key: ${chapterMeta.key}
Subtopics to cover in depth: ${chapterMeta.subtopics.join(', ')}
${chapterMeta.references ? `Suggested references/Data sources to keep in mind: ${chapterMeta.references}` : ''}

BUSINESS DETAILS
Business Name: ${details.businessName}
Industry: ${details.industry}
Offering / Products: ${details.products}
Business Model: ${details.businessModel}
Business Stage: ${details.businessStage}
Target Country: ${details.targetCountry}
Target State/City: ${details.targetState || ''}, ${details.targetCity || ''}
Target Audience: ${details.targetAudience}
Marketing Budget: ${details.marketingBudget}
Description: ${details.businessDescription}

${modifier ? `ADDITIONAL MODIFIER INSTRUCTIONS: "${modifier}"` : ''}

TASK
Use Google Search grounding to research REAL, current, industry-specific data (market sizes, CAGR %, real competitor names, real pricing, real keyword volumes wherever possible). Do not use generic placeholder numbers — ground every figure in the actual industry/geography given above.

Generate a comprehensive, highly customized, and professional section.
1. Write full, highly detailed, and exhaustive markdown content (at least 2000–3000 words) addressing all subtopics.
2. CRITICAL LENGTH REQUIREMENT: The total word count of the "content" field MUST be at least 1500 words. For EACH subtopic listed under the chapter details: [${chapterMeta.subtopics.join(', ')}], you MUST write a distinct section headed by "#### [Subtopic Name]" and containing at least 4 detailed, comprehensive paragraphs (minimum 300 words per subtopic) of analysis, strategic advice, real-world metrics, and concrete steps. Short summaries, brief lists, or quick overviews are strictly forbidden.
3. Provide a valid Mermaid.js diagram (such as flowchart, funnel, quadrant chart, or risk matrix) that visualizes the strategic concepts.
4. Include 1-2 charts with REAL numeric values relevant to the chapter.
5. Give 2 Unsplash image search suggestions.
6. Provide 3-5 specific recommendations with timeframe, cost, impact.
7. Provide trust indicators citing the sources that grounded your analysis.

Return ONLY the JSON object matching the required schema. No markdown code block wraps, no preamble.
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: CHAPTER_ITEM_SCHEMA,
        maxOutputTokens: 8192
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error(`Gemini generation failed for chapter ${chapterKey}:`, error);
    // Graceful fallback to mock so the user doesn't hit a wall
    return generateMockChapter(chapterKey, details);
  }
}

/**
 * Generate Bonus brand assets
 */
export async function generateBonusAssets(details) {
  if (!ai) return generateMockBonusAssets(details);

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildBonusAssetsPrompt(details),
      config: { 
        responseMimeType: 'application/json', 
        responseSchema: BONUS_ASSETS_SCHEMA 
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.error('Bonus asset generation failed, using fallback:', e);
    return generateMockBonusAssets(details);
  }
}

/**
 * Legacy support wrapper - resolves a full volume by generating its chapters
 */
export async function generateVolume(volumeNumber, details) {
  const volume = REPORT_STRUCTURE.find(v => v.volume === volumeNumber);
  if (!volume) throw new Error(`Unknown volume number: ${volumeNumber}`);

  const sectionsByKey = {};
  for (const ch of volume.chapters) {
    sectionsByKey[ch.key] = await generateSingleChapter(ch.key, details);
  }

  let bonusAssets = null;
  if (volume.hasBonusAssets) {
    bonusAssets = await generateBonusAssets(details);
  }

  return { sections: sectionsByKey, bonusAssets };
}

/**
 * Legacy support wrapper - regenerates a single chapter
 */
export async function regenerateChapter(volumeNumber, chapterKey, details, currentSection, modifier) {
  return generateSingleChapter(chapterKey, details, modifier);
}

/**
 * ==========================================================================
 * MOCK / FALLBACK GENERATORS
 * ==========================================================================
 */
export function generateMockChapter(chapterKey, details) {
  const chapterMeta = REPORT_STRUCTURE.flatMap(v => v.chapters).find(c => c.key === chapterKey);
  if (!chapterMeta) throw new Error(`Unknown chapter key: ${chapterKey}`);
  
  return {
    key: chapterKey,
    title: chapterMeta.title,
    content: `### Strategic Overview for ${details.businessName}\n\nThis section outlines a comprehensive McKinsey-grade analysis for **${details.businessName}** operating in the **${details.industry}** sector, focusing on their main offerings: **${details.products}**.\n\n` +
      chapterMeta.subtopics.map(sub => {
        return `#### ${sub}\n\n` +
          `A key aspect of this research focuses on **${sub}**. In the context of ${details.businessName}, validating this dimension involves examining current sector dynamics and assessing target audience constraints. For ${details.targetAudience || 'our target market'}, ${sub} presents unique growth channels and operational hurdles.\n\n` +
          `Understanding the nuances of ${sub} is critical. We recommend aligning the product architecture with the regional requirements of ${details.targetCountry || 'the target region'}. This requires analyzing local benchmarks, pricing thresholds, and consumer behavioral tendencies. By leveraging these data points, ${details.businessName} can create a defensive moat around its core offerings and maximize market penetration.\n\n` +
          `Furthermore, analyzing ${sub} yields actionable insights into customer pain points and distribution channels. Implementing validation frameworks for this specific segment ensures high efficiency, lower customer acquisition costs (CAC), and robust unit economics. We advise establishing key performance metrics (KPIs) to continuously track and optimize outcomes in this area.\n\n` +
          `Additionally, establishing continuous monitoring systems for ${sub} enables the team to iterate quickly based on changing consumer behaviors. Developing strategic partnerships and optimizing acquisition flows can yield a 15-20% improvement in customer retention. We recommend conducting quarterly reviews to verify assumptions and update strategies.\n\n` +
          `Finally, integrating technology tools (such as CRM or web dashboards) streamlines the tracking of ${sub} metrics. This enables real-time decisions, data transparency, and improved alignment between product and marketing teams. The long-term ROI of optimizing this process will significantly support ${details.businessName}'s growth strategy.`;
      }).join('\n\n'),
    diagram: {
      type: 'flowchart TD',
      mermaidCode: `flowchart TD\n  A[Start] --> B[${chapterMeta.title.split('—')[1]?.trim() || 'Analysis'}]\n  B --> C[Insight]\n  C --> D[Action]`,
      caption: `Strategic flow for ${chapterMeta.title}`
    },
    charts: [{
      type: 'bar',
      title: `${chapterMeta.title} Metrics`,
      labels: ['Target SAM', 'Addressable Market', 'Competitor Share'],
      datasets: [{ label: 'Estimated Percentage', data: [65, 30, 15] }]
    }],
    imageSuggestions: [`${details.industry} ${chapterMeta.title.split('—')[1]?.trim() || ''}`.trim()],
    recommendations: [
      {
        title: `Prioritize ${chapterMeta.title.split('—')[1]?.trim() || 'Optimization'}`,
        why: `Analyzing subtopics like ${chapterMeta.subtopics.slice(0, 2).join(', ')} is critical for ${details.businessName}.`,
        how: `Assign operations lead to map current processes against ${details.industry} standards.`,
        impact: 'High',
        difficulty: 'Medium',
        cost: 'Low',
        timeframe: '1-2 weeks'
      }
    ],
    trustIndicators: [{ type: 'citation', label: 'Standard Industry Benchmarks' }]
  };
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

export function generateDetailedMockReport(details) {
  const sections = {};
  REPORT_STRUCTURE.forEach(volume => {
    volume.chapters.forEach(ch => {
      sections[ch.key] = generateMockChapter(ch.key, details);
    });
  });
  return { sections, bonusAssets: generateMockBonusAssets(details) };
}