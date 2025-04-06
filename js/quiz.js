// Updated Quiz page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load quiz data from database
    let quizQuestions = [];
    
    // Try to load questions from localStorage
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
    
    // Quiz state variables
    let currentQuestionIndex = 0;
    let totalQuestions = quizQuestions.length;
    let userAnswers = new Array(totalQuestions).fill(null);
    let skippedQuestions = [];
    let lockedQuestions = new Array(totalQuestions).fill(false);
    let quizStartTime = new Date();
    let questionStartTime = new Date();
    let elapsedTimeInterval;
    let remainingTimeInterval;
    let remainingSeconds = 120; // 2 minutes per question
    let isQuizCompleted = false;
    
    // DOM elements
    const candidateName = document.getElementById('candidateName');
    const candidateRollNo = document.getElementById('candidateRollNo');
    const candidatePostName = document.getElementById('candidatePostName');
    const candidateDepartment = document.getElementById('candidateDepartment');
    const elapsedTimeElement = document.getElementById('elapsedTime');
    const remainingTimeElement = document.getElementById('remainingTime');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const questionNumber = document.getElementById('questionNumber');
    const questionText = document.getElementById('questionText');
    const options = document.querySelectorAll('input[name="answer"]');
    const optionLabels = document.querySelectorAll('.option label');
    const skipButton = document.getElementById('skipButton');
    const saveNextButton = document.getElementById('saveNextButton');
    const skippedList = document.getElementById('skippedList');
    
    // Initialize quiz
    initializeQuiz();
    
    // Initialize quiz
    function initializeQuiz() {
        // Load user data from localStorage
        const userData = JSON.parse(localStorage.getItem('quizUserData')) || {
            name: 'Candidate',
            rollNo: '12345',
            postName: 'Applicant',
            departmentName: 'General'
        };
        
        // Update candidate info in sidebar
        candidateName.textContent = userData.name;
        candidateRollNo.textContent = userData.rollNo;
        candidatePostName.textContent = userData.postName;
        candidateDepartment.textContent = userData.departmentName;
        
        // Add CSS for avatar
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/avatar.css';
        document.head.appendChild(link);
        
        // Replace img with icon in profile
        const profileImage = document.querySelector('.profile-image');
        profileImage.innerHTML = '<i class="fas fa-user"></i>';
        
        // Start timers
        startTimers();
        
        // Load first question
        loadQuestion(currentQuestionIndex);
        
        // Update progress bar
        updateProgress();
        
        // Add event listeners
        skipButton.addEventListener('click', skipQuestion);
        saveNextButton.addEventListener('click', saveAndNext);
        
        // Add event listeners for radio buttons
        options.forEach(option => {
            option.addEventListener('change', function() {
                saveNextButton.disabled = false;
            });
        });
    }
    
    // Load question
    function loadQuestion(index) {
        // Reset question timer
        resetQuestionTimer();
        
        // Get question data
        const questionData = quizQuestions[index];
        
        // Update question number
        questionNumber.textContent = `Question No ${index + 1} out of ${totalQuestions}`;
        
        // Update question text
        questionText.textContent = questionData.question;
        
        // Update options
        options.forEach((option, i) => {
            option.checked = (userAnswers[index] === i);
            option.value = i;
            option.disabled = lockedQuestions[index];
            optionLabels[i].textContent = questionData.options[i];
        });
        
        // Update button text for last question or last unattempted question
        updateButtonText();
        
        // Disable save button if no option selected
        saveNextButton.disabled = (userAnswers[index] === null);
        
        // Disable skip button if question is locked
        skipButton.disabled = lockedQuestions[index];
    }
    
    // Update button text based on current state
    function updateButtonText() {
        // Check if this is the last question
        const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
        
        // Check if this is the last unattempted question
        let isLastUnattempted = true;
        for (let i = currentQuestionIndex + 1; i < totalQuestions; i++) {
            if (userAnswers[i] === null && !lockedQuestions[i]) {
                isLastUnattempted = false;
                break;
            }
        }
        
        // Check if there are any skipped questions left
        const hasSkippedQuestions = skippedQuestions.length > 0;
        
        // Update button text
        if ((isLastQuestion || isLastUnattempted) && !hasSkippedQuestions) {
            saveNextButton.textContent = 'Save & Submit';
            saveNextButton.classList.add('btn-submit');
        } else {
            saveNextButton.textContent = 'Save & Next';
            saveNextButton.classList.remove('btn-submit');
        }
    }
    
    // Skip question
    function skipQuestion() {
        // Add to skipped questions if not already there
        if (!skippedQuestions.includes(currentQuestionIndex)) {
            skippedQuestions.push(currentQuestionIndex);
        }
        
        // Update skipped questions list
        updateSkippedQuestionsList();
        
        // Move to next question or end quiz
        moveToNextQuestion();
    }
    
    // Save and next
    function saveAndNext() {
        // Check if an option is selected
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (!selectedOption) {
            // Show warning if no option is selected
            showWarningNotification("Warning: Either Skip or Select one");
            return;
        }
        
        // Save current answer
        userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
        
        // Lock this question
        lockedQuestions[currentQuestionIndex] = true;
        
        // Remove from skipped questions if it was skipped before
        const skippedIndex = skippedQuestions.indexOf(currentQuestionIndex);
        if (skippedIndex !== -1) {
            skippedQuestions.splice(skippedIndex, 1);
            updateSkippedQuestionsList();
        }
        
        // Check if it's the last question or last unattempted question with no skipped questions
        const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
        
        // Check if this is the last unattempted question
        let isLastUnattempted = true;
        for (let i = 0; i < totalQuestions; i++) {
            if (userAnswers[i] === null && !lockedQuestions[i] && i !== currentQuestionIndex) {
                isLastUnattempted = false;
                break;
            }
        }
        
        // Check if there are any skipped questions left
        const hasSkippedQuestions = skippedQuestions.length > 0;
        
        // If last question or last unattempted with no skipped questions, end quiz
        if ((isLastQuestion || isLastUnattempted) && !hasSkippedQuestions) {
            endQuiz();
            return;
        }
        
        // Move to next question
        moveToNextQuestion();
    }
    
    // Move to next question
    function moveToNextQuestion() {
        // Find the next sequential question
        let nextIndex = currentQuestionIndex + 1;
        
        // If we're at the end, go back to the beginning to find any unattempted questions
        if (nextIndex >= totalQuestions) {
            nextIndex = 0;
        }
        
        // Find the next unattempted question that's not locked
        let foundNext = false;
        let startIndex = nextIndex;
        
        do {
            if (userAnswers[nextIndex] === null && !lockedQuestions[nextIndex]) {
                foundNext = true;
                break;
            }
            
            nextIndex = (nextIndex + 1) % totalQuestions;
        } while (nextIndex !== startIndex);
        
        // If found an unattempted question, go to it
        if (foundNext) {
            currentQuestionIndex = nextIndex;
            loadQuestion(currentQuestionIndex);
            updateProgress();
            return;
        }
        
        // If all questions are either answered or locked, end quiz
        if (skippedQuestions.length === 0) {
            endQuiz();
            return;
        }
        
        // If there are skipped questions, go to the first one
        currentQuestionIndex = skippedQuestions[0];
        loadQuestion(currentQuestionIndex);
        updateProgress();
    }
    
    // Show warning notification
    function showWarningNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('warningNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'warningNotification';
            notification.className = 'warning-notification';
            document.body.appendChild(notification);
            
            // Add styles if not already in CSS
            const style = document.createElement('style');
            style.textContent = `
                .warning-notification {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #ff9800;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 1000;
                    display: none;
                    text-align: center;
                    font-weight: 500;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set message and show notification
        notification.textContent = message;
        notification.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
    
    // Update skipped questions list
    function updateSkippedQuestionsList() {
        skippedList.innerHTML = '';
        
        if (skippedQuestions.length === 0) {
            skippedList.innerHTML = '<p>No skipped questions</p>';
            return;
        }
        
        // Sort skipped questions by question number
        skippedQuestions.sort((a, b) => a - b);
        
        skippedQuestions.forEach(index => {
            const skippedItem = document.createElement('div');
            skippedItem.className = 'skipped-item';
            skippedItem.textContent = `${index + 1}`;
            skippedItem.addEventListener('click', function() {
                currentQuestionIndex = index;
                loadQuestion(index);
                updateProgress();
            });
            skippedList.appendChild(skippedItem);
        });
    }
    
    // Start timers
    function startTimers() {
        // Elapsed time timer
        quizStartTime = new Date();
        elapsedTimeInterval = setInterval(updateElapsedTime, 1000);
        
        // Remaining time timer
        resetQuestionTimer();
    }
    
    // Update elapsed time
    function updateElapsedTime() {
        const now = new Date();
        const elapsedMs = now - quizStartTime;
        const elapsedMinutes = Math.floor(elapsedMs / 60000);
        const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);
        
        elapsedTimeElement.textContent = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;
    }
    
    // Reset question timer
    function resetQuestionTimer() {
        // Clear existing interval
        if (remainingTimeInterval) {
            clearInterval(remainingTimeInterval);
        }
        
        // Reset time
        remainingSeconds = 120; // 2 minutes
        questionStartTime = new Date();
        
        // Update display
        updateRemainingTime();
        
        // Start new interval
        remainingTimeInterval = setInterval(function() {
            remainingSeconds--;
            updateRemainingTime();
            
            if (remainingSeconds <= 0) {
                // Time's up for this question
                clearInterval(remainingTimeInterval);
                skipQuestion();
            }
        }, 1000);
    }
    
    // Update remaining time
    function updateRemainingTime() {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        
        remainingTimeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update progress
    function updateProgress() {
        const answeredCount = userAnswers.filter(answer => answer !== null).length;
        const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
        
        progressBar.style.width = `${progressPercent}%`;
        progressPercent.textContent = `${progressPercent}%`;
    }
    
    // End quiz
    function endQuiz() {
        // Stop timers
        clearInterval(elapsedTimeInterval);
        clearInterval(remainingTimeInterval);
        
        // Calculate score
        const markingType = JSON.parse(localStorage.getItem('quizUserData')).markingType || 'normal';
        const score = calculateScore(markingType);
        
        // Store results
        const quizResults = {
            userAnswers: userAnswers,
            score: score,
            totalQuestions: totalQuestions,
            markingType: markingType,
            elapsedTime: elapsedTimeElement.textContent
        };
        
        localStorage.setItem('quizResults', JSON.stringify(quizResults));
        
        // Redirect to results page
        window.location.href = 'result.html';
    }
    
    // Calculate score
    function calculateScore(markingType) {
        let score = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        
        userAnswers.forEach((answer, index) => {
            if (answer === null) return; // Skipped question
            
            if (answer === quizQuestions[index].correctAnswer) {
                correctCount++;
            } else {
                incorrectCount++;
            }
        });
        
        // Calculate score based on marking type
        if (markingType === 'normal') {
            // Normal marking: 1 mark per correct answer, no negative marking
            score = correctCount;
        } else if (markingType === 'negative') {
            // Negative marking: 2 marks per correct answer, -1 mark per wrong answer
            score = (correctCount * 2) - incorrectCount;
        }
        
        return Math.max(0, score); // Ensure score is not negative
    }
});
