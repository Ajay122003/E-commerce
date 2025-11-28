// ---------- DOM refs ----------
const teamANameEl = document.getElementById("teamAName");
const teamBNameEl = document.getElementById("teamBName");
const scoreAEl = document.getElementById("scoreA");
const scoreBEl = document.getElementById("scoreB");
const matchTimeEl = document.getElementById("matchTime");
const raidTimeEl = document.getElementById("raidTime");
const historyListEl = document.getElementById("historyList");
const playersACountEl = document.getElementById("playersACount");
const playersBCountEl = document.getElementById("playersBCount");
const themeSelect = document.getElementById("themeSelect");
const matchTimeInput = document.getElementById("matchTimeInput");
const setMatchTimeBtn = document.getElementById("setMatchTime");

// popup & summary
const matchSummaryBox = document.getElementById("matchSummary");
const summaryTextEl = document.getElementById("summaryText");
const matchOverOverlay = document.getElementById("matchOverOverlay");
const matchOverWinnerEl = document.getElementById("matchOverWinner");
const closeMatchOverBtn = document.getElementById("closeMatchOver");

const undoBtn = document.getElementById("undoBtn");
const saveMatchBtn = document.getElementById("saveMatchBtn");
const loadMatchBtn = document.getElementById("loadMatchBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

// timeout buttons
const timeoutA = document.getElementById("timeoutA");
const timeoutB = document.getElementById("timeoutB");
const timeoutOfficial = document.getElementById("timeoutOfficial");

// ---------- Utility ----------
function formatTime(sec) {
  return (
    String(Math.floor(sec / 60)).padStart(2, "0") +
    ":" +
    String(sec % 60).padStart(2, "0")
  );
}

function addHistory(text) {
  const t = matchTimeEl.textContent;
  const div = document.createElement("div");
  div.className = "history-item history-new";
  div.innerHTML = `<span>${text}</span><span>${t}</span>`;
  historyListEl.appendChild(div);
  historyListEl.scrollTop = historyListEl.scrollHeight;
  setTimeout(() => div.classList.remove("history-new"), 250);
}

// ---------- Simple sound (PKL style beeps) ----------
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
}

function playBeep(type = "score") {
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  let freq = 600;
  let duration = 0.15;

  if (type === "score") {
    freq = 900;
    duration = 0.12;
  } else if (type === "raidStart") {
    freq = 750;
    duration = 0.18;
  } else if (type === "raidOver") {
    freq = 450;
    duration = 0.25;
  } else if (type === "matchOver") {
    freq = 350;
    duration = 0.5;
  } else if (type === "allout") {
    freq = 500;
    duration = 0.4;
  }

  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  osc.start();
  setTimeout(() => {
    osc.stop();
  }, duration * 1000);
}

// ---------- THEMES ----------
themeSelect.addEventListener("change", () => {
  document.body.className = themeSelect.value;
});

// ---------- TEAM NAME CHANGE ----------
document.querySelectorAll(".team-name-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const team = btn.dataset.team;
    const labelEl = team === "A" ? teamANameEl : teamBNameEl;
    const newName = prompt("Enter Team Name:", labelEl.textContent);
    if (newName && newName.trim()) {
      labelEl.textContent = newName.trim();
      addHistory(`Team ${team} renamed to ${labelEl.textContent}`);
    }
  });
});

// ---------- PLAYER NAME EDIT (feature 8) ----------
document.querySelectorAll(".player-avatar").forEach((avatar) => {
  avatar.addEventListener("click", () => {
    const current = avatar.textContent;
    const newName = prompt("Enter Player Name:", current);
    if (newName && newName.trim()) {
      avatar.textContent = newName.trim();
      addHistory(`Player renamed to ${avatar.textContent}`);
    }
  });
});

// ---------- SCORE + PLAYERS LOGIC ----------
let scoreA = 0;
let scoreB = 0;
let playersA = 7;
let playersB = 7;
const MAX_PLAYERS = 7;

