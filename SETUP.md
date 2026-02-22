# Medical Report Analyzer - Setup & Integration Guide

## ✅ Integration Complete!

Your frontend and backend are now fully integrated. The system is ready to analyze medical reports with AI-powered explanations in English and Malayalam.

---

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm install  # if not already done
node server.js
```

The server will run on `http://localhost:5000`

### 2. Open the Frontend

Open `index.html` in your browser:
- Simply double-click `index.html` 
- Or use a local server: `python -m http.server 8000` (then visit `http://localhost:8000`)

---

## 📋 Features Integrated

### Frontend Features
✅ **File Upload** - Upload PDF, JPG, or PNG medical reports
✅ **Patient Information** - Optional age and gender for personalized explanations
✅ **Language Selection** - English (en) or Malayalam (ml)
✅ **Real-time Analysis** - Analyze reports immediately
✅ **Beautiful UI** - Glass-effect design with responsive layout
✅ **Result Display** - Color-coded results (Green=Normal, Orange=Low, Red=High)

### Backend Features
✅ **Image OCR** - Extract text from image-based medical reports using Tesseract.js
✅ **PDF Processing** - Extract text from text-based PDFs
✅ **Scanned PDF Support** - Canvas-based PDF page rendering + OCR for scanned documents (no Poppler required)
✅ **Parameter Detection** - Extracts 16+ medical parameters:
- Hemoglobin (Male/Female)
- WBC Count
- Glucose
- Platelets
- RBC Count (Male/Female)
- Hematocrit/PCV (Male/Female)
- MCV, MCH, MCHC
- Total Cholesterol
- Liver Enzymes (SGOT/AST)
- Clotting Time
- Erythropoietin

✅ **Personalized Explanations** - Tailored explanations based on:
- Parameter value vs. reference range
- Patient age (pediatric/geriatric notes)
- Patient gender (hemoglobin differences, etc.)
- Deviation severity (mild/moderate/large deviations)

✅ **Bilingual Support** - Return explanations in English or Malayalam

---

## 🔌 API Endpoints

### POST /api/analyze

**Request Format:**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "file=@report.pdf" \
  -F "age=27" \
  -F "sex=female" \
  -F "lang=en"
```

**Form Fields:**
| Field | Type | Required | Values |
|-------|------|----------|--------|
| `file` | File | Yes | PDF, JPG, PNG |
| `age` | Number | No | 1-120 |
| `sex` | String | No | male, female, other |
| `lang` | String | No | en (English), ml (Malayalam) |

**Response Example:**
```json
{
  "detectedParameters": [
    {
      "name": "hemoglobin_female",
      "value": 13.1,
      "unit": "g/dL",
      "normalRange": "12 - 16",
      "status": "Normal",
      "explanation": "Your hemoglobin_female (13.1 g/dL) is within the typical range... Females often have slightly lower hemoglobin than males."
    }
  ]
}
```

**Status Values:**
- `"Normal"` - Within reference range
- `"Low"` - Below reference range
- `"High"` - Above reference range

---

## 🎨 Frontend Form Fields

The `index.html` has been updated with:

1. **Language Selection**
   - English / Malayalam
   - Returned as `lang` parameter (en/ml)

2. **Patient Information** (Optional)
   - Age input (1-120)
   - Gender dropdown (male/female/other)
   - Personalize explanations based on patient profile

3. **File Upload**
   - PDF, JPG, PNG support
   - Drag-and-drop ready
   - Accepts both text and scanned documents

4. **Results Display**
   - Color-coded status indicators
   - Detailed explanations for each parameter
   - Medical disclaimer for user safety

---

## 📁 Project Structure

```
medical-report-analyzer-frontend/
├── backend/
│   ├── server.js                    # Express server
│   ├── routes/
│   │   └── analyzeRoute.js          # /api/analyze endpoint
│   ├── services/
│   │   └── extractionService.js     # Parameter extraction logic
│   └── data/
│       ├── medicalRanges.js         # Reference ranges for 16+ parameters
│       └── explanations.js          # Bilingual explanations (EN/ML)
│
├── index.html                       # Main frontend page
├── css/
│   └── style.css                    # Responsive styling
├── js/
│   ├── script.js                    # Data utilities
│   ├── data-kochi.js                # Kochi hospital/lab data
│   └── data-trivandrum.js           # Trivandrum hospital/lab data
│
├── package.json                     # Dependencies
└── uploads/                         # Sample test documents
```

---

## 🛠 Technologies Used

### Frontend
- HTML5, CSS3, JavaScript
- Responsive design with Flexbox & Grid
- Glass-effect UI with animations

### Backend
- **Node.js + Express** - Server framework
- **Tesseract.js** - OCR for image text extraction
- **pdf-parse & pdfjs-dist** - PDF text extraction
- **canvas** - PDF page rendering to images (scanned PDF support)
- **multer** - File upload handling
- **cors** - Cross-origin requests

### Dependencies
```json
{
  "cors": "^2.8.6",
  "express": "^5.2.1",
  "multer": "^2.0.2",
  "pdf-parse": "^2.4.5",
  "tesseract.js": "^7.0.0",
  "canvas": "^2.x.x"
}
```

---

## 🧪 Testing

### Test with Sample PDF
The `uploads/` folder contains a sample medical report. Test it:

```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "file=@./uploads/4a1d7f392e22bb540f1ea6b782633ead" \
  -F "age=27" \
  -F "sex=female" \
  -F "lang=ml"
