const express = require("express");
const cors = require("cors");

const analyzeRoute = require("./routes/analyzeRoute");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api", analyzeRoute);

app.get("/", (req, res) => {
    res.send("Medical Backend Running Successfully 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});