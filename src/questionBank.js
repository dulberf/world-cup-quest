// Custom question bank — stores homework equations entered by a parent/teacher
// Stored in localStorage separately from game state

import { SEED_QUESTIONS } from './seedQuestions.js';

const BANK_KEY = 'wcq-question-bank';

// ---- Parser ----
// Accepts formats like:
//   7 × 8        7x8       7*8
//   56 ÷ 7       56/7
//   15 + 8       15+8
//   20 - 6       20-6
//   ? + 6 = 13   3 × ? = 21   15 + ? = 23

function normalise(str) {
  return str
    .trim()
    .replace(/[×x\*]/g, '×')
    .replace(/[÷\/]/g, '÷')
    .replace(/\s+/g, ' ');
}

function makeOptions(correct) {
  const opts = new Set([correct]);
  let attempts = 0;
  while (opts.size < 4 && attempts < 40) {
    attempts++;
    const spread = Math.max(3, Math.round(correct * 0.3));
    const delta = Math.floor(Math.random() * spread * 2) - spread;
    const wrong = correct + delta;
    if (wrong !== correct && wrong >= 0) opts.add(wrong);
  }
  // fallback if spread too small
  let n = correct + 1;
  while (opts.size < 4) { opts.add(n++); }
  return shuffle([...opts]);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate plain display string and hint text from parsed parts
function buildHints(op, a, b, answer) {
  const NAMES = ['Tommy', 'Maddy', 'the team', 'the coach'];
  const ITEMS = ['water bottles', 'boots', 'jerseys', 'match tickets', 'training cones', 'shin pads'];
  const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];

  switch (op) {
    case '×': return {
      hint1: `How many is ${a} groups of ${b}?`,
      hint2: `If there are ${a} players and they each have ${b} ${item}, how many ${item} altogether?`,
    };
    case '÷': return {
      hint1: `Share ${a} equally into ${b} groups — how many each?`,
      hint2: `${a} ${item} shared between ${b} players — how many each?`,
    };
    case '+': return {
      hint1: `Start at ${a} and count on ${b} more.`,
      hint2: `${name} had ${a} ${item} and got ${b} more — how many now?`,
    };
    case '-': return {
      hint1: `Start at ${a} and take away ${b}.`,
      hint2: `${name} had ${a} ${item} and used ${b} of them — how many left?`,
    };
    default: return { hint1: '', hint2: '' };
  }
}

export function parseEquation(raw) {
  const s = normalise(raw);

  // Missing number: ? + 6 = 13 | 3 × ? = 21 | 15 + ? = 23 | 15 - ? = 9
  const missingLeft = s.match(/^\?\s*([\+\-×÷])\s*(\d+)\s*=\s*(\d+)$/);
  const missingRight = s.match(/^(\d+)\s*([\+\-×÷])\s*\?\s*=\s*(\d+)$/);
  const plain = s.match(/^(\d+)\s*([\+\-×÷])\s*(\d+)$/);

  let a, b, op, answer, display;

  if (missingLeft) {
    op = missingLeft[1]; b = Number(missingLeft[2]); answer = Number(missingLeft[3]);
    switch (op) {
      case '+': a = answer - b; break;
      case '-': a = answer + b; break;
      case '×': a = b === 0 ? 0 : answer / b; break;
      case '÷': a = answer * b; break;
      default: return null;
    }
    display = `? ${op} ${b} = ${answer}`;
  } else if (missingRight) {
    a = Number(missingRight[1]); op = missingRight[2]; answer = Number(missingRight[3]);
    switch (op) {
      case '+': b = answer - a; break;
      case '-': b = a - answer; break;
      case '×': b = a === 0 ? 0 : answer / a; break;
      case '÷': b = answer === 0 ? 0 : a / answer; break;
      default: return null;
    }
    display = `${a} ${op} ? = ${answer}`;
  } else if (plain) {
    a = Number(plain[1]); op = plain[2]; b = Number(plain[3]);
    switch (op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      case '×': answer = a * b; break;
      case '÷': answer = b === 0 ? null : a / b; break;
      default: return null;
    }
    if (answer === null || !Number.isInteger(answer) || answer < 0) return null;
    display = `${a} ${op} ${b} = ?`;
  } else {
    return null;
  }

  if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isInteger(answer)) return null;

  const hints = buildHints(op, a, b, answer);
  return {
    id: `${Date.now()}-${Math.random()}`,
    display,
    raw: s,
    answer,
    options: makeOptions(answer),
    hint1: hints.hint1,
    hint2: hints.hint2,
    player: 'any', // 'tommy' | 'maddy' | 'any'
    used: false,
  };
}

// ---- Storage ----
export function loadBank() {
  try {
    const stored = JSON.parse(localStorage.getItem(BANK_KEY) || '[]');
    if (stored.length > 0) return stored;
    // First run — seed from defaults
    const seeded = SEED_QUESTIONS.map((q, i) => ({
      id: `seed-${i}`,
      display: q.display,
      raw: q.display,
      answer: q.answer,
      options: q.options,
      hint1: q.hint1,
      hint2: '',
      player: q.player,
      used: false,
    }));
    saveBank(seeded);
    return seeded;
  } catch { return []; }
}

export function saveBank(bank) {
  localStorage.setItem(BANK_KEY, JSON.stringify(bank));
}

export function addToBank(equations) {
  const bank = loadBank();
  const parsed = equations
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(parseEquation)
    .filter(Boolean);
  saveBank([...bank, ...parsed]);
  return parsed.length;
}

export function clearBank() {
  saveBank([]);
}

// Draw a question from the bank for the given player, falls back to generated
export function drawFromBank(player) {
  const bank = loadBank();
  // prioritise player-specific, then 'any'
  const available = bank.filter(q => !q.used && (q.player === player || q.player === 'any'));
  if (available.length === 0) return null;

  const q = available[Math.floor(Math.random() * available.length)];
  // Mark used
  const updated = bank.map(b => b.id === q.id ? { ...b, used: true } : b);
  saveBank(updated);
  // Refresh options each time (randomise wrong answers)
  return { ...q, options: makeOptions(q.answer) };
}

export function resetUsed() {
  const bank = loadBank().map(q => ({ ...q, used: false }));
  saveBank(bank);
}
