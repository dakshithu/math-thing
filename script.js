const GITHUB_TOKEN = "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"; // Be careful with this!
const REPO_OWNER = "dakshithu";
const REPO_NAME = "math-thing";
const REPO = `${REPO_OWNER}/${REPO_NAME}`;
const input = document.getElementById('ans');
const eqnDisplay = document.getElementById('eqn');
// --- GITHUB CONFIG ---; 
const FILE = "highscore.txt";
// ---------------------
const timerBar = document.getElementById('timer-bar');

let target, combo = 0, timeLeft = 100, gameActive = false;
let worldRecord = 0, fileSHA = "";

// Sync with GitHub on Boot
async function syncGlobalScore() {
    try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`);
        const data = await res.json();
        fileSHA = data.sha;
        worldRecord = parseInt(atob(data.content)) || 0;
        document.getElementById('high-score').innerText = worldRecord;
        startSystem();
    } catch (e) {
        document.getElementById('high-score').innerText = "ERROR";
        startSystem(); 
    }
}

// Push New Record to GitHub
async function updateWorldRecord(score) {
    if (score <= worldRecord) return;
    
    await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
        method: "PUT",
        headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            message: "NEW_GLOBAL_RECORD",
            content: btoa(score.toString()),
            sha: fileSHA
        })
    });
}

function generateMath() {
    // 7th Grade Core: 2-step algebraic equations
    // Form: ax + b = c
    let x = Math.floor(Math.random() * 12) + 1;
    let a = Math.floor(Math.random() * 5) + 2;
    let b = Math.floor(Math.random() * 10) + 1;
    target = x;
    eqnDisplay.innerText = `${a}x + ${b} = ${a*x + b}`;
}

input.addEventListener('input', (e) => {
    if (!gameActive) return;
    if (parseInt(e.target.value) === target) {
        combo++;
        document.getElementById('combo-count').innerText = combo;
        timeLeft = Math.min(100, timeLeft + 10);
        
        document.getElementById('game-ui').classList.add('shake');
        setTimeout(() => document.getElementById('game-ui').classList.remove('shake'), 100);
        
        e.target.value = "";
        generateMath();
    }
});

function startSystem() {
    gameActive = true;
    generateMath();
    updateLoop();
}

function updateLoop() {
    if (gameActive) {
        timeLeft -= (0.2 + (combo * 0.015));
        timerBar.style.width = timeLeft + "%";
        
        if (timeLeft <= 0) {
            gameActive = false;
            document.getElementById('final-score').innerText = combo;
            document.getElementById('game-over').style.display = "flex";
            updateWorldRecord(combo);
        }
    }
    requestAnimationFrame(updateLoop);
}

// Initial Boot Sequence (Show '---' for 1.5s)
setTimeout(syncGlobalScore, 1500);

