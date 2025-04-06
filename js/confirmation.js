// Confirmation page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const candidateName = document.getElementById('candidateName');
    const candidateRollNo = document.getElementById('candidateRollNo');
    const candidateMobile = document.getElementById('candidateMobile');
    const postSelect = document.getElementById('postSelect');
    const postError = document.getElementById('postError');
    const normalMarking = document.getElementById('normalMarking');
    const negativeMarking = document.getElementById('negativeMarking');
    const backButton = document.getElementById('backButton');
    const startQuizButton = document.getElementById('startQuizButton');
    
    // Initialize
    initializeConfirmationPage();
    
    // Initialize confirmation page
    function initializeConfirmationPage() {
        // Load user data from localStorage
        const userData = JSON.parse(localStorage.getItem('quizUserData')) || {};
        
        // Update candidate info
        candidateName.textContent = userData.name || '-';
        candidateRollNo.textContent = userData.rollNo || '-';
        candidateMobile.textContent = userData.mobileNo || '-';
        
        // Set marking type from user data if available
        if (userData.markingType === 'negative') {
            negativeMarking.checked = true;
        } else {
            normalMarking.checked = true;
        }
        
        // Load posts
        loadPosts();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Load posts
    function loadPosts() {
        const posts = db.getPosts();
        
        // Clear select options except the first one
        while (postSelect.options.length > 1) {
            postSelect.remove(1);
        }
        
        if (posts.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No posts available';
            option.disabled = true;
            postSelect.appendChild(option);
            return;
        }
        
        // Add posts to select
        posts.forEach(post => {
            const option = document.createElement('option');
            option.value = post.name;
            option.textContent = post.name;
            postSelect.appendChild(option);
        });
        
        // Select post from user data if available
        const userData = JSON.parse(localStorage.getItem('quizUserData')) || {};
        if (userData.postName) {
            // Find the option with matching text
            for (let i = 0; i < postSelect.options.length; i++) {
                if (postSelect.options[i].textContent === userData.postName) {
                    postSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Back button
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
        
        // Start quiz button
        startQuizButton.addEventListener('click', startQuiz);
        
        // Post select change
        postSelect.addEventListener('change', function() {
            // Hide error message if post is selected
            if (postSelect.value) {
                postError.style.display = 'none';
            }
        });
    }
    
    // Start quiz
    function startQuiz() {
        // Validate post selection
        if (!postSelect.value) {
            postError.textContent = 'Please select a post';
            postError.style.display = 'block';
            postSelect.focus();
            return;
        }
        
        // Get user data
        const userData = JSON.parse(localStorage.getItem('quizUserData')) || {};
        
        // Update user data with post and marking type
        userData.postName = postSelect.value;
        userData.markingType = normalMarking.checked ? 'normal' : 'negative';
        
        // Save updated user data
        localStorage.setItem('quizUserData', JSON.stringify(userData));
        
        // Get questions for selected post
        const postQuestions = db.getPostQuestions(userData.postName);
        
        // Save questions to localStorage for quiz page
        localStorage.setItem('quizQuestions', JSON.stringify(postQuestions));
        
        // Redirect to quiz page
        window.location.href = 'quiz.html';
    }
});
