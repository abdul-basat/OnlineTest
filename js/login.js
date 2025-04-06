// Login page JavaScript with candidate data storage
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginForm = document.getElementById('loginForm');
    const rollNoInput = document.getElementById('rollNo');
    const mobileNoInput = document.getElementById('mobileNo');
    const rollNoError = document.getElementById('rollNoError');
    const mobileNoError = document.getElementById('mobileNoError');
    
    // Initialize database
    if (typeof db === 'undefined') {
        // Create a simple database object if the main database.js is not loaded
        window.db = {
            storeCandidateData: function(data) {
                try {
                    // Get existing candidates or initialize empty array
                    const storedCandidates = localStorage.getItem('quizCandidates') || '[]';
                    const candidates = JSON.parse(storedCandidates);
                    
                    // Add timestamp
                    data.timestamp = new Date().toISOString();
                    
                    // Add to array
                    candidates.push(data);
                    
                    // Save back to storage
                    localStorage.setItem('quizCandidates', JSON.stringify(candidates));
                    
                    return true;
                } catch (error) {
                    console.error('Error storing candidate data:', error);
                    return false;
                }
            }
        };
    }
    
    // Set up event listeners
    loginForm.addEventListener('submit', handleLogin);
    
    // Handle login
    function handleLogin(e) {
        e.preventDefault();
        
        // Reset error messages
        rollNoError.textContent = '';
        rollNoError.style.display = 'none';
        mobileNoError.textContent = '';
        mobileNoError.style.display = 'none';
        
        // Get form values
        const rollNo = rollNoInput.value.trim();
        const mobileNo = mobileNoInput.value.trim();
        
        // Validate roll number
        if (!rollNo) {
            rollNoError.textContent = 'Please enter your roll number';
            rollNoError.style.display = 'block';
            rollNoInput.focus();
            return;
        }
        
        // Validate mobile number
        if (!mobileNo) {
            mobileNoError.textContent = 'Please enter your mobile number';
            mobileNoError.style.display = 'block';
            mobileNoInput.focus();
            return;
        }
        
        // Check if mobile number starts with "03" and has exactly 11 digits
        if (!mobileNo.startsWith('03') || mobileNo.length !== 11 || !/^\d+$/.test(mobileNo)) {
            mobileNoError.textContent = 'Mobile number must start with 03 and have 11 digits';
            mobileNoError.style.display = 'block';
            mobileNoInput.focus();
            return;
        }
        
        // Create user data object
        const userData = {
            rollNo: rollNo,
            mobileNo: mobileNo,
            markingType: 'normal', // Default marking type, will be updated in confirmation page
            name: `Candidate ${rollNo}`, // Default name based on roll number
            departmentName: 'ETEA', // Default department
            loginTime: new Date().toISOString()
        };
        
        // Store candidate data
        db.storeCandidateData(userData);
        
        // Save to localStorage for use in quiz
        localStorage.setItem('quizUserData', JSON.stringify(userData));
        
        // Export candidates data to Excel
        exportCandidatesToExcel();
        
        // Redirect to confirmation page
        window.location.href = 'confirmation.html';
    }
    
    // Export candidates data to Excel
    function exportCandidatesToExcel() {
        try {
            // Get candidates data
            const storedCandidates = localStorage.getItem('quizCandidates') || '[]';
            const candidates = JSON.parse(storedCandidates);
            
            if (candidates.length === 0) {
                return;
            }
            
            // Check if XLSX is available
            if (typeof XLSX === 'undefined') {
                console.warn('XLSX library not available for direct Excel export');
                return;
            }
            
            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(candidates);
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Candidates");
            
            // Save to file in data/candidates directory
            // Note: This would normally require server-side code
            // For now, we'll just create a blob for download in admin panel
            
            // Generate Excel binary
            const excelBinary = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
            
            // Convert to ArrayBuffer
            const buffer = new ArrayBuffer(excelBinary.length);
            const view = new Uint8Array(buffer);
            for (let i = 0; i < excelBinary.length; i++) {
                view[i] = excelBinary.charCodeAt(i) & 0xFF;
            }
            
            // Store in localStorage for admin panel to access
            // This is a workaround since we can't directly write to filesystem from browser
            localStorage.setItem('candidatesExcelData', JSON.stringify(Array.from(view)));
            
        } catch (error) {
            console.error('Error exporting candidates to Excel:', error);
        }
    }
});
