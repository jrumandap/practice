

const defaultQuestions = [
    { id: "default-1", question: "What was your first impression of me?", type: "built-in" },
    { id: "default-2", question: "What is your favorite memory from childhood?", type: "built-in" },
    { id: "default-3", question: "What is something that makes you happy?", type: "built-in" },
    { id: "default-4", question: "What is the most embarrassing thing that happened to you?", type: "built-in" },
    { id: "default-5", question: "What is one thing people usually misunderstand about you?", type: "built-in" },
    { id: "default-6", question: "What is your favorite way to spend a free day?", type: "built-in" },
    { id: "default-7", question: "What is one thing you want to achieve in life?", type: "built-in" },
    { id: "default-8", question: "If you could travel anywhere right now, where would you go?", type: "built-in" },
    { id: "default-9", question: "What qualities do you value most in a person?", type: "built-in" },
    { id: "default-10", question: "What is the weirdest thing you have ever done?", type: "built-in" },
    { id: "default-11", question: "What is something you have always wanted to try?", type: "built-in" },
    { id: "default-12", question: "What is your biggest fear?", type: "built-in" },
    { id: "default-13", question: "What song can you listen to over and over again?", type: "built-in" },
    { id: "default-14", question: "What makes you feel appreciated?", type: "built-in" },
    { id: "default-15", question: "If you could have one superpower, what would it be?", type: "built-in" },
    { id: "default-16", question: "What is your favorite food?", type: "built-in" },
    { id: "default-17", question: "Are you a morning person or a night person?", type: "built-in" },
    { id: "default-18", question: "What is your biggest dream?", type: "built-in" },
    { id: "default-19", question: "What is your favorite movie or series?", type: "built-in" },
    { id: "default-20", question: "What is one thing people should know about you?", type: "built-in" }
];


function loadCustomQuestions() {
    try {
        const saved = JSON.parse(localStorage.getItem("qr_custom_questions"));

        if (!Array.isArray(saved)) return [];

        return saved
            .filter(item => item && typeof item.question === "string")
            .map(item => ({
                id: String(item.id),
                question: item.question,
                type: "custom"
            }));
    } catch {
        return [];
    }
}

function loadHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem("qr_history"));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

let customQuestions = loadCustomQuestions();
let questions = [...defaultQuestions, ...customQuestions];
let history = loadHistory();
let players = ["", ""];
let soundEnabled = localStorage.getItem("qr_sound") !== "false";
let usedQuestions = [];
let currentQuestion = null;
let currentPlayer = null;
let currentRound = 1;
let isSpinning = false;
let isSelectingPlayer = false;
let spinTimeout = null;
let audioContext = null;

const resultModal = new bootstrap.Modal(
    document.getElementById("resultModal")
);

const screens = [
    "homeScreen",
    "setupScreen",
    "gameScreen",
    "questionsScreen",
    "historyScreen"
];

function saveData() {
    localStorage.setItem("qr_custom_questions", JSON.stringify(customQuestions));
    localStorage.setItem("qr_history", JSON.stringify(history));
    localStorage.setItem("qr_sound", soundEnabled);
}

function showScreen(screenId) {
    if (isSpinning || isSelectingPlayer) return;

    screens.forEach(id => {
        document.getElementById(id).classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");

    if (screenId === "questionsScreen") renderQuestions();
    if (screenId === "historyScreen") renderHistory();
}

function playSound(frequency = 500, duration = 100) {
    if (!soundEnabled) return;

    try {
        audioContext = audioContext || new AudioContext();

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0.08, audioContext.currentTime);

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration / 1000
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
        console.error(error);
    }
}

function updateSoundButton() {
    document.getElementById("soundToggle").innerHTML = soundEnabled
        ? '<i class="bi bi-volume-up-fill"></i>'
        : '<i class="bi bi-volume-mute-fill"></i>';
}

document.getElementById("soundToggle").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    saveData();
    updateSoundButton();
    playSound(600, 100);
});

document.getElementById("playButton").addEventListener("click", () => {
    document.getElementById("playerOne").value = "";
    document.getElementById("playerTwo").value = "";
    document.getElementById("setupError").textContent = "";

    showScreen("setupScreen");
});

document.getElementById("startGameButton").addEventListener("click", () => {
    const playerOne = document.getElementById("playerOne").value.trim();
    const playerTwo = document.getElementById("playerTwo").value.trim();
    const error = document.getElementById("setupError");

    if (!playerOne || !playerTwo) {
        error.textContent = "Please enter both player names.";
        return;
    }

    if (playerOne.toLowerCase() === playerTwo.toLowerCase()) {
        error.textContent = "Please enter two different names.";
        return;
    }

    if (questions.length === 0) {
        error.textContent = "No questions available.";
        return;
    }

    players = [playerOne, playerTwo];
    currentRound = 1;
    usedQuestions = [];
    currentQuestion = null;
    currentPlayer = null;

    updateGameDisplay();
    resetGameRound();
    showScreen("gameScreen");

    playSound(600, 150);
});

