// Fraction word problems
const problems = [
    {
        text: "Sarah ate 1/4 of a pizza and John ate 1/3 of the same pizza. How much pizza did they eat together?",
        options: ["2/7", "7/12", "1/12", "5/12"],
        correct: 1
    },
    {
        text: "A recipe calls for 3/4 cup of sugar, but you only have 1/2 cup. How much more sugar do you need?",
        options: ["1/4 cup", "1/2 cup", "5/4 cups", "1/8 cup"],
        correct: 0
    },
    {
        text: "Tom ran 2 1/2 miles on Monday and 1 3/4 miles on Tuesday. How many miles did he run in total?",
        options: ["3 1/4 miles", "4 1/4 miles", "3 3/4 miles", "4 1/2 miles"],
        correct: 1
    },
    {
        text: "A tank is 5/6 full of water. After using 1/3 of the tank, how much water is left?",
        options: ["1/2", "1/3", "1/6", "2/3"],
        correct: 0
    },
    {
        text: "Emma has 3/5 of a chocolate bar and gives 1/4 to her friend. How much does she have left?",
        options: ["7/20", "2/9", "1/20", "7/9"],
        correct: 0
    },
    {
        text: "A piece of wood is 4 1/3 feet long. If you cut off 2 1/2 feet, how long is the remaining piece?",
        options: ["1 1/6 feet", "1 5/6 feet", "2 1/6 feet", "6 5/6 feet"],
        correct: 1
    },
    {
        text: "In a garden, 2/5 of the flowers are roses and 1/4 are tulips. What fraction of the flowers are roses or tulips?",
        options: ["3/9", "13/20", "3/20", "7/20"],
        correct: 1
    },
    {
        text: "A container holds 3 3/4 liters of juice. After pouring out 1 2/3 liters, how much juice remains?",
        options: ["2 1/12 liters", "1 1/12 liters", "2 1/4 liters", "5 1/12 liters"],
        correct: 0
    },
    {
        text: "Mike spent 1/6 of his allowance on candy and 1/3 on games. What fraction of his allowance did he spend in total?",
        options: ["1/18", "1/9", "1/2", "2/9"],
        correct: 2
    },
    {
        text: "A rope is 5 1/2 meters long. If you cut off 2 3/4 meters, how long is the remaining rope?",
        options: ["2 3/4 meters", "3 1/4 meters", "2 1/4 meters", "7 3/4 meters"],
        correct: 0
    }
];

// DOM elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const problemText = document.getElementById('problem-text');
const problemCount = document.getElementById('problem-count');
const optionsContainer = document.getElementById('options-container');
const scoreElement = document.getElementById('score');
const feedbackMessage = document.getElementById('feedback-message');
const correctSound = document.getElementById('correctSound');
const incorrectSound = document.getElementById('incorrectSound');

// Game state
let currentProblemIndex = 0;
let score = 0;
let selectedAnswer = null;

// Initialize game
function initGame() {
    currentProblemIndex = 0;
    score = 0;
    showStartScreen();
}

// Show start screen
function showStartScreen() {
    startScreen.classList.remove('hidden');
    quizScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    resetButtons();
}

// Start the activity
function startActivity() {
    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loadProblem();
}

// Load current problem
function loadProblem() {
    resetButtons();
    const current = problems[currentProblemIndex];
    problemText.textContent = current.text;
    problemCount.textContent = currentProblemIndex + 1;
    
    // Display options
    optionsContainer.innerHTML = '';
    current.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(optionBtn);
    });
}

// Reset option buttons
function resetButtons() {
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
    });
    selectedAnswer = null;
}

// Play sound safely
function playSound(audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log("Audio play prevented:", e));
}

// Handle answer selection
function selectAnswer(choiceIndex) {
    if (selectedAnswer !== null) return;
    selectedAnswer = choiceIndex;
    
    // Highlight selected button
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons[choiceIndex].classList.add('selected');
    
    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);
    
    // Check answer
    const current = problems[currentProblemIndex];
    const isCorrect = choiceIndex === current.correct;
    
    if (isCorrect) {
        score++;
        playSound(correctSound);
    } else {
        playSound(incorrectSound);
    }
    
    // Move to next problem or end activity
    setTimeout(() => {
        currentProblemIndex++;
        if (currentProblemIndex < problems.length) {
            loadProblem();
        } else {
            endActivity();
        }
    }, 1800);
}

// End the activity
function endActivity() {
    quizScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    scoreElement.textContent = score;
    
    let feedback = '';
    let feedbackClass = '';
    
    if (score >= 9) {
        feedback = "Excellent! You're a fraction problem-solving expert!";
        feedbackClass = 'excellent';
    } else if (score >= 7) {
        feedback = "Great job! You can confidently solve fraction word problems!";
        feedbackClass = 'good';
    } else if (score >= 5) {
        feedback = "Good effort! Practice more fraction word problems to improve.";
        feedbackClass = 'practice';
    } else {
        feedback = "Keep practicing! Solving fraction word problems gets easier with practice.";
        feedbackClass = 'practice';
    }
    
    feedbackMessage.textContent = feedback;
    feedbackMessage.className = `feedback ${feedbackClass}`;
}

// Event listeners
startBtn.addEventListener('click', startActivity);
restartBtn.addEventListener('click', initGame);

// Initialize the game
initGame();