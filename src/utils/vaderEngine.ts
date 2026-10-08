import { SentimentClass, VaderScores } from '../types/sentiment';

// VADER Lexicon subset containing high-frequency words, social expressions, slang, and emojis
const VADER_LEXICON: Record<string, number> = {
  // Emoticons & Emojis
  ':)': 2.0, ':-)': 2.0, '(:': 2.0, ':D': 2.3, ':-D': 2.3, ';)': 1.9, ';-)': 1.9,
  ':(': -2.0, ':-(': -2.0, ':/': -1.4, ':-/': -1.4, ':o': 0.6, ':O': 0.6,
  '❤️': 3.2, '💖': 3.2, '🔥': 2.8, '🚀': 2.6, '🎉': 2.7, '✨': 2.2, '👍': 2.4,
  '👎': -2.4, '😭': -2.1, '😡': -3.0, '😍': 3.4, '🥰': 3.3, '💩': -2.5, '💀': -1.0,
  '💯': 2.9, '👏': 2.3, '🙌': 2.5, '⭐': 2.0, '🌟': 2.2, '💔': -3.1,

  // Positive Social Slang & Expressions
  'awesome': 3.1, 'cool': 1.8, 'dope': 2.4, 'lit': 2.5, 'fire': 2.6, 'goat': 3.0,
  'legend': 2.7, 'slaps': 2.5, 'win': 2.8, 'winner': 2.8, 'winning': 2.8, 'yay': 2.5,
  'lmao': 2.0, 'lol': 1.8, 'rofl': 2.1, 'gem': 2.7, 'masterpiece': 3.4, 'flawless': 3.2,

  // Negative Social Slang & Expressions
  'trash': -3.0, 'garbage': -3.2, 'sucks': -2.6, 'suck': -2.5, 'crap': -2.4, 'fail': -2.5,
  'failure': -2.7, 'flop': -2.2, 'scam': -3.5, 'fraud': -3.5, 'rip': -1.8, 'rip-off': -3.2,
  'ripoff': -3.2, 'buggy': -2.3, 'clunky': -2.0, 'laggy': -2.2, 'broken': -2.6, 'smh': -1.8,
  'meh': -1.2, 'wtf': -2.8, 'terrible': -3.2, 'horrible': -3.3, 'awful': -3.2,

  // General Positive Lexicon
  'good': 1.9, 'great': 3.1, 'excellent': 3.3, 'amazing': 3.4, 'wonderful': 3.2,
  'superb': 3.1, 'fantastic': 3.3, 'love': 3.2, 'loving': 3.0, 'loved': 3.0, 'loves': 3.0,
  'like': 1.5, 'liked': 1.5, 'likes': 1.5, 'enjoy': 2.2, 'enjoyed': 2.2, 'pleasant': 2.1,
  'fast': 1.6, 'smooth': 2.2, 'clean': 1.8, 'reliable': 2.4, 'durable': 2.2, 'perfect': 3.5,
  'perfection': 3.5, 'best': 3.2, 'better': 1.9, 'recommend': 2.6, 'recommended': 2.6,
  'happy': 2.7, 'glad': 2.1, 'delight': 2.9, 'delighted': 2.9, 'delightful': 2.9,
  'impressive': 2.6, 'impressed': 2.6, 'stunning': 3.0, 'brilliant': 3.0, 'solid': 2.0,
  'helpful': 2.2, 'friendly': 2.2, 'responsive': 2.3, 'intuitive': 2.3, 'efficient': 2.4,
  'sleek': 2.1, 'premium': 2.4, 'value': 2.0, 'worth': 2.1, 'worthwhile': 2.3, 'satisfied': 2.2,
  'satisfaction': 2.4, 'thank': 1.9, 'thanks': 1.9, 'appreciate': 2.3, 'appreciated': 2.3,
  'safe': 1.9, 'secure': 2.0, 'bright': 1.7, 'sharp': 1.8, 'easy': 1.9, 'seamless': 2.6,

  // General Negative Lexicon
  'bad': -2.5, 'poor': -2.2, 'worse': -2.3, 'worst': -3.5, 'hate': -3.2, 'hated': -3.2,
  'hates': -3.2, 'dislike': -1.9, 'disappointed': -2.6, 'disappointing': -2.5,
  'disappointment': -2.7, 'annoying': -2.2, 'annoyed': -2.1, 'frustrating': -2.6,
  'frustrated': -2.5, 'useless': -2.8, 'worthless': -3.3, 'waste': -2.8, 'wasted': -2.6,
  'slow': -1.8, 'sluggish': -2.1, 'glitchy': -2.3, 'freeze': -2.0, 'crash': -2.7,
  'crashed': -2.7, 'crashing': -2.7, 'error': -2.0, 'errors': -2.0, 'bug': -1.9,
  'bugs': -1.9, 'defect': -2.4, 'defective': -2.5, 'unusable': -3.0, 'expensive': -1.5,
  'overpriced': -2.4, 'cheap': -1.8, 'ugly': -2.3, 'hard': -1.2, 'difficult': -1.5,
  'confusing': -2.0, 'confused': -1.8, 'unfriendly': -2.2, 'rude': -2.7, 'unreliable': -2.6,
  'horrid': -3.0, 'disaster': -3.3, 'disastrous': -3.2, 'pathetic': -3.0, 'drain': -1.7,
  'pain': -2.2, 'painful': -2.4, 'unacceptable': -2.8, 'boring': -1.7, 'regret': -2.5,

  // Sentiment modifier words / auxiliary valences
  'problem': -1.8, 'problems': -1.9, 'issue': -1.6, 'issues': -1.7, 'flaw': -2.0, 'flaws': -2.0,
  'struggle': -1.9, 'danger': -2.4, 'risk': -1.8, 'stuck': -1.9, 'stress': -2.3,
  'loss': -2.2, 'lost': -1.8, 'missing': -1.5, 'lacking': -1.7, 'complaint': -2.0,
};

