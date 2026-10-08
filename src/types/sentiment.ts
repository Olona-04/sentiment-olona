export type SentimentClass = 'positive' | 'neutral' | 'negative';

export interface VaderScores {
  pos: number;      // 0.00 to 1.00
  neu: number;      // 0.00 to 1.00
  neg: number;      // 0.00 to 1.00
  compound: number; // -1.00 to +1.00
  label: SentimentClass;
}

export interface HuggingFaceScores {
  positive: number;  // 0.00 to 1.00
  neutral: number;   // 0.00 to 1.00
  negative: number;  // 0.00 to 1.00
  label: SentimentClass;
  confidence: number; // 0.00 to 1.00
  contextAttentionSpan?: string; // key phrase triggering decision
}

export interface ModelComparison {
  agreement: boolean;
  agreementType: 'full_consensus' | 'partial_divergence' | 'polar_opposite';
  discrepancyNote: string;
  vaderConfidence: number;
  hfConfidence: number;
}

export interface KeywordItem {
  text: string;
  count: number;
  sentiment: SentimentClass;
  score: number; // -1 to +1
  salience: number; // 0 to 100 relative bar size
}

export interface SentenceAnalysis {
  text: string;
  vaderCompound: number;
  vaderLabel: SentimentClass;
  hfLabel: SentimentClass;
  hfConfidence: number;
}

export interface SingleAnalysisResult {
  id: string;
  text: string;
  timestamp: number;
  vader: VaderScores;
  huggingFace: HuggingFaceScores;
  comparison: ModelComparison;
  keywords: KeywordItem[];
  positiveKeywords: KeywordItem[];
  negativeKeywords: KeywordItem[];
  sentences: SentenceAnalysis[];
  metrics: {
    charCount: number;
    wordCount: number;
    readingTimeSec: number;
    subjectivity: number; // 0 to 1
  };
}

export interface BatchItem {
  id: string;
  index: number;
  text: string;
  vader: VaderScores;
  huggingFace: HuggingFaceScores;
  comparison: ModelComparison;
  primaryKeywords: string[];
}

export interface BatchSummary {
  total: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
  avgCompound: number;
  agreementRate: number; // % where VADER and HF agree
  divergentCount: number;
  topPositiveKeywords: KeywordItem[];
  topNegativeKeywords: KeywordItem[];
  allKeywords: KeywordItem[];
  trendPoints: {
    index: number;
    excerpt: string;
    vaderCompound: number;
    hfPositiveScore: number;
    hfNegativeScore: number;
    label: SentimentClass;
    movingAvg: number;
  }[];
}
