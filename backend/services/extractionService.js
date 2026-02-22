function extractParameters(text) {

    const parameters = [];

    const patterns = [
    // --- 1. HAEMATOLOGY ---
    { name: "hemoglobin_male", regex: /(hemoglobin|hgb|hb)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "hemoglobin_female", regex: /(hemoglobin|hgb|hb)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "wbc_total_count", regex: /(wbc|white blood cell|total leucocyte count|tlc)[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "platelet_count", regex: /(platelet|plt|thrombocyte)[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "rbc_count_male", regex: /(rbc|red blood cell|erythrocyte)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "rbc_count_female", regex: /(rbc|red blood cell|erythrocyte)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "pcv_hematocrit_male", regex: /(pcv|hematocrit|packed cell volume)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "pcv_hematocrit_female", regex: /(pcv|hematocrit|packed cell volume)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "mcv", regex: /(mcv|mean corpuscular volume)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "mch", regex: /(mch|mean corpuscular hemoglobin)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "mchc", regex: /(mchc)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "rdw_cv", regex: /(rdw-cv|rdw)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "absolute_neutrophil_count", regex: /(absolute neutrophil count|anc)[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "absolute_lymphocyte_count", regex: /(absolute lymphocyte count|alc)[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "absolute_monocyte_count", regex: /(absolute monocyte count|amoc)[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "absolute_eosinophil_count", regex: /(absolute eosinophil count|aec)[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "absolute_basophil_count", regex: /(absolute basophil count|abc)[^\d\n\r]*([0-9][0-9,\.\s]*)/i },
    { name: "neutrophils_percent", regex: /(neutrophils|polymorphs)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "lymphocytes_percent", regex: /(lymphocytes)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "monocytes_percent", regex: /(monocytes)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "eosinophils_percent", regex: /(eosinophils)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "basophils_percent", regex: /(basophils)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "esr_male", regex: /(esr|erythrocyte sedimentation rate)[^\d\n\r]*([0-9]+)/i },
    { name: "esr_female", regex: /(esr|erythrocyte sedimentation rate)[^\d\n\r]*([0-9]+)/i },
    { name: "reticulocyte_count", regex: /(reticulocyte count|retic)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 2. DIABETIC PROFILE ---
    { name: "glucose_fasting", regex: /(glucose fasting|fbs|fasting blood sugar)[^\d\n\r]*([0-9]+)/i },
    { name: "glucose_pp", regex: /(glucose pp|ppbs|post prandial blood sugar)[^\d\n\r]*([0-9]+)/i },
    { name: "glucose_random", regex: /(glucose random|rbs|random blood sugar)[^\d\n\r]*([0-9]+)/i },
    { name: "hba1c", regex: /(hba1c|glycosylated hemoglobin)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "avg_blood_glucose", regex: /(average blood glucose|eag)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "fructosamine", regex: /(fructosamine)[^\d\n\r]*([0-9]+)/i },
    { name: "insulin_fasting", regex: /(insulin fasting|fasting insulin)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "c_peptide", regex: /(c-peptide|c peptide)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urine_glucose", regex: /(urine glucose|sugar urine)[^\d\n\r]*([0-9]+)/i },

    // --- 3. RENAL FUNCTION ---
    { name: "serum_creatinine_male", regex: /(serum creatinine|creatinine|creat)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_creatinine_female", regex: /(serum creatinine|creatinine|creat)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "blood_urea", regex: /(blood urea|urea)[^\d\n\r]*([0-9]+)/i },
    { name: "bun", regex: /(bun|blood urea nitrogen)[^\d\n\r]*([0-9]+)/i },
    { name: "uric_acid_male", regex: /(uric acid)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "uric_acid_female", regex: /(uric acid)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "egfr_normal", regex: /(egfr|estimated gfr)[^\d\n\r]*([0-9]+)/i },
    { name: "cystatin_c", regex: /(cystatin c|cystatin-c)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urea_creatinine_ratio", regex: /(urea creatinine ratio|urea\/creatinine)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urine_creatinine", regex: /(urine creatinine)[^\d\n\r]*([0-9]+)/i },
    { name: "urine_microalbumin", regex: /(urine microalbumin|microalbuminuria)[^\d\n\r]*([0-9]+)/i },

    // --- 4. LIVER FUNCTION (LFT) ---
    { name: "bilirubin_total", regex: /(bilirubin total|t\. bilirubin|total bilirubin)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "bilirubin_direct", regex: /(bilirubin direct|d\. bilirubin|direct bilirubin)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "bilirubin_indirect", regex: /(bilirubin indirect|i\. bilirubin|indirect bilirubin)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "sgot_ast", regex: /(sgot|ast|aspartate aminotransferase)[^\d\n\r]*([0-9]+)/i },
    { name: "sgpt_alt", regex: /(sgpt|alt|alanine aminotransferase)[^\d\n\r]*([0-9]+)/i },
    { name: "alkaline_phosphatase", regex: /(alkaline phosphatase|alp|alk phos)[^\d\n\r]*([0-9]+)/i },
    { name: "gamma_gt", regex: /(gamma gt|ggt|gamma glutamyl transferase)[^\d\n\r]*([0-9]+)/i },
    { name: "total_protein", regex: /(total protein|serum protein)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_albumin", regex: /(serum albumin|albumin)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_globulin", regex: /(serum globulin|globulin)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "albumin_globulin_ratio", regex: /(albumin globulin ratio|a\/g ratio)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 5. LIPID PROFILE ---
    { name: "total_cholesterol", regex: /(total cholesterol|cholesterol)[^\d\n\r]*([0-9]+)/i },
    { name: "triglycerides", regex: /(triglycerides|tg)[^\d\n\r]*([0-9]+)/i },
    { name: "hdl_cholesterol", regex: /(hdl cholesterol|hdl)[^\d\n\r]*([0-9]+)/i },
    { name: "ldl_cholesterol", regex: /(ldl cholesterol|ldl)[^\d\n\r]*([0-9]+)/i },
    { name: "vldl_cholesterol", regex: /(vldl cholesterol|vldl)[^\d\n\r]*([0-9]+)/i },
    { name: "non_hdl_cholesterol", regex: /(non-hdl cholesterol|non hdl)[^\d\n\r]*([0-9]+)/i },
    { name: "cholesterol_hdl_ratio", regex: /(cholesterol hdl ratio|total cholesterol\/hdl)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ldl_hdl_ratio", regex: /(ldl hdl ratio|ldl\/hdl ratio)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 6. ELECTROLYTES ---
    { name: "sodium", regex: /(sodium|na\+)[^\d\n\r]*([0-9]+)/i },
    { name: "potassium", regex: /(potassium|k\+)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "chloride", regex: /(chloride|cl-)[^\d\n\r]*([0-9]+)/i },
    { name: "bicarbonate", regex: /(bicarbonate|hco3)[^\d\n\r]*([0-9]+)/i },
    { name: "ionized_calcium", regex: /(ionized calcium)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_calcium_total", regex: /(serum calcium|calcium)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_magnesium", regex: /(serum magnesium|magnesium)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_phosphorus", regex: /(serum phosphorus|phosphorus)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 7. THYROID PROFILE ---
    { name: "tsh", regex: /(tsh|thyroid stimulating hormone)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "total_t3", regex: /(total t3|triiodothyronine)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "total_t4", regex: /(total t4|thyroxine)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "free_t3", regex: /(free t3|ft3)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "free_t4", regex: /(free t4|ft4)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "anti_tpo_antibodies", regex: /(anti tpo antibodies|tpo ab)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "anti_thyroglobulin_abs", regex: /(anti thyroglobulin antibodies|atg)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 8. VITAMINS & MINERALS ---
    { name: "vitamin_d_25_hydroxy", regex: /(vitamin d 25 hydroxy|25-oh vitamin d)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "vitamin_b12", regex: /(vitamin b12|b12|cyanocobalamin)[^\d\n\r]*([0-9]+)/i },
    { name: "folate_serum", regex: /(folate serum|folic acid)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "vitamin_a", regex: /(vitamin a|retinol)[^\d\n\r]*([0-9]+)/i },
    { name: "vitamin_e", regex: /(vitamin e|tocopherol)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "serum_iron", regex: /(serum iron|iron)[^\d\n\r]*([0-9]+)/i },
    { name: "serum_ferritin_male", regex: /(serum ferritin|ferritin)[^\d\n\r]*([0-9]+)/i },
    { name: "serum_ferritin_female", regex: /(serum ferritin|ferritin)[^\d\n\r]*([0-9]+)/i },
    { name: "tibc", regex: /(tibc|total iron binding capacity)[^\d\n\r]*([0-9]+)/i },
    { name: "transferrin_saturation", regex: /(transferrin saturation)[^\d\n\r]*([0-9]+)/i },
    { name: "serum_zinc", regex: /(serum zinc|zinc)[^\d\n\r]*([0-9]+)/i },
    { name: "serum_copper", regex: /(serum copper|copper)[^\d\n\r]*([0-9]+)/i },

    // --- 9. CARDIAC MARKERS ---
    { name: "hs_crp", regex: /(hs-crp|high sensitivity crp)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "troponin_i", regex: /(troponin i|trop i)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "troponin_t", regex: /(troponin t|trop t)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ck_mb", regex: /(ck-mb|creatine kinase mb)[^\d\n\r]*([0-9]+)/i },
    { name: "cpk_total_male", regex: /(cpk total|creatine phosphokinase)[^\d\n\r]*([0-9]+)/i },
    { name: "cpk_total_female", regex: /(cpk total|creatine phosphokinase)[^\d\n\r]*([0-9]+)/i },
    { name: "nt_probnp", regex: /(nt-probnp|probnp)[^\d\n\r]*([0-9]+)/i },
    { name: "homocysteine", regex: /(homocysteine)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ldh", regex: /(ldh|lactate dehydrogenase)[^\d\n\r]*([0-9]+)/i },

    // --- 10. HORMONES ---
    { name: "testosterone_total_male", regex: /(testosterone total|total testosterone)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "testosterone_total_female", regex: /(testosterone total|total testosterone)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "prolactin_male", regex: /(prolactin|prl)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "prolactin_female", regex: /(prolactin|prl)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "estradiol_male", regex: /(estradiol|e2)[^\d\n\r]*([0-9]+)/i },
    { name: "progesterone_male", regex: /(progesterone)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "fsh_male", regex: /(fsh|follicle stimulating hormone)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "lh_male", regex: /(lh|luteinizing hormone)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "amh_female_fertile", regex: /(amh|anti mullerian hormone)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "cortisol_morning", regex: /(cortisol morning|s\. cortisol)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "dheas_male", regex: /(dheas)[^\d\n\r]*([0-9]+)/i },
    { name: "growth_hormone", regex: /(growth hormone|gh)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "acth", regex: /(acth|adrenocorticotropic hormone)[^\d\n\r]*([0-9]+)/i },

    // --- 11. TUMOR MARKERS ---
    { name: "psa_total", regex: /(psa total|total psa|prostate specific antigen)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "psa_free_ratio", regex: /(psa free ratio|free psa ratio)[^\d\n\r]*([0-9]+)/i },
    { name: "ca_125", regex: /(ca-125|cancer antigen 125)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ca_19_9", regex: /(ca 19-9|ca 19\.9)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "ca_15_3", regex: /(ca 15-3|ca 15\.3)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "afp", regex: /(afp|alpha fetoprotein)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "cea", regex: /(cea|carcinoembryonic antigen)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "beta_hcg_non_preg", regex: /(beta hcg|total hcg)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 12. COAGULATION ---
    { name: "prothrombin_time", regex: /(prothrombin time|pt)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "inr", regex: /(inr)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "aptt", regex: /(aptt|activated partial thromboplastin time)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "fibrinogen", regex: /(fibrinogen)[^\d\n\r]*([0-9]+)/i },
    { name: "bleeding_time", regex: /(bleeding time|bt)[^\d\n\r]*([0-9]+)/i },
    { name: "clotting_time", regex: /(clotting time|ct)[^\d\n\r]*([0-9]+)/i },
    { name: "d_dimer", regex: /(d-dimer|d dimer)[^\d\n\r]*([0-9]+)/i },

    // --- 13. PANCREATIC ---
    { name: "amylase_serum", regex: /(amylase serum|s\. amylase)[^\d\n\r]*([0-9]+)/i },
    { name: "lipase_serum", regex: /(lipase serum|s\. lipase)[^\d\n\r]*([0-9]+)/i },
    { name: "fecal_elastase", regex: /(fecal elastase)[^\d\n\r]*([0-9]+)/i },

    // --- 14. BONE & JOINT ---
    { name: "rheumatoid_factor", regex: /(rheumatoid factor|ra factor)[^\d\n\r]*([0-9]+)/i },
    { name: "anti_ccp", regex: /(anti ccp|anti-cyclic citrullinated peptide)[^\d\n\r]*([0-9]+)/i },
    { name: "ana_titer", regex: /(ana titer|ana by ifa)[^\d\n\r]*([0-9]+)/i },
    { name: "aslo_titer", regex: /(aslo titer|aslo)[^\d\n\r]*([0-9]+)/i },
    { name: "serum_osteocalcin", regex: /(serum osteocalcin)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 15. URINALYSIS ---
    { name: "urine_ph", regex: /(urine ph|ph urine)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urine_specific_gravity", regex: /(specific gravity|sp\. gravity)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "urine_protein", regex: /(urine protein|proteinuria)[^\d\n\r]*([0-9]+)/i },
    { name: "urine_urobilinogen", regex: /(urobilinogen)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },

    // --- 16. MISCELLANEOUS ---
    { name: "insulin_like_growth_factor_1", regex: /(igf-1|insulin like growth factor 1)[^\d\n\r]*([0-9]+)/i },
    { name: "ceruloplasmin", regex: /(ceruloplasmin)[^\d\n\r]*([0-9]+)/i },
    { name: "alpha_1_antitrypsin", regex: /(alpha 1 antitrypsin|a1at)[^\d\n\r]*([0-9]+)/i },
    { name: "complement_c3", regex: /(complement c3|c3)[^\d\n\r]*([0-9]+)/i },
    { name: "complement_c4", regex: /(complement c4|c4)[^\d\n\r]*([0-9]+)/i },
    { name: "ig_total_igg", regex: /(igg total|serum igg)[^\d\n\r]*([0-9]+)/i },
    { name: "ig_total_iga", regex: /(iga total|serum iga)[^\d\n\r]*([0-9]+)/i },
    { name: "ig_total_igm", regex: /(igm total|serum igm)[^\d\n\r]*([0-9]+)/i },
    { name: "total_ige", regex: /(total ige|ige total)[^\d\n\r]*([0-9]+)/i },
    { name: "gastrin", regex: /(gastrin)[^\d\n\r]*([0-9]+)/i },
    { name: "erythropoietin", regex: /(erythropoietin|epo)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i },
    { name: "pepsinogen_1", regex: /(pepsinogen 1|pepsinogen i)[^\d\n\r]*([0-9]+)/i },
    { name: "procalcitonin", regex: /(procalcitonin|pct)[^\d\n\r]*([0-9]+(?:[.,]\d+)?)/i }
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