function updateGameDisplay() {
    document.getElementById("playerOneDisplay").textContent = players[0];
    document.getElementById("playerTwoDisplay").textContent = players[1];
    document.getElementById("roundLabel").textContent = `ROUND ${currentRound}`;
}

function resetGameRound() {
    currentQuestion = null;
    currentPlayer = null;

    document.getElementById("wheelText").textContent = "READY?";
    document.getElementById("questionHint").textContent =
        "Spin to get a random question.";

    document.getElementById("selectedPlayer").innerHTML =
        '<i class="bi bi-stars me-2"></i>Waiting for selection';

    const wheel = document.getElementById("questionWheel");

    wheel.style.transition = "none";
    wheel.style.transform = "rotate(0deg)";

    document.getElementById("spinQuestionButton").disabled = false;
    document.getElementById("spinQuestionButton").innerHTML =
        '<i class="bi bi-arrow-repeat me-2"></i>SPIN QUESTION';

    document.getElementById("spinPlayerButton").disabled = true;
    document.getElementById("spinPlayerButton").innerHTML =
        '<i class="bi bi-shuffle me-2"></i>PICK A PLAYER';

    document.getElementById("playerOneBox").classList.remove("active-player");
    document.getElementById("playerTwoBox").classList.remove("active-player");

    updateGameDisplay();
}

function spinQuestion() {
    if (isSpinning || isSelectingPlayer || currentQuestion) return;

    questions = [...defaultQuestions, ...customQuestions];

    if (usedQuestions.length >= questions.length) {
        usedQuestions = [];
        document.getElementById("questionHint").textContent =
            "All questions have been used. Starting a new cycle!";
    }

    const availableQuestions = questions.filter(
        question => !usedQuestions.includes(question.id)
    );

    if (availableQuestions.length === 0) {
        usedQuestions = [];
        return spinQuestion();
    }

    currentQuestion = availableQuestions[
        Math.floor(Math.random() * availableQuestions.length)
    ];

    usedQuestions.push(currentQuestion.id);
    isSpinning = true;

    const wheel = document.getElementById("questionWheel");
    const wheelText = document.getElementById("wheelText");
    const spinButton = document.getElementById("spinQuestionButton");

    spinButton.disabled = true;
    spinButton.innerHTML =
        '<i class="bi bi-hourglass-split me-2"></i>SPINNING...';

    document.getElementById("spinPlayerButton").disabled = true;

    let count = 0;
    let delay = 100;
    let rotation = 0;

    function animateQuestion() {
        const randomQuestion = questions[
            Math.floor(Math.random() * questions.length)
        ];

        wheelText.textContent = randomQuestion.question;

        rotation += 360 + Math.floor(Math.random() * 360);
        wheel.style.transform = `rotate(${rotation}deg)`;

        playSound(400 + count * 20, 60);

        count++;

        if (count < 20) {
            delay += 15;
            spinTimeout = setTimeout(animateQuestion, delay);
        } else {
            finishQuestionSpin();
        }
    }

    function finishQuestionSpin() {
        wheelText.textContent = currentQuestion.question;

        isSpinning = false;

        document.getElementById("questionHint").textContent =
            "Question selected! Now pick a player.";

        spinButton.disabled = true;
        spinButton.innerHTML =
            '<i class="bi bi-check-circle me-2"></i>QUESTION READY';

        document.getElementById("spinPlayerButton").disabled = false;

        document.getElementById("selectedPlayer").innerHTML =
            '<i class="bi bi-stars me-2"></i>Now select a player!';

        playSound(850, 250);
    }

    animateQuestion();
}

document.getElementById("spinQuestionButton").addEventListener(
    "click",
    spinQuestion
);

function selectPlayer() {
    if (isSelectingPlayer || !currentQuestion || currentPlayer !== null) return;

    isSelectingPlayer = true;

    const button = document.getElementById("spinPlayerButton");
    const selectedPlayer = document.getElementById("selectedPlayer");
    const playerOneBox = document.getElementById("playerOneBox");
    const playerTwoBox = document.getElementById("playerTwoBox");

    button.disabled = true;
    button.innerHTML =
        '<i class="bi bi-hourglass-split me-2"></i>SELECTING...';

    let count = 0;
    let delay = 80;
    let activeIndex = 0;

    function alternatePlayers() {
        playerOneBox.classList.remove("active-player");
        playerTwoBox.classList.remove("active-player");

        activeIndex = Math.random() < 0.5 ? 0 : 1;

        if (activeIndex === 0) {
            playerOneBox.classList.add("active-player");
        } else {
            playerTwoBox.classList.add("active-player");
        }

        selectedPlayer.textContent = players[activeIndex];

        playSound(450 + activeIndex * 150, 60);

        count++;

        if (count < 15) {
            delay += 20;
            spinTimeout = setTimeout(alternatePlayers, delay);
        } else {
            finishPlayerSelection(activeIndex);
        }
    }

    alternatePlayers();
}

