process.env.LOCAL_ONLY_EXPLANATIONS = 'true';
const getExplanation = require('./backend/data/explanations.js');

(async () => {
  const tests = [
    { param: 'Glucose', value: 147, range: { min: 55, max: 100, unit: 'mg/dL' }, title: 'GLUCOSE (High)' },
    { param: 'Total_Cholesterol', value: 168, range: { min: 125, max: 200, unit: 'mg/dL' }, title: 'TOTAL CHOLESTEROL (Normal)' },
    { param: 'Triglycerides', value: 190, range: { min: 30, max: 150, unit: 'mg/dL' }, title: 'TRIGLYCERIDES (High)' },
    { param: 'Hemoglobin', value: 12, range: { min: 13.5, max: 17.5, unit: 'g/dL' }, title: 'HEMOGLOBIN (Low)' },
    { param: 'AST', value: 85, range: { min: 10, max: 40, unit: 'U/L' }, title: 'AST ENZYME (High - Liver)' }
  ];

  for (const test of tests) {
    try {
      const explanation = await getExplanation(test.param, test.value, test.range, { age: 51, sex: 'male', sessionId: 'user-123' }, 'en');
      console.log('\n═══════════════════════════════════════');
      console.log(`${test.title}`);
      console.log('═══════════════════════════════════════');
      console.log(explanation);
    } catch (err) {
      console.error(`Error for ${test.param}:`, err.message);
    }
  }
  console.log('\n✓ Test complete');
})();
