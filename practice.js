const roundLimit = 10;
const practiceSongs = window.songs || [];

let score = 0;
let round = 0;
let mode = null;
let currentSong = null;
let remainingSongs = [];
let isAnswerLocked = false;
let nextRoundTimer = null;

const setupPanel = document.getElementById("setupPanel");
const gameContainer = document.getElementById("gameContainer");
const finalPanel = document.getElementById("finalPanel");
const roundDisplay = document.getElementById("roundDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const modeDisplay = document.getElementById("modeDisplay");
const audioPlayer = document.getElementById("audioPlayer");
const options = document.getElementById("options");
const typedAnswerForm = document.getElementById("typedAnswerForm");
const typedAnswer = document.getElementById("typedAnswer");
const feedback = document.getElementById("feedback");
const finalMessage = document.getElementById("finalMessage");
const restartBtn = document.getElementById("restartBtn");

document.getElementById("hintModeBtn").addEventListener("click", () => startGame("hints"));
document.getElementById("noHintModeBtn").addEventListener("click", () => startGame("no-hints"));
document.getElementById("playAgainBtn").addEventListener("click", () => showSetup());
restartBtn.addEventListener("click", () => showSetup());
typedAnswerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    checkAnswer(typedAnswer.value);
});

function showSetup() {
    clearTimeout(nextRoundTimer);
    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();

    setupPanel.style.display = "block";
    gameContainer.style.display = "none";
    finalPanel.style.display = "none";
    restartBtn.style.display = "none";
    feedback.style.display = "none";
    options.innerHTML = "";
    typedAnswer.value = "";
}

function startGame(selectedMode) {
    mode = selectedMode;
    score = 0;
    round = 0;
    isAnswerLocked = false;
    remainingSongs = shuffle([...practiceSongs]);

    setupPanel.style.display = "none";
    gameContainer.style.display = "block";
    finalPanel.style.display = "none";
    restartBtn.style.display = "inline-flex";
    modeDisplay.textContent = mode === "hints" ? "Hints: 3 choices" : "No hints: type the town";
    scoreDisplay.textContent = `Score: ${score}/${roundLimit}`;

    nextRound();
}

function nextRound() {
    clearTimeout(nextRoundTimer);
    isAnswerLocked = false;
    feedback.style.display = "none";
    feedback.textContent = "";
    typedAnswer.value = "";
    options.innerHTML = "";

    if (round >= roundLimit || remainingSongs.length === 0) {
        endGame();
        return;
    }

    round += 1;
    currentSong = remainingSongs.pop();
    roundDisplay.textContent = `Round: ${round}/${roundLimit}`;

    audioPlayer.src = currentSong.file;
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(() => {
        feedback.textContent = "Press play to hear the song.";
        feedback.className = "feedback neutral";
        feedback.style.display = "block";
    });

    if (mode === "hints") {
        renderMultipleChoice();
        typedAnswerForm.style.display = "none";
    } else {
        typedAnswerForm.style.display = "flex";
    }

    setAnswerControlsDisabled(false);
}

function renderMultipleChoice() {
    const wrongAnswers = shuffle(practiceSongs.filter((song) => song.city !== currentSong.city)).slice(0, 2);
    const choices = shuffle([currentSong, ...wrongAnswers]);

    typedAnswerForm.style.display = "none";
    choices.forEach((song) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-btn";
        button.textContent = song.city;
        button.addEventListener("click", () => checkAnswer(song.city));
        options.appendChild(button);
    });
}

function checkAnswer(answer) {
    if (isAnswerLocked || !currentSong) return;

    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(currentSong.city);
    isAnswerLocked = true;
    setAnswerControlsDisabled(true);

    if (isCorrect) {
        score += 1;
        feedback.textContent = `Correct: ${currentSong.city}`;
        feedback.className = "feedback correct";
    } else {
        feedback.textContent = `Wrong. It was ${currentSong.city}.`;
        feedback.className = "feedback wrong";
    }

    feedback.style.display = "block";
    scoreDisplay.textContent = `Score: ${score}/${roundLimit}`;
    nextRoundTimer = setTimeout(nextRound, 1800);
}

function endGame() {
    audioPlayer.pause();
    gameContainer.style.display = "none";
    finalPanel.style.display = "block";
    restartBtn.style.display = "inline-flex";

    if (score === roundLimit) {
        finalMessage.textContent = "Perfect score. You got every song right.";
    } else {
        finalMessage.textContent = `You scored ${score}/${roundLimit}.`;
    }
}

function setAnswerControlsDisabled(disabled) {
    document.querySelectorAll(".option-btn").forEach((button) => {
        button.disabled = disabled;
    });
    typedAnswer.disabled = disabled;
    typedAnswerForm.querySelector("button").disabled = disabled;

    if (!disabled && mode === "no-hints") {
        typedAnswer.focus();
    }
}

function normalizeAnswer(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
}

showSetup();
