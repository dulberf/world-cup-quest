// Default question bank — loaded automatically if the bank is empty.
// Add questions here to make them available on every device without manual entry.
//
// player: 'tommy' | 'maddy' | 'any'
// options: exactly 4 numbers (include the correct answer among them)

export const SEED_QUESTIONS = [
  // ── Tommy ────────────────────────────────────────────────────────────────
  { player: 'tommy', display: '3 × 4 = ?',   answer: 12,  options: [10, 12, 14, 16],       hint1: '3 groups of 4 makes 12 — count up in 3s four times!' },
  { player: 'tommy', display: '6 × 7 = ?',   answer: 42,  options: [36, 40, 42, 48],       hint1: '6 × 7 = 42 — if you know 6 × 6 = 36, just add one more 6!' },
  { player: 'tommy', display: '9 × 8 = ?',   answer: 72,  options: [63, 70, 72, 74],       hint1: '9 × 8 = 72 — the digits of 9 times table always add up to 9!' },
  { player: 'tommy', display: '12 × 4 = ?',  answer: 48,  options: [44, 46, 48, 52],       hint1: '12 × 4 = 48 — think 10 × 4 = 40, then add 2 × 4 = 8!' },
  { player: 'tommy', display: '7 × 6 = ?',   answer: 42,  options: [40, 42, 44, 48],       hint1: '7 × 6 is the same as 6 × 7 = 42 — multiplication works both ways!' },
  { player: 'tommy', display: '11 × 5 = ?',  answer: 55,  options: [50, 55, 60, 65],       hint1: '11 × 5 = 55 — 11 times any single digit just repeats the digit twice!' },
  { player: 'tommy', display: '8 × 8 = ?',   answer: 64,  options: [60, 62, 64, 66],       hint1: '8 × 8 = 64 — this is one worth memorising, it comes up a lot!' },
  { player: 'tommy', display: '5 × 9 = ?',   answer: 45,  options: [40, 43, 45, 47],       hint1: '5 × 9 = 45 — count up in 5s nine times or reverse it: 9 × 5!' },
  { player: 'tommy', display: '12 × 12 = ?', answer: 144, options: [132, 140, 144, 148],   hint1: '12 × 12 = 144 — the top of the times tables, worth knowing by heart!' },
  { player: 'tommy', display: '4 × 7 = ?',   answer: 28,  options: [24, 26, 28, 32],       hint1: '4 × 7 = 28 — think 4 × 6 = 24, then add one more 4!' },
  { player: 'tommy', display: '6 × 9 = ?',   answer: 54,  options: [48, 52, 54, 56],       hint1: '6 × 9 = 54 — the digits add to 9, which is a great check for 9 times table!' },
  { player: 'tommy', display: '3 × 11 = ?',  answer: 33,  options: [30, 33, 36, 39],       hint1: '3 × 11 = 33 — 11 times a single digit just doubles it side by side!' },
  { player: 'tommy', display: '7 × 8 = ?',   answer: 56,  options: [54, 56, 58, 63],       hint1: '7 × 8 = 56 — try this trick: 5, 6, 7, 8 → 56 = 7 × 8!' },
  { player: 'tommy', display: '9 × 9 = ?',   answer: 81,  options: [79, 81, 83, 85],       hint1: '9 × 9 = 81 — 8 and 1 add up to 9, which is always true for 9 times table!' },
  { player: 'tommy', display: '12 × 7 = ?',  answer: 84,  options: [74, 80, 84, 88],       hint1: '12 × 7 = 84 — split it: 10 × 7 = 70, plus 2 × 7 = 14, total 84!' },
  { player: 'tommy', display: '4 × 11 = ?',  answer: 44,  options: [40, 42, 44, 48],       hint1: '4 × 11 = 44 — 11 times a single digit repeats the digit: 44!' },
  { player: 'tommy', display: '6 × 6 = ?',   answer: 36,  options: [32, 34, 36, 38],       hint1: '6 × 6 = 36 — six sixes make 36, a square number!' },
  { player: 'tommy', display: '8 × 12 = ?',  answer: 96,  options: [88, 92, 96, 100],      hint1: '8 × 12 = 96 — split it: 8 × 10 = 80, plus 8 × 2 = 16, total 96!' },
  { player: 'tommy', display: '5 × 7 = ?',   answer: 35,  options: [30, 33, 35, 37],       hint1: '5 × 7 = 35 — all answers in the 5 times table end in 0 or 5!' },
  { player: 'tommy', display: '3 × 9 = ?',   answer: 27,  options: [24, 27, 29, 31],       hint1: '3 × 9 = 27 — the digits 2 and 7 add up to 9, a handy check!' },
  { player: 'tommy', display: '11 × 11 = ?', answer: 121, options: [111, 121, 131, 141],   hint1: '11 × 11 = 121 — a famous square number, worth memorising!' },
  { player: 'tommy', display: '4 × 9 = ?',   answer: 36,  options: [32, 34, 36, 38],       hint1: '4 × 9 = 36 — try 4 × 10 = 40, then subtract 4 to get 36!' },
  { player: 'tommy', display: '7 × 12 = ?',  answer: 84,  options: [74, 80, 84, 88],       hint1: '7 × 12 = 84 — split it: 7 × 10 = 70, plus 7 × 2 = 14, total 84!' },
  { player: 'tommy', display: '8 × 6 = ?',   answer: 48,  options: [44, 46, 48, 52],       hint1: '8 × 6 = 48 — if you know 8 × 5 = 40, just add one more 8!' },
  { player: 'tommy', display: '9 × 12 = ?',  answer: 108, options: [98, 104, 108, 112],    hint1: '9 × 12 = 108 — split it: 9 × 10 = 90, plus 9 × 2 = 18, total 108!' },

  // ── Maddy ─────────────────────────────────────────────────────────────────
  // Add Maddy's questions here in the same format, with player: 'maddy'
  { player: 'maddy', display: '23 − 8 = ?',  answer: 15,  options: [13, 14, 15, 16],   hint1: 'Count back 8 from 23 — or count up from 8 to 23, the gap is 15!' },
  { player: 'maddy', display: '31 − 6 = ?',  answer: 25,  options: [23, 24, 25, 26],   hint1: 'Take away 6 from 31 — think 31 − 1 = 30, then take away 5 more!' },
  { player: 'maddy', display: '45 − 9 = ?',  answer: 36,  options: [34, 35, 36, 37],   hint1: 'Take away 10 then add 1 back — 45 − 10 = 35, plus 1 = 36!' },
  { player: 'maddy', display: '52 − 7 = ?',  answer: 45,  options: [43, 44, 45, 46],   hint1: 'Count back 7 from 52 — take away 2 first to get 50, then 5 more!' },
  { player: 'maddy', display: '14 + 8 = ?',  answer: 22,  options: [20, 21, 22, 23],   hint1: 'Add 6 to get to 20 first, then add the remaining 2 — total 22!' },
  { player: 'maddy', display: '27 + 6 = ?',  answer: 33,  options: [31, 32, 33, 34],   hint1: 'Add 3 to get to 30 first, then add 3 more — total 33!' },
  { player: 'maddy', display: '36 + 7 = ?',  answer: 43,  options: [41, 42, 43, 44],   hint1: 'Add 4 to get to 40 first, then add 3 more — total 43!' },
  { player: 'maddy', display: '48 + 5 = ?',  answer: 53,  options: [51, 52, 53, 54],   hint1: 'Add 2 to get to 50 first, then add 3 more — total 53!' },
  { player: 'maddy', display: '65 − 8 = ?',  answer: 57,  options: [55, 56, 57, 58],   hint1: 'Take away 10 then add 2 back — 65 − 10 = 55, plus 2 = 57!' },
  { player: 'maddy', display: '2 × 6 = ?',   answer: 12,  options: [10, 12, 14, 16],   hint1: 'Multiplying by 2 is just doubling — double 6 is 12!' },
  { player: 'maddy', display: '2 × 9 = ?',   answer: 18,  options: [16, 18, 20, 22],   hint1: 'Double 9 is 18 — like having 9 pairs of boots!' },
  { player: 'maddy', display: '2 × 11 = ?',  answer: 22,  options: [20, 22, 24, 26],   hint1: '2 × 11 = 22 — doubling 11 gives you 22, the digits match!' },
  { player: 'maddy', display: '2 × 7 = ?',   answer: 14,  options: [12, 14, 16, 18],   hint1: 'Count up in 2s seven times: 2, 4, 6, 8, 10, 12, 14!' },
  { player: 'maddy', display: '4 × 3 = ?',   answer: 12,  options: [8,  10, 12, 14],   hint1: 'Think of 4 groups of 3 players on the pitch — that is 12!' },
  { player: 'maddy', display: '4 × 6 = ?',   answer: 24,  options: [20, 22, 24, 26],   hint1: 'Double 6 is 12, then double again to get 24!' },
  { player: 'maddy', display: '4 × 8 = ?',   answer: 32,  options: [28, 30, 32, 34],   hint1: 'Double 8 is 16, then double it again to get 32!' },
  { player: 'maddy', display: '4 × 5 = ?',   answer: 20,  options: [16, 18, 20, 22],   hint1: 'Four teams of 5 players each makes 20 players total!' },
  { player: 'maddy', display: '5 × 3 = ?',   answer: 15,  options: [10, 13, 15, 18],   hint1: 'Answers in the 5 times table always end in 0 or 5!' },
  { player: 'maddy', display: '5 × 6 = ?',   answer: 30,  options: [25, 28, 30, 35],   hint1: 'Count up in 5s six times: 5, 10, 15, 20, 25, 30!' },
  { player: 'maddy', display: '5 × 8 = ?',   answer: 40,  options: [35, 38, 40, 45],   hint1: 'Half of 8 is 4, so 5 × 8 is just 40!' },
  { player: 'maddy', display: '5 × 11 = ?',  answer: 55,  options: [50, 55, 60, 65],   hint1: 'Count up in 5s eleven times — or just remember 55!' },
  { player: 'maddy', display: '10 × 4 = ?',  answer: 40,  options: [14, 30, 40, 44],   hint1: 'Multiplying by 10 just adds a zero to the end!' },
  { player: 'maddy', display: '10 × 7 = ?',  answer: 70,  options: [17, 57, 70, 77],   hint1: 'Any number times 10 just gets a zero added — 70!' },
  { player: 'maddy', display: '10 × 9 = ?',  answer: 90,  options: [19, 89, 90, 99],   hint1: 'The easiest times table — just add a zero to get 90!' },
  { player: 'maddy', display: '10 × 12 = ?', answer: 120, options: [102, 112, 120, 122], hint1: '12 with a zero on the end — simple as that!' },
];
