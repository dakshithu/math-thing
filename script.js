const GITHUB_TOKEN = "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"; // Be careful with this!
const REPO_OWNER = "dakshithu";
const REPO_NAME = "math-thing";
const REPO = `${REPO_OWNER}/${REPO_NAME}`;
const input = document.getElementById('ans');
const eqnDisplay = document.getElementById('eqn');

let target, combo = 0, timeLeft = 100, gameActive = true;
let worldRecord = 0, fileSHA = "";

// Fetch Global Score from highscore.txt via GitHub API
async function syncGlobalScore() {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/highscore.txt`);
    const data = await res.json();
    fileSHA = data.sha;
    worldRecord = parseInt(atob(data.content));
    document.getElementById('high-score').innerText = worldRecord;
}

// Update highscore.txt if beaten
async function updateGlobalScore(score) {
    if (score <= worldRecord) return;
    await fetch(`https://api.github.com/repos/${REPO}/contents/highscore.txt`, {
        method: "PUT",
        headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            message: "NEW_WORLD_RECORD",
            content: btoa(score.toString()),
            sha: fileSHA
        })
    });
}

function generateMath() {
    // 7th Grade: Integers and Two-Step Equations
    let x = Math.floor(Math.random() * 10) + 1;
    let a = Math.floor(Math.random() * 5) + 2;
    let b = Math.floor(Math.random() * 10) + 1;
    target = x;
    eqnDisplay.innerText = `${a}x + ${b} = ${a*x + b}`;
}

input.addEventListener('input', (e) => {
    if (parseInt(e.target.value) === target) {
        combo++;
        document.getElementById('combo-count').innerText = combo;
        timeLeft = Math.min(100, timeLeft + 10);
        e.target.value = "";
        generateMath();
    }
});

function resetGame() {
    location.reload(); // Simplest way to restart the API sync
}

function loop() {
    if (gameActive) {
        timeLeft -= (0.15 + (combo * 0.015));
        document.getElementById('timer-bar').style.width = timeLeft + "%";
        if (timeLeft <= 0) {
            gameActive = false;
            document.getElementById('final-score').innerText = combo;
            document.getElementById('game-over').style.display = "flex";
            updateGlobalScore(combo);
        }
    }
    requestAnimationFrame(loop);
}

// Start sequence
setTimeout(() => {
    syncGlobalScore();
    generateMath();
    loop();
}, 1000); // 1-second delay to show the '---'
