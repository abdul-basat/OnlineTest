// Create a default avatar for the quiz page
const canvas = document.createElement('canvas');
canvas.width = 200;
canvas.height = 200;
const ctx = canvas.getContext('2d');

// Draw background circle
ctx.fillStyle = '#e0e5f0';
ctx.beginPath();
ctx.arc(100, 100, 100, 0, Math.PI * 2);
ctx.fill();

// Draw silhouette
ctx.fillStyle = '#8ca0c0';
ctx.beginPath();
// Head
ctx.arc(100, 85, 45, 0, Math.PI * 2);
ctx.fill();
// Body
ctx.beginPath();
ctx.moveTo(60, 140);
ctx.quadraticCurveTo(100, 190, 140, 140);
ctx.fill();

// Export to PNG
const dataURL = canvas.toDataURL('image/png');
const fs = require('fs');
const path = require('path');

// Save the image
fs.writeFileSync(path.join(__dirname, 'default-avatar.png'), Buffer.from(dataURL.split(',')[1], 'base64'));

console.log('Default avatar created successfully!');
