function extractParameters(text) {

    const parameters = [];

    const patterns = [
    // --- VITAMINS & MINERALS (Higher Priority - More Specific) ---
    { name: "vitamin_d_25_hydroxy", regex: /(vitamin\s+d\s+25\s+hydroxy|25\s*-?\s*oh\s+vitamin\s+d|25\-hydroxycalciferol|cholecalciferol)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "vitamin_b12", regex: /(vitamin\s+b12|b\s*12|cyanocobalamin)[^\d\n\r]*([0-9]+)/i },
    { name: "folate_serum", regex: /(folate\s+serum|folic\s+acid|serum\s+folate)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_iron", regex: /(serum\s+iron|s\.\s*iron)[^\d\n\r]*([0-9]+)/i },
    { name: "serum_ferritin_male", regex: /(serum\s+ferritin|s\.\s*ferritin)\b[^\d\n\r]*([0-9]+)/i },
    { name: "serum_ferritin_female", regex: /(serum\s+ferritin|s\.\s*ferritin)\b[^\d\n\r]*([0-9]+)/i },
    { name: "serum_zinc", regex: /(serum\s+zinc|s\.\s*zinc)[^\d\n\r]*([0-9]+)/i },
    
    // --- 4. LIVER FUNCTION (LFT) - Second Priority ---
    { name: "bilirubin_total", regex: /(bilirubin\s+total|t\.\s*bilirubin|total\s+bilirubin)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "bilirubin_direct", regex: /(bilirubin\s+direct|d\.\s*bilirubin|direct\s+bilirubin)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "bilirubin_indirect", regex: /(bilirubin\s+indirect|i\.\s*bilirubin|indirect\s+bilirubin)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "sgot_ast", regex: /(sgot|ast|aspartate\s+aminotransferase)\b[^\d\n\r]*([0-9]+)/i },
    { name: "sgpt_alt", regex: /(sgpt|alt|alanine\s+aminotransferase)\b[^\d\n\r]*([0-9]+)/i },
    { name: "alkaline_phosphatase", regex: /(alkaline\s+phosphatase|alp|alk\s+phos)\b[^\d\n\r]*([0-9]+)/i },
    { name: "gamma_gt", regex: /(gamma\s+gt|ggt|gamma\s+glutamyl\s+transferase)[^\d\n\r]*([0-9]+)/i },
    { name: "total_protein", regex: /(total\s+protein|serum\s+protein)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_albumin", regex: /(serum\s+albumin|albumin)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_globulin", regex: /(serum\s+globulin|globulin)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "albumin_globulin_ratio", regex: /(albumin\s+globulin\s+ratio|a\s*\/\s*g\s+ratio|a\/g)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    
    // --- 1. HAEMATOLOGY ---
    { name: "hemoglobin_male", regex: /(hemoglobin|hgb|hb)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "hemoglobin_female", regex: /(hemoglobin|hgb|hb)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "wbc_total_count", regex: /(wbc|white\s+blood\s+cell|total\s+leucocyte\s+count|tlc)\b[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "platelet_count", regex: /(platelet|plt|thrombocyte)\b[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "rbc_count_male", regex: /(rbc|red\s+blood\s+cell|erythrocyte)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "rbc_count_female", regex: /(rbc|red\s+blood\s+cell|erythrocyte)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "pcv_hematocrit_male", regex: /(pcv|hematocrit|packed\s+cell\s+volume)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "pcv_hematocrit_female", regex: /(pcv|hematocrit|packed\s+cell\s+volume)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "mcv", regex: /(mcv|mean\s+corpuscular\s+volume)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "mch", regex: /(mch|mean\s+corpuscular\s+hemoglobin)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "mchc", regex: /(mchc)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "rdw_cv", regex: /(rdw\-cv|rdw)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "absolute_neutrophil_count", regex: /(absolute\s+neutrophil\s+count|anc)\b[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "absolute_lymphocyte_count", regex: /(absolute\s+lymphocyte\s+count)\b[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "absolute_monocyte_count", regex: /(absolute\s+monocyte\s+count|amoc)\b[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "absolute_eosinophil_count", regex: /(absolute\s+eosinophil\s+count|aec)\b[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "absolute_basophil_count", regex: /(absolute\s+basophil\s+count|abc)\b[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "neutrophils_percent", regex: /(neutrophils|polymorphs)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "lymphocytes_percent", regex: /(lymphocytes)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "monocytes_percent", regex: /(monocytes)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "eosinophils_percent", regex: /(eosinophils)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "basophils_percent", regex: /(basophils)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "esr_male", regex: /(esr|erythrocyte\s+sedimentation\s+rate)\b[^\d\n\r]*([0-9]+)/i },
    { name: "esr_female", regex: /(esr|erythrocyte\s+sedimentation\s+rate)\b[^\d\n\r]*([0-9]+)/i },
    { name: "reticulocyte_count", regex: /(reticulocyte\s+count|retic)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 2. DIABETIC PROFILE ---
    { name: "glucose_fasting", regex: /(glucose\s+fasting|fbs|fasting\s+blood\s+sugar)\b[^\d\n\r]*([0-9]+)/i },
    { name: "glucose_pp", regex: /(glucose\s+pp|ppbs|post\s+prandial\s+blood\s+sugar)\b[^\d\n\r]*([0-9]+)/i },
    { name: "glucose_random", regex: /(glucose\s+random|rbs|random\s+blood\s+sugar)\b[^\d\n\r]*([0-9]+)/i },
    { name: "hba1c", regex: /(hba1c|glycosylated\s+hemoglobin)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "avg_blood_glucose", regex: /(average\s+blood\s+glucose|eag)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "fructosamine", regex: /(fructosamine)\b[^\d\n\r]*([0-9]+)/i },
    { name: "insulin_fasting", regex: /(insulin\s+fasting|fasting\s+insulin)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "c_peptide", regex: /(c[\-\s]peptide)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urine_glucose", regex: /(urine\s+glucose|sugar\s+urine)\b[^\d\n\r]*([0-9]+)/i },

    // --- 3. RENAL FUNCTION ---
    { name: "serum_creatinine_male", regex: /(serum\s+creatinine|creatinine)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_creatinine_female", regex: /(serum\s+creatinine|creatinine)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "blood_urea", regex: /(blood\s+urea|urea)\b[^\d\n\r]*([0-9]+)/i },
    { name: "bun", regex: /(bun|blood\s+urea\s+nitrogen)\b[^\d\n\r]*([0-9]+)/i },
    { name: "uric_acid_male", regex: /(uric\s+acid)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "uric_acid_female", regex: /(uric\s+acid)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "egfr_normal", regex: /(egfr|estimated\s+gfr)\b[^\d\n\r]*([0-9]+)/i },
    { name: "cystatin_c", regex: /(cystatin\s+c|cystatin[\-\s]c)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urea_creatinine_ratio", regex: /(urea\s+creatinine\s+ratio|urea\/creatinine)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urine_creatinine", regex: /(urine\s+creatinine)\b[^\d\n\r]*([0-9]+)/i },
    { name: "urine_microalbumin", regex: /(urine\s+microalbumin|microalbuminuria)\b[^\d\n\r]*([0-9]+)/i },


    // --- 5. LIPID PROFILE ---
    { name: "total_cholesterol", regex: /(total\s+cholesterol|cholesterol)\b[^\d\n\r]*([0-9]+)/i },
    { name: "triglycerides", regex: /(triglycerides|tg)\b[^\d\n\r]*([0-9]+)/i },
    { name: "hdl_cholesterol", regex: /(hdl\s+cholesterol|hdl)\b[^\d\n\r]*([0-9]+)/i },
    { name: "ldl_cholesterol", regex: /(ldl\s+cholesterol|ldl)\b[^\d\n\r]*([0-9]+)/i },
    { name: "vldl_cholesterol", regex: /(vldl\s+cholesterol|vldl)\b[^\d\n\r]*([0-9]+)/i },
    { name: "non_hdl_cholesterol", regex: /(non[\-\s]hdl\s+cholesterol|non\s+hdl)\b[^\d\n\r]*([0-9]+)/i },
    { name: "cholesterol_hdl_ratio", regex: /(cholesterol\s+hdl\s+ratio|total\s+cholesterol\/hdl)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ldl_hdl_ratio", regex: /(ldl\s+hdl\s+ratio|ldl\/hdl\s+ratio)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 6. ELECTROLYTES ---
    { name: "sodium", regex: /(sodium|na\+)\b[^\d\n\r]*([0-9]+)/i },
    { name: "potassium", regex: /(potassium|k\+)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "chloride", regex: /(chloride|cl[\-\+])\b[^\d\n\r]*([0-9]+)/i },
    { name: "bicarbonate", regex: /(bicarbonate|hco3)\b[^\d\n\r]*([0-9]+)/i },
    { name: "ionized_calcium", regex: /(ionized\s+calcium)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_calcium_total", regex: /(serum\s+calcium|calcium\s+total|total\s+calcium)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_magnesium", regex: /(serum\s+magnesium|magnesium)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_phosphorus", regex: /(serum\s+phosphorus|phosphorus)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 7. THYROID PROFILE ---
    { name: "tsh", regex: /(tsh|thyroid\s+stimulating\s+hormone)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "total_t3", regex: /(total\s+t3|triiodothyronine)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "total_t4", regex: /(total\s+t4|thyroxine)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "free_t3", regex: /(free\s+t3|ft3)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "free_t4", regex: /(free\s+t4|ft4)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "anti_tpo_antibodies", regex: /(anti\s+tpo\s+antibodies|tpo\s+ab)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "anti_thyroglobulin_abs", regex: /(anti\s+thyroglobulin\s+antibodies|atg)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    { name: "vitamin_a", regex: /(vitamin\s+a|retinol)\b[^\d\n\r]*([0-9]+)/i },
    { name: "vitamin_e", regex: /(vitamin\s+e|tocopherol)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "tibc", regex: /(tibc|total\s+iron\s+binding\s+capacity)\b[^\d\n\r]*([0-9]+)/i },
    { name: "transferrin_saturation", regex: /(transferrin\s+saturation)\b[^\d\n\r]*([0-9]+)/i },
    { name: "serum_copper", regex: /(serum\s+copper|copper)\b[^\d\n\r]*([0-9]+)/i },

    // --- 9. CARDIAC MARKERS ---
    { name: "hs_crp", regex: /(hs[\-\s]crp|high\s+sensitivity\s+crp)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "troponin_i", regex: /(troponin\s+i|trop\s+i)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "troponin_t", regex: /(troponin\s+t|trop\s+t)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ck_mb", regex: /(ck[\-\s]mb|creatine\s+kinase\s+mb)\b[^\d\n\r]*([0-9]+)/i },
    { name: "cpk_total_male", regex: /(cpk\s+total|creatine\s+phosphokinase)\b[^\d\n\r]*([0-9]+)/i },
    { name: "cpk_total_female", regex: /(cpk\s+total|creatine\s+phosphokinase)\b[^\d\n\r]*([0-9]+)/i },
    { name: "nt_probnp", regex: /(nt[\-\s]probnp|probnp)\b[^\d\n\r]*([0-9]+)/i },
    { name: "homocysteine", regex: /(homocysteine)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ldh", regex: /(ldh|lactate\s+dehydrogenase)\b[^\d\n\r]*([0-9]+)/i },

    // --- 10. HORMONES ---
    { name: "testosterone_total_male", regex: /(testosterone\s+total|total\s+testosterone)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "testosterone_total_female", regex: /(testosterone\s+total|total\s+testosterone)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "prolactin_male", regex: /(prolactin|prl)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "prolactin_female", regex: /(prolactin|prl)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "estradiol_male", regex: /(estradiol|e2)\b[^\d\n\r]*([0-9]+)/i },
    { name: "progesterone_male", regex: /(progesterone)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "fsh_male", regex: /(fsh|follicle\s+stimulating\s+hormone)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "lh_male", regex: /(lh|luteinizing\s+hormone)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "amh_female_fertile", regex: /(amh|anti\s+mullerian\s+hormone)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "cortisol_morning", regex: /(cortisol\s+morning|s\.\s*cortisol)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "dheas_male", regex: /(dheas)\b[^\d\n\r]*([0-9]+)/i },
    { name: "growth_hormone", regex: /(growth\s+hormone|gh)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "acth", regex: /(acth|adrenocorticotropic\s+hormone)\b[^\d\n\r]*([0-9]+)/i },

    // --- 11. TUMOR MARKERS ---
    { name: "psa_total", regex: /(psa\s+total|total\s+psa|prostate\s+specific\s+antigen)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "psa_free_ratio", regex: /(psa\s+free\s+ratio|free\s+psa\s+ratio)\b[^\d\n\r]*([0-9]+)/i },
    { name: "ca_125", regex: /(ca[\-\s]125|cancer\s+antigen\s+125)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ca_19_9", regex: /(ca\s+19[\-\s]9|ca\s+19\.9)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ca_15_3", regex: /(ca\s+15[\-\s]3|ca\s+15\.3)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "afp", regex: /(afp|alpha\s+fetoprotein)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "cea", regex: /(cea|carcinoembryonic\s+antigen)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "beta_hcg_non_preg", regex: /(beta\s+hcg|total\s+hcg)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 12. COAGULATION ---
    { name: "prothrombin_time", regex: /(prothrombin\s+time)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "inr", regex: /(inr)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "aptt", regex: /(aptt|activated\s+partial\s+thromboplastin\s+time)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "fibrinogen", regex: /(fibrinogen)\b[^\d\n\r]*([0-9]+)/i },
    { name: "bleeding_time", regex: /(bleeding\s+time)\b[^\d\n\r]*([0-9]+)/i },
    { name: "clotting_time", regex: /(clotting\s+time)\b[^\d\n\r]*([0-9]+)/i },
    { name: "d_dimer", regex: /(d[\-\s]dimer|d\s+dimer)\b[^\d\n\r]*([0-9]+)/i },

    // --- 13. PANCREATIC ---
    { name: "amylase_serum", regex: /(amylase\s+serum|s\.\s*amylase)\b[^\d\n\r]*([0-9]+)/i },
    { name: "lipase_serum", regex: /(lipase\s+serum|s\.\s*lipase)\b[^\d\n\r]*([0-9]+)/i },
    { name: "fecal_elastase", regex: /(fecal\s+elastase)\b[^\d\n\r]*([0-9]+)/i },

    // --- 14. BONE & JOINT ---
    { name: "rheumatoid_factor", regex: /(rheumatoid\s+factor|ra\s+factor)\b[^\d\n\r]*([0-9]+)/i },
    { name: "anti_ccp", regex: /(anti\s+ccp|anti[\-\s]cyclic\s+citrullinated\s+peptide)\b[^\d\n\r]*([0-9]+)/i },
    { name: "ana_titer", regex: /(ana\s+titer|ana\s+by\s+ifa)\b[^\d\n\r]*([0-9]+)/i },
    { name: "aslo_titer", regex: /(aslo\s+titer|aslo)\b[^\d\n\r]*([0-9]+)/i },
    { name: "serum_osteocalcin", regex: /(serum\s+osteocalcin)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 15. URINALYSIS ---
    { name: "urine_ph", regex: /(urine\s+ph|ph\s+urine)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urine_specific_gravity", regex: /(specific\s+gravity|sp\.\s*gravity)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urine_protein", regex: /(urine\s+protein|proteinuria)\b[^\d\n\r]*([0-9]+)/i },
    { name: "urine_urobilinogen", regex: /(urobilinogen)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 16. MISCELLANEOUS ---
    { name: "insulin_like_growth_factor_1", regex: /(igf[\-\s]1|insulin\s+like\s+growth\s+factor\s+1)\b[^\d\n\r]*([0-9]+)/i },
    { name: "ceruloplasmin", regex: /(ceruloplasmin)\b[^\d\n\r]*([0-9]+)/i },
    { name: "alpha_1_antitrypsin", regex: /(alpha\s+1\s+antitrypsin|a1at)\b[^\d\n\r]*([0-9]+)/i },
    { name: "complement_c3", regex: /(complement\s+c3|c3)\b[^\d\n\r]*([0-9]+)/i },
    { name: "complement_c4", regex: /(complement\s+c4|c4)\b[^\d\n\r]*([0-9]+)/i },
    { name: "ig_total_igg", regex: /(igg\s+total|serum\s+igg)\b[^\d\n\r]*([0-9]+)/i },
    { name: "ig_total_iga", regex: /(iga\s+total|serum\s+iga)\b[^\d\n\r]*([0-9]+)/i },
    { name: "ig_total_igm", regex: /(igm\s+total|serum\s+igm)\b[^\d\n\r]*([0-9]+)/i },
    { name: "total_ige", regex: /(total\s+ige|ige\s+total)\b[^\d\n\r]*([0-9]+)/i },
    { name: "gastrin", regex: /(gastrin)\b[^\d\n\r]*([0-9]+)/i },
    { name: "erythropoietin", regex: /(erythropoietin|epo)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "pepsinogen_1", regex: /(pepsinogen\s+1|pepsinogen\s+i)\b[^\d\n\r]*([0-9]+)/i },
    { name: "procalcitonin", regex: /(procalcitonin|pct)\b[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i }
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