// Pure analysis and drill generation — no React, no side effects.
// All functions are deterministic given the same inputs, except generateDrillText
// which uses a date-seeded PRNG for controlled daily variation.

export const MIN_SESSIONS   = 5
export const MIN_KEYSTROKES = 500
export const ANALYSIS_WINDOW = 30

const MIN_CHAR_SAMPLES = 3  // minimum IKI samples before a char qualifies as "slow"
const SLOW_THRESHOLD   = 0.15 // chars 15%+ slower than median baseline are surfaced
const MIN_ERROR_COUNT  = 3    // fewer than 3 total errors across window = noise, skip

// Words per character — chosen to prominently feature the target character,
// be short (3–6 chars), and commonly appear in real writing.
const WORD_BANK = {
  a: ['ask',  'add',  'glad', 'fast', 'last', 'flag', 'flat', 'has',  'lads', 'grab'],
  b: ['bull',  'cub',  'ebb',  'grab', 'stub', 'buzz', 'bulb', 'rob',  'bit',  'best'],
  c: ['can',  'cool', 'click','catch','lock', 'check','cat',  'dock', 'black','cubic'],
  d: ['did',  'dock', 'dark', 'dead', 'fold', 'add',  'drip', 'dull', 'had',  'hard'],
  e: ['free', 'feel', 'feet', 'seek', 'keep', 'even', 'else', 'feed', 'knee', 'tree'],
  f: ['off',  'flat', 'flex', 'lift', 'left', 'soft', 'flag', 'fix',  'leaf', 'fuzz'],
  g: ['grab', 'flag', 'good', 'jog',  'gang', 'drug', 'grip', 'rag',  'egg',  'gig'],
  h: ['rush', 'high', 'this', 'such', 'each', 'that', 'hold', 'hard', 'with', 'hush'],
  i: ['kick', 'hint', 'lift', 'milk', 'into', 'drift','risk', 'slick','iris', 'dim'],
  j: ['just', 'jab',  'jog',  'jar',  'job',  'junk', 'jet',  'joy',  'jam',  'jack'],
  k: ['kick', 'silk', 'desk', 'dark', 'bulk', 'risk', 'lock', 'task', 'dock', 'sick'],
  l: ['all',  'fall', 'fill', 'tall', 'bell', 'full', 'ill',  'well', 'still','skill'],
  m: ['mom',  'milk', 'drum', 'swim', 'slim', 'firm', 'term', 'calm', 'rim',  'farm'],
  n: ['nun',  'inn',  'fan',  'nine', 'tan',  'win',  'pin',  'chin', 'thin', 'sun'],
  o: ['cool', 'pool', 'book', 'foot', 'noon', 'took', 'look', 'root', 'good', 'loop'],
  p: ['pop',  'cup',  'pump', 'drip', 'grip', 'nap',  'app',  'cap',  'skip', 'sip'],
  q: ['quiz', 'quit', 'quip', 'quick','query','quay', 'quilt','quiet','quack','quota'],
  r: ['rear', 'roar', 'rare', 'error','radar','refer','river','shore','more', 'from'],
  s: ['sass', 'kiss', 'miss', 'loss', 'boss', 'grass','glass','mass', 'pass', 'class'],
  t: ['text', 'tall', 'tent', 'tilt', 'that', 'this', 'toast','total','test', 'taste'],
  u: ['null', 'bull', 'full', 'dull', 'skull','lull', 'true', 'blue', 'rule', 'suit'],
  v: ['live', 'give', 'love', 'have', 'very', 'wave', 'valve','vote', 'vim',  'vow'],
  w: ['will', 'well', 'swim', 'dawn', 'town', 'grow', 'slow', 'show', 'with', 'snow'],
  x: ['next', 'text', 'flex', 'exit', 'box',  'fix',  'mix',  'wax',  'fox',  'hex'],
  y: ['your', 'year', 'easy', 'day',  'play', 'say',  'stay', 'sky',  'try',  'way'],
  z: ['zero', 'zone', 'buzz', 'fizz', 'jazz', 'zinc', 'zap',  'maze', 'size', 'fuzz'],
  ',': ['then', 'next', 'also', 'but',  'yet',  'when', 'while','here'],
  '.': ['stop', 'end',  'all',  'call', 'fall', 'now',  'here', 'pass'],
  ';': ['thus', 'else', 'such', 'each', 'well', 'also', 'here', 'still'],
}