// UNDO: save simple state before changes
const stateHistory = [];
function saveState() {
  stateHistory.push({
    scoreA,
    scoreB,
    playersA,
    playersB
  });
  if (stateHistory.length > 100) stateHistory.shift();
}

function updateScore() {
  scoreAEl.textContent = scoreA;
  scoreBEl.textContent = scoreB;

  scoreAEl.classList.add("score-bounce");
  scoreBEl.classList.add("score-bounce");
  setTimeout(() => {
    scoreAEl.classList.remove("score-bounce");
    scoreBEl.classList.remove("score-bounce");
  }, 250);
}

function updatePlayersUI() {
  playersACountEl.textContent = `${playersA}/${MAX_PLAYERS}`;
  playersBCountEl.textContent = `${playersB}/${MAX_PLAYERS}`;

  document.querySelectorAll('.player-avatar[data-team="A"]').forEach((el, idx) => {
    if (idx < playersA) {
      el.classList.remove("out");
    } else {
      el.classList.add("out");
    }
  });

  document.querySelectorAll('.player-avatar[data-team="B"]').forEach((el, idx) => {
    if (idx < playersB) {
      el.classList.remove("out");
    } else {
      el.classList.add("out");
    }
  });
}

function pulsePlayers(team) {
  const selector = `.players-row[data-team="${team}"] .player-avatar`;
  document.querySelectorAll(selector).forEach((el) => {
    el.classList.add("player-change");
    setTimeout(() => el.classList.remove("player-change"), 250);
  });
}

function getTeamName(team) {
  return team === "A"
    ? (teamANameEl.textContent || "Team A")
    : (teamBNameEl.textContent || "Team B");
}

function checkAllOut(outTeam, oppTeam) {
  const outCount = outTeam === "A" ? playersA : playersB;
  if (outCount === 0) {
    const oppName = getTeamName(oppTeam);
    if (oppTeam === "A") scoreA += 2;
    else scoreB += 2;

    playersA = MAX_PLAYERS;
    playersB = MAX_PLAYERS;
    updateScore();
    updatePlayersUI();
    addHistory(`${oppName} ALL OUT! (+2)`);
    playBeep("allout");
  }
}

function handleRaidFail(team) {
  saveState();
  const raiderName = getTeamName(team);
  const opponent = team === "A" ? "B" : "A";
  const oppName = getTeamName(opponent);

  if (team === "A") playersA = Math.max(0, playersA - 1);
  else playersB = Math.max(0, playersB - 1);

  if (opponent === "A") scoreA += 1;
  else scoreB += 1;

  updateScore();
  updatePlayersUI();
  pulsePlayers(team);
  addHistory(`${raiderName} raid FAIL (+1 to ${oppName})`);
  playBeep("score");

  checkAllOut(team, opponent);
}

function handleScore(team, points) {
  saveState();
  const name = getTeamName(team);

  if (team === "A") scoreA += points;
  else scoreB += points;

  for (let i = 0; i < points; i++) {
    if (team === "A") playersA = Math.min(MAX_PLAYERS, playersA + 1);
    else playersB = Math.min(MAX_PLAYERS, playersB + 1);
  }

  updateScore();
  updatePlayersUI();
  pulsePlayers(team);
  addHistory(`${name} scored +${points}`);
  playBeep("score");
}

function handleDefense(team) {
  saveState();
  const name = getTeamName(team);
  const opponent = team === "A" ? "B" : "A";

  if (team === "A") scoreA += 1;
  else scoreB += 1;

  if (opponent === "A") playersA = Math.max(0, playersA - 1);
  else playersB = Math.max(0, playersB - 1);

  if (team === "A") playersA = Math.min(MAX_PLAYERS, playersA + 1);
  else playersB = Math.min(MAX_PLAYERS, playersB + 1);

  updateScore();
  updatePlayersUI();
  pulsePlayers(team);
  addHistory(`${name} DEFENSE success (+1, opponent -1)`);
  playBeep("score");

  checkAllOut(opponent, team);
}

