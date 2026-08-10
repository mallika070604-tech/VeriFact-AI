import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, Language } from '../types';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Please configure it in your secrets setting.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      description: 'The overall verdict on the primary ORIGINAL factual claim: REAL, MOSTLY_REAL, MISLEADING, MOSTLY_FALSE, FAKE, or UNVERIFIABLE.',
    },
    confidence: {
      type: Type.INTEGER,
      description: 'Confidence score from 0 to 100 based on the strength and quantity of available verifiable evidence.',
    },
    riskLevel: {
      type: Type.STRING,
      description: 'Risk rating considering potential public harm, health danger, financial fraud, or social unrest: LOW, MEDIUM, HIGH, or CRITICAL.',
    },
    category: {
      type: Type.STRING,
      description: 'Claim category: General News, Politics, Health, Science, Technology, Finance, Crime, Entertainment, Social Media, Emergency, or Other.',
    },
    evidenceQuality: {
      type: Type.STRING,
      description: 'Quality rating of available evidence: STRONG, MODERATE, WEAK, or INSUFFICIENT.',
    },
    isFactCheckArticle: {
      type: Type.BOOLEAN,
      description: 'Set to true if the input itself is a fact-check report, debunking article, or fact-check hub investigating claims.',
    },
    claimOrigin: {
      type: Type.STRING,
      description: 'The origin of the evaluated claim: ORIGINAL_CLAIM, ARTICLE_CONTEXT, or FACT_CHECK_CONCLUSION.',
    },
    factCheckContext: {
      type: Type.STRING,
      description: 'Short summary of the fact check context.',
    },
    factCheckDetails: {
      type: Type.OBJECT,
      properties: {
        isFactCheckArticle: { type: Type.BOOLEAN },
        factCheckedOrganization: { type: Type.STRING, description: 'The publishing fact-check media or organization, e.g. AP News, Snopes, Reuters Fact Check.' },
        originalClaim: { type: Type.STRING, description: 'The exact viral or original factual claim being fact-checked, NOT the meta context.' },
        factCheckConclusion: { type: Type.STRING, description: 'What the article concludes about the claim, e.g., "False. The photo was taken in 2018."' },
      },
      required: ['isFactCheckArticle', 'factCheckedOrganization', 'originalClaim', 'factCheckConclusion'],
    },
    sourceCredibility: {
      type: Type.OBJECT,
      properties: {
        organization: { type: Type.STRING, description: 'Name of the publisher/source.' },
        credibilityScore: { type: Type.INTEGER, description: 'Publisher credibility score from 0 to 100.' },
        ratingReason: { type: Type.STRING, description: 'Explanation of publisher reliability and transparency.' },
      },
      required: ['organization', 'credibilityScore', 'ratingReason'],
    },
    isMultipleClaimsDetected: {
      type: Type.BOOLEAN,
      description: 'Set to true if the webpage contains multiple distinct fact-checks or is a fact-check hub.',
    },
    subClaims: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          claim: { type: Type.STRING, description: 'The individual original claim being fact-checked.' },
          claimOrigin: { type: Type.STRING, description: 'ORIGINAL_CLAIM' },
          verdict: { type: Type.STRING, description: 'REAL, MOSTLY_REAL, MISLEADING, MOSTLY_FALSE, FAKE, or UNVERIFIABLE.' },
          confidence: { type: Type.INTEGER, description: '0 to 100' },
          riskLevel: { type: Type.STRING, description: 'LOW, MEDIUM, HIGH, or CRITICAL' },
          evidenceQuality: { type: Type.STRING, description: 'STRONG, MODERATE, WEAK, or INSUFFICIENT' },
          summary: { type: Type.STRING },
          explanation: { type: Type.STRING },
          factCheckConclusion: { type: Type.STRING },
          warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                link: { type: Type.STRING },
                relevance: { type: Type.STRING },
              },
              required: ['name', 'title', 'link', 'relevance'],
            },
          },
        },
        required: ['claim', 'claimOrigin', 'verdict', 'confidence', 'evidenceQuality', 'summary', 'explanation', 'factCheckConclusion', 'evidence', 'sources'],
      },
      description: 'List of individual claims extracted if multiple fact-checked claims were detected on a page.',
    },
    claim: {
      type: Type.STRING,
      description: 'The exact single primary original factual claim being evaluated (or "Multiple fact-checked claims detected").',
    },
    summary: {
      type: Type.STRING,
      description: 'A 2-3 sentence executive summary of the evaluation.',
    },
    explanation: {
      type: Type.STRING,
      description: 'In-depth explanation detailing why the claim is true, misleading, fake, or unverifiable.',
    },
    warningSigns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of specific red flags, emotional manipulation, unverified quotes, or missing context.',
    },
    evidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Bullet points of concrete, verifiable facts, official statements, scientific data, or cross-references.',
    },
    sources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          title: { type: Type.STRING },
          link: { type: Type.STRING },
          relevance: { type: Type.STRING },
        },
        required: ['name', 'title', 'link', 'relevance'],
      },
      description: 'List of real, trustworthy authoritative sources or reference links supporting this verdict. Do NOT fabricate fake sources.',
    },
    recommendedAction: {
      type: Type.STRING,
      description: 'Clear advice for the user.',
    },
    detectedLanguage: {
      type: Type.STRING,
      description: 'The language detected in the input.',
    },
    claimType: {
      type: Type.STRING,
      description: 'Short claim classification tag.',
    },
  },
  required: [
    'verdict',
    'confidence',
    'riskLevel',
    'category',
    'evidenceQuality',
    'claim',
    'summary',
    'explanation',
    'warningSigns',
    'evidence',
    'sources',
    'recommendedAction',
    'detectedLanguage',
    'claimType',
  ],
};

