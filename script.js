const ENCODED_TOKEN = "Z2hwX3ROOUozcnhvUEtiWUtocGFsd1BvR3VKQ21seDhYNjJ6cjBMVAo="; // Base64 encoded for minimal obfuscation
const GITHUB_TOKEN = atob(ENCODED_TOKEN); // Be careful with this!
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


async function updateWorldRecord(score) {
    if (score <= worldRecord) {
        console.log("Score not high enough to beat World Record.");
        return;
    }

    console.log("New Record detected! Syncing with GitHub...");

    try {
        // 1. MUST GET THE LATEST SHA EVERY TIME BEFORE PUTTING
        const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
            headers: { "Authorization": `token ${GITHUB_TOKEN}` }
        });
        const getData = await getRes.json();
        const currentSHA = getData.sha; 

        // 2. NOW SEND THE UPDATE WITH THE FRESH SHA
        const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
            method: "PUT",
            headers: { 
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                message: `🏆 NEW WORLD RECORD: ${score}`,
                content: btoa(score.toString()), // Content MUST be Base64
                sha: currentSHA // The "Key" that allows the edit
            })
        });

        if (putRes.ok) {
            console.log("✅ GLOBAL RECORD UPDATED ON GITHUB!");
            worldRecord = score;
            document.getElementById('high-score').innerText = score;
        } else {
            const error = await putRes.json();
            console.error("❌ UPDATE FAILED:", error.message);
        }
    } catch (err) {
        console.error("❌ CONNECTION ERROR:", err);
    }
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
