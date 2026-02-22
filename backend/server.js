const express = require("express");
const cors = require("cors");
const path = require("path");

const analyzeRoute = require("./routes/analyzeRoute");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve static files from parent directory (frontend HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

app.use("/api", analyzeRoute);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});