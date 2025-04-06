// Create a sample Excel file for testing
const XLSX = require('xlsx');

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Sample quiz questions
const questions = [
    ["Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer"],
    ["What is 15 + 9?", "24", "23", "22", "25", "A"],
    ["Which planet is known as the Red Planet?", "Venus", "Jupiter", "Mars", "Saturn", "C"],
    ["What is the capital of France?", "London", "Berlin", "Madrid", "Paris", "D"],
    ["Which of these is not a programming language?", "Java", "Python", "Cobra", "Crocodile", "D"],
    ["What is the largest ocean on Earth?", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean", "D"],
    ["What is the chemical symbol for gold?", "Go", "Gd", "Au", "Ag", "C"],
    ["Which country is known as the Land of the Rising Sun?", "China", "Japan", "Thailand", "South Korea", "B"],
    ["What is the square root of 144?", "12", "14", "10", "16", "A"],
    ["Who wrote 'Romeo and Juliet'?", "Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain", "B"],
    ["Which of these is not a primary color?", "Red", "Blue", "Green", "Yellow", "D"]
];

// Create a worksheet
const worksheet = XLSX.utils.aoa_to_sheet(questions);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Questions");

// Write to file
XLSX.writeFile(workbook, "sample-quiz-questions.xlsx");

console.log("Sample Excel file created successfully!");
