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
        ? ((value - ((min + max) / 2)) / ((max - min) / 2)) * 100
        : null;

    // Deterministic seeded RNG when sessionId provided, otherwise fallback to Math.random
    const createSeededRng = (seedStr) => {
        // xfnv1a then mulberry32
        const xfnv1a = function(str) {
            for (var i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
                h = Math.imul(h ^ str.charCodeAt(i), 16777619);
            }
            return (h >>> 0);
        };
        const seed = xfnv1a(seedStr).toString();
        let a = parseInt(seed.slice(0, 8), 10) || xfnv1a(seedStr + 'a');
        a = a >>> 0;
        return function() {
            // mulberry32-ish
            a |= 0;
            a = a + 0x6D2B79F5 | 0;
            var t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    };

    let rng = null;
    if (patient && patient.sessionId) {
        try {
            rng = createSeededRng(String(patient.sessionId) + '::' + String(name));
        } catch (e) {
            rng = null;
        }
    }

    const pick = arr => {
        if (!Array.isArray(arr) || arr.length === 0) return '';
        if (rng) return arr[Math.floor(rng() * arr.length)];
        return arr[Math.floor(Math.random() * arr.length)];
    };

    // English variants
    const opensEn = {
        Normal: [
            `Your ${name.replace(/_/g, ' ')} (${value}${unit ? ' ' + unit : ''}) falls within the expected range${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
            `Good news — ${name.replace(/_/g, ' ')} is ${value}${unit ? ' ' + unit : ''}, which is inside the typical reference range.`,
            `${name.replace(/_/g, ' ')} at ${value}${unit ? ' ' + unit : ''} is considered within normal limits.`
        ],
        Low: [
            `Your ${name.replace(/_/g, ' ')} (${value}${unit ? ' ' + unit : ''}) is lower than the usual range${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
            `${name.replace(/_/g, ' ')} is ${value}${unit ? ' ' + unit : ''}, which is below the expected range.`
        ],
        High: [
            `Your ${name.replace(/_/g, ' ')} (${value}${unit ? ' ' + unit : ''}) is higher than expected${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
            `${name.replace(/_/g, ' ')} measures ${value}${unit ? ' ' + unit : ''}, above the typical range.`
        ]
    };

    // Malayalam variants (kept concise)
    const opensMl = {
        Normal: [
            `നിങ്ങളുടെ ${name} (${value}${unit ? ' ' + unit : ''}) സാധാരണ പരിധിയിലാണ്${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
            `${name} ${value}${unit ? ' ' + unit : ''} ആയി രേഖപ്പെടുത്തിയിട്ടുണ്ട്, ഇത് സാധാരണ പരിധിയിലാണ്.`
        ],
        Low: [
            `നിങ്ങളുടെ ${name} (${value}${unit ? ' ' + unit : ''}) സാധാരണ പരിധിയേക്കാൾ കുറവാണ്${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        ],
        High: [
            `നിങ്ങളുടെ ${name} (${value}${unit ? ' ' + unit : ''}) സാധാരണ പരിധിയേക്കാൾ കൂടുതലാണ്${min && max ? ` (${min} - ${max}${unit ? ' ' + unit : ''})` : ''}.`,
        ]
    };

    const opens = lang === 'ml' ? opensMl : opensEn;

    // Degree phrases depend on deviation magnitude
    const degreeEn = (dev) => {
        if (dev === null) return pick(['Please discuss with your clinician for context.','Interpretation depends on clinical context.']);
        const absDev = Math.abs(Math.round(dev));
        if (absDev >= 80) return pick(['This is a marked difference from typical values and usually warrants prompt clinical review.','This large difference often needs urgent clinical attention.']);
        if (absDev >= 30) return pick(['This is a moderate difference; follow-up testing or clinical correlation is recommended.','A moderate deviation — consider repeating the test or discussing with your clinician.']);
        if (absDev >= 10) return pick(['This is a mild variation; monitor and correlate with any symptoms.','A small deviation; keep an eye on it and review with your doctor if symptoms appear.']);
        return pick(['This is very close to the midpoint of the reference range and is generally not concerning.','A small, expected variation — usually not clinically significant.']);
    };

    const degreeMl = (dev) => {
        if (dev === null) return 'വ്യാഖ്യാനം ക്ലിനിക്കൽ സാഹചര്യത്തെ ആശ്രയിച്ചിരിക്കുന്നു.';
        const absDev = Math.abs(Math.round(dev));
        if (absDev >= 80) return 'ഇത് വലിയ വ്യത്യാസമാണ്; ഡോക്ടറുടെ അടിയന്തര പരിശോധന ആവശ്യമാകും.';
        if (absDev >= 30) return 'ഈ വ്യത്യാസം മിതമാണ്; തുടർന്നുള്ള പരിശോധനാ നിർദ്ദേശം ലഭിക്കാം.';
        if (absDev >= 10) return 'ഇത് ചെറിയ വ്യത്യാസമാണ്; ലക്ഷണങ്ങൾ കാണുമെങ്കിൽ ശ്രദ്ധിക്കുക.';
        return 'ഇത് സാധാരണപരിധിക്കുള്ളിലെ സുപ്രധാനമല്ലാത്ത വ്യത്യാസമാണ്.';
    };

    const recEn = (dev) => pick([
        'If you have symptoms, seek medical advice; otherwise, consider repeating the test in a few weeks.',
        'Discuss these results with your healthcare provider to decide the next steps.',
        'No immediate action is usually required but check with your clinician for personalised guidance.'
    ]);

    const recMl = (dev) => pick([
        'ലക്ഷണങ്ങളുണ്ടെങ്കിൽ ഡോക്ടറെ കാണുക; അല്ലെങ്കിൽ ചിലവരത്തിൽ വീണ്ടും പരിശോധന ചെയ്യുക.',
        'ഈ ഫലങ്ങൾ നിങ്ങളുടെ ചികിത്സകനുമായി ചര്‍ച്ച ചെയ്യൂ.',
        'സാധാരണയായി തൽപരമായ നടപടി ആവശ്യമാണ് അല്ല, പക്ഷേ വ്യക്തിഗത നിര്‍ദേശത്തിന് ഡോക്ടറെ സമീപിക്കുക.'
    ]);

    // Parameter-specific note (small heuristics)
    const paramNoteEn = () => {
        const key = name.toLowerCase();
        if (key.includes('glucose') || key.includes('hba1c')) return pick(['Consider correlation with symptoms and recent meals; HbA1c gives long-term control.','Compare fasting vs post-prandial values and consider HbA1c for long-term control.']);
        if (key.includes('hdl') || key.includes('ldl') || key.includes('chol')) return pick(['Lipid values vary with recent diet and fasting state; consider overall cardiovascular risk.','Consider discussing diet, exercise and overall lipid profile with your clinician.']);
        if (key.includes('hemoglobin') || key.includes('hb')) return pick(['Hemoglobin can be affected by hydration, iron status, and menstrual status in females.','Consider iron studies or clinical correlation for anemia symptoms.']);
        return '';
    };

    const paramNoteMl = () => {
        const key = name.toLowerCase();
        if (key.includes('glucose') || key.includes('hba1c')) return 'ഭക്ഷണസ്ഥിതിയും HbA1c പോലുള്ള ദീര്‍ഘകാല സൂചകങ്ങളും പരിശോധിക്കുക.';
        if (key.includes('hdl') || key.includes('ldl') || key.includes('chol')) return 'ഭക്ഷണശീലിയിലും സമഗ്രമായ കാർഡിയോവാസ്‌കുലാർ റിസക്കിലും ഇത് പരിശോധിക്കുക.';
        if (key.includes('hemoglobin') || key.includes('hb')) return 'ഹീമോഗ്ലോബിൻ തരം വഴിപാടുകൾ അയവാകാം; അയർൺ സ്ഥിതി പരിശോധിക്കുക.';
        return '';
    };

    const openSentence = pick(opens[status]);
    const degreeSentence = lang === 'ml' ? degreeMl(deviation) : degreeEn(deviation);
    const paramSentence = lang === 'ml' ? paramNoteMl() : paramNoteEn();
    const recSentence = lang === 'ml' ? pick(recMl(deviation)) : recEn(deviation);

    // Occasionally add an age/sex contextual sentence
    let contextSentence = '';
    if (age && Math.random() < 0.4) {
        contextSentence = lang === 'ml'
            ? (age >= 65 ? 'മുതിര്‍ന്നവർക്കായി റഫറൻസ് മൂല്യങ്ങൾ വ്യത്യാസപ്പെടാം.' : (age <= 12 ? 'കുട്ടികളിൽ റഫറൻസ് വ്യത്യാസപ്പെടാം.' : 'പ്രായം ഫലങ്ങൾ പ്രകാരമുള്ളപ്പോൾ പ്രാധാന്യം വഹിക്കും.'))
            : (age >= 65 ? 'Reference ranges can differ in older adults.' : (age <= 12 ? 'Pediatric ranges may differ.' : 'Age can influence interpretation.'));
    }

    // Build the final explanation with gentle variation
    const parts = [openSentence];
    if (paramSentence) parts.push(paramSentence);
    parts.push(degreeSentence);
    if (contextSentence) parts.push(contextSentence);
    parts.push(recSentence);

    return parts.filter(Boolean).join(' ');
}

async function getExplanation(name, value, range = {}, patient = {}, lang = 'en') {
    // If environment forces local explanations, skip OpenAI
    if (process.env.LOCAL_ONLY_EXPLANATIONS === 'true') {
        return buildTemplateExplanation(name, value, range, patient, lang);
    }

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
