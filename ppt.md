# Medical Report Analyzer - Project Presentation

---

## Slide 1: Title

# Medical Report Analyzer

**A Web Application for Analyzing Medical Reports**

**Project Members:**
- Adithya Sankar (Team Lead & Developer)

**Roll No:** 17

**Institution:** [Your Institution Name]

**Year:** 2024-2025

---

## Slide 2: Content

## Table of Contents

1. Introduction
2. Problem Statement
3. Existing System & Limitations
4. Proposed System
5. SRS Requirements
6. System Design
7. Implementation
8. Results
9. Conclusion
10. Future Works
11. References

---

## Slide 3: Introduction

## Introduction

**Medical Report Analyzer** is a web application that helps users understand their medical reports with confidence.

### Key Features:
- **Smart Report Analysis**: Upload PDF or image reports and get instant analysis
- **100+ Medical Tests Supported**: Comprehensive coverage of blood tests, lipid profiles, thyroid tests, and more
- **Human-Friendly Explanations**: Get clear, easy-to-understand explanations for each parameter
- **Reference Ranges**: Automatic comparison against normal medical reference values
- **Multi-Language Support**: Available in English and Malayalam
- **City Directory**: Find nearby doctors, hospitals, and labs

---

## Slide 4: Problem Statement

## Problem Statement

### The Problem:
- Medical reports contain complex terminology and numerous parameters
- Patients often find it difficult to understand their test results
- Need to visit a doctor for basic understanding of reports
- Time-consuming to research each parameter online
- Language barriers in understanding medical terms

### The Solution:
An automated system that:
- Extracts medical parameters from reports using OCR
- Compares values against normal reference ranges
- Provides human-friendly explanations
- Makes healthcare information accessible to everyone

---

## Slide 5: Existing System & Limitations

## Existing System & Limitations

### Existing Systems:
- Hospital portals require registration and are specific to each hospital
- Third-party apps are often paid services
- Limited coverage of medical tests
- No multi-language support
- Complex user interfaces

### Limitations of Existing Systems:
- Not user-friendly for elderly patients
- Lack of comprehensive test coverage
- No integration with local healthcare directories
- High cost for premium features
- No offline support

---

## Slide 6: Proposed System

## Proposed System - Objectives

### Objectives:
1. **Easy Report Upload**: Support for PDF and image formats (JPG, PNG)
2. **Automatic Parameter Extraction**: OCR-based text extraction using Tesseract.js
3. **Smart Analysis**: Compare values against reference ranges
4. **Human-Friendly Explanations**: Simple language explanations for each parameter
5. **Multi-Language Support**: English and Malayalam
6. **Local Healthcare Directory**: Find doctors, hospitals, and labs in Trivandrum and Kochi

### Technology Stack:
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **OCR**: Tesseract.js
- **PDF Processing**: pdf-parse, pdfjs-dist

---

## Slide 7: SRS Requirements

## SRS - Software & Hardware Requirements

### Software Requirements:
| Component | Technology |
|-----------|------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| OCR Engine | Tesseract.js |
| PDF Parser | pdf-parse, pdfjs-dist |
| Server | Express.js (localhost:5000) |

### Hardware Requirements:
- **Processor**: Intel Core i3 or higher
- **RAM**: 4 GB minimum
- **Storage**: 500 MB for application
- **Display**: 1024x768 resolution or higher

### Dataset:
- 100+ medical test parameters with reference ranges
- Gender-specific reference values
- Comprehensive explanations in English and Malayalam

---

## Slide 8: System Design - Architecture

## System Design - Architecture

### Architecture: Client-Server Model

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend       │
│   (Browser)     │────────▶│   (Node.js)     │
│                 │  HTTP   │                 │
│  - index.html   │  POST   │  - /api/analyze │
│  - results.html │         │  - OCR Engine   │
│  - CSS/JS       │         │  - Text Parser  │
└─────────────────┘         └─────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │  Data Files     │
                           │  - medicalRanges│
                           │  - explanations  │
                           └─────────────────┘
