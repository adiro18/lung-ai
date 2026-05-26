import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import PredictPage from './pages/PredictPage';
import DashboardPage from './pages/DashboardPage';
import ContactPage from './pages/ContactPage';
import BehaviorPage from './pages/BehaviorPage';
import CombinedReportPage from './pages/CombinedReportPage';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans">
      <Navbar />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/behavior" element={<BehaviorPage />} />
        <Route path="/combined-report" element={<CombinedReportPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </div>
  );
}

export default App;
