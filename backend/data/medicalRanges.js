const medicalRanges = {
    hemoglobin: { min: 13, max: 17, unit: "g/dL" },
    wbc: { min: 4000, max: 11000, unit: "cells" },
    glucose: { min: 70, max: 140, unit: "mg/dL" },
    platelets: { min: 150000, max: 450000, unit: "cells" }
};

module.exports = medicalRanges;