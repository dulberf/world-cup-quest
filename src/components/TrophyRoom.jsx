import React from 'react';
import { TEAMS, STAGE_LABELS } from '../gameState.js';
import './TrophyRoom.css';

const BADGE_ICONS = {
  group1: '🥉',
  group2: '🥉',
  group3: '🥉',
  round16: '🥈',
  quarter: '🥈',
  semi: '🥇',
  final: '🏆',
};

export default function TrophyRoom({ gameState, onBack }) {
  const team = TEAMS.find((t) => t.id === gameState.team);
  const tommyAcc = gameState.tommy.total > 0
    ? Math.round((gameState.tommy.correct / gameState.tommy.total) * 100)
    : 0;
  const maddyAcc = gameState.maddy.total > 0
    ? Math.round((gameState.maddy.correct / gameState.maddy.total) * 100)
    : 0;

  return (
    <div className="trophy-room">
      <div className="tr-header">
        <button className="tr-back" onClick={onBack}>← Back</button>
        <h1 className="tr-title">Trophy Room</h1>
      </div>

      <div className="tr-content">
        {/* Team badge */}
        <div className="tr-team-card">
          <span className="tr-team-emoji">{team?.emoji}</span>
          <span className="tr-team-name">{team?.name}</span>
          {gameState.streak > 0 && (
            <span className="tr-streak">🔥 {gameState.streak} day streak!</span>
          )}
        </div>

        {/* Player stats */}
        <div className="tr-players">
          <div className="tr-player tommy">
            <h3>Tommy</h3>
            <div className="tr-stat">
              <span className="tr-stat-num">{gameState.tommy.goals}</span>
              <span className="tr-stat-label">Goals</span>
            </div>
            <div className="tr-stat">
              <span className="tr-stat-num">{tommyAcc}%</span>
              <span className="tr-stat-label">Accuracy</span>
            </div>
          </div>
          <div className="tr-player maddy">
            <h3>Maddy</h3>
            <div className="tr-stat">
              <span className="tr-stat-num">{gameState.maddy.goals}</span>
              <span className="tr-stat-label">Goals</span>
            </div>
            <div className="tr-stat">
              <span className="tr-stat-num">{maddyAcc}%</span>
              <span className="tr-stat-label">Accuracy</span>
            </div>
          </div>
        </div>

        {/* Best match */}
        <div className="tr-best">
          <span>Best Match:</span>
          <span className="tr-best-num">{gameState.bestMatchGoals} goals</span>
        </div>

        {/* Badges */}
        <div className="tr-badges-section">
          <h3>Badges Earned</h3>
          <div className="tr-badges-grid">
            {Object.entries(BADGE_ICONS).map(([stage, icon]) => {
              const earned = gameState.badges.includes(stage);
              return (
                <div key={stage} className={`tr-badge ${earned ? 'earned' : 'locked'}`}>
                  <span className="tr-badge-icon">{earned ? icon : '🔒'}</span>
                  <span className="tr-badge-label">{STAGE_LABELS[stage]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
