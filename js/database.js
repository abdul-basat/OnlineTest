// Database management for quiz website
// Handles storage and retrieval of questions, posts, and candidate data

class Database {
    constructor() {
        this.subjects = {};
        this.posts = {};
        this.loadData();
    }

    // Load all data from storage
    loadData() {
        try {
            // Load subjects
            const storedSubjects = localStorage.getItem('quizSubjects');
            if (storedSubjects) {
                this.subjects = JSON.parse(storedSubjects);
            }

            // Load posts
            const storedPosts = localStorage.getItem('quizPosts');
            if (storedPosts) {
                this.posts = JSON.parse(storedPosts);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Save all data to storage
    saveData() {
        try {
            localStorage.setItem('quizSubjects', JSON.stringify(this.subjects));
            localStorage.setItem('quizPosts', JSON.stringify(this.posts));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Add or update a subject with questions
    addSubject(subjectName, questions) {
        this.subjects[subjectName] = {
            name: subjectName,
            questions: questions,
            lastUpdated: new Date().toISOString()
        };
        this.saveData();
    }

    // Get all subjects
    getSubjects() {
        return Object.values(this.subjects);
    }

    // Get questions for a specific subject
    getSubjectQuestions(subjectName) {
        return this.subjects[subjectName]?.questions || [];
    }

    // Add or update a post
    addPost(postName, questionPackage) {
        this.posts[postName] = {
            name: postName,
            questionPackage: questionPackage,
            lastUpdated: new Date().toISOString()
        };
        this.saveData();
    }

    // Get all posts
    getPosts() {
        return Object.values(this.posts);
    }

    // Get question package for a specific post
    getPostQuestions(postName) {
        return this.posts[postName]?.questionPackage || [];
    }

    // Create a question package for a post from selected subjects
    createQuestionPackage(postName, subjectSelections, totalQuestions) {
        const questionPackage = [];
        
        // Calculate questions per subject based on percentages
        const questionsPerSubject = {};
        let remainingQuestions = totalQuestions;
        
        // First pass: allocate based on percentages
        for (const [subject, percentage] of Object.entries(subjectSelections)) {
            if (this.subjects[subject]) {
                const count = Math.floor(totalQuestions * (percentage / 100));
                questionsPerSubject[subject] = count;
                remainingQuestions -= count;
            }
        }
        
        // Second pass: distribute remaining questions
        const subjectKeys = Object.keys(subjectSelections);
        let index = 0;
        while (remainingQuestions > 0 && subjectKeys.length > 0) {
            const subject = subjectKeys[index % subjectKeys.length];
            if (this.subjects[subject]) {
                questionsPerSubject[subject] = (questionsPerSubject[subject] || 0) + 1;
                remainingQuestions--;
            }
            index++;
        }
        
        // Select questions from each subject
        for (const [subject, count] of Object.entries(questionsPerSubject)) {
            if (count > 0 && this.subjects[subject]) {
                const subjectQuestions = [...this.subjects[subject].questions];
                
                // Shuffle questions
                for (let i = subjectQuestions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [subjectQuestions[i], subjectQuestions[j]] = [subjectQuestions[j], subjectQuestions[i]];
                }
                
                // Take required number of questions
                const selectedQuestions = subjectQuestions.slice(0, count);
                
                // Add to package with subject metadata
                selectedQuestions.forEach(q => {
                    questionPackage.push({
                        ...q,
                        subject: subject
                    });
                });
            }
        }
        
        // Shuffle final package
        for (let i = questionPackage.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questionPackage[i], questionPackage[j]] = [questionPackage[j], questionPackage[i]];
        }
        
        // Save package to post
        this.addPost(postName, questionPackage);
        
        return questionPackage;
    }

    // Store candidate data
    storeCandidateData(candidateData) {
        try {
            // Get existing candidates or initialize empty array
            const storedCandidates = localStorage.getItem('quizCandidates') || '[]';
            const candidates = JSON.parse(storedCandidates);
            
            // Add timestamp
            candidateData.timestamp = new Date().toISOString();
            
            // Add to array
            candidates.push(candidateData);
            
            // Save back to storage
            localStorage.setItem('quizCandidates', JSON.stringify(candidates));
            
            return true;
        } catch (error) {
            console.error('Error storing candidate data:', error);
            return false;
        }
    }

    // Get all candidates
    getCandidates() {
        try {
            const storedCandidates = localStorage.getItem('quizCandidates') || '[]';
            return JSON.parse(storedCandidates);
        } catch (error) {
            console.error('Error retrieving candidates:', error);
            return [];
        }
    }

    // Export candidates to Excel format
    exportCandidatesToExcel() {
        const candidates = this.getCandidates();
        if (candidates.length === 0) {
            return null;
        }

        try {
            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(candidates);
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Candidates");
            
            // Generate Excel file
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            
            return excelBuffer;
        } catch (error) {
            console.error('Error exporting candidates to Excel:', error);
            return null;
        }
    }
}

// Create and export database instance
const db = new Database();
