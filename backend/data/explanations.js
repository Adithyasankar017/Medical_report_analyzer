const OpenAI = (() => {
    try {
        return require('openai').OpenAI;
    } catch (e) {
        return null;
    }
})();

function buildTemplateExplanation(name, value, range = {}, patient = {}, lang = 'en') {
    const { min, max, unit } = range || {};
    const age = patient.age || null;
    const sex = (patient.sex || '').toLowerCase();

    let status = 'Normal';
    if (typeof value === 'number' && typeof min === 'number' && value < min) status = 'Low';
    if (typeof value === 'number' && typeof max === 'number' && value > max) status = 'High';

    const deviation = (typeof value === 'number' && typeof min === 'number' && typeof max === 'number')
        ? Math.round(((value - ((min + max) / 2)) / ((max - min) / 2)) * 100)
        : null;

    const baseEn = {
        Normal: `Your ${name} (${value}${unit ? ' ' + unit : ''}) is within the typical range${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        Low: `Your ${name} (${value}${unit ? ' ' + unit : ''}) is below the typical range${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        High: `Your ${name} (${value}${unit ? ' ' + unit : ''}) is above the typical range${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
    };

    const baseMl = {
        Normal: `നിങ്ങളുടെ ${name} (${value}${unit ? ' ' + unit : ''}) സാധാരണ പരിധിക്കുള്ളിലാണ്${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        Low: `നിങ്ങളുടെ ${name} (${value}${unit ? ' ' + unit : ''}) സാധാരണ പരിധിയേക്കാൾ കുറവാണ്${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        High: `നിങ്ങളുടെ ${name} (${value}${unit ? ' ' + unit : ''}) സാധാരണ പരിധിയേക്കാള്‍ കൂടുതലാണ്${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
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
                ? 'കുട്ടികളിലെ റഫറൻസ് പരിധികൾ വ്യത്യാസപ്പെടാം; ഒരു പിഡിയാട്രിഷ്യനെ കൂടിയാലോചിക്കുക.'
                : 'Pediatric reference ranges can differ significantly; consult a pediatrician.';
        }
    }

    if (sex) {
        if (sex === 'female' && name.toLowerCase().includes('hemoglobin')) {
            personalized += (personalized ? ' ' : '') + (lang === 'ml'
                ? 'സ്ത്രീകളിൽ ഹെമോഗ്ലോബിൻ സാധാരണയായി കുറവായിരിക്കും.'
                : 'Females often have slightly lower hemoglobin than males.');
        }
    }

    if (deviation !== null) {
        const absDev = Math.abs(deviation);
        if (absDev >= 80) {
            personalized += (personalized ? ' ' : '') + (lang === 'ml'
                ? 'ഇത് വലിയ വ്യതിയാനമാണ്; അടിയന്തിരമായി ക്ലിനിക്കൽ വിലയിരുത്തൽ ആവശ്യമാണ്.'
                : 'This is a large deviation and usually requires prompt clinical review.');
        }
        else if (absDev >= 30) {
            personalized += (personalized ? ' ' : '') + (lang === 'ml'
                ? 'ഈ വ്യതിയാനം മിതമാണ്; പിന്തുടർച്ചാ പരിശോധന ശുപാർശ ചെയ്യപ്പെടും.'
                : 'This deviation is moderate; follow-up testing or clinical correlation is recommended.');
        }
        else if (absDev >= 10) {
            personalized += (personalized ? ' ' : '') + (lang === 'ml'
                ? 'സൂക്ഷ്മ വ്യതിയാനമാണ്; ലക്ഷണങ്ങളെ ശ്രദ്ധിക്കുക.'
                : 'This is a mild deviation; monitor and correlate with symptoms.');
        }
    }

    if (!personalized) {
        personalized = lang === 'ml'
            ? 'വ്യാഖ്യാനം ക്ലിനിക്കൽ സാഹചര്യത്തെ ആശ്രയിച്ചിരിക്കുന്നു; ദയവായി നിങ്ങളുടെ ആരോഗ്യ സേവനദാതാവുമായി ചര്‍ച്ച ചെയ്യുക.'
            : 'Interpretation depends on clinical context; discuss results with your healthcare provider.';
    }

    return `${base[status]} ${personalized}`;
}

async function getExplanation(name, value, range = {}, patient = {}, lang = 'en') {
    // If OpenAI SDK is available and API key set, prefer AI-generated explanation
    try {
        const apiKey = process.env.OPENAI_API_KEY || null;
        if (OpenAI && apiKey) {
            const client = new OpenAI({ apiKey });

            const min = range.min ?? null;
            const max = range.max ?? null;
            const unit = range.unit || '';
            const age = patient.age || null;
            const sex = (patient.sex || '').toLowerCase();

            let status = 'Normal';
            if (typeof value === 'number' && typeof min === 'number' && value < min) status = 'Low';
            if (typeof value === 'number' && typeof max === 'number' && value > max) status = 'High';

            const promptLang = lang === 'ml' ? 'ml' : 'en';

            const systemMessage = promptLang === 'ml'
                ? 'നിങ്ങൾ ഒരു മെഡിക്കൽ അസിസ്റ്റന്റ് ആയാണ് പ്രവർത്തിക്കുന്നത്. കുറച്ച് സൗഹൃദപരവും വ്യക്തവും ക്ലിനിക്കൽ രീതിയിലും വിശദീകരണം നൽകുക. ഉപയോക്താവിനെ ഭയപ്പെടുത്താതെ നിർദ്ദേശങ്ങള്‍ നൽകുക.'
                : 'You are a medical assistant. Provide a concise, clear, and non-alarming clinical explanation of a lab value, including what it means, degree of urgency, likely next steps, and a reminder to consult a healthcare provider.';

            const userMessage = promptLang === 'ml'
                ? `പരീക്ഷണം: ${name}\nമൂല്യം: ${value} ${unit}\nറഫറൻസ്: ${min !== null && max !== null ? min + ' - ' + max + ' ' + unit : 'Unavailable'}\nസ്ഥിതി: ${status}\nരോഗിയുടെ പ്രായം: ${age || 'Unknown'}\nഭേദം: ${sex || 'Unknown'}\n\nദയവായി ഒരു 1-2 വാക്യത്തിലുള്ള ലഘു വിശദീകരണം നൽകുക, തുടർന്ന് 1 ചുരുങ്ങിയ ശുപാർശ വാക്യം.`
                : `Parameter: ${name}\nValue: ${value} ${unit}\nReference range: ${min !== null && max !== null ? min + ' - ' + max + ' ' + unit : 'Unavailable'}\nStatus: ${status}\nPatient age: ${age || 'Unknown'}\nPatient sex: ${sex || 'Unknown'}\n\nProvide a 1-2 sentence plain-language explanation and 1 short recommendation sentence (urgency and next steps). Keep tone non-alarming.`;

            const messages = [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage }
            ];

            // Retry logic for transient quota/rate errors
            const maxAttempts = 3;
            let attempt = 0;
            while (attempt < maxAttempts) {
                attempt++;
                try {
                    const resp = await client.chat.completions.create({
                        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                        messages,
                        max_tokens: 220,
                        temperature: 0.2
                    });

                    if (resp && resp.choices && resp.choices[0] && resp.choices[0].message && resp.choices[0].message.content) {
                        return resp.choices[0].message.content.trim();
                    }
                    break; // no usable response, break to fallback
                } catch (err) {
                    const msg = err && err.message ? err.message : String(err);
                    // If rate/quota error, wait and retry
                    if ((/429|quota/i).test(msg) && attempt < maxAttempts) {
                        const waitMs = 500 * Math.pow(2, attempt - 1);
                        await new Promise(r => setTimeout(r, waitMs));
                        continue;
                    }
                    // For authentication or other permanent errors, log and break
                    console.warn('AI explanation request error:', msg);
                    break;
                }
            }
        }
    } catch (aiErr) {
        // Log but fall through to template explanation
        console.warn('AI explanation failed, falling back to template:', aiErr && aiErr.message ? aiErr.message : aiErr);
    }

    // Fallback deterministic/template explanation
    return buildTemplateExplanation(name, value, range, patient, lang);
}

module.exports = getExplanation;
