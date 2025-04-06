// Server-side script to export candidates data to Excel
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to export candidates data to Excel
function exportCandidates() {
    try {
        // Create candidates directory if it doesn't exist
        const candidatesDir = path.join(__dirname, 'data', 'candidates');
        if (!fs.existsSync(candidatesDir)) {
            fs.mkdirSync(candidatesDir, { recursive: true });
        }
        
        // Read candidates data from localStorage file
        // In a real server environment, this would come from a database
        // For this demo, we'll create sample data
        const candidates = [
            {
                rollNo: '12345',
                name: 'Muhammad Mushtaq',
                mobileNo: '03001234567',
                postName: 'PST',
                departmentName: 'ETEA',
                markingType: 'normal',
                loginTime: new Date().toISOString()
            },
            // Add more sample candidates as needed
        ];
        
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(candidates);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Candidates");
        
        // Generate filename with current date
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        const filename = `candidates_${dateStr}.xlsx`;
        
        // Write to file
        const filePath = path.join(candidatesDir, filename);
        XLSX.writeFile(wb, filePath);
        
        console.log(`Candidates data exported to: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Error exporting candidates to Excel:', error);
        return null;
    }
}

// Export candidates data
const exportedFile = exportCandidates();
console.log('Export result:', exportedFile ? 'Success' : 'Failed');
