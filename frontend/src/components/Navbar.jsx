import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu, X, FileDown } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Activity className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                LungAI
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
                        <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</Link>
                        <Link to="/predict" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Predict Scan</Link>
                        <Link to="/behavior" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Behavior Analysis</Link>
                        <Link to="/combined-report" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"><FileDown className="h-4 w-4" />Combined Report</Link>
                        <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</Link>
                        <Link
                            to="/predict"
                            className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
                        >
                            Get Started
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-blue-600 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-md">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg">
                        <Link to="/" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">Home</Link>
                        <Link to="/about" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">About</Link>
                        <Link to="/predict" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">Predict Scan</Link>
                        <Link to="/behavior" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">Behavior Analysis</Link>
                        <Link to="/combined-report" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">Combined Report</Link>
                        <Link to="/contact" className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium">Contact</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
