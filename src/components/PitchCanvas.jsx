import React, { useRef, useEffect } from 'react';

const BASE = import.meta.env.BASE_URL;

const SPRITES = {
  tommy: `${BASE}assets/players/tommy_idle.png`,
  tommyRun0: `${BASE}assets/players/tommy_run0.png`,
  tommyRun1: `${BASE}assets/players/tommy_run1.png`,
  tommyRun2: `${BASE}assets/players/tommy_run2.png`,
  tommyKick: `${BASE}assets/players/tommy_kick.png`,
  tommyCheer0: `${BASE}assets/players/tommy_cheer0.png`,
  tommyCheer1: `${BASE}assets/players/tommy_cheer1.png`,
  tommyHurt: `${BASE}assets/players/tommy_hurt.png`,
  maddy: `${BASE}assets/players/maddy_idle.png`,
  maddyRun0: `${BASE}assets/players/maddy_run0.png`,
  maddyRun1: `${BASE}assets/players/maddy_run1.png`,
  maddyRun2: `${BASE}assets/players/maddy_run2.png`,
  maddyKick: `${BASE}assets/players/maddy_kick.png`,
  maddyCheer0: `${BASE}assets/players/maddy_cheer0.png`,
  maddyCheer1: `${BASE}assets/players/maddy_cheer1.png`,
  maddyHurt: `${BASE}assets/players/maddy_hurt.png`,
  opponent: `${BASE}assets/opponents/zombie_idle.png`,
  opponentRun0: `${BASE}assets/opponents/zombie_run0.png`,
  opponentRun1: `${BASE}assets/opponents/zombie_run1.png`,
  opponentHurt: `${BASE}assets/opponents/zombie_hurt.png`,
  keeper: `${BASE}assets/keeper/robot_idle.png`,
  keeperJump: `${BASE}assets/keeper/robot_jump.png`,
  keeperHurt: `${BASE}assets/keeper/robot_hurt.png`,
  keeperCheer: `${BASE}assets/keeper/robot_cheer0.png`,
  ball: `${BASE}assets/equipment/ball.png`,
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ─── Waypoints ──────────────────────────────────────────────────────────────
// Canvas is 320 × 360.
// Each entry = where each player should BE at that pass count.
// Passer stays at their position, receiver has already run (or is running) to theirs.
//
// attackStarter='tommy': Tommy passes first
//   pass 0 → Maddy runs to receive center
//   pass 1 → Tommy has ball at center-left, Maddy runs upper-right wing → SHOT Maddy
//
// attackStarter='maddy': Maddy passes first
//   pass 0 → Tommy runs to receive center
//   pass 1 → Maddy has ball at center-right, Tommy runs upper-left → SHOT Tommy

const WAYPOINTS = {
  3: {
    tommy: [
      // passCount=0: Tommy at home (has ball), Maddy runs to centre
      { tommy: [80, 280],  maddy: [195, 215] },
      // passCount=1: Maddy at centre (has ball), Tommy runs to upper-left
      { tommy: [95, 150],  maddy: [195, 215] },
      // passCount=2: SHOT TIME — both sprint to attacking third
      { tommy: [60, 60],   maddy: [270, 60] },
    ],
    maddy: [
      // passCount=0: Maddy at home (has ball), Tommy runs to centre
      { tommy: [155, 215], maddy: [240, 280] },
      // passCount=1: Tommy at centre (has ball), Maddy runs to upper-right wing
      { tommy: [155, 215], maddy: [225, 150] },
      // passCount=2: SHOT TIME — both sprint to attacking third
      { tommy: [60, 60],   maddy: [270, 60] },
    ],
  },
  2: { // skill move — one pass then shoot, receiver goes further
    tommy: [
      { tommy: [80, 280],  maddy: [200, 165] },
      { tommy: [80, 280],  maddy: [200, 165] },
    ],
    maddy: [
      { tommy: [140, 165], maddy: [240, 280] },
      { tommy: [140, 165], maddy: [240, 280] },
    ],
  },
};

const HOME = { tommy: [80, 280], maddy: [240, 280] };

export default function PitchCanvas({
  passCount,
  maxPasses,
  currentPlayer,
  attackStarter,
  animState,
  keeperDiving,
  shotOutcome,
  phase,
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef({});

  // Separate animated positions for each player and ball
  const posRef = useRef({
    tommyX: HOME.tommy[0], tommyY: HOME.tommy[1],
    maddyX: HOME.maddy[0], maddyY: HOME.maddy[1],
    ballX: HOME.tommy[0] + 10, ballY: HOME.tommy[1] + 50,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all(Object.entries(SPRITES).map(async ([k, src]) => [k, await loadImage(src)]))
      .then(entries => { if (!cancelled) imagesRef.current = Object.fromEntries(entries); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId, frame = 0;

    function draw() {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      const imgs = imagesRef.current;

      // ── Position targets ──────────────────────────────────────────────────
      const starter = attackStarter || 'tommy';
      const passes = maxPasses === 2 ? 2 : 3;
      const wpSet = WAYPOINTS[passes]?.[starter] || WAYPOINTS[3].tommy;
      const wpIdx = Math.min(passCount, wpSet.length - 1);
      const wp = wpSet[wpIdx];

      let tommyTarget = wp.tommy;
      let maddyTarget = wp.maddy;

      const p = posRef.current;

      // During 'ready', freeze everyone — run only starts when user taps "Tap to play!"
      if (phase === 'ready') {
        tommyTarget = [p.tommyX, p.tommyY];
        maddyTarget = [p.maddyX, p.maddyY];
      }

      // During passing, freeze the kicker so kick plays in place, then they run after
      if (animState === 'passing') {
        if (currentPlayer === 'tommy') tommyTarget = [p.tommyX, p.tommyY];
        else maddyTarget = [p.maddyX, p.maddyY];
      }

      // On intercept, players freeze in place (hurt animation plays at current position)
      if (animState === 'intercepted') {
        tommyTarget = [p.tommyX, p.tommyY];
        maddyTarget = [p.maddyX, p.maddyY];
      }

      const moveSpeed = 0.055;

      p.tommyX += (tommyTarget[0] - p.tommyX) * moveSpeed;
      p.tommyY += (tommyTarget[1] - p.tommyY) * moveSpeed;
      p.maddyX += (maddyTarget[0] - p.maddyX) * moveSpeed;
      p.maddyY += (maddyTarget[1] - p.maddyY) * moveSpeed;

      // ── Ball target ───────────────────────────────────────────────────────
      // Normally sits at passer's feet
      const pX = currentPlayer === 'tommy' ? p.tommyX : p.maddyX;
      const pY = currentPlayer === 'tommy' ? p.tommyY : p.maddyY;
      const rX = currentPlayer === 'tommy' ? p.maddyX : p.tommyX;
      const rY = currentPlayer === 'tommy' ? p.maddyY : p.tommyY;

      let ballTargetX = pX + 10;
      let ballTargetY = pY + 50; // feet

      // Keeper's effective X (used for save target)
      let keeperPosX = w / 2;
      if (keeperDiving === 'left')  keeperPosX = w / 2 - 38;
      if (keeperDiving === 'right') keeperPosX = w / 2 + 38;

      if (animState === 'passing') {
        ballTargetX = rX + 10;
        ballTargetY = rY + 50;
      } else if (animState === 'shooting') {
        if (shotOutcome === 'goal') {
          // Ball flies directly to the open corner (opposite to keeper's dive)
          ballTargetX = keeperDiving === 'left' ? w / 2 + 50 : w / 2 - 50;
          ballTargetY = 10;
        } else {
          // Ball flies directly at the keeper
          ballTargetX = keeperPosX;
          ballTargetY = 36;
        }
      } else if (animState === 'saved') {
        ballTargetX = keeperPosX;
        ballTargetY = 36;
      } else if (animState === 'goal') {
        ballTargetX = keeperDiving === 'left' ? w / 2 + 50 : w / 2 - 50;
        ballTargetY = 10;
      } else if (animState === 'oppGoal') {
        // Ball flies off the bottom of the screen
        ballTargetX = w / 2;
        ballTargetY = h + 60;
      } else if (animState === 'intercepted') {
        // Ball goes to the zombie on the same side as the passer
        if (currentPlayer === 'tommy') {
          ballTargetX = w * 0.2 + 10; // left zombie
          ballTargetY = h * 0.37 + 40;
        } else {
          ballTargetX = w * 0.8 + 10; // right zombie
          ballTargetY = h * 0.32 + 40;
        }
      }

      const ballSpeed = (animState === 'passing' || animState === 'shooting' || animState === 'saved' || animState === 'goal' || animState === 'intercepted' || animState === 'oppGoal') ? 0.18 : 0.12;
      p.ballX += (ballTargetX - p.ballX) * ballSpeed;
      p.ballY += (ballTargetY - p.ballY) * ballSpeed;

      // ── Draw pitch ────────────────────────────────────────────────────────
      ctx.fillStyle = '#2d8b46';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < h; i += 40) {
        if (Math.floor(i / 40) % 2 === 0) { ctx.fillStyle = '#2a7f40'; ctx.fillRect(0, i, w, 20); }
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(w / 2, h * 0.5, 38, 0, Math.PI * 2); ctx.stroke();

      const goalW = w * 0.45;
      ctx.strokeRect((w - goalW) / 2, 0, goalW, 36);
      const penW = w * 0.68;
      ctx.strokeRect((w - penW) / 2, 0, penW, 65);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect((w - goalW * 0.78) / 2, 0, goalW * 0.78, 18);

      // ── Sprites ───────────────────────────────────────────────────────────
      const SW = 56, SH = 56;
      const KW = 64, KH = 64;

      function drawSprite(img, cx, cy, sw, sh, flipX = false) {
        if (!img) return;
        ctx.save();
        if (flipX) {
          ctx.translate(cx - sw / 2, cy);
          ctx.scale(-1, 1);
          ctx.drawImage(img, -sw, 0, sw, sh);
        } else {
          ctx.drawImage(img, cx - sw / 2, cy, sw, sh);
        }
        ctx.restore();
      }

      // Keeper
      let keeperImg = imgs.keeper;
      let keeperX = w / 2;
      if (keeperDiving === 'left')  { keeperImg = imgs.keeperJump; keeperX = w / 2 - 38; }
      if (keeperDiving === 'right') { keeperImg = imgs.keeperJump; keeperX = w / 2 + 38; }
      if (animState === 'saved') keeperImg = imgs.keeperCheer;
      if (animState === 'goal')  keeperImg = imgs.keeperHurt;
      drawSprite(keeperImg, keeperX, 10, KW, KH);

      // Opponents (zombies) — roughly midfield sides, animate idly
      const oppCycle = Math.floor(frame / 22) % 3;
      const oppImg = [imgs.opponent, imgs.opponentRun0, imgs.opponentRun1][oppCycle] || imgs.opponent;
      drawSprite(oppImg, w * 0.2, h * 0.37, SW, SH, true);
      drawSprite(oppImg, w * 0.8, h * 0.32, SW, SH);

      // Run cycle
      const runSpeed = phase === 'runningIn' ? 6 : 10;
      const runCycle = Math.floor(frame / runSpeed) % 3;

      // Is a player currently moving toward their target?
      const tommyMoving = Math.abs(p.tommyX - tommyTarget[0]) > 3 || Math.abs(p.tommyY - tommyTarget[1]) > 3;
      const maddyMoving = Math.abs(p.maddyX - maddyTarget[0]) > 3 || Math.abs(p.maddyY - maddyTarget[1]) > 3;

      // ── Tommy ──
      let tommyImg = imgs.tommy;
      if (animState === 'goal') {
        tommyImg = frame % 20 < 10 ? imgs.tommyCheer0 : imgs.tommyCheer1;
      } else if (animState === 'intercepted') {
        tommyImg = imgs.tommyHurt;
      } else if (animState === 'passing' && currentPlayer === 'tommy') {
        tommyImg = imgs.tommyKick;
      } else if (tommyMoving) {
        tommyImg = [imgs.tommyRun0, imgs.tommyRun1, imgs.tommyRun2][runCycle] || imgs.tommy;
      }
      // Tommy faces right (toward goal/centre) — no flip needed
      drawSprite(tommyImg, p.tommyX, p.tommyY, SW, SH);

      // ── Maddy (flipped to face left/inward) ──
      let maddyImg = imgs.maddy;
      if (animState === 'goal') {
        maddyImg = frame % 20 < 10 ? imgs.maddyCheer0 : imgs.maddyCheer1;
      } else if (animState === 'intercepted') {
        maddyImg = imgs.maddyHurt;
      } else if (animState === 'passing' && currentPlayer === 'maddy') {
        maddyImg = imgs.maddyKick;
      } else if (maddyMoving) {
        maddyImg = [imgs.maddyRun0, imgs.maddyRun1, imgs.maddyRun2][runCycle] || imgs.maddy;
      }
      drawSprite(maddyImg, p.maddyX, p.maddyY, SW, SH, true);

      // Player labels
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = currentPlayer === 'tommy' ? '#ffc107' : 'rgba(255,255,255,0.7)';
      ctx.fillText('Tommy', p.tommyX, p.tommyY + SH + 13);
      ctx.fillStyle = currentPlayer === 'maddy' ? '#ffc107' : 'rgba(255,255,255,0.7)';
      ctx.fillText('Maddy', p.maddyX, p.maddyY + SH + 13);

      // ── Ball ──
      if (imgs.ball) {
        const BS = 22;
        ctx.drawImage(imgs.ball, p.ballX - BS / 2, p.ballY - BS / 2, BS, BS);
      }

      // Goal flash overlay
      if (animState === 'goal') {
        ctx.fillStyle = `rgba(255,193,7,${0.12 + 0.08 * Math.sin(frame * 0.3)})`;
        ctx.fillRect(0, 0, w, h);
      }


      rafId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [passCount, maxPasses, currentPlayer, attackStarter, animState, keeperDiving, shotOutcome, phase]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={360}
      style={{
        width: '100%',
        maxWidth: 380,
        maxHeight: '100%',
        borderRadius: 12,
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
}