function handleManualAllOut(team) {
  saveState();
  const name = getTeamName(team);

  if (team === "A") scoreA += 2;
  else scoreB += 2;

  playersA = MAX_PLAYERS;
  playersB = MAX_PLAYERS;
  updateScore();
  updatePlayersUI();
  pulsePlayers("A");
  pulsePlayers("B");
  addHistory(`${name} ALL OUT declared (+2, both teams reset)`);
  playBeep("allout");
}

// Attach score buttons
document.querySelectorAll(".score-buttons .btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const team = btn.dataset.team;
    const points = btn.dataset.points;
    const action = btn.dataset.action || null;

    btn.classList.add("btn-pressed");
    setTimeout(() => btn.classList.remove("btn-pressed"), 120);

    if (action === "defense") {
      handleDefense(team);
      return;
    }

    if (action === "allout") {
      handleManualAllOut(team);
      return;
    }

    if (!isNaN(points)) {
      const p = Number(points);
      if (p === 0) {
        handleRaidFail(team);
      } else {
        handleScore(team, p);
      }
    }
  });
});

updateScore();
updatePlayersUI();

// ---------- UNDO (feature 7) ----------
undoBtn.addEventListener("click", () => {
  if (!stateHistory.length) {
    alert("Nothing to undo");
    return;
  }
  const last = stateHistory.pop();
  scoreA = last.scoreA;
  scoreB = last.scoreB;
  playersA = last.playersA;
  playersB = last.playersB;
  updateScore();
  updatePlayersUI();
  addHistory("Undo last action");
});

// ---------- MATCH TIMER with FH+SH ----------
let matchSec = 20 * 60;
let matchRun = false;
let matchInterval;
let currentHalf = 1;          // 1 = first half, 2 = second half
let halfDurationSec = 20 * 60;

const periodBtn = document.getElementById("periodBtn");

function updateMatchTimer() {
  matchTimeEl.textContent = formatTime(matchSec);
}

function resetDangerBlink() {
  matchTimeEl.classList.remove("danger-time");
}

document.getElementById("matchStartStop").onclick = () => {
  if (matchRun) {
    clearInterval(matchInterval);
    matchRun = false;
    addHistory("Match paused");
  } else {
    matchRun = true;
    addHistory(currentHalf === 1 ? "First half started" : "Second half started");

    matchInterval = setInterval(() => {
      if (matchSec > 0) {
        matchSec--;
        updateMatchTimer();

        if (matchSec <= 10 && matchSec > 0) {
          matchTimeEl.classList.add("danger-time"); // feature 1
        } else {
          resetDangerBlink();
        }
      } else {
        clearInterval(matchInterval);
        matchRun = false;
        resetDangerBlink();

        if (currentHalf === 1) {
          addHistory("First Half Over");
          playBeep("matchOver");
          currentHalf = 2;
          matchSec = halfDurationSec;
          updateMatchTimer();
          periodBtn.textContent = "2nd Half";
          alert("First Half Over. Set teams and press Start for Second Half.");
        } else {
          addHistory("Match Time Over");
          playBeep("matchOver");
          showMatchSummary(); // ONLY after second half
        }
      }
    }, 1000);
  }
};

document.getElementById("matchReset").onclick = () => {
  clearInterval(matchInterval);
  matchRun = false;
  currentHalf = 1;
  halfDurationSec = 20 * 60;
  matchSec = halfDurationSec;
  periodBtn.textContent = "1st Half";
  resetDangerBlink();
  updateMatchTimer();
  addHistory("Match reset (back to 1st Half)");
};

// Match time input (Set button) — per half
setMatchTimeBtn.addEventListener("click", () => {
  let mins = Number(matchTimeInput.value);
  if (!mins || mins <= 0) {
    alert("Enter valid minutes (e.g. 5, 10, 20)");
    return;
  }
  clearInterval(matchInterval);
  matchRun = false;
  halfDurationSec = mins * 60;
  currentHalf = 1;
  matchSec = halfDurationSec;
  updateMatchTimer();
  periodBtn.textContent = "1st Half";
  resetDangerBlink();
  addHistory(`Half duration set to ${mins} minutes`);
  playBeep("score");
});