const SYSTEM_INSTRUCTIONS = `
You are VeriFact AI, an expert cybersecurity, investigative journalism, and AI fact-checking intelligence system.
Your mission is to evaluate factual claims with extreme objectivity, mathematical rigor, and zero hallucination.

CRITICAL DIRECTIVES FOR FACT-CHECK ARTICLES & URL CLAIM EXTRACTION:

1. IDENTIFY THE ORIGINAL CLAIM:
   - When a URL or text is a fact-check article or fact-check hub (e.g. from AP News, Snopes, Reuters Fact Check, PolitiFact, AFP, etc.):
     * You MUST identify and extract the ORIGINAL VIRAL CLAIM being fact-checked.
     * Do NOT use the fact-check article's own meta-summary or background statement (such as "False and misleading claims were widely circulated during the election...") as the claim! That is ARTICLE_CONTEXT, NOT the viral claim.
     * Do NOT classify the fact-check article or news publisher itself as the claim (e.g., do NOT mark AP News as REAL).
     * Do NOT generate a generic claim about misinformation existing.
     * Set claimOrigin = "ORIGINAL_CLAIM".

2. LOOK FOR EXPLICIT CLAIM PATTERNS:
   - Explicitly search for claim indicators in the text:
     * "Claim:"
     * "The claim:"
     * "Posts claimed..."
     * "Social media users claimed..."
     * "A viral post claimed..."
     * "False claim..."
     * "Misleading claim..."
     * Headlines or subheadings describing the viral rumor/claim
     * Direct quotes that the article investigates.
   - Preserve the original wording of the viral claim as much as possible.

3. MULTIPLE CLAIMS & FACT-CHECK HUBS:
   - If the page contains MULTIPLE distinct fact-checks (e.g., a weekly roundup or fact-check hub page):
     * Do NOT invent one combined meta-claim.
     * Set isMultipleClaimsDetected = true.
     * Extract each individual claim separately into the subClaims array.
     * Each subClaim must have its own: claim, claimOrigin ("ORIGINAL_CLAIM"), verdict, confidence, riskLevel, evidenceQuality, summary, explanation, factCheckConclusion, evidence, and sources.
     * The top-level claim should be: "Multiple fact-checked claims detected" or "Multiple claims from [Organization]".

4. IF CANNOT RELIABLY ISOLATE AN ORIGINAL CLAIM:
   - If an original factual claim CANNOT be reliably isolated from the page:
     * Set verdict = "UNVERIFIABLE".
     * Set explanation = "An original factual claim could not be reliably isolated from this page."
     * Do NOT guess or hallucinate a claim.

5. SEPARATE SOURCE CREDIBILITY FROM CLAIM VERDICT:
   - Do NOT assign "REAL 95%" simply because the fact-checking organization is trustworthy.
   - The publisher's reliability belongs in sourceCredibility (e.g., organization: "AP News", credibilityScore: 95, ratingReason: "Independent international news organization with high standards").
   - The viral claim's verdict depends strictly on the truthfulness of the ORIGINAL VIRAL CLAIM being investigated! (e.g. if AP News debunks a false claim that drinking bleach cures COVID, verdict = FAKE, confidence = 95%).

6. VERDICT LOGIC RULES:
   - If the fact-check article explicitly concludes the ORIGINAL CLAIM is false: verdict = "FAKE" or "MOSTLY_FALSE".
   - If it says the claim is misleading / out of context: verdict = "MISLEADING".
   - If it says the claim is substantially true: verdict = "REAL" or "MOSTLY_REAL".
   - If evidence is insufficient or claim cannot be isolated: verdict = "UNVERIFIABLE".

7. MULTILINGUAL OUTPUT:
   - Provide summary, explanation, evidence, warningSigns, and recommendedAction in the requested target language (English, Telugu, or Hindi).
`;

