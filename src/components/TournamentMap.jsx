import React from 'react';
import { TEAMS, TOURNAMENT_STAGES, STAGE_LABELS, getOpponentForStage } from '../gameState.js';
import './TournamentMap.css';

export default function TournamentMap({ gameState, onStartMatch, onShowTrophyRoom, onResetGame, onShowQuestionBank }) {
  const team = TEAMS.find((t) => t.id === gameState.team);
  const currentIdx = TOURNAMENT_STAGES.indexOf(gameState.currentStage);
  const allWon = gameState.badges.includes('final');

  return (
    <div className="tournament-map">
      <div className="tm-header">
        <div className="tm-team-badge">
          <span className="tm-flag">{team?.emoji}</span>
          <span className="tm-team-name">{team?.name}</span>
        </div>
        <div className="tm-streak">
          {gameState.streak > 0 && <span>🔥 {gameState.streak} day streak!</span>}
        </div>
      </div>

      <h2 className="tm-title">Tournament Draw</h2>

      <div className="tm-stages">
        {TOURNAMENT_STAGES.map((stage, idx) => {
          const result = gameState.matchResults[stage];
          const isCurrent = idx === currentIdx && !allWon;
          const isLocked = idx > currentIdx && !allWon;
          const opponent = getOpponentForStage(stage, gameState.team);

          return (
            <div
              key={stage}
              className={`tm-stage ${result?.won ? 'won' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
            >
              <div className="tm-stage-label">{STAGE_LABELS[stage]}</div>
              <div className="tm-stage-opponent">
                vs {opponent.emoji} {opponent.name}
              </div>
              {result?.won && (
                <div className="tm-stage-score">
                  ✅ Won {result.playerScore}-{result.oppScore}
                </div>
              )}
              {isCurrent && (
                <button className="tm-play-btn" onClick={onStartMatch}>
                  KICK OFF!
                </button>
              )}
              {isLocked && <div className="tm-locked">🔒</div>}
            </div>
          );
        })}
      </div>

      {allWon && (
        <div className="tm-champion">
          <h2>🏆 WORLD CHAMPIONS! 🏆</h2>
          <p>{team?.emoji} {team?.name} have won the World Cup!</p>
        </div>
      )}

      <div className="tm-footer">
        <button className="tm-trophy-btn" onClick={onShowTrophyRoom}>
          🏆 Trophy Room
        </button>
        <button className="tm-bank-btn" onClick={onShowQuestionBank}>
          📝 Questions
        </button>
        <button className="tm-reset-btn" onClick={onResetGame}>
          New Tournament
        </button>
      </div>
    </div>
  );
}
