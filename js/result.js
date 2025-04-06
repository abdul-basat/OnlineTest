// Result page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get quiz results from localStorage
    const quizResults = JSON.parse(localStorage.getItem('quizResults')) || {
        score: 0,
        totalQuestions: 0,
        userAnswers: [],
        markingType: 'normal',
        elapsedTime: '0:00'
    };
    
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('quizUserData')) || {
        name: 'Candidate',
        rollNo: '12345',
        mobileNo: '0000000000',
        markingType: 'normal'
    };
    
    // Load quiz questions from localStorage
    let quizQuestions = [];
    
    try {
        const storedQuestions = localStorage.getItem('quizQuestions');
        if (storedQuestions) {
            quizQuestions = JSON.parse(storedQuestions);
        }
    } catch (error) {
        console.error('Error loading questions from localStorage:', error);
    }
    
    // Fallback to sample questions if no questions were loaded
    if (!quizQuestions || quizQuestions.length === 0) {
        quizQuestions = [
            {
                question: "What is 15 + 9?",
                options: ["24", "23", "22", "25"],
                correctAnswer: 0
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Jupiter", "Mars", "Saturn"],
                correctAnswer: 2
            },
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Madrid", "Paris"],
                correctAnswer: 3
            },
            {
                question: "Which of these is not a programming language?",
                options: ["Java", "Python", "Cobra", "Crocodile"],
                correctAnswer: 3
            },
            {
                question: "What is the largest ocean on Earth?",
                options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
                correctAnswer: 3
            }
        ];
    }
    
    // Update score display
    document.getElementById('scoreValue').textContent = Math.round(quizResults.score * 10) / 10; // Round to 1 decimal place
    document.getElementById('scoreTotal').textContent = `/${quizResults.totalQuestions}`;
    
    // Update candidate details
    document.getElementById('candidateName').textContent = userData.name;
    document.getElementById('candidateRollNo').textContent = userData.rollNo;
    document.getElementById('timeTaken').textContent = quizResults.elapsedTime;
    
    // Calculate statistics
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    
    quizResults.userAnswers.forEach((answer, index) => {
        if (answer === null) {
            skippedCount++;
        } else if (index < quizQuestions.length && answer === quizQuestions[index].correctAnswer) {
            correctCount++;
        } else {
            incorrectCount++;
        }
    });
    
    // Update statistics display
    document.getElementById('correctAnswers').textContent = correctCount;
    document.getElementById('incorrectAnswers').textContent = incorrectCount;
    document.getElementById('skippedQuestions').textContent = skippedCount;
    document.getElementById('markingType').textContent = userData.markingType === 'normal' ? 'Normal Marking' : 'Negative Marking';
    
    // Add event listeners for buttons
    document.getElementById('viewAnswersBtn').addEventListener('click', toggleAnswersSection);
    document.getElementById('newQuizBtn').addEventListener('click', startNewQuiz);
    
    // Populate answers section
    populateAnswersSection(quizQuestions, quizResults.userAnswers);
});

// Toggle answers section visibility
function toggleAnswersSection() {
    const answersSection = document.getElementById('answersSection');
    const viewAnswersBtn = document.getElementById('viewAnswersBtn');
    
    if (answersSection.style.display === 'block') {
        answersSection.style.display = 'none';
        viewAnswersBtn.textContent = 'View Answers';
    } else {
        answersSection.style.display = 'block';
        viewAnswersBtn.textContent = 'Hide Answers';
    }
}

// Start new quiz
function startNewQuiz() {
    window.location.href = 'index.html';
}

// Populate answers section with question analysis
function populateAnswersSection(questions, userAnswers) {
    const answersList = document.getElementById('answersList');
    
    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correctAnswer;
        
        // Create answer item
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        
        // Add question text
        const questionText = document.createElement('div');
        questionText.className = 'answer-question';
        questionText.textContent = `Q${index + 1}: ${question.question}`;
        answerItem.appendChild(questionText);
        
        // Add options
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'answer-options';
        
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'answer-option';
            
            // Add correct/incorrect class
            if (optionIndex === correctAnswer) {
                optionElement.classList.add('correct');
            } else if (userAnswer === optionIndex) {
                optionElement.classList.add('incorrect');
            }
            
            // Add selected indicator
            if (userAnswer === optionIndex) {
                optionElement.classList.add('selected');
                optionElement.innerHTML = `<i class="fas fa-check-circle"></i> ${option} ${optionIndex === correctAnswer ? '' : `(Correct: ${question.options[correctAnswer]})`}`;
            } else if (optionIndex === correctAnswer && userAnswer !== null) {
                optionElement.innerHTML = `<i class="fas fa-check"></i> ${option}`;
            } else {
                optionElement.textContent = option;
            }
            
            optionsContainer.appendChild(optionElement);
        });
        
        answerItem.appendChild(optionsContainer);
        
        // Add status
        const statusElement = document.createElement('div');
        statusElement.className = 'answer-status';
        
        if (userAnswer === null) {
            statusElement.classList.add('skipped');
            statusElement.innerHTML = '<i class="fas fa-minus-circle"></i> Skipped';
        } else if (userAnswer === correctAnswer) {
            statusElement.classList.add('correct');
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Correct';
        } else {
            statusElement.classList.add('incorrect');
            statusElement.innerHTML = '<i class="fas fa-times-circle"></i> Incorrect';
        }
        
        answerItem.appendChild(statusElement);
        
        // Add to answers list
        answersList.appendChild(answerItem);
    });
}
