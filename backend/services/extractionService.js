function extractParameters(text) {

    const parameters = [];

    const patterns = [
        { name: "hemoglobin", regex: /(hemoglobin|hgb|hb)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
        { name: "wbc", regex: /(wbc|white blood cell|white blood cells)[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
        { name: "glucose", regex: /(glucose|blood sugar)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
        { name: "platelets", regex: /(platelet|platelets)[^\d\n\r]*([0-9][0-9,\.\s]*)/i }
    ];

    patterns.forEach(pattern => {
        const match = text.match(pattern.regex);

        if (match && match[2]) {
            const cleanValue = match[2].replace(/[^0-9.\-]/g, '');

            const parsed = parseFloat(cleanValue);
            if (!isNaN(parsed)) {
                parameters.push({
                    name: pattern.name,
                    value: parsed
                });
            }
        }
    });

    return parameters;
}

module.exports = extractParameters;