// VADER Booster / Dampener words
const BOOSTER_DICT: Record<string, number> = {
  'absolutely': 0.293, 'amazingly': 0.293, 'awfully': 0.274, 'completely': 0.293,
  'considerably': 0.293, 'decidedly': 0.293, 'deeply': 0.293, 'effing': 0.293,
  'enormously': 0.293, 'entirely': 0.293, 'especially': 0.293, 'exceptionally': 0.293,
  'extremely': 0.293, 'fabulously': 0.293, 'flipping': 0.293, 'fully': 0.293,
  'greatly': 0.293, 'heavily': 0.293, 'highly': 0.293, 'hugely': 0.293,
  'incredibly': 0.293, 'insanely': 0.293, 'intensely': 0.293, 'majorly': 0.293,
  'purely': 0.293, 'quite': 0.150, 'really': 0.280, 'remarkably': 0.293,
  'so': 0.240, 'substantially': 0.293, 'thoroughly': 0.293, 'totally': 0.293,
  'tremendously': 0.293, 'ultra': 0.293, 'unbelievably': 0.293, 'unusually': 0.293,
  'utterly': 0.293, 'very': 0.293, 'super': 0.280, 'way': 0.200,

  // Dampeners (negative booster delta)
  'almost': -0.150, 'barely': -0.293, 'hardly': -0.293, 'just': -0.100,
  'kinda': -0.150, 'kind of': -0.150, 'partly': -0.150, 'scarcely': -0.293,
  'slightly': -0.200, 'somewhat': -0.150, 'sorta': -0.150, 'sort of': -0.150
};

// VADER Negation words
const NEGATIONS = new Set([
  'not', 'never', 'no', "isn't", 'isnt', "aren't", 'arent', "wasn't", 'wasnt',
  "weren't", 'werent', "haven't", 'havent', "hasn't", 'hasnt', "hadn't", 'hadnt',
  "won't", 'wont', "wouldn't", 'wouldnt', "don't", 'dont', "doesn't", 'doesnt',
  "didn't", 'didnt', "can't", 'cant', "couldn't", 'couldnt', "shouldn't", 'shouldnt',
  'cannot', 'without', 'barely', 'hardly', 'rarely', 'seldom', 'neither', 'nor'
]);

const B_INCR = 0.733; // ALL-CAPS booster differential
const C_INCR = 0.291; // Exclamation mark amplifier

function isAllUpper(word: string): boolean {
  if (word.length <= 1) return false;
  return word === word.toUpperCase() && word !== word.toLowerCase();
}

function countPunctuation(text: string): { exclamations: number; questions: number } {
  let exclamations = 0;
  let questions = 0;
  for (const ch of text) {
    if (ch === '!') exclamations++;
    else if (ch === '?') questions++;
  }
  return {
    exclamations: Math.min(exclamations, 4),
    questions: Math.min(questions, 3)
  };
}

/**
 * Executes VADER sentiment analysis following Hutto & Gilbert's exact heuristics:
 * 1. Punctuation booster (!)
 * 2. Capitalization booster (ALL CAPS)
 * 3. Degree modifier boosters & dampeners
 * 4. Polarity negation (up to 3 token look-back)
 * 5. Contrastive conjunction 'but' weighting (0.5 before, 1.5 after)
 * 6. Normalized compound formula: compound = sum / sqrt(sum^2 + alpha)
 */
