const express = require("express");
const cors = require("cors");
const path = require("path");

// Load .env when present (safe local dev)
try { require('dotenv').config({ path: path.join(__dirname, '.env') }); } catch (e) { /* ignore if not installed */ }

const analyzeRoute = require("./routes/analyzeRoute");
const getExplanation = require('./data/explanations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from parent directory (frontend HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

app.use("/api", analyzeRoute);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Small health / AI test endpoint to verify AI explanations without file upload
app.get('/api/ai-test', async (req, res) => {
    try {
        // sample parameter for quick test
        const explanation = await getExplanation('glucose', 150, { min: 70, max: 110, unit: 'mg/dL' }, { age: 50, sex: 'male' }, 'en');
        res.json({ ok: true, explanation });
    } catch (err) {
        console.error('AI test failed:', err && err.message ? err.message : err);
        res.status(500).json({ ok: false, error: 'AI test failed', details: err && err.message ? err.message : String(err) });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});