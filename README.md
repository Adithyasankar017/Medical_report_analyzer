# Medical Report Analyzer

A web application that helps users understand their medical reports with confidence. Simply upload a medical report (PDF or image) and get detailed, human-friendly explanations of each parameter detected - all before visiting a doctor.

![Medical Report Analyzer](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **Smart Report Analysis**: Upload PDF or image reports and get instant analysis
- **100+ Medical Tests Supported**: Comprehensive coverage of blood tests, lipid profiles, thyroid tests, and more
- **Human-Friendly Explanations**: Get clear, easy-to-understand explanations for each parameter
- **Reference Ranges**: Automatic comparison against normal medical reference values
- **Multi-Language Support**: Available in English and Malayalam
- **City Directory**: Find nearby doctors, hospitals, and labs in Trivandrum and Kochi
- **Print-Friendly**: Print or save your analysis results as PDF

## 🏗️ Architecture

```
medical-report-analyzer-frontend/
├── index.html              # Main landing page
├── results.html            # Analysis results display page
├── doctors.html           # Doctor directory page
├── hospitals.html         # Hospital directory page
├── labs.html              # Lab directory page
├── tests.html             # Medical tests reference page
├── css/
│   └── style.css          # Global stylesheet
├── js/
│   ├── script.js          # Frontend JavaScript
│   ├── data-trivandrum.js # Trivandrum city data
│   ├── data-kochi.js      # Kochi city data
│   └── data-utils.js      # Utility functions
├── backend/
│   ├── server.js          # Express server entry point
│   ├── package.json       # Backend dependencies
│   ├── routes/
│   │   └── analyzeRoute.js    # API endpoints for analysis
│   ├── services/
│   │   └── extractionService.js  # Medical parameter extraction
│   └── data/
│       ├── medicalRanges.js # Normal reference ranges
│       └── explanations.js   # Parameter explanations
└── uploads/               # Temporary file uploads
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

```
bash
git clone https://github.com/Adithyasankar017/Medical_report_analyzer.git
cd medical-report-analyzer-frontend
```

2. **Install frontend dependencies**

```
bash
npm install
```

3. **Install backend dependencies**

```
bash
cd backend
npm install
```

### Running the Application

1. **Start the backend server**

```
bash
cd backend
node server.js
```

The server will run on `http://localhost:5000`

2. **Open the application**

Open `index.html` in your browser, or navigate to `http://localhost:5000`

## 📖 Usage Guide

### Analyzing a Medical Report

1. **Select Your City**: Choose Trivandrum or Kochi from the dropdown
2. **Choose Language**: Select English or Malayalam
3. **Enter Patient Info** (Optional): Age and gender for more accurate interpretations
4. **Upload Report**: Click to upload a PDF, JPG, or PNG file
5. **Analyze**: Click "Analyze Report" to get your results

### Understanding Results

- **Green (Normal)**: Values are within the normal range
- **Yellow (Low)**: Values are below the normal range
- **Red (High)**: Values are above the normal range

Each result includes:
- Measured value with units
- Normal reference range
- Detailed explanation of what the parameter means

## 🏥 Supported Tests

### Blood & Haematology
- Hemoglobin, WBC, RBC, Platelets
- PCV/Hematocrit, MCV, MCH, MCHC
- Neutrophils, Lymphocytes, Monocytes, Eosinophils

### Diabetes Profile
- Fasting Blood Sugar (FBS)
- Post Prandial (PPBS)
- HbA1c
- Insulin, C-Peptide

### Lipid Profile
- Total Cholesterol
- Triglycerides
- HDL, LDL, VLDL

### Liver Function
- Bilirubin (Total, Direct, Indirect)
- SGOT/AST, SGPT/ALT
- Alkaline Phosphatase
- Total Protein, Albumin

### Kidney Function
- Serum Creatinine
- Blood Urea
- Uric Acid
- EGFR

### Thyroid Profile
- TSH, T3, T4
- Free T3, Free T4
- Anti-TPO Antibodies

### And 50+ more tests

## ⚠️ Disclaimer

This analysis is AI-generated and provided for informational purposes only. It is NOT a substitute for professional medical diagnosis, advice, or treatment. Always consult with a qualified healthcare professional before making any health-related decisions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

- **Adithya Sankar** - [GitHub](https://github.com/Adithyasankar017)

## 🙏 Acknowledgments

- Tesseract.js for OCR capabilities
- pdf-parse and pdfjs-dist for PDF processing
- All contributors who have helped improve this project

---

<p align="center">Made with ❤️ for better healthcare understanding</p>
