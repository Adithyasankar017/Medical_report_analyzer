function getExplanation(name, value, range = {}, patient = {}, lang = 'en') {
    const { min, max, unit } = range || {};
    const age = patient.age || null;
    const sex = (patient.sex || '').toLowerCase();

    let status = 'Normal';
    if (typeof value === 'number' && typeof min === 'number' && value < min) status = 'Low';
    if (typeof value === 'number' && typeof max === 'number' && value > max) status = 'High';

    const deviation = (typeof value === 'number' && typeof min === 'number' && typeof max === 'number')
        ? Math.round(((value - ((min + max) / 2)) / ((max - min) / 2)) * 100)
        : null;

    // English explanations
    const baseEn = {
        Normal: `Your ${name} (${value}${unit ? ' ' + unit : ''}) is within the typical range${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        Low: `Your ${name} (${value}${unit ? ' ' + unit : ''}) is below the typical range${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        High: `Your ${name} (${value}${unit ? ' ' + unit : ''}) is above the typical range${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
    };

    // Malayalam explanations
    const baseMl = {
        Normal: `നിങ്ങളുടെ ${name} (${value}${unit ? ' ' + unit : ''}) സാധാരണ പരിധിക്കുള്ളിലാണ്${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        Low: `നിങ്ങളുടെ ${name} (${value}${unit ? ' ' + unit : ''}) സാധാരണ പരിധിയേക്കാൾ കുറവാണ്${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        High: `നിങ്ങളുടെ ${name} (${value}${unit ? ' ' + unit : ''}) സാധാരണ പരിധിയേക്കാൾ കൂടുതലാണ്${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
    };

    const base = lang === 'ml' ? baseMl : baseEn;

    let personalized = '';

    if (age) {
        if (age >= 65) {
            personalized += lang === 'ml' 
                ? 'പ്രായമായ മുതിർന്നവരിൽ മൂല്യങ്ങൾ വ്യത്യാസപ്പെടാം; നിങ്ങളുടെ ഡോക്ടറുമായി സംസാരിക്കുക.'
                : 'Values can differ in older adults; discuss with your clinician.';
        }
        else if (age <= 12) {
            personalized += lang === 'ml'
                ? 'കുട്ടികളിലെ റഫറൻസ് പരിധികൾ വിപരീതമായി വ്യത്യാസപ്പെടാം; ഒരു പീഡിയാട്രിഷ്യനെ കൂടിയാലോചിക്കുക.'
                : 'Pediatric reference ranges can differ significantly; consult a pediatrician.';
        }
    }

    if (sex) {
        if (sex === 'female' && name === 'hemoglobin') {
            personalized += (personalized ? ' ' : '') + (lang === 'ml'
                ? 'സ്ത്രീകളിൽ പലപ്പോഴും ഹെമോഗ്ലോബിൻ പുരുഷന്മാരേക്കാൾ സ്വല്പം കുറവാണ്.'
                : 'Females often have slightly lower hemoglobin than males.');
        }
    }

    if (deviation !== null) {
        const absDev = Math.abs(deviation);
        if (absDev >= 80) {
            personalized += (personalized ? ' ' : '') + (lang === 'ml'
                ? 'ഇത് ഒരു വലിയ വ്യതിയാനമാണ്, സാധാരണ കാര്യമായ ക്ലിനിക്കൽ പരിശോധന ആവശ്യമാണ്.'
                : 'This is a large deviation and usually requires prompt clinical review.');
        }
        else if (absDev >= 30) {
            personalized += (personalized ? ' ' : '') + (lang === 'ml'
                ? 'ഈ വ്യതിയാനം മിതമാണ്; പിൻ വലിപ്പ് പരിശോധനയോ ക്ലിനിക്കൽ സഹബന്ധനയോ ശുപാർശ ചെയ്യുന്നു.'
                : 'This deviation is moderate; follow-up testing or clinical correlation is recommended.');
        }
        else if (absDev >= 10) {
            personalized += (personalized ? ' ' : '') + (lang === 'ml'
                ? 'ഇത് ഒരു നേരിയ വ്യതിയാനമാണ്; നിരീക്ഷിക്കുക കൂടാതെ ലക്ഷണങ്ങളുമായി ബന്ധപ്പെടുത്തുക.'
                : 'This is a mild deviation; monitor and correlate with symptoms.');
        }
    }

    if (!personalized) {
        personalized = lang === 'ml'
            ? 'വ്യാഖ്യാനം ക്ലിനിക്കൽ സന്ദർഭത്തെ ആശ്രയിച്ചിരിക്കുന്നു; നിങ്ങളുടെ ആരോഗ്യ സേവന ദാതാവുമായി ഫലങ്ങൾ ചർച്ച ചെയ്യുക.'
            : 'Interpretation depends on clinical context; discuss results with your healthcare provider.';
    }

    return `${base[status]} ${personalized}`;
}

module.exports = getExplanation;