```

---

## Slide 9: System Design - Data Flow

## System Design - Data Flow Diagram

### Level 0 (Context Diagram):
```
┌──────────────┐
│   User       │────────────────▶┌─────────────────┐
│              │    Upload       │   Medical       │
│              │    Report       │   Report        │
│              │◀─────────────── │   Analyzer      │
│              │    Results      │   System        │
└──────────────┘                 └─────────────────┘
```

### Level 1 (Process Flow):
1. User uploads medical report (PDF/Image)
2. Backend processes file (OCR/Text Extraction)
3. Extract medical parameters using regex patterns
4. Compare values with reference ranges
5. Generate explanations
6. Display results to user

---

## Slide 10: System Design - Database

## System Design - Database

### Data Files Structure:

#### 1. medicalRanges.js
```
javascript
{
  hemoglobin_male: { min: 13.5, max: 17.5, unit: "g/dL" },
  hemoglobin_female: { min: 12.0, max: 16.0, unit: "g/dL" },
  glucose_fasting: { min: 70, max: 100, unit: "mg/dL" },
  // ... 100+ parameters
}
```

#### 2. explanations.js
- Detailed explanations for each parameter
- Bilingual support (English/Malayalam)
- Status-specific interpretations (Normal/Low/High)

---

## Slide 11: System Design - Frontend

## System Design - Frontend

### Pages:
1. **index.html** - Main landing page
   - City selection (Trivandrum/Kochi)
   - Language selection (English/Malayalam)
   - Patient info input (Age/Gender)
   - File upload functionality

2. **results.html** - Analysis results
   - Parameter cards with status colors
   - Normal (Green), Low (Yellow), High (Red)
   - Detailed explanations
   - Print/Download options

3. **doctors.html, hospitals.html, labs.html** - Directory pages

---

## Slide 12: System Design - Backend

## System Design - Backend

### API Endpoints:

#### POST /api/analyze
- **Input**: FormData (file, age, sex, lang)
- **Process**:
  1. File type detection (PDF/Image)
  2. Text extraction (OCR/PDF parsing)
  3. Parameter extraction using regex
  4. Reference range comparison
  5. Explanation generation
- **Output**: JSON with detected parameters and analysis

### Services:
- **extractionService.js**: Regex-based parameter extraction
- **analyzeRoute.js**: API route handling and processing

---

## Slide 13: Implementation - OCR & Extraction

## Implementation - Algorithms

### Text Extraction Algorithm:
```
1. Check file type (PDF/Image)
2. If PDF:
   a. Try pdf-parse for text extraction
   b. Fallback to pdfjs-dist
   c. Fallback to canvas rendering + OCR
3. If Image:
   a. Validate image format
   b. Use Tesseract.js for OCR
   c. Extract text from image
```

### Parameter Extraction Algorithm:
```
1. Define regex patterns for 100+ medical tests
2. Apply patterns to extracted text
3. Extract numeric values
4. Return list of detected parameters
```

---

## Slide 14: Implementation - Code Snippets

## Implementation - Key Code

### Frontend Upload:
```
javascript
async function analyzeReport() {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("age", age);
  formData.append("sex", sex);
  formData.append("lang", lang);

  const response = await fetch("http://localhost:5000/api/analyze", {
    method: "POST",
    body: formData
  });
  
  const data = await response.json();
  sessionStorage.setItem('analysisResults', JSON.stringify(data.detectedParameters));
  window.location.href = 'results.html';
}
```

---

## Slide 15: Results

## Results

### Test Coverage:
- ✅ **100+ Medical Tests** supported
- Blood & Haematology (Hemoglobin, WBC, RBC, Platelets)
- Diabetes Profile (FBS, HbA1c, Insulin)
- Lipid Profile (Cholesterol, Triglycerides, HDL, LDL)
- Liver Function (SGOT, SGPT, Bilirubin)
- Kidney Function (Creatinine, Urea, Uric Acid)
- Thyroid Profile (TSH, T3, T4)
- And many more...

### Status Indicators:
- 🟢 **Normal**: Values within range
- 🟡 **Low**: Values below normal
- 🔴 **High**: Values above normal

---

## Slide 16: Results - Screenshots

## Results - Features

### Screenshot Descriptions:
1. **Home Page**: Clean UI with upload box, city/language selection
2. **Analysis Loading**: Animated loading indicator
3. **Results Page**: Color-coded parameter cards
4. **Directory Pages**: Lists of doctors, hospitals, labs

### Key Features Demonstrated:
- Multi-language support (English/Malayalam)
- Gender-specific reference ranges
- Print-friendly result pages
- User-friendly error messages

---

## Slide 17: Conclusion

## Conclusion

### Summary:
The Medical Report Analyzer successfully:
1. ✅ Accepts PDF and image uploads
2. ✅ Extracts text using OCR technology
3. ✅ Identifies 100+ medical parameters
4. ✅ Compares values against reference ranges
5. ✅ Provides human-friendly explanations
6. ✅ Supports bilingual (English/Malayalam)
7. ✅ Includes local healthcare directory

### Impact:
- Makes healthcare information accessible
- Reduces burden on healthcare system
- Empatients to understand their health
- Bridges language barriers in healthcare

---

## Slide 18: Future Works

## Future Works

### Enhancements:
1. **Mobile App**: Develop Android/iOS applications
2. **AI Predictions**: Add disease risk predictions
3. **Cloud Storage**: Save reports for historical comparison
4. **Doctor Consultation**: Integrate video consultation
5. **More Languages**: Add Hindi, Tamil, and other regional languages
6. **Appointment Booking**: Direct appointment scheduling
7. **Health Dashboard**: Track health trends over time
8. **Offline Mode**: PWA for offline functionality

---

## Slide 19: References

## References

### Technologies Used:
1. **Tesseract.js** - OCR for text extraction
   - https://tesseract.js.org/

2. **pdf-parse** - PDF text extraction
   - https://github.com/problemfirst/pdf-parse

3. **pdfjs-dist** - PDF.js for PDF rendering
   - https://mozilla.github.io/pdf.js/

4. **Express.js** - Node.js web framework
   - https://expressjs.com/

5. **Node.js** - JavaScript runtime
   - https://nodejs.org/

### Documentation:
- Project Repository: https://github.com/Adithyasankar017/Medical_report_analyzer

---

## Slide 20: Thank You

# Thank You!

## Questions?

**Project:** Medical Report Analyzer

**Developed by:** Adithya Sankar

**Contact:** [Your Email]

---

*Presentation generated for Academic Project Evaluation*
