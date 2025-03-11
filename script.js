let currentQuiz = '';
let currentQuestionIndex = 0;
let score = 0;

const quizzes = {
    animals: [
        {
            question: "Which animal is known as the king of the jungle?",
            options: ["Lion", "Elephant", "Tiger", "Bear"],
            correctAnswer: "Lion"
        },
        {
            question: "What is the largest land animal?",
            options: ["Lion", "Elephant", "Rhino", "Giraffe"],
            correctAnswer: "Elephant"
        }
    ],
    math: [
        {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "4"
        },
        {
            question: "What is 5 + 7?",
            options: ["11", "12", "13", "14"],
            correctAnswer: "12"
        }
    ],
    colors: [
        {
            question: "What color is the sky on a clear day?",
            options: ["Blue", "Red", "Yellow", "Green"],
            correctAnswer: "Blue"
        },
        {
            question: "What color is a lemon?",
            options: ["Yellow", "Green", "Red", "Orange"],
            correctAnswer: "Yellow"
        }
    ]
};

function startQuiz(quizType) {
    currentQuiz = quizType;
    currentQuestionIndex = 0;
    score = 0;

    document.getElementById('quiz-type').style.display = 'none';
    document.getElementById('questions-container').style.display = 'block';

    document.getElementById('quiz-title').innerText = `${quizType.charAt(0).toUpperCase() + quizType.slice(1)} Quiz`;
    showQuestion();
}

function showQuestion() {
    const quiz = quizzes[currentQuiz];
    const questionData = quiz[currentQuestionIndex];

    document.getElementById('question-container').innerHTML = `
        <p>${questionData.question}</p>
        ${questionData.options.map((option, index) => `
            <button onclick="checkAnswer('${option}')">${option}</button>
        `).join('')}
    `;

    document.getElementById('next-button').style.display = 'none';
}

function checkAnswer(selectedOption) {
    const quiz = quizzes[currentQuiz];
    const questionData = quiz[currentQuestionIndex];

    if (selectedOption === questionData.correctAnswer) {
        score++;
    }

    // Show next button after selection
    document.getElementById('next-button').style.display = 'inline';
}

function nextQuestion() {
    currentQuestionIndex++;

    const quiz = quizzes[currentQuiz];
    if (currentQuestionIndex < quiz.length) {
        showQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    document.getElementById('questions-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';

    document.getElementById('score').innerText = `${score} out of ${quizzes[currentQuiz].length}`;
}

function restartQuiz() {
    document.getElementById('result-container').style.display = 'none';
    document.getElementById('quiz-type').style.display = 'block';
}
