import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Extracts basic metadata from HTML string
 */
function extractMeta(html) {
  const result = {
    title: '',
    description: '',
    techKeywords: []
  };

  try {
    // Basic title extractor
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) result.title = titleMatch[1].trim();

    // Basic meta description extractor
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    if (descMatch) result.description = descMatch[1].trim();

    // Tech signatures
    if (html.includes('wp-content') || html.includes('wp-includes')) result.techKeywords.push('WordPress');
    if (html.includes('Shopify.shop')) result.techKeywords.push('Shopify');
    if (html.includes('google-analytics.com') || html.includes('googletagmanager')) result.techKeywords.push('Google Analytics');
    if (html.includes('fbq(')) result.techKeywords.push('Meta Pixel');
    if (html.includes('hubspot')) result.techKeywords.push('HubSpot CRM');
    if (html.includes('intercom')) result.techKeywords.push('Intercom');
  } catch (err) {
    console.error('Error extracting page metadata:', err.message);
  }

  return result;
}

/**
 * Enriches business data using website URL scraping + Gemini Web Grounding
 */
export const enrichWebsiteData = async (url) => {
  if (!url) {
    throw new Error('URL is required for enrichment.');
  }

  // Ensure url protocol
  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  let htmlContent = '';
  let metaInfo = { title: '', description: '', techKeywords: [] };

  // Attempt lightweight fetch using native global fetch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      htmlContent = await res.text();
      metaInfo = extractMeta(htmlContent);
    }
  } catch (err) {
    console.warn(`Direct fetch failed for ${targetUrl}: ${err.message}. Proceeding with LLM research.`);
  }

  // If Gemini client is active, run search grounding to identify details
  if (ai) {
    console.log(`Running Gemini web search enrichment for website: ${targetUrl}...`);
    const prompt = `
Analyze the website "${targetUrl}" and provide a structured JSON profile for the business.
HTML Meta Title Extracted: "${metaInfo.title || 'N/A'}"
HTML Meta Description Extracted: "${metaInfo.description || 'N/A'}"
Heuristics Tech Stack: [${metaInfo.techKeywords.join(', ')}]

Use web search grounding to gather accurate context about what this company does, their industry sector, their products/services, their brand description, and their technology stack/analytics.

You must reply with a structured JSON document conforming EXACTLY to this schema:
{
  "businessName": "Suggested company/business name",
  "industry": "Industry sector e.g. SaaS & Tech, E-commerce & Retail, Healthcare & Wellness, etc.",
  "products": "Primary products or services offered (comma-separated list, max 10 words)",
  "description": "Comprehensive description of what the company does, their operations, and offerings",
  "usp": "Core unique selling proposition or value proposition",
  "techStack": "Suggested tech stack/CRM/Analytics tool signatures (comma-separated list, e.g. WordPress, Google Analytics, Shopify)",
  "businessModel": "Choose one: B2B / B2C / D2C / SaaS / Marketplace / Agency / Other"
}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              businessName: { type: 'STRING' },
              industry: { type: 'STRING' },
              products: { type: 'STRING' },
              description: { type: 'STRING' },
              usp: { type: 'STRING' },
              techStack: { type: 'STRING' },
              businessModel: { type: 'STRING' }
            },
            required: ['businessName', 'industry', 'products', 'description', 'usp', 'techStack', 'businessModel']
          }
        }
      });

      return JSON.parse(response.text);
    } catch (geminiError) {
      console.error('Gemini enrichment call failed, using heuristic fallback:', geminiError);
    }
  }

  // Fallback / Offline / Mock responses
  console.log(`Generating simulated enrichment profile for URL: ${targetUrl}`);
  
  // Clean domain name to guess business name
  let domainName = 'Company';
  try {
    const parsed = new URL(targetUrl);
    const parts = parsed.hostname.replace('www.', '').split('.');
    if (parts.length > 0) {
      domainName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  } catch (e) {}

  // Guess industry based on keywords
  let industry = 'SaaS & Tech';
  let products = 'Cloud software solutions, enterprise productivity tools';
  let desc = `A digital solutions provider specialized in delivering modern cloud-based solutions to scale operations.`;
  let usp = 'High-efficiency systems designed to accelerate business workflows.';
  let model = 'B2B';

  const lowerUrl = targetUrl.toLowerCase();
  if (lowerUrl.includes('shop') || lowerUrl.includes('store') || lowerUrl.includes('organic') || lowerUrl.includes('retail')) {
    industry = 'E-commerce & Retail';
    products = 'Sustainable lifestyle accessories, eco-friendly household goods';
    desc = `Premium direct-to-consumer online boutique offering environmentally conscious lifestyle products and accessories.`;
    usp = '100% biodegradable and zero-waste alternatives for daily items.';
    model = 'D2C';
  } else if (lowerUrl.includes('health') || lowerUrl.includes('care') || lowerUrl.includes('fit') || lowerUrl.includes('clinic')) {
    industry = 'Healthcare & Wellness';
    products = 'Wellness coaching sessions, nutritional counseling plans';
    desc = `Comprehensive health and wellness consultancy empowering individuals to reach their goals through customized health plans.`;
    usp = 'Personalized clinical-grade health and exercise consulting.';
    model = 'B2C';
  } else if (lowerUrl.includes('agency') || lowerUrl.includes('design') || lowerUrl.includes('media') || lowerUrl.includes('consult')) {
    industry = 'Agency & B2B Services';
    products = 'Digital advertising campaigns, brand strategy consulting, UI design';
    desc = `Full-service creative agency helping brands stand out in crowded digital markets through conversion rate optimization.`;
    usp = 'Data-backed marketing blueprints with performance-based pricing.';
    model = 'Agency';
  }

  // If we extracted HTML meta tags, merge them
  if (metaInfo.title) {
    domainName = metaInfo.title.split('|')[0].split('-')[0].trim();
  }
  if (metaInfo.description) {
    desc = metaInfo.description;
  }

  const techList = [...new Set([...metaInfo.techKeywords, 'Google Analytics', 'WordPress'])];

  return {
    businessName: domainName,
    industry,
    products,
    description: desc,
    usp,
    techStack: techList.join(', '),
    businessModel: model
  };
};
