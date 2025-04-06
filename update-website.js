// Script to update the deployed website with the Quran MCQs
const fs = require('fs');
const path = require('path');

// Path to the JSON file with Quran MCQs
const jsonFilePath = path.join(__dirname, 'data', 'quran-mcqs.json');

// Read the JSON file
try {
    const quizQuestions = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    // Create a JavaScript file that will set the questions in localStorage
    const jsContent = `
// Quran MCQs loaded from JSON
const quranMCQs = ${JSON.stringify(quizQuestions, null, 2)};

// Store in localStorage when page loads
document.addEventListener('DOMContentLoaded', function() {
    localStorage.setItem('quizQuestions', JSON.stringify(quranMCQs));
    console.log('Successfully loaded ${quizQuestions.length} Quran MCQs into quiz database');
    
    // Add notification to the page
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    notification.style.zIndex = '1000';
    notification.textContent = '${quizQuestions.length} Quran MCQs loaded successfully!';
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
});
    `;
    
    // Write the JavaScript file
    fs.writeFileSync(path.join(__dirname, 'js', 'quran-mcqs.js'), jsContent);
    
    // Update index.html to include this script
    let indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    // Check if the script is already included
    if (!indexHtml.includes('quran-mcqs.js')) {
        // Add the script before the closing body tag
        indexHtml = indexHtml.replace('</body>', '    <script src="js/quran-mcqs.js"></script>\n</body>');
        fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml);
    }
    
    console.log('Successfully updated the website with Quran MCQs');
    
} catch (error) {
    console.error('Error updating website with Quran MCQs:', error);
}