// Mulberry32 — fast, seedable PRNG, no dependencies
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function shuffle(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function median(arr) {
  if (!arr.length) return null
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// Returns { totalSessions, totalKeystrokes } for threshold checking.
// Keystrokes are approximated from WPM + duration: chars = wpm * 5 * (duration_sec/60)
export function computeSessionStats(sessions) {
  return {
    totalSessions: sessions.length,
    totalKeystrokes: sessions.reduce((sum, s) =>
      sum + Math.round((s.wpm ?? 0) * 5 * ((s.duration_sec ?? 0) / 60)), 0),
  }
}

// Returns [{ char, errorCount }] sorted by errorCount desc.
// Excludes space and chars with fewer than MIN_ERROR_COUNT total errors (noise).
export function analyzeErrorKeys(sessions) {
  const aggregate = {}
  for (const session of sessions) {
    for (const [char, count] of Object.entries(session.error_keys ?? {})) {
      if (char === ' ') continue
      aggregate[char] = (aggregate[char] ?? 0) + count
    }
  }
  return Object.entries(aggregate)
    .filter(([, count]) => count >= MIN_ERROR_COUNT)
    .map(([char, errorCount]) => ({ char, errorCount }))
    .sort((a, b) => b.errorCount - a.errorCount)
}

// Returns [{ char, medianIki, relativeSlowness }] sorted by relativeSlowness desc.
// Only surfaces chars that are more than SLOW_THRESHOLD above the user's own median.
export function analyzeSlowKeys(sessions) {
  const pool = {}
  for (const session of sessions) {
    for (const [char, ikis] of Object.entries(session.key_timings ?? {})) {
      if (char === ' ') continue
      if (!pool[char]) pool[char] = []
      pool[char].push(...ikis)
    }
  }

  const charMedians = {}
  for (const [char, ikis] of Object.entries(pool)) {
    if (ikis.length < MIN_CHAR_SAMPLES) continue
    charMedians[char] = median(ikis)
  }

  const allMedianValues = Object.values(charMedians)
  if (allMedianValues.length < 2) return []
  const globalMedian = median(allMedianValues)

  return Object.entries(charMedians)
    .map(([char, med]) => ({
      char,
      medianIki:        Math.round(med),
      relativeSlowness: (med - globalMedian) / globalMedian,
    }))
    .filter(({ relativeSlowness }) => relativeSlowness > SLOW_THRESHOLD)
    .sort((a, b) => b.relativeSlowness - a.relativeSlowness)
}

// Generates a drill string targeting the given weak characters.
// drillOffset (default 0) increments the daily seed for "new drill" functionality.
// Returns null if no word bank entries exist for the identified weak chars.
export function generateDrillText(topErrorKeys, topSlowKeys, drillOffset = 0) {
  // Deduplicate: error keys take priority, up to 3 unique chars with WORD_BANK entries
  const seen = new Set()
  const weakChars = []
  for (const { char } of [...topErrorKeys.slice(0, 2), ...topSlowKeys.slice(0, 2)]) {
    if (!seen.has(char) && WORD_BANK[char]) {
      seen.add(char)
      weakChars.push(char)
      if (weakChars.length === 3) break
    }
  }
  if (!weakChars.length) return null

  // Seed changes daily; drillOffset lets the user request a fresh variant
  const rng = mulberry32(Math.floor(Date.now() / 86400000) + drillOffset)

  // Sample 2 words per weak character from its word bank
  const wordGroups = weakChars.map(char => shuffle(WORD_BANK[char], rng).slice(0, 2))

  // Bigram-approximation patterns: all pairs of weak chars (including self-pairs)
  // force the user to type those transitions consecutively
  const bigramParts = []
  for (let i = 0; i < weakChars.length; i++) {
    for (let j = i; j < weakChars.length; j++) {
      bigramParts.push(weakChars[i] + weakChars[j])
    }
  }

  const tokens  = [...wordGroups.flat(), bigramParts.join(' ')]
  const shuffled = shuffle(tokens, rng)
  let drillText  = shuffled.join(' ')

  // Trim at a word boundary if over 60 chars
  if (drillText.length > 60) {
    drillText = drillText.slice(0, 61).replace(/\s\S+$/, '').trim()
  }
  // Pad if too short by appending the first word group again
  if (drillText.length < 30 && wordGroups[0]) {
    drillText = (drillText + ' ' + wordGroups[0].join(' ')).trim()
  }

  return drillText
}
