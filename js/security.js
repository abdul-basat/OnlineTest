// Security enhancements for quiz website
document.addEventListener('DOMContentLoaded', function() {
    // Prevent right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Prevent keyboard shortcuts for copy/paste/print/save
    document.addEventListener('keydown', function(e) {
        // Ctrl+C, Ctrl+V, Ctrl+P, Ctrl+S, F12
        if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 's')) || 
            e.key === 'F12' || e.key === 'PrintScreen') {
            e.preventDefault();
            return false;
        }
    });
    
    // Prevent text selection
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            return false;
        }
    });
    
    // Prevent drag and drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Prevent copy
    document.addEventListener('copy', function(e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            return false;
        }
    });
    
    // Add watermark with candidate info
    if (window.location.pathname.includes('quiz.html')) {
        addWatermark();
    }
    
    // Function to add watermark
    function addWatermark() {
        try {
            // Get user data
            const userData = JSON.parse(localStorage.getItem('quizUserData')) || {};
            
            // Create watermark element
            const watermark = document.createElement('div');
            watermark.className = 'watermark';
            watermark.innerHTML = `${userData.name || 'Candidate'} - ${userData.rollNo || 'Unknown'}`;
            
            // Add watermark styles
            const style = document.createElement('style');
            style.textContent = `
                .watermark {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    pointer-events: none;
                    z-index: -1;
                    font-size: 48px;
                    color: rgba(0, 0, 0, 0.05);
                    transform: rotate(-45deg);
                    user-select: none;
                }
            `;
            
            // Add to document
            document.head.appendChild(style);
            document.body.appendChild(watermark);
        } catch (error) {
            console.error('Error adding watermark:', error);
        }
    }
});
