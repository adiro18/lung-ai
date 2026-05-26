# LungAI: AI-Powered Lung Cancer Detection & Behavioral Analysis

LungAI is a comprehensive full-stack medical diagnostic tool designed for early detection of lung cancer. It combines computer vision for CT scan analysis with machine learning for behavioral risk assessment.

## 🚀 Key Features

*   **AI-Powered CT Analysis**: Uses a custom-trained model to analyze lung CT scans with 97.4% accuracy.
*   **Behavioral Risk Assessment**: A machine learning model that evaluates lifestyle factors (smoking, pollution, age) to estimate risk.
*   **Combined Diagnostic Report**: A unified interface that runs both analyses simultaneously and generates a professional PDF report.
*   **Real-time Insights**: A dashboard showing model performance metrics (Accuracy, Precision, Recall, F1 Score).
*   **Modern UX**: Built with React, Tailwind CSS, and Framer Motion for a premium, responsive experience.

## 🏗️ Technical Architecture

### Frontend (React + Vite)
*   **Framework**: React 19 with Vite for fast builds.
*   **State Management**: React Hooks (useState, useCallback).
*   **Styling**: Vanilla CSS & Tailwind CSS for modern aesthetics.
*   **Icons & Animations**: Lucide-React and Framer Motion.
*   **Data Visualization**: Recharts for the performance dashboard.
*   **PDF Generation**: `jspdf` for creating downloadable clinical reports.

### Backend (Flask)
*   **Server**: Python-based Flask API.
*   **Logic**:
    *   `/api/predict`: Processes CT scan images using the PCA-LDA model.
    *   `/api/risk`: Calculates behavioral risk based on lifestyle inputs.
    *   `/api/predict_behavior`: Alternative endpoint for advanced behavioral classification.

### Machine Learning Models
1.  **Image Model (PCA-LDA)**:
    *   **PCA (Principal Component Analysis)**: Used for high-dimensional feature extraction from CT scan images.
    *   **LDA (Linear Discriminant Analysis)**: Used for robust classification into "Normal" or "Cancerous" categories.
2.  **Behavioral Model**:
    *   A Scikit-learn model (`behavior_model.pkl`) trained on clinical data to identify high-risk lifestyle patterns.

## 📄 New Feature: Combined Report

The latest update adds a **Combined Report** page. This feature solves the fragmentation between scan data and lifestyle data by:
1.  Allowing a user to upload a scan **and** fill out a lifestyle form in one step.
2.  Aggregating the results into an **Overall Risk Level** (High, Moderate, Low).
3.  Generating a downloadable PDF that serves as a formal diagnostic summary, containing classification data, confidence scores, and specific medical recommendations for both segments.

## 🛠️ Project Structure

```text
lungAI/
├── app.py                  # Main Flask API
├── src/
│   ├── model.py            # Model loading and prediction logic
│   └── utils.py            # Risk calculation and recommendations
├── models/
│   ├── behavior_model.pkl  # Trained ML model for behavior
│   └── (image models)      # PCA-LDA weights/data
├── frontend/
│   ├── src/
│   │   ├── pages/          # Landing, Predict, Behavior, CombinedReport, Dashboard
│   │   ├── components/     # Navbar, UI elements
│   │   └── App.jsx         # Routing logic
│   └── package.json        # Frontend dependencies (jspdf, axios, etc.)
└── requirements.txt        # Python dependencies (flask, numpy, scikit-learn)
```
