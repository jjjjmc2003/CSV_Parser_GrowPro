import React, { useState } from 'react';
import ComparisonResult from './components/ComparisonResult';
import Papa from 'papaparse';
<img src="/grow_pro_agency_logo.jpg" alt="Grow Pro Agency" className="h-12 mb-4 mx-auto" />

export default function Home() {
  const [csv1, setCsv1] = useState([]);
  const [csv2, setCsv2] = useState([]);
  const [differences, setDifferences] = useState([]);
  const [file1Name, setFile1Name] = useState('');
  const [file2Name, setFile2Name] = useState('');
  const [hasCompared, setHasCompared] = useState(false);

  const handleCompare = () => {
    const diffs = [];
    const maxLength = Math.max(csv1.length, csv2.length);
    for (let i = 0; i < maxLength; i++) {
      if (JSON.stringify(csv1[i]) !== JSON.stringify(csv2[i])) {
        diffs.push(i);
      }
    }
    setDifferences(diffs);
    setHasCompared(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Gradient and Blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      <div className="absolute top-10 left-5 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-20 right-5 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-4 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl p-8">
        <div className="text-center mb-4">
          {/* Logo */}
          <img src="/grow_pro_agency_logo.jpg" alt="Grow Pro Logo" className="h-20 mx-auto" />
          </div>
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            CSV Comparison Tool
          </h1>
          <p className="text-lg text-blue-200">
            Upload two CSV files and compare their differences with ease
          </p>
          <p className="text-sm text-blue-200">
            For internal use only @ Grow Pro Agency
          </p>
        </div>

        {/* File Upload Section */}
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">First CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setFile1Name(e.target.files[0].name);
                    Papa.parse(e.target.files[0], {
                      header: true,
                      complete: (results) => setCsv1(results.data)
                    });
                  }
                }}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-blue-600 file:text-white hover:file:from-purple-700 hover:file:to-blue-700 file:cursor-pointer cursor-pointer bg-white/5 backdrop-blur border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:bg-white/10 transition-all duration-200"
              />
              {file1Name && (
                <p className="text-sm text-green-300 font-medium">✓ {file1Name}</p>
              )}
            </div>

            {/* Second File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">Second CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setFile2Name(e.target.files[0].name);
                    Papa.parse(e.target.files[0], {
                      header: true,
                      complete: (results) => setCsv2(results.data)
                    });
                  }
                }}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-blue-600 file:text-white hover:file:from-purple-700 hover:file:to-blue-700 file:cursor-pointer cursor-pointer bg-white/5 backdrop-blur border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:bg-white/10 transition-all duration-200"
              />
              {file2Name && (
                <p className="text-sm text-green-300 font-medium">✓ {file2Name}</p>
              )}
            </div>
          </div>

          {/* Compare Button Centered Below */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleCompare}
              disabled={csv1.length === 0 || csv2.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300/50"
            >
              Compare Files
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-10">
          {hasCompared && (
            <ComparisonResult csv1={csv1} csv2={csv2} differences={differences} />
          )}
        </div>
      </div>
    </div>
  );
}