```

### Expected Response
You should receive 15-16 detected parameters with Malayalam explanations.

---

## ⚙️ Configuration

### Change API URL (if needed)
Edit the `analyzeReport()` function in `index.html`:
```javascript
const response = await fetch("http://localhost:5000/api/analyze", {
```

### Add More Medical Parameters
1. Add parameter extraction in `backend/services/extractionService.js`
2. Add reference range in `backend/data/medicalRanges.js`
3. Add explanations in `backend/data/explanations.js`

### Extend to More Languages
In `backend/data/explanations.js`, add a new language block (following en/ml pattern):
```javascript
const baseYourLang = {
  Normal: "Your message in new language...",
  Low: "...",
  High: "..."
};
```

---

## 🚨 Common Issues & Solutions

### Issue: "Unsupported file type" error
**Solution:** Ensure your file is a valid PDF/JPG/PNG. Check MIME type is correct.

### Issue: "Error during OCR processing"
**Solution:** The image may be corrupted or too small. Try a different image.

### Issue: "No medical parameters detected"
**Solution:** The document doesn't contain standard medical test values. Check format matches expectations.

### Issue: Backend won't start
**Solution:** 
- Check port 5000 is not in use
- Run `npm install` in backend folder
- Ensure Node.js is installed (v18+)

### Issue: No CORS errors
**Solution:** Backend already has CORS enabled. If still issues, check frontend is sending from `http://localhost:*`

---

## 📊 Medical Parameters Supported

| Parameter | Unit | Normal Range (Males) | Normal Range (Females) |
|-----------|------|----------------------|------------------------|
| Hemoglobin | g/dL | 13.5 - 17.5 | 12 - 16 |
| WBC | cells/mcL | 4000 - 11000 | 4000 - 11000 |
| RBC | million/mcL | 4.5 - 5.9 | 4.1 - 5.1 |
| Hematocrit | % | 40 - 52 | 36 - 47 |
| MCV | fL | 80 - 100 | 80 - 100 |
| Platelets | cells/mcL | 150000 - 450000 | 150000 - 450000 |
| Blood Glucose | mg/dL | 70 - 100 | 70 - 100 |
| Total Cholesterol | mg/dL | 125 - 200 | 125 - 200 |
| *And 8+ more...* | | | |

---

## 📝 Notes & Disclaimers

⚠️ **IMPORTANT**: This tool provides AI-generated analysis for **educational and informational purposes only**. It is NOT a substitute for professional medical diagnosis or advice from qualified healthcare providers.

- Always consult a healthcare provider for proper medical interpretation
- Results are based on pattern recognition from the uploaded document
- Accuracy depends on document quality and legibility
- Never make medical decisions based solely on this analysis

---

## 📞 Support

For issues or questions:
1. Check server logs in terminal
2. Verify backend is running (`http://localhost:5000`)
3. Check browser developer console (F12) for frontend errors
4. Ensure all dependencies are installed (`npm install` in both root and backend)

---

## 🎯 Next Steps

1. **Customize** - Add more parameters and explanations as needed
2. **Deploy** - Move to production server (update API URL)
3. **Expand Language** - Add regional languages (Hindi, Tamil, etc.)
4. **Integrate Data** - Connect to actual hospital/lab data APIs
5. **Mobile App** - Wrap frontend in React Native or Flutter

---

**Happy analyzing! 🏥✨**
