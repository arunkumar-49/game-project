import React, { useRef, useEffect, useState } from 'react';

// ... (Keep your helper function 'roundRect' here) ...
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

const LEVEL_THRESHOLDS = {
  2: 500,
  3: 1500,
  4: 3000,
};

function Game({ onGameOver }) {
  const canvasRef = useRef(null);
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highscore, setHighscore] = useState(
    () => parseInt(localStorage.getItem('mini-run-high') || '0', 10)
  );
  const [paused, setPaused] = useState(false);

  // Refs for game loop state
  const gameState = useRef({
    running: true,
    paused: false,
    lastTime: performance.now(),
    spawnTimer: 0,
    spawnInterval: 900,
    baseSpeed: 250,
    speedIncrease: 0.025,
    speedMultiplier: 1,
    score: 0,
    level: 1,
    player: { lane: 1, x: 0, y: 0, vy: 0, w: 50, h: 50, jumping: false, color: '#ffdd57' },
    obstacles: [],
    keys: {},
    LANES: 3,
    laneWidth: 0,
    groundY: 0,
    playerSize: 50,
    gravity: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const g = gameState.current;

    function resize() {
      // Calculate height: Window height - Navbar (70px) - UI spacing
      const availableHeight = window.innerHeight - 140; 
      canvas.width = Math.min(window.innerWidth * 0.9, 900);
      canvas.height = Math.min(availableHeight, 750);
      
      g.laneWidth = canvas.width / (g.LANES + 1);
      g.groundY = canvas.height * 0.85;
      g.playerSize = Math.round(Math.min(canvas.width, canvas.height) * 0.06);
      g.gravity = 0.0025 * canvas.height;
      
      g.player.w = g.playerSize;
      g.player.h = g.playerSize;
      
      initPositions();
    }
    
    // ... (Keep jump, initPositions, resetGame, spawnObstacle, moveLeft/Right logic exactly as before) ...
    
    // Helper to keep code concise:
    const laneX = (i) => (i + 1) * g.laneWidth;

    function initPositions() {
      g.player.w = g.playerSize;
      g.player.h = g.playerSize;
      g.player.x = laneX(g.player.lane) - g.player.w / 2;
      g.player.y = g.groundY - g.player.h;
    }

    function resetGame() {
        g.spawnTimer = 0;
        g.obstacles.length = 0;
        g.score = 0;
        setScore(0);
        g.speedMultiplier = 1;
        g.baseSpeed = 250;
        g.level = 1;
        setLevel(1);
        g.player.lane = 1;
        g.player.y = g.groundY - g.player.h;
        g.player.vy = 0;
        g.player.jumping = false;
        g.running = true;
        g.paused = false;
        setPaused(false);
        g.lastTime = performance.now();
        initPositions();
    }

    function spawnObstacle() {
        // ... (Paste your exact previous spawnObstacle code here) ...
        const lane = Math.floor(Math.random() * g.LANES);
        const width = g.playerSize * (0.9 + Math.random() * 0.7);
        let height = g.playerSize * (0.8 + Math.random() * 1.2);
        const x = laneX(lane) - width / 2;
        let y = -height - 10;
        
        const obstacleChoices = ['fruit', 'box', 'box', 'box', 'box', 'balloon', 'balloon', 'danger']; 
        const type = obstacleChoices[Math.floor(Math.random() * obstacleChoices.length)];

        let color = '#222222'; 
        let isLethal = true; 
        let scoreValue = 0; 

        if (type === 'fruit') {
            color = Math.random() < 0.5 ? '#e74c3c' : '#2ecc71'; 
            isLethal = false;
            scoreValue = 25;
        } else if (type === 'danger') {
            color = '#e74c3c'; 
            height = g.playerSize * (1.5 + Math.random() * 1); 
            isLethal = true;
        } else if (type === 'box') {
            const boxColors = ['#222222', '#1a73e8', '#f2c200', '#74b9ff']; 
            color = boxColors[Math.floor(Math.random() * boxColors.length)];
            isLethal = true;
        } else if (type === 'balloon') {
            const balloonColors = ['#ff6b6b', '#1dd1a1']; 
            color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
            isLethal = false; 
            scoreValue = 50; 
            height = g.playerSize * 1.2; 
            y = -height - Math.random() * canvas.height * 0.3; 
        }

        g.obstacles.push({ lane, x, y, w: width, h: height, type, color, isLethal, scoreValue });
    }

    function moveLeft() { if (g.player.lane > 0 && !g.paused && g.running) g.player.lane -= 1; }
    function moveRight() { if (g.player.lane < g.LANES - 1 && !g.paused && g.running) g.player.lane += 1; }
    function jump() {
      if (!g.player.jumping && g.running && !g.paused) {
        g.player.vy = -0.60 * canvas.height;
        g.player.jumping = true;
      }
    }
    
    function collided(a, b) {
      return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
    }

    function update(delta) {
       // ... (Paste your exact previous update code here) ...
       const nextLevel = g.level + 1;
       if (LEVEL_THRESHOLDS[nextLevel] && g.score >= LEVEL_THRESHOLDS[nextLevel]) {
         g.level = nextLevel;
         setLevel(nextLevel);
         g.baseSpeed += 50;
       }
 
       g.speedMultiplier += g.speedIncrease * delta;
       g.spawnTimer += delta * 1000;
       
       if (g.spawnTimer >= g.spawnInterval / Math.max(1, g.speedMultiplier)) {
         g.spawnTimer = 0;
         spawnObstacle();
         g.spawnInterval = Math.max(420, g.spawnInterval - 6);
       }
 
       const speed = g.baseSpeed * g.speedMultiplier;
       for (let i = g.obstacles.length - 1; i >= 0; i--) {
         const ob = g.obstacles[i];
         ob.y += speed * delta;
         if (ob.y > canvas.height + 100) {
           g.obstacles.splice(i, 1);
         }
       }
 
       g.player.x = laneX(g.player.lane) - g.player.w / 2;
       g.player.vy += g.gravity * delta;
       g.player.y += g.player.vy * delta;
       const ground = g.groundY - g.player.h;
       if (g.player.y >= ground) {
         g.player.y = ground;
         g.player.vy = 0;
         g.player.jumping = false;
       }
 
       // Collision check
       for (let i = g.obstacles.length - 1; i >= 0; i--) {
         const ob = g.obstacles[i];
         const obRect = { x: ob.x, y: ob.y, w: ob.w, h: ob.h };
         const plRect = { x: g.player.x, y: g.player.y, w: g.player.w, h: g.player.h };
         if (collided(plRect, obRect)) {
           if (!ob.isLethal) { 
             g.score += ob.scoreValue;
             setScore(g.score); 
             g.obstacles.splice(i, 1); 
           } else { 
             gameOver();
             return;
           }
         }
       }
    }

    function gameOver() {
      g.running = false;
      g.paused = true;
      setPaused(true);
      if (g.score > highscore) {
        const newHigh = Math.floor(g.score);
        localStorage.setItem('mini-run-high', String(newHigh));
        setHighscore(newHigh); 
      }
      onGameOver(Math.floor(g.score));
    }

    // ... (Keep drawRoad, drawPlayer, render, step, event listeners exactly as before) ...
    function drawRoad() {
        ctx.save();
        const roadTop = canvas.height * 0.38;
        const roadBottom = g.groundY;
  
        const skyGradient = ctx.createLinearGradient(0, 0, 0, roadTop);
        skyGradient.addColorStop(0, '#050505'); 
        skyGradient.addColorStop(1, '#222'); 
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, roadTop);
  
        const gr = ctx.createLinearGradient(0, roadTop, 0, roadBottom);
        gr.addColorStop(0, '#1a1a2e'); 
        gr.addColorStop(1, '#16213e'); 
        ctx.fillStyle = gr;
        ctx.fillRect(0, roadTop, canvas.width, roadBottom - roadTop);
  
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)'; // Neon grid lines
        ctx.lineWidth = 2;
        for (let i = 0; i < g.LANES; i++) {
          const x = laneX(i);
          ctx.beginPath();
          ctx.moveTo(x, roadTop);
          ctx.lineTo(x, roadBottom);
          ctx.stroke();
        }
        ctx.restore();
    }

    function drawPlayer() {
        const p = g.player;
        const x = p.x;
        const y = p.y;
        const w = p.w;
        const h = p.h;

        // Shadow
        ctx.fillStyle = 'rgba(0, 242, 255, 0.3)'; // Neon shadow
        ctx.beginPath();
        ctx.ellipse(x + w / 2 + 6, y + h + 8, w * 0.6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cyber Player Body
        ctx.fillStyle = '#00f2ff'; 
        roundRect(ctx, x, y + h * 0.2, w, h * 0.8, 5, true, false); 
        
        // Head
        ctx.fillStyle = '#fff'; 
        roundRect(ctx, x + w * 0.25, y - h * 0.2, w * 0.5, h * 0.4, 3, true, false);
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRoad();
        for (const ob of g.obstacles) {
            ctx.fillStyle = ob.color;
            if(ob.type === 'fruit' || ob.type === 'balloon') {
                 // Simple circle draw for these
                 ctx.beginPath();
                 ctx.arc(ob.x + ob.w/2, ob.y + ob.h/2, ob.w/2, 0, Math.PI*2);
                 ctx.fill();
            } else {
                 roundRect(ctx, ob.x, ob.y, ob.w, ob.h, 4, true, false);
            }
        }
        drawPlayer();
    }

    function step(now) {
        if (!g.running) return; 
        const dt = Math.min(40, now - g.lastTime);
        g.lastTime = now;
        
        if (!g.paused) {
          update(dt / 1000);
        }
        render();
        requestAnimationFrame(step);
    }

    function handleKeyDown(e) {
      g.keys[e.key] = true;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') moveLeft();
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') moveRight();
      if (e.key === 'ArrowUp' || e.code === 'Space') jump();
      if (e.key === 'p') {
        const newPaused = !g.paused;
        g.paused = newPaused;
        setPaused(newPaused);
      }
    }
    function handleKeyUp(e) { g.keys[e.key] = false; }
    
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    resize(); 
    resetGame();
    requestAnimationFrame(step);

    return () => {
      g.running = false; 
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  
  }, [onGameOver, highscore]); 

  // --- UPDATED UI RETURN ---
  return (
    <>
      <div className="game-ui-overlay">
        <div className="hud-panel">
          <div className="hud-item">
            <span className="hud-label">SCORE</span>
            <span className="hud-value">{score}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">HIGH</span>
            <span className="hud-value">{highscore}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">LEVEL</span>
            <span className="hud-value lvl">{level}</span>
          </div>
        </div>
        
        <div>
          <button className="btn-pause" onClick={() => {
            const newPaused = !gameState.current.paused;
            gameState.current.paused = newPaused;
            setPaused(newPaused);
          }}>
            {paused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} id="game" />

      <div className="help-text">
        [ARROWS / SPACE] to Move & Jump
      </div>
    </>
  );
}

export default Game;