import React, { useState, useEffect, useCallback } from 'react';
import { loadState, saveState, updateStreak } from './gameState.js';
import TeamSelect from './components/TeamSelect.jsx';
import TournamentMap from './components/TournamentMap.jsx';
import Match from './components/Match.jsx';
import TrophyRoom from './components/TrophyRoom.jsx';
import QuestionBank from './components/QuestionBank.jsx';
import './App.css';

export default function App() {
  const [gameState, setGameState] = useState(loadState);
  const [screen, setScreen] = useState(() => {
    const s = loadState();
    return s.team ? 'tournament' : 'teamSelect';
  });

  const persist = useCallback((updater) => {
    setGameState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveState(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (gameState.team) {
      persist((s) => updateStreak(s));
    }
  }, []);

  const handleTeamSelect = (teamId) => {
    persist((s) => ({ ...s, team: teamId }));
    setScreen('tournament');
  };

  const handleStartMatch = () => {
    setScreen('match');
  };

  const handleMatchEnd = (result) => {
    persist((s) => {
      const updated = {
        ...s,
        matchResults: { ...s.matchResults, [s.currentStage]: result },
        tommy: {
          goals: s.tommy.goals + result.tommyGoals,
          correct: s.tommy.correct + result.tommyCorrect,
          total: s.tommy.total + result.tommyTotal,
        },
        maddy: {
          goals: s.maddy.goals + result.maddyGoals,
          correct: s.maddy.correct + result.maddyCorrect,
          total: s.maddy.total + result.maddyTotal,
        },
        bestMatchGoals: Math.max(s.bestMatchGoals, result.tommyGoals + result.maddyGoals),
      };

      if (result.won) {
        const badge = s.currentStage;
        if (!updated.badges.includes(badge)) {
          updated.badges = [...updated.badges, badge];
        }
        const stages = ['group1', 'group2', 'group3', 'round16', 'quarter', 'semi', 'final'];
        const idx = stages.indexOf(s.currentStage);
        if (idx < stages.length - 1) {
          updated.currentStage = stages[idx + 1];
        }
      }
      return updated;
    });
    setScreen('tournament');
  };

  const handleReplay = () => {
    setScreen('match');
  };

  const handleShowTrophyRoom = () => {
    setScreen('trophy');
  };

  const handleResetGame = () => {
    const fresh = {
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
    persist(fresh);
    setScreen('teamSelect');
  };

  return (
    <div className="app">
      {screen === 'teamSelect' && (
        <TeamSelect onSelect={handleTeamSelect} />
      )}
      {screen === 'tournament' && (
        <TournamentMap
          gameState={gameState}
          onStartMatch={handleStartMatch}
          onShowTrophyRoom={handleShowTrophyRoom}
          onResetGame={handleResetGame}
          onShowQuestionBank={() => setScreen('questionBank')}
        />
      )}
      {screen === 'match' && (
        <Match
          gameState={gameState}
          onMatchEnd={handleMatchEnd}
          onQuit={() => setScreen('tournament')}
        />
      )}
      {screen === 'trophy' && (
        <TrophyRoom
          gameState={gameState}
          onBack={() => setScreen('tournament')}
        />
      )}
      {screen === 'questionBank' && (
        <QuestionBank onBack={() => setScreen('tournament')} />
      )}
    </div>
  );
}
