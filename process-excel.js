// Script to process the user's Excel file and convert it to JSON
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Path to the uploaded Excel file
const excelFilePath = '/home/ubuntu/upload/Quran_MCQs_100_NoHeaders.xlsx';

// Read the Excel file
try {
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Process the data into quiz questions format
    const quizQuestions = [];
    
    data.forEach((row, index) => {
        // Check if row has enough columns
        if (row.length < 6) {
            console.log(`Skipping row ${index + 1} due to insufficient columns`);
            return;
        }
        
        const question = row[0];
        const options = [row[1], row[2], row[3], row[4]];
        let correctAnswer;
        
        // Parse correct answer
        if (typeof row[5] === 'string') {
            const answerLetter = row[5].trim().toUpperCase();
            if (answerLetter === 'A') correctAnswer = 0;
            else if (answerLetter === 'B') correctAnswer = 1;
            else if (answerLetter === 'C') correctAnswer = 2;
            else if (answerLetter === 'D') correctAnswer = 3;
            else correctAnswer = parseInt(row[5]) - 1; // Fallback to numeric index
        } else {
            correctAnswer = parseInt(row[5]) - 1; // Numeric index
        }
        
        // Validate correctAnswer
        if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
            console.log(`Row ${index + 1} has invalid correct answer: ${row[5]}, defaulting to first option`);
            correctAnswer = 0; // Default to first option if invalid
        }
        
        // Add question
        quizQuestions.push({
            question,
            options,
            correctAnswer
        });
    });
    
    // Save as JSON
    const jsonFilePath = path.join(__dirname, 'data', 'quran-mcqs.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(quizQuestions, null, 2));
    
    console.log(`Successfully processed ${quizQuestions.length} questions`);
    console.log(`JSON file saved to: ${jsonFilePath}`);
    
} catch (error) {
    console.error('Error processing Excel file:', error);
}
