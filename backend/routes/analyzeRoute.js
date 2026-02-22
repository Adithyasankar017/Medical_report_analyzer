const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

const extractParameters = require("../services/extractionService");
const medicalRanges = require("../data/medicalRanges");

const router = express.Router();

// Store file in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", upload.single("file"), async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        let text = "";

        // 📄 If PDF
        if (req.file.mimetype === "application/pdf") {
            const data = await pdfParse(req.file.buffer);
            text = data.text;
        }

        // 📷 If Image
        else if (req.file.mimetype.startsWith("image/")) {
            const result = await Tesseract.recognize(
                req.file.buffer,
                "eng"
            );
            text = result.data.text;
        }

        else {
            return res.status(400).json({ error: "Unsupported file type" });
        }

        console.log("Extracted Text:", text);

        const parameters = extractParameters(text);

        if (parameters.length === 0) {
            return res.json({ message: "No medical parameters detected" });
        }

        const analysis = parameters.map(param => {
            const range = medicalRanges[param.name];
            if (!range) return param;

            let status = "Normal";
            if (param.value < range.min) status = "Low";
            if (param.value > range.max) status = "High";

            return {
                name: param.name,
                value: param.value,
                unit: range.unit,
                normalRange: `${range.min} - ${range.max}`,
                status
            };
        });

        res.json({ detectedParameters: analysis });

    } catch (error) {
        console.error("Error analyzing report:", error);
        res.status(500).json({ error: "Error analyzing report" });
    }
});

module.exports = router;