function normalizeAnalysisResult(parsed: any): any {
  const isFactCheck = Boolean(parsed.isFactCheckArticle || parsed.factCheckDetails?.isFactCheckArticle);

  let claimOrigin = parsed.claimOrigin || 'ORIGINAL_CLAIM';
  if (!['ORIGINAL_CLAIM', 'ARTICLE_CONTEXT', 'FACT_CHECK_CONCLUSION'].includes(claimOrigin)) {
    claimOrigin = 'ORIGINAL_CLAIM';
  }

  let factCheckDetails = parsed.factCheckDetails;
  if (isFactCheck && (!factCheckDetails || typeof factCheckDetails !== 'object')) {
    factCheckDetails = {
      isFactCheckArticle: true,
      factCheckedOrganization: parsed.sources?.[0]?.name || parsed.sourceCredibility?.organization || 'Fact-Checking Publisher',
      originalClaim: parsed.claim || 'Extracted viral claim',
      factCheckConclusion: parsed.summary || parsed.explanation || 'Analyzed fact-check report',
    };
  }

  let claim = parsed.claim || '';
  if (isFactCheck && factCheckDetails?.originalClaim && factCheckDetails.originalClaim.trim().length > 5) {
    if (
      claim.toLowerCase().includes('false and misleading claims') ||
      claim.toLowerCase().includes('widely circulated') ||
      claim.toLowerCase().includes('misinformation was circulated') ||
      claim.toLowerCase().includes('social media posts claimed') ||
      claim.toLowerCase().includes('articles claimed')
    ) {
      claim = factCheckDetails.originalClaim;
    }
  }

  let sourceCredibility = parsed.sourceCredibility;
  if (!sourceCredibility && isFactCheck) {
    sourceCredibility = {
      organization: factCheckDetails?.factCheckedOrganization || 'Independent Publisher',
      credibilityScore: 90,
      ratingReason: 'Established journalism/fact-checking media outlet evaluated separately from the viral claim.',
    };
  }

  const originalClaim = factCheckDetails?.originalClaim || claim;
  const sourceName = sourceCredibility?.organization || factCheckDetails?.factCheckedOrganization || parsed.sources?.[0]?.name || 'Analyzed Source';

  return {
    ...parsed,
    claim,
    originalClaim,
    claimOrigin,
    isFactCheckArticle: isFactCheck,
    factCheckContext:
      typeof parsed.factCheckContext === 'string' && parsed.factCheckContext.length > 0
        ? parsed.factCheckContext
        : isFactCheck
        ? `Fact-check article from ${factCheckDetails?.factCheckedOrganization || 'publisher'}`
        : undefined,
    factCheckDetails: isFactCheck ? factCheckDetails : undefined,
    sourceCredibility,
    sourceName,
    isMultipleClaimsDetected: Boolean(
      parsed.isMultipleClaimsDetected || (parsed.subClaims && parsed.subClaims.length > 1)
    ),
    subClaims:
      Array.isArray(parsed.subClaims) && parsed.subClaims.length > 0
        ? parsed.subClaims.map((sc: any, idx: number) => ({
            id: `sub-${idx + 1}`,
            claim: sc.claim || 'Extracted Claim',
            claimOrigin: 'ORIGINAL_CLAIM',
            verdict: sc.verdict || 'UNVERIFIABLE',
            confidence: typeof sc.confidence === 'number' ? sc.confidence : 50,
            riskLevel: sc.riskLevel || 'MEDIUM',
            evidenceQuality: sc.evidenceQuality || 'MODERATE',
            summary: sc.summary || '',
            explanation: sc.explanation || '',
            factCheckConclusion: sc.factCheckConclusion || sc.summary || '',
            warningSigns: Array.isArray(sc.warningSigns) ? sc.warningSigns : [],
            evidence: Array.isArray(sc.evidence) ? sc.evidence : [],
            sources: Array.isArray(sc.sources) ? sc.sources : [],
          }))
        : undefined,
  };
}

