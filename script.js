const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const input = document.getElementById('ans');
const timerBar = document.getElementById('timer-bar');
const gameOverScreen = document.getElementById('game-over');
const gameUI = document.getElementById('game-ui');
const retryBtn = document.getElementById('retry-btn');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let target, combo = 0, timeLeft = 100, particles = [], gameActive = true;
let highScore = localStorage.getItem('neon_strike_pb') || 0;

document.getElementById('high-score').innerText = highScore;

function generate() {
    let x = Math.floor(Math.random() * 10) + 1;
    let a = Math.floor(Math.random() * 5) + 2;
    let b = Math.floor(Math.random() * 10) + 1;
    target = x;
    document.getElementById('eqn').innerText = `${a}x + ${b} = ${a*x + b}`;
}

input.addEventListener('input', (e) => {
    if (!gameActive) return;
    if (parseInt(e.target.value) === target) {
        combo++;
        document.getElementById('combo-count').innerText = combo;
        timeLeft = Math.min(100, timeLeft + 10);
        gameUI.classList.add('shake');
        setTimeout(() => gameUI.classList.remove('shake'), 100);
        e.target.value = "";
        generate();
    }
});

retryBtn.addEventListener('click', () => {
    combo = 0; timeLeft = 100; gameActive = true;
    document.getElementById('combo-count').innerText = 0;
    gameOverScreen.style.display = 'none';
    gameUI.style.display = 'block';
    input.value = ""; input.focus();
    generate();
});

function update() {
    if (gameActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        timeLeft -= (0.2 + (combo * 0.02));
        timerBar.style.width = timeLeft + "%";
        
        if (timeLeft <= 0) {
            gameActive = false;
            if (combo > highScore) {
                highScore = combo;
                localStorage.setItem('neon_strike_pb', highScore);
                document.getElementById('high-score').innerText = highScore;
            }
            document.getElementById('final-score').innerText = combo;
            gameUI.style.display = 'none';
            gameOverScreen.style.display = 'flex';
        }
    }
    requestAnimationFrame(update);
}

generate();
update();