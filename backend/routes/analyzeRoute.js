const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

const extractParameters = require("../services/extractionService");
const medicalRanges = require("../data/medicalRanges");
const getExplanation = require("../data/explanations");

const router = express.Router();

// Store file in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", upload.single("file"), async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        let text = "";

        // 📄 If PDF (by mimetype or PDF file signature)
        const isPdfSignature = req.file.buffer && req.file.buffer.slice(0,4).toString() === '%PDF';
        if (req.file.mimetype === "application/pdf" || isPdfSignature) {
            // Support both CJS and ESM default exports from `pdf-parse` when available,
            // otherwise fall back to `pdfjs-dist` for text extraction.
            try {
                const pdfFn = (typeof pdfParse === 'function') ? pdfParse : (pdfParse && typeof pdfParse.default === 'function' ? pdfParse.default : null);
                if (pdfFn) {
                    const data = await pdfFn(req.file.buffer);
                    text = data && data.text ? data.text : '';
                } else {
                    throw new Error('pdf-parse not callable');
                }
            } catch (primaryErr) {
                // Try pdfjs-dist fallback, but do not throw — we'll fallback to rasterization if needed
                try {
                    const pdfjs = require('pdfjs-dist');
                    const uint8Array = new Uint8Array(req.file.buffer);
                    const loadingTask = pdfjs.getDocument({ data: uint8Array });
                    const pdfDoc = await loadingTask.promise;
                    let fullText = '';
                    for (let p = 1; p <= pdfDoc.numPages; p++) {
                        const page = await pdfDoc.getPage(p);
                        const content = await page.getTextContent();
                        const strings = content.items.map(i => i.str || '').join(' ');
                        fullText += '\n' + strings;
                    }
                    text = fullText;
                } catch (pdfjsErr) {
                    console.warn('PDF text extraction fallback failed:', primaryErr.message, pdfjsErr && pdfjsErr.message);
                    text = '';
                }
            }

            // If pdf extraction returned no meaningful text, attempt canvas-based page rendering + OCR
            if (!text || text.trim().length < 20) {
                try {
                    const { createCanvas } = require('canvas');
                    const pdfjs = require('pdfjs-dist');

                    const uint8Array = new Uint8Array(req.file.buffer);
                    const loadingTask = pdfjs.getDocument({ data: uint8Array });
                    const pdfDoc = await loadingTask.promise;

                    const worker = await Tesseract.createWorker('eng');
                    try {
                        let combined = '';
                        for (let p = 1; p <= pdfDoc.numPages; p++) {
                            const page = await pdfDoc.getPage(p);
                            const viewport = page.getViewport({ scale: 2 }); // 2x scale for better OCR

                            const canvas = createCanvas(viewport.width, viewport.height);
                            const context = canvas.getContext('2d');

                            const renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            };

                            await page.render(renderContext).promise;
                            const pngBuffer = canvas.toBuffer('image/png');

                            const { data } = await worker.recognize(pngBuffer);
                            combined += '\n' + (data && data.text ? data.text : '');
                        }
                        text = combined;
                    } finally {
                        try { await worker.terminate(); } catch (e) { /* ignore */ }
                    }
                } catch (err) {
                    console.error('Scanned-PDF fallback error (canvas rendering):', err);
                    // fall through to continue with empty/minimal text
                }
            }
        }

        // 📷 If Image
        else if (req.file.mimetype.startsWith("image/")) {
            const buf = req.file.buffer;

            // Basic validation: non-empty and minimum size
            if (!buf || !Buffer.isBuffer(buf) || buf.length < 512) {
                return res.status(400).json({ error: "Uploaded image is too small or empty" });
            }

            // Check common image signatures
            const isPng = buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
            const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
            const isGif = buf.slice(0, 3).toString() === 'GIF';
            const isBmp = buf.slice(0, 2).toString() === 'BM';

            if (!isPng && !isJpeg && !isGif && !isBmp) {
                return res.status(400).json({ error: "Uploaded image appears to be corrupted or an unsupported image format" });
            }

            let worker;
            try {
                worker = await Tesseract.createWorker('eng');
            } catch (createErr) {
                console.error('Failed to create OCR worker:', createErr);
                return res.status(500).json({ error: 'Failed to initialize OCR engine' });
            }

            try {
                const { data } = await worker.recognize(buf);
                text = data.text;
            } catch (ocrErr) {
                console.error("OCR error:", ocrErr);
                return res.status(500).json({ error: "OCR failed — image may be corrupted or unsupported" });
            } finally {
                try { await worker.terminate(); } catch (e) { /* ignore terminate errors */ }
            }
        }

        else {
            return res.status(400).json({ error: "Unsupported file type" });
        }

        console.log("Extracted Text:", text);

        const parameters = extractParameters(text);

        if (parameters.length === 0) {
            return res.json({ message: "No medical parameters detected" });
        }

        // Accept optional patient info and language preference from form fields
        const age = req.body.age ? parseInt(req.body.age, 10) : null;
        const sex = req.body.sex ? req.body.sex : null;
        const lang = req.body.lang || 'en'; // Default to English; accepts 'en' or 'ml' for Malayalam
        const sessionId = req.body.sessionId || req.headers['x-session-id'] || null;

        const analysis = await Promise.all(parameters.map(async (param) => {
            const range = medicalRanges[param.name];
            if (!range) return { name: param.name, value: param.value };

            let status = "Normal";
            if (param.value < range.min) status = "Low";
            if (param.value > range.max) status = "High";

            const explanation = await getExplanation(param.name, param.value, range, { age, sex, sessionId }, lang);

            return {
                name: param.name,
                value: param.value,
                unit: range.unit,
                normalRange: `${range.min} - ${range.max}`,
                status,
                explanation
            };
        }));

        res.json({ detectedParameters: analysis });

    } catch (error) {
        console.error("Error analyzing report:", error);
        res.status(500).json({ error: "Error analyzing report" });
    }
});

module.exports = router;