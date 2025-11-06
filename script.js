// The entire game logic is wrapped in an IIFE to safely scope variables (like currentProblem)
// and functions, preventing them from polluting the global window object.
(function() {

    // --- Game State Variables ---
    const MAX_QUESTIONS = 20;
    let score = 0;
    let questionNumber = 0;
    let currentProblem = null; // Safely contained within this function's scope!

    // --- Mathematical Helper Functions ---

    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }

    /**
     * Simplifies an improper fraction (numerator/denominator) to a standardized string format.
     * Format: "W N/D" or "N/D" or "W" (e.g., "1 1/2", "3/4", "5")
     */
    function simplifyFraction(n, d) {
        if (n === 0) return "0";
        
        const sign = n < 0 ? "-" : "";
        n = Math.abs(n);
        d = Math.abs(d);

        if (n % d === 0) {
            return sign + (n / d).toString(); // Whole number
        }

        const commonDivisor = gcd(n, d);
        const simplifiedN = n / commonDivisor;
        const simplifiedD = d / commonDivisor;

        const whole = Math.floor(simplifiedN / simplifiedD);
        const remainder = simplifiedN % simplifiedD;

        const fractionStr = `${remainder}/${simplifiedD}`;

        if (whole > 0) {
            return `${sign}${whole} ${fractionStr}`; // Mixed number
        } else {
            return `${sign}${fractionStr}`; // Proper fraction
        }
    }

    /**
     * Converts a simplified string (e.g., "1 1/2" or "3/4" or "5") to a full HTML display string 
     * for the options buttons, including the required CSS classes.
     */
    function formatFractionDisplayHTML(simplifiedStr) {
        let cleanStr = simplifiedStr.trim();
        if (cleanStr === "0") return "0";
        
        // 1. Check for whole number
        if (!cleanStr.includes('/')) {
            return cleanStr; // Return as a simple string
        }

        // 2. Check for mixed number ("W N/D")
        const parts = cleanStr.split(' ');
        if (parts.length === 2) {
            const whole = parts[0];
            const [n, d] = parts[1].split('/');
            return `<span class="whole-number">${whole}</span> <span class="fraction-line">${n} / ${d}</span>`;
        } 
        
        // 3. Must be a proper fraction ("N/D")
        if (cleanStr.includes('/')) {
            const [n, d] = cleanStr.split('/');
            return `<span class="fraction-line">${n} / ${d}</span>`;
        } 
        
        return cleanStr;
    }


    /**
     * Performs the actual addition/subtraction and returns the simplified result string.
     */
    function calculateResult(f1, op, f2) {
        // Convert to improper fractions
        const n1 = f1.n + f1.w * f1.d;
        const n2 = f2.n + f2.w * f2.d;
        const d1 = f1.d;
        const d2 = f2.d;

        // Find LCD
        const commonD = (d1 * d2) / gcd(d1, d2);

        // Adjust numerators
        const newN1 = n1 * (commonD / d1);
        const newN2 = n2 * (commonD / d2);

        let finalN;
        if (op === '+') {
            finalN = newN1 + newN2;
        } else { // op === '-'
            finalN = newN1 - newN2;
        }

        return simplifyFraction(finalN, commonD);
    }

    // Helper to shuffle arrays
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- PROBLEM DATA ---
    const ALL_PROBLEMS = [
        ["Sarah drank 1 1/2 litres of water in the morning and 3/4 litres in the afternoon. How much water did she drink in total?", {w: 1, n: 1, d: 2}, '+', {w: 0, n: 3, d: 4}, "litres"],
        ["A builder needs 5 1/3 bags of cement for a job. If he only has 2 1/6 bags, how many more bags must he buy?", {w: 5, n: 1, d: 3}, '-', {w: 2, n: 1, d: 6}, "bags"],
        ["A ribbon is 7/8 metre long. If 1/4 metre is cut off, what length of ribbon is left?", {w: 0, n: 7, d: 8}, '-', {w: 0, n: 1, d: 4}, "metre"],
        ["A pizza recipe calls for 1/3 cup of flour and 1/6 cup of cornmeal. How much dry ingredients are needed in total?", {w: 0, n: 1, d: 3}, '+', {w: 0, n: 1, d: 6}, "cup"],
        ["A farmer sold 3 4/5 hectares of land. If he started with 5 1/2 hectares, how much land does he have left?", {w: 5, n: 1, d: 2}, '-', {w: 3, n: 4, d: 5}, "hectares"],
        ["Mark spent 1/2 hour studying math and 2/3 hour studying science. What is the total time he spent studying?", {w: 0, n: 1, d: 2}, '+', {w: 0, n: 2, d: 3}, "hour"],
        ["A tank holds 10 litres of fuel. If it is already 3 1/5 litres full, how much more fuel can be added?", {w: 10, n: 0, d: 1}, '-', {w: 3, n: 1, d: 5}, "litres"],
        ["Two pipes are joined together. One is 2 1/4 feet long and the other is 1 5/8 feet long. What is their combined length?", {w: 2, n: 1, d: 4}, '+', {w: 1, n: 5, d: 8}, "feet"],
    ];

    // --- DOM Elements ---
    const wordProblemEl = document.getElementById('word-problem-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackArea = document.getElementById('feedback-area');
    const startButton = document.getElementById('start-button');
    const nextButton = document.getElementById('next-button');
    const scoreTracker = document.getElementById('score-tracker');
    const questionCounter = document.getElementById('question-counter');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');
    const finalScoreDisplay = document.getElementById('final-score-display');
    const celebrationMessage = document.getElementById('celebration-message');


    // --- Core Game Functions ---

    function generateDistractors(correctAnswer) {
        const distractors = [];
        const uniqueIncorrectOptions = [
            "1/3", "2 1/2", "3 1/8", "1 1/12", "5/6", "1 1/6", "3 1/4", "1 1/8", "6/5", "2 1/5", "4 1/4", "7/8", "1", "3/5", "1 1/4"
        ];

        while (distractors.length < 3) {
            const randomIndex = Math.floor(Math.random() * uniqueIncorrectOptions.length);
            const distractor = uniqueIncorrectOptions[randomIndex];
            if (distractor !== correctAnswer && !distractors.includes(distractor)) {
                distractors.push(distractor);
            }
        }
        return distractors;
    }


    function endGame() {
        gameScreen.style.display = 'none';
        resultsScreen.style.display = 'block';

        finalScoreDisplay.textContent = `${score} / ${MAX_QUESTIONS}`;

        const percentage = (score / MAX_QUESTIONS) * 100;
        let message = '';
        
        if (percentage >= 90) {
            message = "👑 Masterful! You crushed the word problems and the fractions!";
        } else if (percentage >= 70) {
            message = "🌟 Excellent! You correctly interpreted and solved most problems.";
        } else if (percentage >= 50) {
            message = "👍 Good effort! Focus on setting up the equation before solving the math.";
        } else {
            message = "Keep practicing! Reviewing the language (more/less/total/left) is key.";
        }

        celebrationMessage.textContent = message;
    }

    /**
     * Loads a new word problem and renders options.
     */
    function loadNewProblem() {
        if (questionNumber >= MAX_QUESTIONS) {
            endGame();
            return;
        }
        
        questionNumber++;
        questionCounter.textContent = questionNumber;

        const problemIndex = Math.floor(Math.random() * ALL_PROBLEMS.length);
        const [text, f1, op, f2, unit] = ALL_PROBLEMS[problemIndex];
        
        const correctValueStr = calculateResult(f1, op, f2);
        
        wordProblemEl.innerHTML = text;

        const distractors = generateDistractors(correctValueStr);
        let options = [];
        
        // Add distractors 
        distractors.forEach(d => {
            options.push({ 
                value: d, 
                display: formatFractionDisplayHTML(d) + ` ${unit}`
            });
        });

        // Add correct answer
        options.push({ 
            value: correctValueStr, 
            display: formatFractionDisplayHTML(correctValueStr) + ` ${unit}`
        });

        shuffle(options);
        optionsContainer.innerHTML = '';
        
        currentProblem = {correct: correctValueStr}; 
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.innerHTML = option.display;
            button.classList.add('option-button');
            button.setAttribute('data-value', option.value); 
            button.onclick = checkAnswer;
            optionsContainer.appendChild(button);
        });

        // Reset UI
        feedbackArea.textContent = 'Analyze the problem and select the answer.';
        feedbackArea.className = 'feedback';
        nextButton.style.display = 'none';
    }

    /**
     * Checks the user's selected option.
     */
    function checkAnswer(event) {
        document.querySelectorAll('.option-button').forEach(btn => btn.onclick = null);

        const selectedValue = event.target.getAttribute('data-value');
        const correctValue = currentProblem.correct;

        if (selectedValue === correctValue) {
            feedbackArea.textContent = '🥳 Correct! Great problem analysis and math! (+1)';
            feedbackArea.className = 'feedback correct';
            event.target.style.backgroundColor = '#3cb371'; 
            score++;
            scoreTracker.textContent = score;
        } else {
            feedbackArea.textContent = `❌ Incorrect. The correct simplified answer is ${correctValue}.`;
            feedbackArea.className = 'feedback incorrect';
            event.target.style.backgroundColor = '#dc143c'; 
            
            document.querySelectorAll('.option-button').forEach(btn => {
                if (btn.getAttribute('data-value') === correctValue) {
                    btn.style.border = '4px solid #3cb371';
                }
            });
        }
        
        nextButton.style.display = 'block'; 
    }

    function startGame() {
        startButton.style.display = 'none'; // Hide Start button
        loadNewProblem();
    }

    // --- Event Listeners and Initial Load ---
    
    // Attach event listeners after all DOM elements are defined
    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', loadNewProblem);

    // Initial setup on page load
    window.onload = () => {
        optionsContainer.innerHTML = ''; 
        nextButton.style.display = 'none';
    };

})(); // End of IIFE