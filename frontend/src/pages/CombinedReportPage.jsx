import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle, RefreshCcw, Download, Activity, ChevronRight, Info, FileDown } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const CombinedReportPage = () => {
    // CT scan state
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [ctResult, setCtResult] = useState(null);

    // Behavior state
    const [formData, setFormData] = useState({
        smoking_years: 0,
        cigarettes_per_day: 0,
        age: 30,
        pollution_exposure: 0
    });
    const [behaviorResult, setBehaviorResult] = useState(null);

    // Shared state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setCtResult(null);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
    };

    const handleRunBoth = async () => {
        if (!file) {
            setError("Please upload a CT scan image first.");
            return;
        }
        setLoading(true);
        setError(null);
        setCtResult(null);
        setBehaviorResult(null);

        try {
            // Run CT prediction
            const ctFormData = new FormData();
            ctFormData.append('file', file);
            const ctResponse = await axios.post('http://127.0.0.1:5000/api/predict', ctFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Run behavior risk
            const behaviorResponse = await axios.post('http://127.0.0.1:5000/api/risk', formData);

            setTimeout(() => {
                setCtResult(ctResponse.data);
                setBehaviorResult(behaviorResponse.data);
                setLoading(false);
            }, 800);
        } catch (err) {
            console.error(err);
            setError("Analysis failed. Ensure the backend is running.");
            setLoading(false);
        }
    };

    const bothReady = ctResult && behaviorResult;

    const getOverallRisk = () => {
        if (!bothReady) return null;
        const ctHigh = ctResult.risk_level === 'High';
        const bhHigh = behaviorResult.risk === 'High';
        const bhMed = behaviorResult.risk === 'Medium';
        if (ctHigh || bhHigh) return 'High';
        if (bhMed) return 'Moderate';
        return 'Low';
    };

    const downloadPDF = () => {
        if (!bothReady) return;
        const doc = new jsPDF();
        const overall = getOverallRisk();
        const now = new Date().toLocaleString();

        // Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('LungAI — Combined Diagnostic Report', 15, 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${now}`, 15, 28);
        doc.text('Confidential Medical Document', 15, 34);

        // Overall risk banner
        let y = 50;
        const riskColor = overall === 'High' ? [220, 38, 38] : overall === 'Moderate' ? [234, 179, 8] : [22, 163, 74];
        doc.setFillColor(...riskColor);
        doc.roundedRect(15, y, 180, 16, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Overall Risk Assessment: ${overall}`, 105, y + 10.5, { align: 'center' });

        // Section 1: CT Scan Analysis
        y = 78;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text('1. CT Scan Analysis (PCA-LDA Model)', 15, y);
        y += 4;
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.8);
        doc.line(15, y, 195, y);

        y += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        const ctLines = [
            ['Classification', ctResult.label === 'Normal' ? 'Non-Cancerous' : 'Cancer Detected'],
            ['Risk Level', ctResult.risk_level],
            ['Confidence Score', `${ctResult.confidence}%`],
        ];
        ctLines.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${label}:`, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 75, y);
            y += 8;
        });

        if (ctResult.recommendations) {
            y += 4;
            doc.setFont('helvetica', 'bold');
            doc.text('CT Recommendations:', 20, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            ctResult.recommendations.forEach((rec) => {
                const lines = doc.splitTextToSize(`• ${rec}`, 165);
                doc.text(lines, 25, y);
                y += lines.length * 6;
            });
        }

        // Section 2: Behavioral Analysis
        y += 8;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Behavioral / Lifestyle Risk Analysis', 15, y);
        y += 4;
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.8);
        doc.line(15, y, 195, y);

        y += 10;
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        const bhLines = [
            ['Risk Level', behaviorResult.risk],
            ['Risk Score', `${behaviorResult.score}`],
            ['Smoking Years', `${formData.smoking_years}`],
            ['Cigarettes / Day', `${formData.cigarettes_per_day}`],
            ['Age', `${formData.age}`],
            ['Pollution Exposure', `${formData.pollution_exposure}/10`],
        ];
        bhLines.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${label}:`, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 75, y);
            y += 8;
        });

        if (behaviorResult.recommendations) {
            y += 4;
            doc.setFont('helvetica', 'bold');
            doc.text('Lifestyle Recommendations:', 20, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            behaviorResult.recommendations.forEach((rec) => {
                const lines = doc.splitTextToSize(`• ${rec}`, 165);
                doc.text(lines, 25, y);
                y += lines.length * 6;
            });
        }

        // Footer
        y = 275;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(15, y, 195, y);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text('Disclaimer: This report is AI-generated and is not a substitute for professional medical advice.', 15, y + 5);
        doc.text('LungAI © 2026 — All rights reserved.', 15, y + 10);

        doc.save('LungAI_Combined_Report.pdf');
    };

    const sliders = [
        { name: 'smoking_years', label: 'Years of Smoking', min: 0, max: 50, step: 1 },
        { name: 'cigarettes_per_day', label: 'Cigarettes per Day', min: 0, max: 40, step: 1 },
        { name: 'age', label: 'Age', min: 18, max: 100, step: 1 },
        { name: 'pollution_exposure', label: 'Pollution Exposure (0-10)', min: 0, max: 10, step: 1, help: "Rate your daily exposure to pollution from 0 (Clean Air) to 10 (High Pollution)" },
    ];

    const overallRisk = getOverallRisk();

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 rounded-full mb-4">
                        <FileDown className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">Combined Diagnostic Report</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Combined Analysis & Report</h1>
                    <p className="text-gray-500 mt-2 max-w-xl mx-auto">Upload a CT scan and provide lifestyle data to generate a comprehensive combined report you can download as PDF.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* LEFT — CT Upload */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-blue-600" /> CT Scan Upload
                        </h3>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl h-56 flex flex-col items-center justify-center cursor-pointer transition-colors
                                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-slate-50'}
                                ${preview ? 'bg-gray-900 border-none relative overflow-hidden' : 'bg-white'}
                            `}
                        >
                            <input {...getInputProps()} />
                            {preview ? (
                                <img src={preview} alt="CT preview" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center p-6">
                                    <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <p className="text-gray-900 font-medium text-sm">Drag & drop CT scan here</p>
                                    <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT — Behavior Form */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-600" /> Behavioral Factors
                        </h3>
                        <div className="space-y-6">
                            {sliders.map((field) => (
                                <div key={field.name}>
                                    <div className="flex justify-between mb-1.5">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                            {field.label}
                                            {field.help && (
                                                <div className="group relative">
                                                    <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 bg-gray-800 text-xs text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                        {field.help}
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                        <span className="text-blue-600 font-bold text-sm">{formData[field.name]}</span>
                                    </div>
                                    <input
                                        type="range"
                                        name={field.name}
                                        min={field.min}
                                        max={field.max}
                                        step={field.step}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                                        <span>{field.min}</span>
                                        <span>{field.max}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RUN BUTTON */}
                <button
                    onClick={handleRunBoth}
                    disabled={!file || loading}
                    className={`w-full max-w-md mx-auto py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all mb-8 block
                        ${!file || loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 hover:shadow-blue-500/30'
                        }`}
                >
                    {loading ? (
                        <><RefreshCcw className="animate-spin h-5 w-5" /> Analyzing Both...</>
                    ) : (
                        <><FileText className="h-5 w-5" /> Run Combined Analysis</>
                    )}
                </button>

                {error && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {/* RESULTS */}
                <AnimatePresence>
                    {bothReady && !loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Overall Risk Banner */}
                            <div className={`rounded-2xl p-6 mb-8 text-center text-white font-bold text-xl shadow-lg ${
                                overallRisk === 'High' ? 'bg-gradient-to-r from-red-600 to-rose-500' :
                                overallRisk === 'Moderate' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900' :
                                'bg-gradient-to-r from-green-600 to-emerald-500'
                            }`}>
                                Overall Risk: {overallRisk}
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                {/* CT Result Card */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-blue-600" /> CT Scan Result
                                    </h3>
                                    <div className="flex flex-col items-center mb-6">
                                        <div className={`p-3 rounded-full mb-3 ${ctResult.label === 'Normal' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {ctResult.label === 'Normal'
                                                ? <CheckCircle className="h-10 w-10 text-green-600" />
                                                : <AlertTriangle className="h-10 w-10 text-red-600" />}
                                        </div>
                                        <h2 className={`text-2xl font-bold ${ctResult.label === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                                            {ctResult.label === 'Normal' ? 'Non-Cancerous' : 'Cancer Detected'}
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">Confidence: {ctResult.confidence}%</p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                        <div
                                            className={`h-2.5 rounded-full ${ctResult.label === 'Normal' ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${ctResult.confidence}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Behavior Result Card */}
                                <div className={`rounded-2xl shadow-xl border p-8 ${
                                    behaviorResult.risk === 'High' ? 'bg-red-50 border-red-100' :
                                    behaviorResult.risk === 'Medium' ? 'bg-yellow-50 border-yellow-100' :
                                    'bg-green-50 border-green-100'
                                }`}>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-emerald-600" /> Behavioral Risk
                                    </h3>
                                    <div className="text-center mb-4">
                                        <h2 className={`text-2xl font-bold ${
                                            behaviorResult.risk === 'High' ? 'text-red-600' :
                                            behaviorResult.risk === 'Medium' ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                            {behaviorResult.risk} Risk
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">Score: {behaviorResult.score}</p>
                                    </div>
                                    <div className="text-left bg-white/80 p-4 rounded-xl border border-gray-100">
                                        <h4 className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-wider">Recommendations</h4>
                                        <ul className="space-y-1.5 text-sm text-gray-600">
                                            {behaviorResult.recommendations && behaviorResult.recommendations.map((rec, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-blue-500">•</span> {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Download Button */}
                            <div className="text-center">
                                <button
                                    onClick={downloadPDF}
                                    className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg rounded-full shadow-xl hover:from-blue-700 hover:to-cyan-600 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1"
                                >
                                    <Download className="h-6 w-6" />
                                    Download Combined Report (PDF)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Running Combined Analysis</h3>
                        <p className="text-gray-500 mt-2 text-sm">Processing CT scan & behavioral data...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CombinedReportPage;