// Tap match time → start/stop
matchTimeEl.onclick = () => {
  document.getElementById("matchStartStop").click();
};

// Double click match time → change via prompt
matchTimeEl.ondblclick = () => {
  let mins = prompt("Enter Half Minutes:", String(halfDurationSec / 60));
  if (mins && !isNaN(mins) && Number(mins) > 0) {
    clearInterval(matchInterval);
    matchRun = false;
    halfDurationSec = Number(mins) * 60;
    currentHalf = 1;
    matchSec = halfDurationSec;
    periodBtn.textContent = "1st Half";
    resetDangerBlink();
    updateMatchTimer();
    addHistory(`Half duration set to ${mins} mins (via double-click)`);
  }
};

updateMatchTimer();

// Period toggle (manual, but now controlled mostly by code)
let period = 1;
periodBtn.addEventListener("click", () => {
  // manual toggle only informational
  period = period === 1 ? 2 : 1;
  periodBtn.textContent = period === 1 ? "1st Half" : "2nd Half";
  addHistory(`Period indicator set to ${periodBtn.textContent}`);
});

// ---------- RAID TIMER ----------
let raidSec = 30;
let raidRun = false;
let raidInterval;

function updateRaidTimer() {
  raidTimeEl.textContent = "00:" + String(raidSec).padStart(2, "0");
}

document.getElementById("raidStart").onclick = () => {
  if (raidRun) {
    raidRun = false;
    clearInterval(raidInterval);
    addHistory("Raid paused");
  } else {
    raidRun = true;
    if (raidSec === 0) raidSec = 30;
    addHistory("Raid started");
    playBeep("raidStart");

    raidInterval = setInterval(() => {
      if (raidSec > 0) {
        raidSec--;
        updateRaidTimer();
      } else {
        clearInterval(raidInterval);
        raidRun = false;
        addHistory("Raid time over");
        playBeep("raidOver");
      }
    }, 1000);
  }
};

document.getElementById("raidReset").onclick = () => {
  raidSec = 30;
  raidRun = false;
  clearInterval(raidInterval);
  updateRaidTimer();
  addHistory("Raid reset");
};

updateRaidTimer();

// ---------- TIMEOUT BUTTONS (feature 9) ----------
function handleTimeout(type) {
  if (matchRun) {
    clearInterval(matchInterval);
    matchRun = false;
  }
  let label;
  if (type === "A") label = `${getTeamName("A")} Timeout`;
  else if (type === "B") label = `${getTeamName("B")} Timeout`;
  else label = "Official Timeout";

  addHistory(label);
  alert(label);
  playBeep("raidOver");
}

timeoutA.addEventListener("click", () => handleTimeout("A"));
timeoutB.addEventListener("click", () => handleTimeout("B"));
timeoutOfficial.addEventListener("click", () => handleTimeout("O"));

// ---------- CLEAR HISTORY ----------
document.getElementById("historyClear").onclick = () => {
  historyListEl.innerHTML = "";
};

// ---------- MATCH SUMMARY + POPUP + CONFETTI (features 2 & 3 & 6) ----------
function showMatchSummary() {
  const teamA = teamANameEl.textContent;
  const teamB = teamBNameEl.textContent;
  const finalA = scoreA;
  const finalB = scoreB;

  let winner;
  if (finalA > finalB) winner = `${teamA} Wins 🏆`;
  else if (finalB > finalA) winner = `${teamB} Wins 🏆`;
  else winner = "Match Draw 🤝";

  summaryTextEl.innerHTML = `
    <strong>${winner}</strong><br><br>
    <strong>${teamA}</strong> : ${finalA}<br>
    <strong>${teamB}</strong> : ${finalB}<br><br>
    ⏱ Full Time (2 Halves Completed)
  `;

  matchSummaryBox.classList.remove("hidden");
  matchOverWinnerEl.textContent = winner;
  matchOverOverlay.classList.remove("hidden");

  launchConfetti();
}

