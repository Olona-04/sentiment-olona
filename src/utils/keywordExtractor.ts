import { KeywordItem, SentimentClass } from '../types/sentiment';
import { analyzeVader } from './vaderEngine';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', "aren't", 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', "can't", 'cannot', 'could', "couldn't",
  'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', "hadn't", 'has', "hasn't",
  'have', "haven't", 'having', 'he', "he'd", "he'll", "he's", 'her', 'here',
  "here's", 'hers', 'herself', 'him', 'himself', 'his', 'how', "how's", 'i',
  "i'd", "i'll", "i'm", "i've", 'if', 'in', 'into', 'is', "isn't", 'it', "it's",
  'its', 'itself', "let's", 'me', 'more', 'most', "mustn't", 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', "shan't", 'she',
  "she'd", "she'll", "she's", 'should', "shouldn't", 'so', 'some', 'such',
  'than', 'that', "that's", 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', "there's", 'these', 'they', "they'd", "they'll", "they're",
  "they've", 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', "wasn't", 'we', "we'd", "we'll", "we're", "we've", 'were',
  "weren't", 'what', "what's", 'when', "when's", 'where', "where's", 'which',
  'while', 'who', "who's", 'whom', 'why', "why's", 'with', "won't", 'would',
  "wouldn't", 'you', "you'd", "you'll", "you're", "you've", 'your', 'yours',
  'yourself', 'yourselves', 'just', 'also', 'get', 'got', 'one', 'two', 'really',
  'much', 'even', 'make', 'made', 'thing', 'things', 'way', 'well', 'will', 'can'
]);

/**
 * Extracts salient keywords and key phrases (bigrams) with frequency and sentiment
 */
export function extractKeywords(texts: string | string[], limit: number = 16): {
  all: KeywordItem[];
  positive: KeywordItem[];
  negative: KeywordItem[];
} {
  const textArray = Array.isArray(texts) ? texts : [texts];
  const wordFrequency: Map<string, number> = new Map();
  const phraseFrequency: Map<string, number> = new Map();

  for (const text of textArray) {
    if (!text) continue;
    
    // Normalize and tokenize
    const cleanTokens = text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .map(w => w.replace(/^[-']+|[-']+$/g, ''))
      .filter(w => w.length > 2);

    for (let i = 0; i < cleanTokens.length; i++) {
      const w = cleanTokens[i];
      if (!STOP_WORDS.has(w) && !/^\d+$/.test(w)) {
        wordFrequency.set(w, (wordFrequency.get(w) || 0) + 1);
      }

      // Bigram extraction
      if (i < cleanTokens.length - 1) {
        const nextW = cleanTokens[i + 1];
        if (!STOP_WORDS.has(w) || !STOP_WORDS.has(nextW)) {
          const phrase = `${w} ${nextW}`;
          phraseFrequency.set(phrase, (phraseFrequency.get(phrase) || 0) + 1);
        }
      }
    }
  }

  // Combine words and high-frequency phrases
  const candidateMap: Map<string, number> = new Map(wordFrequency);
  for (const [phrase, count] of phraseFrequency.entries()) {
    if (count >= 2 || textArray.length === 1) {
      candidateMap.set(phrase, count * 1.3); // phrase bonus
    }
  }

  if (candidateMap.size === 0) {
    return { all: [], positive: [], negative: [] };
  }

  const items: KeywordItem[] = [];
  let maxCount = 1;

  for (const [term, count] of candidateMap.entries()) {
    if (count > maxCount) maxCount = count;
    
    const vader = analyzeVader(term);
    let sentiment: SentimentClass = 'neutral';
    if (vader.compound >= 0.05) sentiment = 'positive';
    else if (vader.compound <= -0.05) sentiment = 'negative';

    items.push({
      text: term,
      count: Math.round(count),
      sentiment,
      score: vader.compound,
      salience: 0 // calculated next
    });
  }

  // Normalize salience to 0 - 100 for visual bar presentation
  for (const item of items) {
    const freqRatio = item.count / maxCount;
    const sentimentBoost = Math.abs(item.score) * 0.4;
    const combinedSalience = Math.min(100, Math.round((freqRatio * 0.7 + sentimentBoost) * 100));
    item.salience = Math.max(15, combinedSalience);
  }

  // Sort by frequency and salience
  items.sort((a, b) => b.count - a.count || b.salience - a.salience);

  const positive = items
    .filter(it => it.sentiment === 'positive')
    .slice(0, limit);

  const negative = items
    .filter(it => it.sentiment === 'negative')
    .slice(0, limit);

  const all = items.slice(0, limit);

  return { all, positive, negative };
}
