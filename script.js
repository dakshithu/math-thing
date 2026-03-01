const GITHUB_TOKEN = "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"; // Be careful with this!
const REPO_OWNER = "dakshithu";
const REPO_NAME = "math-thing";
const FILE_PATH = "highscore.txt";

let worldHighScore = 0;
let fileSHA = "";

// 1. FETCH THE WORLD SCORE ON LOAD
async function fetchWorldScore() {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        fileSHA = data.sha; // Save this, we need it to update the file
        worldHighScore = parseInt(atob(data.content)); // Decode Base64 from GitHub
        document.getElementById('high-score').innerText = worldHighScore;
    } catch (err) {
        console.error("Error fetching world score:", err);
    }
}

// 2. UPDATE THE WORLD SCORE IF BEATEN
async function updateWorldScore(newScore) {
    if (newScore <= worldHighScore) return;

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const body = {
        message: `New World Record: ${newScore}`,
        content: btoa(newScore.toString()), // Encode to Base64
        sha: fileSHA
    };

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            console.log("World Record Updated!");
            worldHighScore = newScore;
        }
    } catch (err) {
        console.error("Update failed:", err);
    }
}

// INTEGRATE INTO YOUR GAME OVER LOGIC
// Inside your update() function where timeLeft <= 0:
if (timeLeft <= 0) {
    gameActive = false;
    updateWorldScore(combo); // Trigger the API check
    // ... rest of your game over code
}

fetchWorldScore(); // Run on startup
