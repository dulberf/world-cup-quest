import React, { useState, useEffect } from 'react';
import { loadBank, addToBank, clearBank, resetUsed, parseEquation } from '../questionBank.js';
import './QuestionBank.css';

export default function QuestionBank({ onBack }) {
  const [input, setInput] = useState('');
  const [bank, setBank] = useState(loadBank);
  const [feedback, setFeedback] = useState('');
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    // Live preview as user types
    const lines = input.split('\n').map(l => l.trim()).filter(Boolean);
    setPreview(lines.map(l => ({ raw: l, parsed: parseEquation(l) })));
  }, [input]);

  function handleAdd() {
    if (!input.trim()) return;
    const count = addToBank(input);
    setBank(loadBank());
    setInput('');
    setPreview([]);
    setFeedback(`✅ Added ${count} question${count !== 1 ? 's' : ''}!`);
    setTimeout(() => setFeedback(''), 3000);
  }

  function handleClear() {
    if (!confirm('Clear all questions from the bank?')) return;
    clearBank();
    setBank([]);
    setFeedback('Bank cleared.');
    setTimeout(() => setFeedback(''), 2000);
  }

  function handleReset() {
    resetUsed();
    setBank(loadBank());
    setFeedback('All questions marked as unused — they\'ll appear in game again!');
    setTimeout(() => setFeedback(''), 3000);
  }

  const used = bank.filter(q => q.used).length;
  const total = bank.length;

  return (
    <div className="qb">
      <div className="qb-header">
        <button className="qb-back" onClick={onBack}>← Back</button>
        <h1 className="qb-title">Question Bank</h1>
      </div>

      <div className="qb-content">
        <div className="qb-intro">
          <p>Type equations from homework sheets — one per line.</p>
          <div className="qb-formats">
            <span>7 × 8</span><span>56 ÷ 7</span><span>15 + 8</span><span>20 - 6</span>
            <span>? + 6 = 13</span><span>3 × ? = 21</span><span>7x8</span><span>56/7</span>
          </div>
        </div>

        <textarea
          className="qb-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={"7 × 8\n56 ÷ 7\n? + 6 = 13\n3 × ? = 21\n15 + 23"}
          rows={6}
          spellCheck={false}
        />

        {preview.length > 0 && (
          <div className="qb-preview">
            {preview.map((p, i) => (
              <div key={i} className={`qb-preview-row ${p.parsed ? 'ok' : 'bad'}`}>
                <span className="qb-preview-icon">{p.parsed ? '✅' : '❌'}</span>
                <span className="qb-preview-raw">{p.raw}</span>
                {p.parsed && (
                  <span className="qb-preview-result">→ {p.parsed.display} (answer: {p.parsed.answer})</span>
                )}
                {!p.parsed && <span className="qb-preview-result">can't parse</span>}
              </div>
            ))}
          </div>
        )}

        <button
          className="qb-add-btn"
          onClick={handleAdd}
          disabled={!preview.some(p => p.parsed)}
        >
          Add to Bank
        </button>

        {feedback && <p className="qb-feedback">{feedback}</p>}

        <div className="qb-stats">
          <div className="qb-stat">
            <span className="qb-stat-num">{total}</span>
            <span className="qb-stat-label">Total questions</span>
          </div>
          <div className="qb-stat">
            <span className="qb-stat-num">{total - used}</span>
            <span className="qb-stat-label">Unused</span>
          </div>
          <div className="qb-stat">
            <span className="qb-stat-num">{used}</span>
            <span className="qb-stat-label">Played</span>
          </div>
        </div>

        {total > 0 && (
          <div className="qb-bank-list">
            <h3>Questions in bank</h3>
            <div className="qb-list">
              {bank.map((q, i) => (
                <div key={q.id || i} className={`qb-list-item ${q.used ? 'used' : ''}`}>
                  <span className="qb-list-display">{q.display}</span>
                  <span className="qb-list-ans">= {q.answer}</span>
                  {q.used && <span className="qb-list-badge">played</span>}
                </div>
              ))}
            </div>
            <div className="qb-bank-actions">
              <button className="qb-reset-btn" onClick={handleReset}>Reset all to unused</button>
              <button className="qb-clear-btn" onClick={handleClear}>Clear bank</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