export function analyzeVader(text: string): VaderScores {
  if (!text || !text.trim()) {
    return { pos: 0, neu: 1, neg: 0, compound: 0, label: 'neutral' };
  }

  const rawTokens = text.trim().split(/\s+/);
  if (rawTokens.length === 0) {
    return { pos: 0, neu: 1, neg: 0, compound: 0, label: 'neutral' };
  }

  // Check for contrastive conjunctions like 'but' or 'however'
  const lowerTokens = rawTokens.map(t => t.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, ''));
  const butIndex = lowerTokens.findIndex(t => t === 'but' || t === 'however' || t === 'although');

  const sentiments: number[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const rawWord = rawTokens[i];
    const cleanWord = rawWord.toLowerCase().replace(/^[^\w\u{1F300}-\u{1FAFF}]+|[^\w\u{1F300}-\u{1FAFF}]+$/gu, '');
    
    // Look up in lexicon (first raw for emojis/symbols, then clean)
    let valence = VADER_LEXICON[rawWord] ?? VADER_LEXICON[cleanWord] ?? 0;

    if (valence !== 0) {
      // Heuristic 1: ALL-CAPS intensity amplifier
      if (isAllUpper(rawWord)) {
        if (valence > 0) valence += B_INCR;
        else valence -= B_INCR;
      }

      // Heuristic 2: Degree modifier look-back (up to 3 words back)
      for (let lookback = 1; lookback <= 3; lookback++) {
        const prevIdx = i - lookback;
        if (prevIdx >= 0) {
          const prevRaw = rawTokens[prevIdx];
          const prevClean = prevRaw.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
          
          if (BOOSTER_DICT[prevClean]) {
            let b = BOOSTER_DICT[prevClean];
            if (valence < 0) b = -b;
            if (isAllUpper(prevRaw)) {
              b = b > 0 ? b + B_INCR : b - B_INCR;
            }
            if (lookback === 2) b *= 0.95;
            if (lookback === 3) b *= 0.90;
            valence += b;
          }
        }
      }

      // Heuristic 3: Negation look-back (up to 3 words back)
      for (let lookback = 1; lookback <= 3; lookback++) {
        const prevIdx = i - lookback;
        if (prevIdx >= 0) {
          const prevClean = rawTokens[prevIdx].toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
          if (NEGATIONS.has(prevClean)) {
            valence = valence * -0.74; // VADER standard negation scalar
            break;
          }
        }
      }

      // Heuristic 4: Conjunction clause weighting
      if (butIndex !== -1) {
        if (i < butIndex) {
          valence *= 0.5;
        } else if (i > butIndex) {
          valence *= 1.5;
        }
      }

      sentiments.push(valence);
    }
  }

  // Heuristic 5: Punctuation amplifier
  const { exclamations, questions } = countPunctuation(text);
  let punctMultiplier = 0;
  if (exclamations > 0) {
    punctMultiplier += exclamations * C_INCR;
  }
  if (questions > 1) {
    punctMultiplier -= 0.18; // repeated question marks suggest skepticism/confusion
  }

  let totalValence = sentiments.reduce((acc, v) => acc + v, 0);

  if (totalValence > 0) {
    totalValence += punctMultiplier;
  } else if (totalValence < 0) {
    totalValence -= punctMultiplier;
  }

  // Standard VADER compound formula with alpha = 15
  const alpha = 15;
  const compound = totalValence === 0 
    ? 0 
    : Math.max(-1, Math.min(1, totalValence / Math.sqrt((totalValence * totalValence) + alpha)));

  // Compute proportion pos / neu / neg
  let posSum = 0;
  let negSum = 0;
  let neuCount = rawTokens.length - sentiments.length;

  for (const s of sentiments) {
    if (s > 0) posSum += (s + 1);
    else if (s < 0) negSum += (Math.abs(s) + 1);
    else neuCount++;
  }

  const totalScores = posSum + negSum + (neuCount > 0 ? neuCount : 1);
  const pos = Number((posSum / totalScores).toFixed(3));
  const neg = Number((negSum / totalScores).toFixed(3));
  const neu = Math.max(0, Number((1 - pos - neg).toFixed(3)));

  // Classification threshold
  let label: SentimentClass = 'neutral';
  if (compound >= 0.05) label = 'positive';
  else if (compound <= -0.05) label = 'negative';

  return {
    pos,
    neu,
    neg,
    compound: Number(compound.toFixed(3)),
    label
  };
}
