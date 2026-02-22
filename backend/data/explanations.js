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

    // Choose explanation format style based on parameter name
    const paramKey = name.toLowerCase();
    let formatStyle = 'default';
    if (paramKey.includes('glucose') || paramKey.includes('fbs') || paramKey.includes('ppbs') || paramKey.includes('hba1c')) formatStyle = 'glucose';
    else if (paramKey.includes('chol') || paramKey.includes('triglyceride') || paramKey.includes('ldl') || paramKey.includes('hdl')) formatStyle = 'lipid';
    else if (paramKey.includes('hemoglobin') || paramKey.includes('hb') || paramKey.includes('hct') || paramKey.includes('rbc')) formatStyle = 'blood';
    else if (paramKey.includes('creatinine') || paramKey.includes('urea') || paramKey.includes('bun')) formatStyle = 'kidney';
    else if (paramKey.includes('protein') || paramKey.includes('albumin')) formatStyle = 'protein';
    else if (paramKey.includes('enzyme') || paramKey.includes('ast') || paramKey.includes('alt') || paramKey.includes('ggt')) formatStyle = 'liver';

    // English variants - FORMAT DIVERSIFIED BY PARAMETER TYPE
    const opensEn = {
        glucose: {
            Normal: [
                `Your fasting glucose reading stands at ${value}${unit ? ' ' + unit : ''}, which is well-managed and within the desirable range.`,
                `Glucose control looks good: ${value}${unit ? ' ' + unit : ''} is in the target zone${min && max ? ` (${min}–${max}${unit ? ' ' + unit : ''})` : ''}.`,
                `The glucose test returned ${value}${unit ? ' ' + unit : ''} — a healthy result.`
            ],
            Low: [
                `Alert: Glucose is low at ${value}${unit ? ' ' + unit : ''} (normal range: ${min}–${max}${unit ? ' ' + unit : ''}). Hypoglycemia risk.`,
                `Attention needed — blood sugar dipped to ${value}${unit ? ' ' + unit : ''}, below the safe threshold.`
            ],
            High: [
                `Blood glucose elevated to ${value}${unit ? ' ' + unit : ''}, above the safe threshold of ${max}${unit ? ' ' + unit : ''}. Consider diabetes screening.`,
                `Glucose is running high at ${value}${unit ? ' ' + unit : ''}. This exceeds recommended levels and warrants dietary review.`
            ]
        },
        lipid: {
            Normal: [
                `Cholesterol and lipid profile look healthy. ${name.replace(/_/g, ' ')} measured at ${value}${unit ? ' ' + unit : ''} is in the desirable zone.`,
                `Good lipid news: ${name.replace(/_/g, ' ')} (${value}${unit ? ' ' + unit : ''}) is where we want it.`,
                `${name.replace(/_/g, ' ' )} is optimal at ${value}${unit ? ' ' + unit : ''} — cardiovascular health marker is positive.`
            ],
            Low: [
                `${name.replace(/_/g, ' ')} is low at ${value}${unit ? ' ' + unit : ''}. Discuss with your doctor, especially if HDL is concerned.`,
                `Lipid imbalance detected: ${name.replace(/_/g, ' ')} is ${value}${unit ? ' ' + unit : ''}, lower than ideal.`
            ],
            High: [
                `Lipid concern: ${name.replace(/_/g, ' ')} is elevated at ${value}${unit ? ' ' + unit : ''}, increasing cardiovascular risk.`,
                `${name.replace(/_/g, ' ')} at ${value}${unit ? ' ' + unit : ''} is above target. Diet and exercise modifications are recommended.`
            ]
        },
        blood: {
            Normal: [
                `Red blood cell markers are healthy. ${name.replace(/_/g, ' ')} is ${value}${unit ? ' ' + unit : ''} — strong oxygen-carrying capacity.`,
                `Hemoglobin and blood counts look normal: ${name.replace(/_/g, ' ')} = ${value}${unit ? ' ' + unit : ''}.`,
                `${name.replace(/_/g, ' ')} at ${value}${unit ? ' ' + unit : ''} indicates no anemia or blood disorder.`
            ],
            Low: [
                `Anemia alert: ${name.replace(/_/g, ' ')} is low at ${value}${unit ? ' ' + unit : ''} (normal: ${min}–${max}). Iron supplementation may be needed.`,
                `${name.replace(/_/g, ' ')} is below normal (${value}${unit ? ' ' + unit : ''}). Consider iron studies and B12 levels.`
            ],
            High: [
                `${name.replace(/_/g, ' ')} is elevated to ${value}${unit ? ' ' + unit : ''}. This could indicate dehydration or polycythemia. Recheck after hydration.`,
                `High count detected: ${name.replace(/_/g, ' ')} = ${value}${unit ? ' ' + unit : ''}. Follow up with your physician.`
            ]
        },
        kidney: {
            Normal: [
                `Kidney function is normal. ${name.replace(/_/g, ' ')} at ${value}${unit ? ' ' + unit : ''} indicates healthy filtration.`,
                `Great news on kidney health: ${name.replace(/_/g, ' ')} = ${value}${unit ? ' ' + unit : ''} (normal range).`,
            ],
            Low: [
                `${name.replace(/_/g, ' ')} is low at ${value}${unit ? ' ' + unit : ''}. Discuss with your nephrologist.`
            ],
            High: [
                `Kidney function may be compromised: ${name.replace(/_/g, ' ')} is high at ${value}${unit ? ' ' + unit : ''}. Urgent follow-up recommended.`,
                `Elevated ${name.replace(/_/g, ' ')} (${value}${unit ? ' ' + unit : ''}) suggests reduced kidney clearance. Refer to specialist.`
            ]
        },
        liver: {
            Normal: [
                `Liver enzymes are normal. ${name.replace(/_/g, ' ')} = ${value}${unit ? ' ' + unit : ''} shows no hepatic stress.`,
                `Liver health looks good: ${name.replace(/_/g, ' ')} at ${value}${unit ? ' ' + unit : ''} is in the safe range.`
            ],
            Low: [
                `${name.replace(/_/g, ' ')} is lower than expected at ${value}${unit ? ' ' + unit : ''}. Rare finding — discuss with your doctor.`
            ],
            High: [
                `Liver enzyme elevation detected: ${name.replace(/_/g, ' ')} is ${value}${unit ? ' ' + unit : ''}. Suggests hepatic inflammation or damage — urgent liver evaluation needed.`,
                `${name.replace(/_/g, ' ')} is significantly elevated at ${value}${unit ? ' ' + unit : ''}. Hepatitis or liver disease screening recommended.`
            ]
        },
        default: {
            Normal: [
                `${name.replace(/_/g, ' ')} is within normal limits at ${value}${unit ? ' ' + unit : ''}.`,
                `Test result for ${name.replace(/_/g, ' ')} looks good: ${value}${unit ? ' ' + unit : ''}.`,
                `${name.replace(/_/g, ' ')} (${value}${unit ? ' ' + unit : ''}) is in the healthy range.`
            ],
            Low: [
                `${name.replace(/_/g, ' ')} is low at ${value}${unit ? ' ' + unit : ''}. Monitor and seek medical advice.`,
                `Low reading: ${name.replace(/_/g, ' ')} = ${value}${unit ? ' ' + unit : ''}. Discuss with your clinician.`
            ],
            High: [
                `${name.replace(/_/g, ' ')} is elevated at ${value}${unit ? ' ' + unit : ''}. Follow-up may be needed.`,
                `High result: ${name.replace(/_/g, ' ')} = ${value}${unit ? ' ' + unit : ''}. Consult your healthcare provider.`
            ]
        }
    };

    // Malayalam variants - FORMAT DIVERSIFIED
    const opensMl = {
        glucose: {
            Normal: ['നിങ്ങളുടെ ഗ്ലൂക്കോസ് നിയന്ത്രണം നല്ലതാണ്: ' + value + (unit ? ' ' + unit : '') + ' സുരക്ഷിത പരിധിയിലാണ്.'],
            Low: ['ഗ്ലൂക്കോസ് വളരെ കുറവാണ്: ' + value + (unit ? ' ' + unit : '') + '। പ്രത്യേക ശ്രദ്ധയോടെ കാണുക.'],
            High: ['ഗ്ലൂക്കോസ് ഉയർന്നതാണ്: ' + value + (unit ? ' ' + unit : '') + '। ഡയബെറ്റീസ് സ്ക്രീനിംഗ് പരിഗണിക്കുക.']
        },
        lipid: {
            Normal: ['ലിപിഡ് പ്രൊഫൈൽ ആരോഗ്യകരമാണ്: ' + name + ' = ' + value + (unit ? ' ' + unit : '') + '.'],
            Low: [name + ' കുറവായിരിക്കുന്നു: ' + value + (unit ? ' ' + unit : '') + '.'],
            High: [name + ' ഉയർന്നതാണ്: ' + value + (unit ? ' ' + unit : '') + '। ഭക്ഷണരീതിയും വ്യായാമവും പരിഷ്കരിക്കൂ.']
        },
        blood: {
            Normal: ['രക്തസെല്ലുകൻ സൂചകങ്ങൾ ആരോഗ്യകരമാണ്: ' + name + ' = ' + value + (unit ? ' ' + unit : '') + '.'],
            Low: ['അനീമിയ സാധ്യത: ' + name + ' കുറവാണ് (' + value + (unit ? ' ' + unit : '') + ')। അയർൺ പരിഹാരം പരിഗണിക്കുക.'],
            High: [name + ' ഉയർന്നതാണ്: ' + value + (unit ? ' ' + unit : '') + '। വെള്ളം കുടിക്കുകയും വീണ്ടും പരിശോധിക്കുകയും ചെയ്യുക.']
        },
        default: {
            Normal: [name + ' സാധാരണ പരിധിയിലാണ്: ' + value + (unit ? ' ' + unit : '') + '.'],
            Low: [name + ' കുറവായിരിക്കുന്നു: ' + value + (unit ? ' ' + unit : '') + '.'],
            High: [name + ' ഉയർന്നതാണ്: ' + value + (unit ? ' ' + unit : '') + '.']
        }
    };

    const opens = lang === 'ml' ? opensMl[formatStyle] || opensMl.default : (opensEn[formatStyle] || opensEn.default);

    // Degree phrases - VARY BY FORMAT STYLE
    const degreeEn = (dev, style) => {
        if (dev === null) return pick(['Interpretation depends on clinical context.','Consult your clinician for proper assessment.']);
        const absDev = Math.abs(Math.round(dev));
        
        if (style === 'glucose') {
            if (absDev >= 80) return pick(['Diabetes risk is elevated — lifestyle changes and medication review needed.','This is a significant glucose elevation requiring medical monitoring.']);
            if (absDev >= 30) return pick(['Prediabetes range — diet and exercise are critical interventions.','Glucose control needs attention; consider HbA1c testing.']);
            if (absDev >= 10) return pick(['Slightly above target — watch your carbohydrate intake.','Minor elevation; monitor with repeat testing in 3 months.']);
            return 'Excellent glucose control.';
        }
        if (style === 'lipid') {
            if (absDev >= 80) return pick(['Severe lipid imbalance — cardiovascular risk is high.','Aggressive lipid management required; medication may be necessary.']);
            if (absDev >= 30) return pick(['Moderate lipid concern — diet and medication review needed.','This lipid level increases heart disease risk; action recommended.']);
            if (absDev >= 10) return pick(['Mild lipid elevation — dietary changes may help.','Near optimal; continue healthy lifestyle habits.']);
            return 'Lipid profile is optimal.';
        }
        if (style === 'blood') {
            if (absDev >= 80) return pick(['Severe blood abnormality — hematology referral urgently needed.','Critical anemia or blood disorder; immediate investigation required.']);
            if (absDev >= 30) return pick(['Moderate blood count abnormality — further investigation recommended.','Blood disorder suspected; additional testing is warranted.']);
            if (absDev >= 10) return pick(['Minor variation in blood counts; monitor closely.','Borderline result; recheck in 2-4 weeks.']);
            return 'Blood counts are healthy.';
        }
        if (style === 'kidney') {
            if (absDev >= 80) return pick(['Severe kidney function impairment — urgent nephrology referral.','End-stage kidney disease risk — emergency evaluation needed.']);
            if (absDev >= 30) return pick(['Moderate kidney dysfunction — specialist consultation advised.','Kidney function declining; medication and diet review critical.']);
            if (absDev >= 10) return pick(['Slight reduction in kidney function; monitor regularly.','Early kidney concern; check annually.']);
            return 'Kidney function is excellent.';
        }
        if (style === 'liver') {
            if (absDev >= 80) return pick(['Severe hepatic damage — cirrhosis or acute hepatitis likely.','Critical liver dysfunction — emergency referral required.']);
            if (absDev >= 30) return pick(['Significant liver inflammation — hepatitis screening needed.','Liver damage evident; alcohol cessation and imaging recommended.']);
            if (absDev >= 10) return pick(['Mild liver enzyme elevation; repeat testing advised.','Possible fatty liver or medication effect; monitor.']);
            return 'Liver function is normal.';
        }
        
        // Default
        if (absDev >= 80) return pick(['This is a marked difference from typical values.','Large deviation — urgent clinical review needed.']);
        if (absDev >= 30) return pick(['This is a moderate difference.','Moderate deviation — follow-up recommended.']);
        if (absDev >= 10) return pick(['This is a mild variation.','Small deviation; monitor.']);
        return 'Very close to normal.';
    };

    const degreeMl = (dev, style) => {
        if (dev === null) return 'വ്യാഖ്യാനം ക്ലിനിക്കൽ സാഹചര്യത്തെ ആശ്രയിച്ചിരിക്കുന്നു.';
        const absDev = Math.abs(Math.round(dev));
        
        if (style === 'glucose') {
            if (absDev >= 80) return 'ഡയബെറ്റീസ് അപകടം ഉപഭാഷിതം; ജീവിതരീതി പരിവർത്തനം ആവശ്യം.';
            if (absDev >= 30) return 'പ്രീ-ഡയബെറ്റീസ് പരിധി; ഭക്ഷണ നിയന്ത്രണം പ്രധാനം.';
            if (absDev >= 10) return 'ചെറിയ ഉയർച്ച; കാർബോഹൈഡ്രേറ്റ് കുറയ്ക്കുക.';
            return 'ഗ്ലൂക്കോസ് നിയന്ത്രണം ണ്ണാണമായിരിക്കുന്നു.';
        }
        if (style === 'lipid') {
            if (absDev >= 80) return 'ഗുരുതരമായ ലിപിഡ് അസന്തുലിതം; ഹൃദയ രോഗ അപകടം ഉയർന്നതാണ്.';
            if (absDev >= 30) return 'മിതമായ ലിപിഡ് ആശങ്ക; ഭക്ഷണ പരിവർത്തനം പരിഗണിക്കുക.';
            if (absDev >= 10) return 'മൃദു ലിപിഡ് ഉയർച്ച; ആരോഗ്യകരമായ ഭക്ഷണരീതി തുടരുക.';
            return 'ലിപിഡ് പ്രൊഫൈൽ അനുകൂലമാണ്.';
        }
        
        // Default ML
        if (absDev >= 80) return 'വലിയ വ്യത്യാസം; ത്വരിത ഡോക്ടർ സന്ദർശനം വേണം.';
        if (absDev >= 30) return 'മിതമായ വ്യത്യാസം; പുനരാവിഷ്കരണ ശുപാർശ.';
        if (absDev >= 10) return 'ചെറിയ വ്യത്യാസം; നിരീക്ഷിക്കുക.';
        return 'സാധാരണ പരിധിക്കടുത്ത്.';
    };

    const recEn = (dev, style) => {
        if (style === 'glucose') return pick(['Speak with your doctor about diet, exercise, and HbA1c targets.','Schedule a follow-up with your physician within 2 weeks.']);
        if (style === 'lipid') return pick(['Discuss statin therapy and dietary modifications with your cardiologist.','Begin or modify lipid-lowering medication and lifestyle changes.']);
        if (style === 'blood') return pick(['See a hematologist for further workup if symptoms persist.','Complete blood count retest is recommended in 4 weeks.']);
        if (style === 'kidney') return pick(['Consult a nephrologist and adjust medication doses accordingly.','Urinalysis and renal imaging may be needed.']);
        if (style === 'liver') return pick(['Get hepatitis serology and abdominal ultrasound done.','Avoid alcohol and hepatotoxic drugs; liver biopsy may be indicated.']);
        return pick(['Speak with your clinician about next steps.','Schedule a follow-up appointment to discuss findings.']);
    };

    const recMl = (dev, style) => {
        if (style === 'glucose') return 'നിങ്ങളുടെ ഡോക്ടറുമായി HbA1c ലക്ష്യങ്ങളിനെപ്പറ്റി സംസാരിക്കുക.';
        if (style === 'lipid') return 'കാർഡിയോളജിസ്റ്റുമായി ലിപിഡ് കുറയ്ക്കൽ ചികിത്സ പരിചയിക്കുക.';
        if (style === 'blood') return 'രക്തപരിശോധനയ്ക്കായി ഹെമാറ്റോലജിസ്റ്റിനെ കാണുക.';
        if (style === 'kidney') return 'ഒരു നെഫ്രോളജിസ്റ്റുമായി സംസാരിക്കൂ; മരുന്നുകൾ കൊഞ്ച് സായിയ്ക.';
        if (style === 'liver') return 'കരൾ പരിശോധനയ്ക്കായി ഗ്യാസ്ട്രോ പ്രത്യേഷ്വിസ്റ്റിനെ കാണുക.';
        return 'നിങ്ങളുടെ ഡോക്ടറുമായി അടുത്ത ഘട്ടങ്ങൾ ചര്‍ച്ച ചെയ്യുക.';
    };

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
    const degreeSentence = lang === 'ml' ? degreeMl(deviation, formatStyle) : degreeEn(deviation, formatStyle);
    const paramSentence = lang === 'ml' ? paramNoteMl() : paramNoteEn();
    const recSentence = lang === 'ml' ? recMl(deviation, formatStyle) : recEn(deviation, formatStyle);

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