// Close popup
closeMatchOverBtn.addEventListener("click", () => {
  matchOverOverlay.classList.add("hidden");
});

// Simple Confetti
function launchConfetti() {
  const count = 40;
  for (let i = 0; i < count; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti-piece";
    const size = 6 + Math.random() * 6;
    conf.style.position = "fixed";
    conf.style.width = size + "px";
    conf.style.height = size * 2 + "px";
    conf.style.background = ["#f97316","#22c55e","#3b82f6","#eab308"][Math.floor(Math.random()*4)];
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.top = "-20px";
    conf.style.opacity = "0.9";
    conf.style.transform = `rotate(${Math.random()*360}deg)`;
    conf.style.zIndex = 60;

    const fallDuration = 2000 + Math.random() * 2000;
    const translateY = window.innerHeight + 100;
    conf.animate(
      [
        { transform: conf.style.transform, top: "-20px" },
        { transform: `rotate(${Math.random()*360}deg)`, top: translateY + "px" }
      ],
      {
        duration: fallDuration,
        easing: "linear",
        iterations: 1
      }
    );

    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), fallDuration + 100);
  }
}

// ---------- SAVE / LOAD MATCH (feature 11) ----------
saveMatchBtn.addEventListener("click", () => {
  const data = {
    teamA: teamANameEl.textContent,
    teamB: teamBNameEl.textContent,
    scoreA,
    scoreB,
    playersA,
    playersB,
    history: Array.from(historyListEl.querySelectorAll(".history-item")).map(
      (item) => item.innerText
    ),
    savedAt: new Date().toISOString()
  };
  localStorage.setItem("kabaddiLastMatch", JSON.stringify(data));
  addHistory("Match saved to browser");
  alert("Match saved. You can load it later.");
});

loadMatchBtn.addEventListener("click", () => {
  const raw = localStorage.getItem("kabaddiLastMatch");
  if (!raw) {
    alert("No saved match found.");
    return;
  }
  const data = JSON.parse(raw);
  teamANameEl.textContent = data.teamA;
  teamBNameEl.textContent = data.teamB;
  scoreA = data.scoreA;
  scoreB = data.scoreB;
  playersA = data.playersA;
  playersB = data.playersB;
  updateScore();
  updatePlayersUI();
  historyListEl.innerHTML = "";
  data.history.forEach((line) => {
    const div = document.createElement("div");
    div.className = "history-item";
    const parts = line.split("\t");
    if (parts.length === 2) {
      div.innerHTML = `<span>${parts[0]}</span><span>${parts[1]}</span>`;
    } else {
      div.textContent = line;
    }
    historyListEl.appendChild(div);
  });
  addHistory("Saved match loaded");
  alert("Saved match loaded.");
});

// ---------- PDF DOWNLOAD (feature 6 - using browser print) ----------
downloadPdfBtn.addEventListener("click", () => {
  const teamA = teamANameEl.textContent;
  const teamB = teamBNameEl.textContent;
  const finalA = scoreA;
  const finalB = scoreB;

  let winner;
  if (finalA > finalB) winner = `${teamA} Wins 🏆`;
  else if (finalB > finalA) winner = `${teamB} Wins 🏆`;
  else winner = "Match Draw 🤝";

  const w = window.open("", "_blank");
  if (!w) return;

  w.document.write(`
    <html>
      <head>
        <title>Kabaddi Match Summary</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          .summary { margin-top: 20px; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>Kabaddi Match Summary</h1>
        <div class="summary">
          <p><strong>${winner}</strong></p>
          <p><strong>${teamA}</strong> : ${finalA}</p>
          <p><strong>${teamB}</strong> : ${finalB}</p>
          <p>Full Time (2 Halves Completed)</p>
        </div>
      </body>
    </html>
  `);
  w.document.close();
  w.focus();
  w.print();   // user can "Save as PDF"
});

