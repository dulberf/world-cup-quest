const STORAGE_KEY = 'world-cup-quest-state';

const TEAMS = [
  { id: 'australia', name: 'Australia', emoji: '🇦🇺' },
  { id: 'brazil', name: 'Brazil', emoji: '🇧🇷' },
  { id: 'argentina', name: 'Argentina', emoji: '🇦🇷' },
  { id: 'england', name: 'England', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'france', name: 'France', emoji: '🇫🇷' },
  { id: 'germany', name: 'Germany', emoji: '🇩🇪' },
  { id: 'spain', name: 'Spain', emoji: '🇪🇸' },
  { id: 'japan', name: 'Japan', emoji: '🇯🇵' },
];

const TOURNAMENT_STAGES = [
  'group1', 'group2', 'group3',
  'round16', 'quarter', 'semi', 'final',
];

const STAGE_LABELS = {
  group1: 'Group Stage - Match 1',
  group2: 'Group Stage - Match 2',
  group3: 'Group Stage - Match 3',
  round16: 'Round of 16',
  quarter: 'Quarter Final',
  semi: 'Semi Final',
  final: 'THE FINAL',
};

const KEEPER_SAVE_RATES = {
  group1: 0.20,
  group2: 0.20,
  group3: 0.20,
  round16: 0.35,
  quarter: 0.35,
  semi: 0.50,
  final: 0.65,
};

// Chance the opponent scores when the kids get a question wrong
const INTERCEPT_SCORE_RATES = {
  group1: 0.20,
  group2: 0.25,
  group3: 0.30,
  round16: 0.40,
  quarter: 0.50,
  semi: 0.65,
  final: 0.80,
};

function getOpponentForStage(stage, playerTeam) {
  const others = TEAMS.filter((t) => t.id !== playerTeam);
  const stageIndex = TOURNAMENT_STAGES.indexOf(stage);
  return others[stageIndex % others.length];
}

function createInitialState() {
  return {
    team: null,
    currentStage: 'group1',
    matchResults: {},
    tommy: { goals: 0, correct: 0, total: 0 },
    maddy: { goals: 0, correct: 0, total: 0 },
    badges: [],
    streak: 0,
    lastPlayDate: null,
    bestMatchGoals: 0,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return createInitialState();
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateStreak(state) {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastPlayDate === today) return state;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = state.lastPlayDate === yesterday ? state.streak + 1 : 1;
  return { ...state, streak: newStreak, lastPlayDate: today };
}

export {
  TEAMS,
  TOURNAMENT_STAGES,
  STAGE_LABELS,
  KEEPER_SAVE_RATES,
  INTERCEPT_SCORE_RATES,
  getOpponentForStage,
  createInitialState,
  loadState,
  saveState,
  updateStreak,
};
