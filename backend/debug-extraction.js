// Debug script to test parameter extraction
const extractParameters = require('./services/extractionService');

// Sample text similar to what OCR would extract from the medical report
const sampleText = `
Microvision Clinical Laboratory
Patient: Abhinand B
Age: 20 years
Sex: Male

Vitamin D3 (25 Hydroxy Cholecalciferol): 45.2 ng/mL

Liver Function Tests (LFT)
Bilirubin Total: 0.95 mg/dL
Bilirubin Direct: 0.23 mg/dL
Bilirubin Indirect: 0.72 mg/dL
SGOT/AST: 16 IU/L
SGPT/ALT: 15 IU/L
Alkaline Phosphatase: 224 U/L
Total Protein: 7.1 g/dL
Albumin: 4.3 g/dL
Globulin: 2.8 g/dL
A/G Ratio: 1.54
`;

console.log('Testing parameter extraction with sample medical report text...\n');
console.log('Input Text:');
console.log(sampleText);
console.log('\n' + '='.repeat(60));
console.log('Extraction Results:');
console.log('='.repeat(60) + '\n');

const parameters = extractParameters(sampleText);

if (parameters.length === 0) {
    console.log('❌ NO PARAMETERS DETECTED');
} else {
    console.log(`✓ Found ${parameters.length} parameters:\n`);
    parameters.forEach(param => {
        console.log(`  • ${param.name}: ${param.value}`);
    });
}

console.log('\n' + '='.repeat(60));
