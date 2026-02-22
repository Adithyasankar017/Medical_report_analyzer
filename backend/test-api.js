// Test script to verify API works with form data file upload
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Get the test image file - using the test.png from uploads
const filePath = './uploads/test.png';

if (!fs.existsSync(filePath)) {
    console.error(`Test file not found: ${filePath}`);
    process.exit(1);
}

const fileStream = fs.createReadStream(filePath);
const form = new FormData();

form.append('file', fileStream);
form.append('age', '20');
form.append('sex', 'male');
form.append('lang', 'en');

// Make the API request
fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
})
.then(res => res.json())
.then(data => {
    console.log('\nAPI Response:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(60));
    
    if (data.detectedParameters) {
        console.log(`\n✓ Successfully detected ${data.detectedParameters.length} parameters`);
    } else if (data.message) {
        console.log(`\n✗ ${data.message}`);
    } else if (data.error) {
        console.log(`\n✗ Error: ${data.error}`);
    }
})
.catch(err => {
    console.error('Request error:', err);
    process.exit(1);
});
