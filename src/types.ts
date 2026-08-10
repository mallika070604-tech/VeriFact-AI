export type Verdict = 'REAL' | 'MOSTLY_REAL' | 'MISLEADING' | 'MOSTLY_FALSE' | 'FAKE' | 'UNVERIFIABLE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EvidenceQuality = 'STRONG' | 'MODERATE' | 'WEAK' | 'INSUFFICIENT';

export type ClaimCategory = 
  | 'General News'
  | 'Politics'
  | 'Health'
  | 'Science'
  | 'Technology'
  | 'Finance'
  | 'Crime'
  | 'Entertainment'
  | 'Social Media'
  | 'Emergency'
  | 'Other';

export type Language = 'en' | 'te' | 'hi';

export interface Source {
  name: string;
  title: string;
  link: string;
  relevance: string;
  trustworthiness?: number;
}

export interface FactCheckDetails {
  isFactCheckArticle: boolean;
  factCheckedOrganization: string;
  originalClaim: string;
  factCheckConclusion: string;
}

export interface SourceCredibility {
  organization: string;
  credibilityScore: number; // 0 - 100
  ratingReason: string;
}

export interface SubClaim {
  id?: string;
  claim: string;
  claimOrigin?: 'ORIGINAL_CLAIM' | 'ARTICLE_CONTEXT' | 'FACT_CHECK_CONCLUSION';
  verdict: Verdict;
  confidence: number;
  riskLevel?: RiskLevel;
  evidenceQuality: EvidenceQuality;
  summary: string;
  explanation: string;
  factCheckConclusion?: string;
  warningSigns?: string[];
  evidence?: string[];
  sources?: Source[];
}

export interface AnalysisResult {
  id: string;
  userId?: string;
  userEmail?: string;
  inputType: 'text' | 'url' | 'image';
  originalInput: string;
  extractedText?: string;
  claim: string;
  originalClaim?: string;
  claimOrigin?: 'ORIGINAL_CLAIM' | 'ARTICLE_CONTEXT' | 'FACT_CHECK_CONCLUSION';
  isFactCheckArticle?: boolean;
  factCheckContext?: string;
  factCheckDetails?: FactCheckDetails;
  sourceCredibility?: SourceCredibility;
  sourceName?: string;
  articleTitle?: string;
  articleUrl?: string;
  isMultipleClaimsDetected?: boolean;
  subClaims?: SubClaim[];
  verdict: Verdict;
  confidence: number; // 0 - 100
  riskLevel: RiskLevel;
  category: ClaimCategory;
  evidenceQuality: EvidenceQuality;
  summary: string;
  explanation: string;
  warningSigns: string[];
  evidence: string[];
  sources: Source[];
  recommendedAction: string;
  detectedLanguage: string;
  claimType: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferredLanguage: Language;
  theme: 'dark' | 'light';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SystemStats {
  totalAnalyses: number;
  totalUsers: number;
  fakeCount: number;
  realCount: number;
  misleadingCount: number;
  unverifiableCount: number;
  avgConfidence: number;
  riskDistribution: Record<RiskLevel, number>;
  categoryDistribution: Record<string, number>;
  dailyAnalyses: Array<{ date: string; count: number }>;
}
