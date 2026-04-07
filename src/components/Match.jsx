import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TEAMS,
  STAGE_LABELS,
  KEEPER_SAVE_RATES,
  getOpponentForStage,
} from '../gameState.js';
import { drawQuestion, generateBonusQuestion } from '../questions.js';
import PitchCanvas from './PitchCanvas.jsx';
import Confetti from './Confetti.jsx';
import './Match.css';

const GOALS_TO_WIN = 3;
const MATCH_DURATION = 300;
const NORMAL_PASSES = 3;
const SKILL_PASSES = 2;
const RUN_IN_DURATION = 1400; // ms player runs into position

// Time pressure per stage (seconds to answer, null = unlimited)
const QUESTION_TIME = {
  group1: null, group2: null, group3: null,
  round16: null,
  quarter: 15,
  semi: 12,
  final: 10,
};

export default function Match({ gameState, onMatchEnd, onQuit }) {
  const team = TEAMS.find((t) => t.id === gameState.team);
  const opponent = getOpponentForStage(gameState.currentStage, gameState.team);
  const saveRate = KEEPER_SAVE_RATES[gameState.currentStage];
  const stageLabel = STAGE_LABELS[gameState.currentStage];
  const questionTimeLimit = QUESTION_TIME[gameState.currentStage];

  // --- Score & attack state ---
  const [playerScore, setPlayerScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [maxPasses, setMaxPasses] = useState(NORMAL_PASSES);

  // --- Turn fairness ---
  // attackStarter alternates each attack; currentPlayer follows the sequence
  const [attackStarter, setAttackStarter] = useState('tommy');
  const [currentPlayer, setCurrentPlayer] = useState('tommy');
  const passInAttackRef = useRef(0); // which pass within the current attack

  // --- Phase & animation ---
  const [phase, setPhase] = useState('ready');
  // phases: ready | runningIn | question | result | shooting | goalCelebration | saved | intercepted | bonus | matchEnd
  const [animState, setAnimState] = useState('idle');
  const [keeperDiving, setKeeperDiving] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- Question state ---
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [hintLevel, setHintLevel] = useState(0); // 0=equation, 1=hint1, 2=hint2
  const [resultMsg, setResultMsg] = useState('');

  // --- Question timer ---
  const [questionTimer, setQuestionTimer] = useState(null);
  const questionTimerRef = useRef(null);

  // --- Match timer ---
  const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
  const matchTimerRef = useRef(null);

  // --- Stats ---
  const statsRef = useRef({
    tommyGoals: 0, maddyGoals: 0,
    tommyCorrect: 0, maddyCorrect: 0,
    tommyTotal: 0, maddyTotal: 0,
  });

  // ---- Match timer ----
  useEffect(() => {
    matchTimerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(matchTimerRef.current); endMatch(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(matchTimerRef.current);
  }, []);

  const endMatch = useCallback(() => setPhase('matchEnd'), []);

  useEffect(() => {
    if (playerScore >= GOALS_TO_WIN || oppScore >= GOALS_TO_WIN) {
      setTimeout(endMatch, 1500);
    }
  }, [playerScore, oppScore, endMatch]);

  // ---- Fairness: work out whose turn it is within an attack ----
  function playerForPass(passIndex, starter) {
    // Pass 0: starter, Pass 1: other, Pass 2: starter
    // So odd passes go to the other player, even to starter
    return passIndex % 2 === 0 ? starter : (starter === 'tommy' ? 'maddy' : 'tommy');
  }

  // ---- Start a new attack ----
  function startAttack(starter) {
    passInAttackRef.current = 0;
    const firstPlayer = playerForPass(0, starter);
    setCurrentPlayer(firstPlayer);
    setPassCount(0);
    setPhase('ready');
  }

  // ---- Begin question for current player ----
  function beginQuestion() {
    const q = drawQuestion(currentPlayer);
    setQuestion(q);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setHintLevel(0);

    // Show run-in animation first
    setPhase('runningIn');
    setAnimState('running');

    setTimeout(() => {
      setAnimState('idle');
      setPhase('question');
      // Start question timer if applicable
      if (questionTimeLimit) {
        setQuestionTimer(questionTimeLimit);
      }
    }, RUN_IN_DURATION);
  }

  // ---- Question timer countdown ----
  useEffect(() => {
    if (phase !== 'question' || !questionTimeLimit) return;
    if (questionTimer === null) return;
    if (questionTimer <= 0) {
      // Time's up — treat as wrong answer
      handleAnswer(null, true);
      return;
    }
    questionTimerRef.current = setTimeout(() => {
      setQuestionTimer(t => t - 1);
    }, 1000);
    return () => clearTimeout(questionTimerRef.current);
  }, [phase, questionTimer]);

  // ---- Answer handling ----
  function handleAnswer(answer, timedOut = false) {
    clearTimeout(questionTimerRef.current);
    setQuestionTimer(null);

    const correct = !timedOut && answer === question.answer;
    setSelectedAnswer(timedOut ? null : answer);
    setIsCorrect(correct);

    const stats = statsRef.current;
    if (currentPlayer === 'tommy') { stats.tommyTotal++; if (correct) stats.tommyCorrect++; }
    else { stats.maddyTotal++; if (correct) stats.maddyCorrect++; }

    if (correct) {
      const newPassCount = passCount + 1;
      setPassCount(newPassCount);
      setAnimState('passing');

      if (newPassCount >= maxPasses) {
        // Shot!
        setTimeout(() => {
          setPhase('shooting');
          setAnimState('shooting');
          attemptShot();
        }, 900);
      } else {
        // Next pass
        setTimeout(() => {
          setAnimState('idle');
          const nextPassIndex = passInAttackRef.current + 1;
          passInAttackRef.current = nextPassIndex;
          const nextPlayer = playerForPass(nextPassIndex, attackStarter);
          setCurrentPlayer(nextPlayer);
          setPhase('ready');
        }, 1200);
      }
    } else {
      // Wrong — intercepted
      setAnimState('intercepted');
      setResultMsg(timedOut ? `Time's up! The answer was ${question.answer}` : `Intercepted! The answer was ${question.answer}`);
      setPhase('intercepted');

      // Occasional opponent counter
      if (Math.random() < 0.15) {
        setTimeout(() => setOppScore(s => s + 1), 800);
      }

      setTimeout(() => {
        setAnimState('idle');
        setResultMsg('');
        setMaxPasses(NORMAL_PASSES);
        // Flip attack starter on interception
        const nextStarter = attackStarter === 'tommy' ? 'maddy' : 'tommy';
        setAttackStarter(nextStarter);
        startAttack(nextStarter);
      }, 2500);
    }
  }

  // ---- Shot on goal ----
  function attemptShot() {
    const saved = Math.random() < saveRate;
    const diveDir = Math.random() < 0.5 ? 'left' : 'right';
    setKeeperDiving(diveDir);

    setTimeout(() => {
      if (saved) {
        setAnimState('saved');
        setPhase('saved');
        setTimeout(() => {
          setKeeperDiving(null);
          setAnimState('idle');
          setMaxPasses(NORMAL_PASSES);
          const nextStarter = attackStarter === 'tommy' ? 'maddy' : 'tommy';
          setAttackStarter(nextStarter);
          startAttack(nextStarter);
        }, 2000);
      } else {
        // GOAL!
        setAnimState('goal');
        const scorer = currentPlayer;
        if (scorer === 'tommy') statsRef.current.tommyGoals++;
        else statsRef.current.maddyGoals++;
        setPlayerScore(s => s + 1);
        setShowConfetti(true);
        setPhase('goalCelebration');

        setTimeout(() => {
          setShowConfetti(false);
          setKeeperDiving(null);
          setAnimState('idle');
          // Bonus question
          setQuestion(generateBonusQuestion());
          setSelectedAnswer(null);
          setIsCorrect(null);
          setHintLevel(0);
          setPhase('bonus');
        }, 2500);
      }
    }, 900);
  }

  // ---- Bonus answer ----
  function handleBonusAnswer(answer) {
    const correct = answer === question.answer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    const nextMaxPasses = correct ? SKILL_PASSES : NORMAL_PASSES;
    setMaxPasses(nextMaxPasses);

    setTimeout(() => {
      const nextStarter = attackStarter === 'tommy' ? 'maddy' : 'tommy';
      setAttackStarter(nextStarter);
      startAttack(nextStarter);
    }, 1800);
  }

  // ---- Finish match ----
  function handleFinishMatch() {
    const stats = statsRef.current;
    onMatchEnd({
      won: playerScore >= GOALS_TO_WIN || playerScore > oppScore,
      playerScore,
      oppScore,
      tommyGoals: stats.tommyGoals,
      maddyGoals: stats.maddyGoals,
      tommyCorrect: stats.tommyCorrect,
      tommyTotal: stats.tommyTotal,
      maddyCorrect: stats.maddyCorrect,
      maddyTotal: stats.maddyTotal,
    });
  }

  function handleReplay() {
    setPlayerScore(0);
    setOppScore(0);
    setPassCount(0);
    setMaxPasses(NORMAL_PASSES);
    setTimeLeft(MATCH_DURATION);
    statsRef.current = { tommyGoals: 0, maddyGoals: 0, tommyCorrect: 0, maddyCorrect: 0, tommyTotal: 0, maddyTotal: 0 };
    setAttackStarter('tommy');
    startAttack('tommy');
    clearInterval(matchTimerRef.current);
    matchTimerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(matchTimerRef.current); endMatch(); return 0; } return t - 1; });
    }, 1000);
  }

  const formatTime = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const timerWarning = timeLeft <= 60;
  const otherPlayer = currentPlayer === 'tommy' ? 'maddy' : 'tommy';

  return (
    <div className="match">
      {showConfetti && <Confetti />}

      {/* Scoreboard */}
      <div className="match-scoreboard">
        <div className="match-stage">{stageLabel}</div>
        <div className="match-scores">
          <div className="match-team-score">
            <span className="score-emoji">{team?.emoji}</span>
            <span className="score-name">{team?.name}</span>
            <span className="score-num">{playerScore}</span>
          </div>
          <div className="score-vs">vs</div>
          <div className="match-team-score">
            <span className="score-num">{oppScore}</span>
            <span className="score-name">{opponent.name}</span>
            <span className="score-emoji">{opponent.emoji}</span>
          </div>
        </div>
        <div className={`match-timer ${timerWarning ? 'warning' : ''}`}>{formatTime(timeLeft)}</div>
      </div>

      {/* Pitch */}
      <div className="match-pitch">
        <PitchCanvas
          passCount={passCount}
          maxPasses={maxPasses}
          currentPlayer={currentPlayer}
          attackStarter={attackStarter}
          animState={animState}
          keeperDiving={keeperDiving}
          phase={phase}
        />
      </div>

      {/* Pass progress */}
      <div className="pass-progress">
        {Array.from({ length: maxPasses }).map((_, i) => (
          <div key={i} className={`pass-dot ${i < passCount ? 'filled' : ''}`} />
        ))}
        <span className="pass-label">
          {passCount < maxPasses ? `Pass ${passCount + 1} of ${maxPasses}` : 'SHOT!'}
        </span>
      </div>

      {/* Fairness indicator */}
      <div className="fairness-bar">
        <span className={`fairness-player ${currentPlayer === 'tommy' ? 'active' : ''}`}>Tommy</span>
        <span className="fairness-dot">⚽</span>
        <span className={`fairness-player ${currentPlayer === 'maddy' ? 'active' : ''}`}>Maddy</span>
      </div>


      {/* Game panel */}
      <div className="match-panel">

        {phase === 'ready' && (
          <div className="ready-panel">
            <div className={`player-turn ${currentPlayer}`}>
              {currentPlayer === 'tommy' ? "Tommy's" : "Maddy's"} turn!
            </div>

            <button className="confirm-btn" onClick={beginQuestion}>
              Tap to play!
            </button>
          </div>
        )}

        {phase === 'runningIn' && (
          <div className="running-in-panel">
            <div className="running-dots">
              <span>•</span><span>•</span><span>•</span>
            </div>
          </div>
        )}

        {phase === 'question' && question && (
          <div className="question-panel">
            <div className="question-top">
              <div className={`player-badge ${currentPlayer}`}>
                {currentPlayer === 'tommy' ? 'Tommy' : 'Maddy'}
              </div>
              {questionTimeLimit && questionTimer !== null && (
                <div className={`q-timer ${questionTimer <= 5 ? 'urgent' : ''}`}>
                  ⏱ {questionTimer}s
                </div>
              )}
            </div>

            {/* Equation display */}
            <div className="equation-display">
              {hintLevel === 0 && <span className="equation-text">{question.display}</span>}
              {hintLevel === 1 && <span className="hint-text">{question.hint1}</span>}
              {hintLevel === 2 && <span className="hint-text hint-story">{question.hint2}</span>}
            </div>

            {/* Hint button */}
            <button
              className="hint-btn"
              onClick={() => setHintLevel(l => Math.min(l + 1, 2))}
              disabled={hintLevel >= 2}
            >
              {hintLevel === 0 ? '? Need a hint' : hintLevel === 1 ? '? More context' : '✓ Got it'}
            </button>

            <div className="options-grid">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  className={`option-btn ${
                    selectedAnswer !== null
                      ? opt === question.answer ? 'correct' : opt === selectedAnswer ? 'wrong' : ''
                      : ''
                  }`}
                  onClick={() => selectedAnswer === null && handleAnswer(opt)}
                  disabled={selectedAnswer !== null}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'intercepted' && (
          <div className="result-panel">
            <p className="result-msg intercepted">🛑 {resultMsg}</p>
            {question && <p className="explanation">{question.hint1}</p>}
          </div>
        )}

        {phase === 'shooting' && (
          <div className="result-panel">
            <p className="result-msg shooting">⚽ SHOT ON GOAL!</p>
          </div>
        )}

        {phase === 'saved' && (
          <div className="result-panel">
            <p className="result-msg saved">Great save! Win it back!</p>
          </div>
        )}

        {phase === 'goalCelebration' && (
          <div className="result-panel celebration">
            <p className="result-msg goal">⚽ GOOOAAAL! THE CROWD GOES WILD! ⚽</p>
          </div>
        )}

        {phase === 'bonus' && question && (
          <div className="question-panel bonus">
            <p className="bonus-label">✨ SKILL MOVE BONUS! ✨</p>
            <p className="bonus-sub">Get it right — start your next attack closer to goal!</p>
            <div className="equation-display">
              <span className="equation-text">{question.display}</span>
            </div>
            <div className="options-grid">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  className={`option-btn bonus-opt ${
                    selectedAnswer !== null
                      ? opt === question.answer ? 'correct' : opt === selectedAnswer ? 'wrong' : ''
                      : ''
                  }`}
                  onClick={() => selectedAnswer === null && handleBonusAnswer(opt)}
                  disabled={selectedAnswer !== null}
                >
                  {opt}
                </button>
              ))}
            </div>
            {selectedAnswer !== null && (
              <p className={`bonus-result ${isCorrect ? 'correct' : 'wrong'}`}>
                {isCorrect ? '🚀 Next attack starts closer to goal!' : `The answer was ${question.answer}. Normal start!`}
              </p>
            )}
            <button className="skip-btn" onClick={() => {
              setMaxPasses(NORMAL_PASSES);
              const nextStarter = attackStarter === 'tommy' ? 'maddy' : 'tommy';
              setAttackStarter(nextStarter);
              startAttack(nextStarter);
            }}>
              Skip bonus
            </button>
          </div>
        )}

        {phase === 'matchEnd' && (
          <div className="match-end-panel">
            <h2 className="match-end-title">
              {playerScore >= GOALS_TO_WIN || playerScore > oppScore ? '🏆 YOU WIN!' :
               playerScore === oppScore ? "IT'S A DRAW!" : 'Match lost'}
            </h2>
            <p className="match-end-score">
              {team?.emoji} {playerScore} – {oppScore} {opponent.emoji}
            </p>
            <div className="match-end-stats">
              <div>Tommy: {statsRef.current.tommyGoals} goals · {statsRef.current.tommyCorrect}/{statsRef.current.tommyTotal} correct</div>
              <div>Maddy: {statsRef.current.maddyGoals} goals · {statsRef.current.maddyCorrect}/{statsRef.current.maddyTotal} correct</div>
            </div>
            <div className="match-end-btns">
              {playerScore < GOALS_TO_WIN && playerScore <= oppScore ? (
                <button className="confirm-btn" onClick={handleReplay}>Play Again!</button>
              ) : (
                <button className="confirm-btn" onClick={handleFinishMatch}>Continue</button>
              )}
              <button className="quit-btn" onClick={onQuit}>Back to Tournament</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
