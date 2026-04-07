import { drawFromBank } from './questionBank.js';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOptions(correct) {
  const opts = new Set([correct]);
  let attempts = 0;
  while (opts.size < 4 && attempts < 40) {
    attempts++;
    const spread = Math.max(3, Math.round(correct * 0.25));
    const delta = Math.floor(Math.random() * spread * 2) - spread;
    const wrong = correct + delta;
    if (wrong !== correct && wrong >= 0) opts.add(wrong);
  }
  let n = correct + 1;
  while (opts.size < 4) { opts.add(n++); }
  return shuffle([...opts]);
}

// Context-aware subtraction nouns — things that can be given away/lost (not goals!)
const SUB_ITEMS = ['water bottles', 'training cones', 'jerseys', 'boots', 'tickets', 'shin pads'];
const ADD_ITEMS = ['fans', 'players', 'supporters', 'passes', 'shots', 'saves'];
function subItem() { return SUB_ITEMS[randInt(0, SUB_ITEMS.length - 1)]; }
function addItem() { return ADD_ITEMS[randInt(0, ADD_ITEMS.length - 1)]; }

const NAMES = ['Tommy', 'Maddy', 'the coach', 'the team', 'Alex', 'Sam'];
function name() { return NAMES[randInt(0, NAMES.length - 1)]; }

// Build a question object with display + two hint levels
function makeQ(display, answer, hint1, hint2) {
  return { display, answer, options: makeOptions(answer), hint1, hint2 };
}

// ---- Tommy — "striker" level ----
function generateTommyQuestion() {
  const type = randInt(1, 5);

  switch (type) {
    case 1: { // multiplication
      const a = randInt(2, 12), b = randInt(2, 12);
      const answer = a * b;
      return makeQ(
        `${a} × ${b} = ?`,
        answer,
        `How many is ${a} groups of ${b}?`,
        `${name()} has ${a} bags with ${b} ${subItem()} in each. How many altogether?`
      );
    }
    case 2: { // division
      const b = randInt(2, 10), q = randInt(2, 10);
      const a = b * q;
      return makeQ(
        `${a} ÷ ${b} = ?`,
        q,
        `Share ${a} equally into ${b} groups — how many each?`,
        `${a} ${subItem()} shared between ${b} players — how many each?`
      );
    }
    case 3: { // missing number (multiplication)
      const a = randInt(2, 10), b = randInt(2, 10);
      const product = a * b;
      return makeQ(
        `${a} × ? = ${product}`,
        b,
        `${a} groups of what number makes ${product}?`,
        `${a} players each need the same number of ${subItem()} — there are ${product} in total. How many each?`
      );
    }
    case 4: { // two-step addition then subtraction (with non-goal nouns)
      const a = randInt(10, 30), b = randInt(5, 15), c = randInt(2, b);
      const answer = a + b - c;
      return makeQ(
        `${a} + ${b} − ${c} = ?`,
        answer,
        `Add ${b} to ${a}, then take away ${c}.`,
        `${name()} had ${a} ${subItem()}, got ${b} more, then gave away ${c}. How many left?`
      );
    }
    case 5: { // multiplication word — goals are scored, not lost
      const matches = randInt(3, 8), gpm = randInt(2, 6);
      const answer = matches * gpm;
      return makeQ(
        `${matches} × ${gpm} = ?`,
        answer,
        `${matches} matches, ${gpm} goals each — total goals scored?`,
        `The team played ${matches} matches and scored ${gpm} goals every match. How many goals in total?`
      );
    }
    default: return generateTommyQuestion();
  }
}

// ---- Maddy — "midfielder" level ----
function generateMaddyQuestion() {
  const type = randInt(1, 5);

  switch (type) {
    case 1: { // addition to 100
      const a = randInt(10, 60), b = randInt(5, 40);
      const answer = a + b;
      return makeQ(
        `${a} + ${b} = ?`,
        answer,
        `Start at ${a} and count on ${b} more.`,
        `One stand has ${a} ${addItem()}, another has ${b}. How many altogether?`
      );
    }
    case 2: { // subtraction (non-goal noun)
      const a = randInt(20, 80), b = randInt(5, a - 5);
      const answer = a - b;
      return makeQ(
        `${a} − ${b} = ?`,
        answer,
        `Start at ${a} and take away ${b}.`,
        `There were ${a} ${subItem()} in the kit room. ${b} were taken out. How many left?`
      );
    }
    case 3: { // 2×, 5×, 10× tables
      const mult = [2, 5, 10][randInt(0, 2)];
      const b = randInt(1, 10);
      const answer = mult * b;
      return makeQ(
        `${mult} × ${b} = ?`,
        answer,
        `${b} groups of ${mult} — or the ${mult} times table.`,
        `${b} players each carry ${mult} ${subItem()}. How many altogether?`
      );
    }
    case 4: { // number bonds to 20
      const a = randInt(3, 17), total = 20;
      const answer = total - a;
      return makeQ(
        `${a} + ? = ${total}`,
        answer,
        `What number adds to ${a} to make ${total}?`,
        `${name()} has ${a} ${subItem()} and needs ${total} in total. How many more are needed?`
      );
    }
    case 5: { // simple addition word problem — goals
      const first = randInt(1, 8), second = randInt(1, 8);
      const answer = first + second;
      return makeQ(
        `${first} + ${second} = ?`,
        answer,
        `Goals in the first half plus goals in the second half.`,
        `The team scored ${first} goals in the first half and ${second} in the second half. Total goals?`
      );
    }
    default: return generateMaddyQuestion();
  }
}

// ---- Bonus / skill move ----
function generateBonusQuestion() {
  const a = randInt(3, 9), b = randInt(3, 9);
  const answer = a * b;
  return makeQ(
    `${a} × ${b} = ?`,
    answer,
    `${a} groups of ${b} — can you nail it?`,
    `SKILL MOVE! ${a} × ${b} — get it right to start closer to goal!`
  );
}

// ---- Main draw function — bank first, then generated ----
export function drawQuestion(player) {
  const banked = drawFromBank(player);
  if (banked) return banked;
  return player === 'tommy' ? generateTommyQuestion() : generateMaddyQuestion();
}

export { generateTommyQuestion, generateMaddyQuestion, generateBonusQuestion };
