/* --- Simplified Cargo or Survival ---
   Core: fuel, distance, cargo, shields, jettison, win/lose
*/

const CONFIG = {
  destinationDistance: 300,
  quota: 20,
  initialFuel: 100,
  tickMs: 100
};

let state = null;
function newGame() {
  state = {
    fuel: CONFIG.initialFuel,
    distance: 0,
    cargo: 40,
    shields: true,
    delivered: 0,
    running: false,
    gameOver: false,
    score: 0,
    eventLog: []
  };
  renderAll();
}

function logEvent(s) {
  state.eventLog.unshift(s);
  if (state.eventLog.length > 10) state.eventLog.pop();
  renderEventLog();
}

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

function renderAll() {
  document.getElementById('fuelText').innerText = `${state.fuel.toFixed(1)}`;
  document.getElementById('distanceText').innerText = `${Math.floor(state.distance)} / ${CONFIG.destinationDistance}`;
  document.getElementById('deliveredText').innerText = `${state.delivered}u`;
  document.getElementById('weightText').innerText = `${state.cargo + (state.shields ? 10 : 0)} u`;
  document.getElementById('speedText').innerText = state.shields ? "100%" : "120%";
  document.getElementById('quotaText').innerText = `${CONFIG.quota}u`;
  renderCargoList();
  renderPartsList();
  renderCanvas();
}

function renderCargoList() {
  const ul = document.getElementById('cargoList');
  ul.innerHTML = '';
  const li = document.createElement('li');
  li.className = 'item';
  li.innerHTML = `<div><strong>Cargo</strong> <span style="color:var(--muted)">(${state.cargo}u)</span></div>`;
  const btn = document.createElement('button');
  btn.innerText = 'Jettison 10u';
  btn.onclick = ()=>{ jettisonCargo(); };
  btn.disabled = state.cargo < 10 || state.running || state.gameOver;
  li.appendChild(btn);
  ul.appendChild(li);
}

function renderPartsList() {
  const ul = document.getElementById('partsList');
  ul.innerHTML = '';
  const li = document.createElement('li');
  li.className = 'item';
  li.innerHTML = `<div>Shields <span style="color:var(--muted)">(10u)</span></div>`;
  const btn = document.createElement('button');
  btn.innerText = state.shields ? 'Jettison' : 'Jettisoned';
  btn.onclick = ()=>{ jettisonShields(); };
  btn.disabled = !state.shields || state.running || state.gameOver;
  li.appendChild(btn);
  ul.appendChild(li);
}

function renderEventLog() {
  document.getElementById('eventLog').innerHTML = state.eventLog.map(l=>`<div>${l}</div>`).join('');
}

function jettisonCargo() {
  if (state.cargo >= 10) {
    state.cargo -= 10;
    logEvent('Jettisoned 10u cargo.');
    renderAll();
  }
}

function jettisonShields() {
  if (state.shields) {
    state.shields = false;
    logEvent('Shields jettisoned! Fuel efficiency up, but less protection.');
    renderAll();
  }
}

let tickInterval = null;
function startRun() {
  if (state.running || state.gameOver) return;
  state.running = true;
  logEvent("Launch: traveling...");
  tickInterval = setInterval(gameTick, CONFIG.tickMs);
}

function stopRun() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
  state.running = false;
}

function gameTick() {
  // Fuel burn: more if shields gone
  const burn = state.shields ? 1 : 0.8;
  state.fuel = Math.max(0, state.fuel - burn);

  // Distance: faster if shields gone
  state.distance += state.shields ? 2 : 2.5;

  // Random asteroid event (30% chance per tick)
  if (Math.random() < 0.3) {
    if (state.shields) {
      logEvent("Asteroids: shields absorbed impact.");
    } else {
      state.fuel = Math.max(0, state.fuel - 4);
      logEvent("Asteroids: no shields! -4 fuel.");
    }
  }

  // Check for end
  if (state.fuel <= 0) {
    state.fuel = 0;
    endGame(false, "Out of fuel!");
    return;
  }
  if (state.distance >= CONFIG.destinationDistance) {
    stopRun();
    state.delivered = state.cargo;
    const win = state.delivered >= CONFIG.quota;
    endGame(win, win ? "Arrived! Quota met." : "Arrived, but not enough cargo.");
    return;
  }
  renderAll();
}

function endGame(success, reason) {
  stopRun();
  state.gameOver = true;
  state.score = Math.max(0, Math.round(state.fuel + state.delivered*2));
  logEvent(`${reason} ${success ? 'SUCCESS' : 'FAILURE'} — Score: ${state.score}`);
  renderAll();
}

document.getElementById('startBtn').onclick = ()=> startRun();
document.getElementById('resetBtn').onclick = ()=> resetGame();
document.getElementById('jettisonAllCargoBtn').onclick = ()=> { state.cargo = 0; logEvent("All cargo jettisoned!"); renderAll(); };

function resetGame() {
  stopRun();
  newGame();
  state.gameOver = false;
  state.eventLog = [];
  logEvent("Game ready.");
}
newGame();
logEvent("Game initialized.");

// --- Canvas visuals (very simple) ---
function renderCanvas() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // Star background
  ctx.save();
  ctx.fillStyle = '#021018';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for (let i=0;i<40;i++){
    ctx.fillStyle = `rgba(200,220,255,${Math.random()*0.6})`;
    ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 1.5, 1.5);
  }
  ctx.restore();
  // Planet
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas.width-80,canvas.height/2,40,0,Math.PI*2);
  ctx.fillStyle = '#7ad0ff';
  ctx.fill();
  ctx.restore();
  // Ship
  ctx.save();
  ctx.translate(120,canvas.height/2);
  ctx.fillStyle = '#dff1ff';
  ctx.beginPath();
  ctx.moveTo(-20, -8); ctx.lineTo(22,0); ctx.lineTo(-20,8); ctx.closePath();
  ctx.fill();
  if (state.shields) {
    ctx.strokeStyle = 'rgba(120,200,255,0.25)';
    ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0,0,32,14,0,0,Math.PI*2); ctx.stroke();
  }
  ctx.restore();
  // Fuel bar
  ctx.save();
  ctx.fillStyle = '#6c5ce7';
  ctx.fillRect(20, canvas.height-34, 200*(state.fuel/CONFIG.initialFuel), 10);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(20, canvas.height-34, 200, 10);
  ctx.restore();
  // Distance bar
  ctx.save();
  ctx.fillStyle = '#5ac8a0';
  ctx.fillRect(20, canvas.height-18, 200*(state.distance/CONFIG.destinationDistance), 8);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(20, canvas.height-18, 200, 8);
  ctx.restore();
}

