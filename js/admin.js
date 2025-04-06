// Admin page JavaScript for quiz management
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements - Tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // DOM elements - Questions tab
    const uploadBox = document.getElementById('uploadBox');
    const excelFileInput = document.getElementById('excelFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const subjectNameInput = document.getElementById('subjectName');
    const previewSection = document.getElementById('previewSection');
    const previewTable = document.getElementById('previewTable');
    const subjectsListSection = document.getElementById('subjectsListSection');
    const subjectsList = document.getElementById('subjectsList');
    const saveQuestionsBtn = document.getElementById('saveQuestionsBtn');
    
    // DOM elements - Posts tab
    const postNameInput = document.getElementById('postName');
    const totalQuestionsInput = document.getElementById('totalQuestions');
    const subjectSelection = document.getElementById('subjectSelection');
    const subjectPercentages = document.getElementById('subjectPercentages');
    const createPostBtn = document.getElementById('createPostBtn');
    const postsList = document.getElementById('postsList');
    
    // DOM elements - Candidates tab
    const exportCandidatesBtn = document.getElementById('exportCandidatesBtn');
    const candidatesList = document.getElementById('candidatesList');
    
    // DOM elements - Footer
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Quiz questions array for current upload
    let quizQuestions = [];
    
    // Initialize
    initializeAdminPanel();
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Update footer buttons based on active tab
            updateFooterButtons(tabId);
        });
    });
    
    // Initialize admin panel
    function initializeAdminPanel() {
        // Load subjects
        loadSubjects();
        
        // Load posts
        loadPosts();
        
        // Load candidates
        loadCandidates();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Questions tab
        uploadBox.addEventListener('click', () => excelFileInput.click());
        excelFileInput.addEventListener('change', handleFileSelect);
        removeFileBtn.addEventListener('click', removeFile);
        saveQuestionsBtn.addEventListener('click', saveQuestions);
        
        // Drag and drop events
        uploadBox.addEventListener('dragover', handleDragOver);
        uploadBox.addEventListener('dragleave', handleDragLeave);
        uploadBox.addEventListener('drop', handleDrop);
        
        // Posts tab
        createPostBtn.addEventListener('click', createPost);
        
        // Candidates tab
        exportCandidatesBtn.addEventListener('click', exportCandidates);
        
        // Footer
        cancelBtn.addEventListener('click', () => window.location.href = 'index.html');
    }
    
    // Update footer buttons based on active tab
    function updateFooterButtons(activeTab) {
        if (activeTab === 'questions') {
            saveQuestionsBtn.style.display = 'block';
            saveQuestionsBtn.disabled = quizQuestions.length === 0;
        } else {
            saveQuestionsBtn.style.display = 'none';
        }
    }
    
    // Load subjects
    function loadSubjects() {
        const subjects = db.getSubjects();
        
        // Clear subjects list
        subjectsList.innerHTML = '';
        subjectPercentages.innerHTML = '';
        
        if (subjects.length === 0) {
            subjectsList.innerHTML = '<p class="no-data">No subjects available</p>';
            return;
        }
        
        // Add subjects to list
        subjects.forEach(subject => {
            // Add to subjects list
            const subjectItem = document.createElement('div');
            subjectItem.className = 'subject-item';
            
            const subjectInfo = document.createElement('div');
            subjectInfo.className = 'subject-info';
            
            const subjectTitle = document.createElement('h4');
            subjectTitle.textContent = subject.name;
            
            const subjectDetails = document.createElement('p');
            subjectDetails.textContent = `${subject.questions.length} questions • Last updated: ${formatDate(subject.lastUpdated)}`;
            
            subjectInfo.appendChild(subjectTitle);
            subjectInfo.appendChild(subjectDetails);
            
            const subjectActions = document.createElement('div');
            subjectActions.className = 'subject-actions';
            
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn btn-small';
            viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
            viewBtn.addEventListener('click', () => viewSubject(subject.name));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-small btn-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.addEventListener('click', () => deleteSubject(subject.name));
            
            subjectActions.appendChild(viewBtn);
            subjectActions.appendChild(deleteBtn);
            
            subjectItem.appendChild(subjectInfo);
            subjectItem.appendChild(subjectActions);
            
            subjectsList.appendChild(subjectItem);
            
            // Add to subject percentages in Posts tab
            const percentageItem = document.createElement('div');
            percentageItem.className = 'subject-percentage-item';
            
            const checkboxLabel = document.createElement('label');
            checkboxLabel.className = 'checkbox-container';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = subject.name;
            checkbox.className = 'subject-checkbox';
            
            const checkmark = document.createElement('span');
            checkmark.className = 'checkmark';
            
            const subjectLabel = document.createElement('span');
            subjectLabel.textContent = subject.name;
            
            checkboxLabel.appendChild(checkbox);
            checkboxLabel.appendChild(checkmark);
            checkboxLabel.appendChild(subjectLabel);
            
            const percentageInput = document.createElement('input');
            percentageInput.type = 'number';
            percentageInput.min = '0';
            percentageInput.max = '100';
            percentageInput.value = '0';
            percentageInput.className = 'percentage-input';
            percentageInput.disabled = true;
            
            checkbox.addEventListener('change', function() {
                percentageInput.disabled = !this.checked;
                if (this.checked) {
                    percentageInput.value = '20';
                } else {
                    percentageInput.value = '0';
                }
                updateTotalPercentage();
            });
            
            percentageInput.addEventListener('input', updateTotalPercentage);
            
            percentageItem.appendChild(checkboxLabel);
            percentageItem.appendChild(percentageInput);
            
            subjectPercentages.appendChild(percentageItem);
        });
        
        // Add total percentage display
        const totalItem = document.createElement('div');
        totalItem.className = 'subject-percentage-total';
        
        const totalLabel = document.createElement('span');
        totalLabel.textContent = 'Total:';
        
        const totalValue = document.createElement('span');
        totalValue.id = 'totalPercentage';
        totalValue.textContent = '0%';
        
        totalItem.appendChild(totalLabel);
        totalItem.appendChild(totalValue);
        
        subjectPercentages.appendChild(totalItem);
    }
    
    // Update total percentage
    function updateTotalPercentage() {
        const percentageInputs = document.querySelectorAll('.percentage-input');
        const checkboxes = document.querySelectorAll('.subject-checkbox');
        
        let total = 0;
        
        checkboxes.forEach((checkbox, index) => {
            if (checkbox.checked) {
                total += parseInt(percentageInputs[index].value) || 0;
            }
        });
        
        const totalPercentage = document.getElementById('totalPercentage');
        totalPercentage.textContent = `${total}%`;
        
        // Highlight if not 100%
        if (total === 100) {
            totalPercentage.style.color = '#4CAF50';
        } else {
            totalPercentage.style.color = '#F44336';
        }
    }
    
    // View subject
    function viewSubject(subjectName) {
        const questions = db.getSubjectQuestions(subjectName);
        
        // Show preview
        showPreview(questions);
        
        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Delete subject
    function deleteSubject(subjectName) {
        if (confirm(`Are you sure you want to delete the subject "${subjectName}" and all its questions?`)) {
            // Remove subject
            delete db.subjects[subjectName];
            
            // Save data
            db.saveData();
            
            // Reload subjects
            loadSubjects();
            
            // Show message
            alert(`Subject "${subjectName}" has been deleted`);
        }
    }
    
    // Load posts
    function loadPosts() {
        const posts = db.getPosts();
        
        // Clear posts list
        postsList.innerHTML = '';
        
        if (posts.length === 0) {
            postsList.innerHTML = '<p class="no-data">No posts available</p>';
            return;
        }
        
        // Add posts to list
        posts.forEach(post => {
            const postItem = document.createElement('div');
            postItem.className = 'post-item';
            
            const postInfo = document.createElement('div');
            postInfo.className = 'post-info';
            
            const postTitle = document.createElement('h4');
            postTitle.textContent = post.name;
            
            const postDetails = document.createElement('p');
            postDetails.textContent = `${post.questionPackage.length} questions • Last updated: ${formatDate(post.lastUpdated)}`;
            
            postInfo.appendChild(postTitle);
            postInfo.appendChild(postDetails);
            
            const postActions = document.createElement('div');
            postActions.className = 'post-actions';
            
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn btn-small';
            viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
            viewBtn.addEventListener('click', () => viewPost(post.name));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-small btn-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.addEventListener('click', () => deletePost(post.name));
            
            postActions.appendChild(viewBtn);
            postActions.appendChild(deleteBtn);
            
            postItem.appendChild(postInfo);
            postItem.appendChild(postActions);
            
            postsList.appendChild(postItem);
        });
    }
    
    // View post
    function viewPost(postName) {
        const questions = db.getPostQuestions(postName);
        
        // Show preview
        showPreview(questions);
        
        // Switch to questions tab
        tabButtons[0].click();
        
        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Delete post
    function deletePost(postName) {
        if (confirm(`Are you sure you want to delete the post "${postName}"?`)) {
            // Remove post
            delete db.posts[postName];
            
            // Save data
            db.saveData();
            
            // Reload posts
            loadPosts();
            
            // Show message
            alert(`Post "${postName}" has been deleted`);
        }
    }
    
    // Create post
    function createPost() {
        const postName = postNameInput.value.trim();
        const totalQuestions = parseInt(totalQuestionsInput.value);
        
        // Validate post name
        if (!postName) {
            alert('Please enter a post name');
            postNameInput.focus();
            return;
        }
        
        // Validate total questions
        if (isNaN(totalQuestions) || totalQuestions < 10 || totalQuestions > 500) {
            alert('Please enter a valid number of questions (10-500)');
            totalQuestionsInput.focus();
            return;
        }
        
        // Get subject selections
        const subjectSelections = {};
        const checkboxes = document.querySelectorAll('.subject-checkbox');
        const percentageInputs = document.querySelectorAll('.percentage-input');
        
        let totalPercentage = 0;
        
        checkboxes.forEach((checkbox, index) => {
            if (checkbox.checked) {
                const subjectName = checkbox.value;
                const percentage = parseInt(percentageInputs[index].value) || 0;
                
                subjectSelections[subjectName] = percentage;
                totalPercentage += percentage;
            }
        });
        
        // Validate subject selections
        if (Object.keys(subjectSelections).length === 0) {
            alert('Please select at least one subject');
            return;
        }
        
        // Validate total percentage
        if (totalPercentage !== 100) {
            alert('Total percentage must be 100%');
            return;
        }
        
        // Create question package
        const questionPackage = db.createQuestionPackage(postName, subjectSelections, totalQuestions);
        
        // Show success message
        alert(`Successfully created post "${postName}" with ${questionPackage.length} questions`);
        
        // Reset form
        postNameInput.value = '';
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        percentageInputs.forEach(input => {
            input.value = '0';
            input.disabled = true;
        });
        updateTotalPercentage();
        
        // Reload posts
        loadPosts();
    }
    
    // Load candidates
    function loadCandidates() {
        const candidates = db.getCandidates();
        
        // Clear candidates list
        candidatesList.innerHTML = '';
        
        if (candidates.length === 0) {
            candidatesList.innerHTML = '<p class="no-data">No candidates registered</p>';
            return;
        }
        
        // Create table
        const table = document.createElement('table');
        table.className = 'candidates-table';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Name', 'Roll No', 'Mobile', 'Post', 'Department', 'Marking Type', 'Registration Time'];
        
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        
        candidates.forEach(candidate => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = candidate.name || '-';
            
            const rollNoCell = document.createElement('td');
            rollNoCell.textContent = candidate.rollNo || '-';
            
            const mobileCell = document.createElement('td');
            mobileCell.textContent = candidate.mobileNo || '-';
            
            const postCell = document.createElement('td');
            postCell.textContent = candidate.postName || '-';
            
            const departmentCell = document.createElement('td');
            departmentCell.textContent = candidate.departmentName || '-';
            
            const markingTypeCell = document.createElement('td');
            markingTypeCell.textContent = (candidate.markingType === 'negative') ? 'Negative' : 'Normal';
            
            const timestampCell = document.createElement('td');
            timestampCell.textContent = formatDate(candidate.timestamp) || '-';
            
            row.appendChild(nameCell);
            row.appendChild(rollNoCell);
            row.appendChild(mobileCell);
            row.appendChild(postCell);
            row.appendChild(departmentCell);
            row.appendChild(markingTypeCell);
            row.appendChild(timestampCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        candidatesList.appendChild(table);
    }
    
    // Export candidates to Excel
    function exportCandidates() {
        const excelBuffer = db.exportCandidatesToExcel();
        
        if (!excelBuffer) {
            alert('No candidates to export');
            return;
        }
        
        // Create blob
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `candidates_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }
    
    // Handle file selection
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            processExcelFile(file);
        }
    }
    
    // Handle drag over
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('dragover');
    }
    
    // Handle drag leave
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');
    }
    
    // Handle drop
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                    file.type === 'application/vnd.ms-excel')) {
            excelFileInput.files = e.dataTransfer.files;
            processExcelFile(file);
        } else {
            alert('Please upload a valid Excel file (.xlsx or .xls)');
        }
    }
    
    // Process Excel file
    function processExcelFile(file) {
        // Extract subject name from file name if not provided
        if (!subjectNameInput.value) {
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            const subjectMatch = fileName.match(/^([a-zA-Z]+)-([a-zA-Z0-9]+)$/);
            
            if (subjectMatch) {
                const subject = subjectMatch[1];
                const level = subjectMatch[2];
                subjectNameInput.value = `${subject.charAt(0).toUpperCase() + subject.slice(1)} ${level}`;
            }
        }
        
        // Update file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'flex';
        
        // Read file
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // Process data
                processQuizData(jsonData);
            } catch (error) {
                console.error('Error processing Excel file:', error);
                alert('Error processing Excel file. Please check the format and try again.');
                removeFile();
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    // Process quiz data
    function processQuizData(data) {
        // Clear previous data
        quizQuestions = [];
        
        // Check if data is valid
        if (!data || data.length < 2) {
            alert('Excel file is empty or has invalid format');
            return;
        }
        
        // Process rows (skip header if exists)
        const startRow = (data[0][0] === 'Question' || data[0][0] === 'question') ? 1 : 0;
        
        for (let i = startRow; i < data.length; i++) {
            const row = data[i];
            
            // Check if row has enough columns
            if (row.length < 6) continue;
            
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
                correctAnswer = 0; // Default to first option if invalid
            }
            
            // Add question
            quizQuestions.push({
                question,
                options,
                correctAnswer
            });
        }
        
        // Show preview
        showPreview(quizQuestions);
        
        // Enable save button if questions were loaded
        saveQuestionsBtn.disabled = quizQuestions.length === 0;
    }
    
    // Show preview
    function showPreview(questions) {
        // Clear previous preview
        previewTable.innerHTML = '';
        
        // Create header row
        const headerRow = document.createElement('div');
        headerRow.className = 'preview-row header';
        
        const headers = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct'];
        headers.forEach(header => {
            const cell = document.createElement('div');
            cell.className = 'preview-cell';
            cell.textContent = header;
            cell.setAttribute('data-label', header);
            headerRow.appendChild(cell);
        });
        
        previewTable.appendChild(headerRow);
        
        // Create rows for questions
        questions.forEach((question, index) => {
            if (index >= 10) return; // Limit preview to 10 questions
            
            const row = document.createElement('div');
            row.className = 'preview-row';
            
            // Question cell
            const questionCell = document.createElement('div');
            questionCell.className = 'preview-cell';
            questionCell.textContent = question.question;
            questionCell.setAttribute('data-label', 'Question');
            row.appendChild(questionCell);
            
            // Option cells
            question.options.forEach((option, optIndex) => {
                const optionCell = document.createElement('div');
                optionCell.className = 'preview-cell';
                optionCell.textContent = option;
                optionCell.setAttribute('data-label', `Option ${String.fromCharCode(65 + optIndex)}`);
                row.appendChild(optionCell);
            });
            
            // Correct answer cell
            const correctCell = document.createElement('div');
            correctCell.className = 'preview-cell';
            correctCell.textContent = String.fromCharCode(65 + question.correctAnswer);
            correctCell.setAttribute('data-label', 'Correct');
            row.appendChild(correctCell);
            
            previewTable.appendChild(row);
        });
        
        // Show preview section
        previewSection.style.display = 'block';
        
        // Add message if more than 10 questions
        if (questions.length > 10) {
            const messageRow = document.createElement('div');
            messageRow.className = 'preview-row';
            messageRow.style.textAlign = 'center';
            messageRow.style.padding = '10px';
            messageRow.textContent = `... and ${questions.length - 10} more questions`;
            previewTable.appendChild(messageRow);
        }
    }
    
    // Remove file
    function removeFile() {
        excelFileInput.value = '';
        fileInfo.style.display = 'none';
        previewSection.style.display = 'none';
        saveQuestionsBtn.disabled = true;
        quizQuestions = [];
    }
    
    // Save questions
    function saveQuestions() {
        if (quizQuestions.length === 0) {
            alert('No questions to save');
            return;
        }
        
        // Get subject name
        const subjectName = subjectNameInput.value.trim();
        
        if (!subjectName) {
            alert('Please enter a subject name');
            subjectNameInput.focus();
            return;
        }
        
        // Save questions to database
        db.addSubject(subjectName, quizQuestions);
        
        // Show success message
        alert(`Successfully imported ${quizQuestions.length} questions for subject "${subjectName}"`);
        
        // Reset form
        removeFile();
        subjectNameInput.value = '';
        
        // Reload subjects
        loadSubjects();
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Format date
    function formatDate(dateString) {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleString();
    }
});