function finishPlayerSelection(playerIndex) {
    currentPlayer = players[playerIndex];
    isSelectingPlayer = false;

    document.getElementById("playerOneBox").classList.remove("active-player");
    document.getElementById("playerTwoBox").classList.remove("active-player");

    if (playerIndex === 0) {
        document.getElementById("playerOneBox").classList.add("active-player");
    } else {
        document.getElementById("playerTwoBox").classList.add("active-player");
    }

    document.getElementById("selectedPlayer").textContent =
        `${currentPlayer} will answer!`;

    document.getElementById("spinPlayerButton").innerHTML =
        '<i class="bi bi-check-circle-fill me-2"></i>PLAYER SELECTED';

    history.unshift({
        round: currentRound,
        player: currentPlayer,
        question: currentQuestion.question,
        date: new Date().toLocaleString()
    });

    saveData();
    renderHistory();

    document.getElementById("resultModalLabel").textContent =
        `${currentPlayer} will answer!`;

    document.getElementById("modalQuestion").textContent =
        currentQuestion.question;

    playSound(900, 300);
    resultModal.show();
}

document.getElementById("spinPlayerButton").addEventListener(
    "click",
    selectPlayer
);

document.getElementById("modalNextButton").addEventListener("click", () => {
    resultModal.hide();

    currentRound++;

    resetGameRound();
    renderHistory();
});

document.getElementById("endGameButton").addEventListener("click", () => {
    if (isSpinning || isSelectingPlayer) return;

    currentRound = 1;
    usedQuestions = [];
    currentQuestion = null;
    currentPlayer = null;

    resetGameRound();
    showScreen("homeScreen");
});

function renderQuestions() {
    const list = document.getElementById("questionList");

    questions = [...defaultQuestions, ...customQuestions];

    document.getElementById("questionCount").textContent =
        `${questions.length} Questions`;

    if (questions.length === 0) {
        list.innerHTML =
            '<div class="empty-message">No questions available.</div>';
        return;
    }

    list.innerHTML = questions.map(question => `
        <div class="question-item">
            <div class="question-item-content">
                <p>${escapeHTML(question.question)}</p>
                <span class="question-type">
                    ${question.type === "built-in" ? "BUILT-IN QUESTION" : "CUSTOM QUESTION"}
                </span>
            </div>

            <button
                class="delete-question"
                onclick="deleteQuestion('${escapeHTML(question.id)}')"
                aria-label="Delete question"
                ${question.type === "built-in" ? "disabled" : ""}
                title="${question.type === "built-in" ? "Built-in questions cannot be deleted" : "Delete question"}"
            >
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `).join("");
}

function addQuestion() {
    const questionInput = document.getElementById("newQuestion");
    const error = document.getElementById("questionError");
    const questionText = questionInput.value.trim();

    if (!questionText) {
        error.textContent = "Please enter a question.";
        return;
    }

    const duplicate = questions.some(
        question => question.question.toLowerCase() === questionText.toLowerCase()
    );

    if (duplicate) {
        error.textContent = "This question already exists.";
        return;
    }

    customQuestions.push({
        id: `custom-${Date.now()}`,
        question: questionText,
        type: "custom"
    });

    questions = [...defaultQuestions, ...customQuestions];

    saveData();

    questionInput.value = "";
    error.textContent = "";

    renderQuestions();
    playSound(650, 120);
}

document.getElementById("addQuestionButton").addEventListener(
    "click",
    addQuestion
);

function deleteQuestion(id) {
    const question = questions.find(
        item => String(item.id) === String(id)
    );

    if (!question || question.type === "built-in") return;

    customQuestions = customQuestions.filter(
        item => String(item.id) !== String(id)
    );

    usedQuestions = usedQuestions.filter(
        questionId => String(questionId) !== String(id)
    );

    questions = [...defaultQuestions, ...customQuestions];

    saveData();
    renderQuestions();
}

function renderHistory() {
    const list = document.getElementById("historyList");

    document.getElementById("historyCount").textContent = history.length;

    if (history.length === 0) {
        list.innerHTML =
            '<div class="empty-message"><i class="bi bi-clock-history fs-2 d-block mb-2"></i>No game history yet.</div>';
        return;
    }

    list.innerHTML = history.map(item => `
        <div class="history-item">

            <div class="history-top">
                <span>ROUND ${escapeHTML(item.round)}</span>
                <span>${escapeHTML(item.date)}</span>
            </div>

            <p>${escapeHTML(item.question)}</p>

            <div class="history-details">
                <span>
                    <i class="bi bi-person-fill me-1"></i>${escapeHTML(item.player)}
                </span>
            </div>

        </div>
    `).join("");
}

document.getElementById("clearHistoryButton").addEventListener("click", () => {
    if (history.length === 0) return;

    if (confirm("Are you sure you want to clear all game history?")) {
        history = [];
        saveData();
        renderHistory();
    }
});

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

updateSoundButton();
renderQuestions();
renderHistory();
saveData();