export async function analyzeTextClaim(
  text: string,
  targetLanguage: Language = 'en'
): Promise<Omit<AnalysisResult, 'id' | 'createdAt'>> {
  const ai = getGeminiClient();

  const langPrompt =
    targetLanguage === 'te'
      ? 'Please translate the summary, explanation, evidence, warning signs, and recommended actions into TELUGU (తెలుగు).'
      : targetLanguage === 'hi'
      ? 'Please translate the summary, explanation, evidence, warning signs, and recommended actions into HINDI (हिंदी).'
      : 'Provide the response in English.';

  const prompt = `
Analyze the following text or claim:
"""
${text}
"""

Language instruction: ${langPrompt}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini API returned an empty response. Please try again.');
  }

  const parsed = JSON.parse(responseText);
  const normalized = normalizeAnalysisResult(parsed);

  return {
    inputType: 'text',
    originalInput: text,
    extractedText: text,
    ...normalized,
  };
}

export async function analyzeUrlClaim(
  url: string,
  articleContent: string,
  targetLanguage: Language = 'en'
): Promise<Omit<AnalysisResult, 'id' | 'createdAt'>> {
  const ai = getGeminiClient();

  const langPrompt =
    targetLanguage === 'te'
      ? 'Translate output explanations to Telugu.'
      : targetLanguage === 'hi'
      ? 'Translate output explanations to Hindi.'
      : 'Output in English.';

  const prompt = `
Analyze the following webpage article retrieved from URL (${url}):
"""
${articleContent}
"""

Remember: Check if this webpage is a fact-check article debunking a claim. If so, extract the ORIGINAL CLAIM and evaluate the truthfulness of THAT claim!
Language instruction: ${langPrompt}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini API returned an empty response for this URL.');
  }

  const parsed = JSON.parse(responseText);
  const normalized = normalizeAnalysisResult(parsed);

  const titleMatch = articleContent.match(/\[TITLE\]:\s*(.*)/i);
  const articleTitle = titleMatch ? titleMatch[1].trim() : normalized.claim || url;

  return {
    inputType: 'url',
    originalInput: url,
    extractedText: articleContent,
    articleUrl: url,
    articleTitle,
    ...normalized,
  };
}

export async function analyzeImageClaim(
  base64Data: string,
  mimeType: string,
  userEditedText?: string,
  targetLanguage: Language = 'en'
): Promise<Omit<AnalysisResult, 'id' | 'createdAt'>> {
  const ai = getGeminiClient();

  const langPrompt =
    targetLanguage === 'te'
      ? 'Translate output explanations to Telugu.'
      : targetLanguage === 'hi'
      ? 'Translate output explanations to Hindi.'
      : 'Output in English.';

  const imagePart = {
    inlineData: {
      mimeType: mimeType || 'image/png',
      data: base64Data,
    },
  };

  const textPrompt = userEditedText
    ? `The image contains news text or a screenshot. The user verified/edited the extracted OCR text as follows:\n"""\n${userEditedText}\n"""\nPerform OCR on the image to verify context, then evaluate the primary factual claim made in this screenshot/image.`
    : `Perform OCR to extract all visible text from this image or screenshot. Then evaluate the underlying factual claim for truthfulness.`;

  const prompt = `${textPrompt}\nLanguage instruction: ${langPrompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: {
      parts: [imagePart, { text: prompt }],
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini API returned an empty response for this image.');
  }

  const parsed = JSON.parse(responseText);
  const normalized = normalizeAnalysisResult(parsed);

  return {
    inputType: 'image',
    originalInput: 'Uploaded Image Screenshot',
    extractedText: userEditedText || normalized.claim || 'Extracted from screenshot via Gemini OCR',
    ...normalized,
  };
}

export async function extractOcrFromImage(
  base64Data: string,
  mimeType: string
): Promise<string> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: mimeType || 'image/png', data: base64Data } },
        {
          text: 'Perform clean OCR on this image. Extract ALL visible headline text, body text, tweet text, or article text verbatim. Do not summarize, just extract the exact text.',
        },
      ],
    },
  });

  return response.text?.trim() || '';
}
