import React from 'react';
import { TEAMS } from '../gameState.js';
import './TeamSelect.css';

export default function TeamSelect({ onSelect }) {
  return (
    <div className="team-select">
      <div className="team-select-header">
        <h1 className="title">World Cup Quest</h1>
        <p className="subtitle">Tommy & Maddy's Football Adventure!</p>
        <p className="instruction">Pick your national team:</p>
      </div>
      <div className="team-grid">
        {TEAMS.map((team) => (
          <button
            key={team.id}
            className="team-card"
            onClick={() => onSelect(team.id)}
          >
            <span className="team-emoji">{team.emoji}</span>
            <span className="team-name">{team.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
