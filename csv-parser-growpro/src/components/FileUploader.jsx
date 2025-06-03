import React, { useState } from 'react';
import Papa from 'papaparse';

export default function FileUploader({ setCsv1, setCsv2 }) {
  const [file1Name, setFile1Name] = useState('');
  const [file2Name, setFile2Name] = useState('');

  const parseFile = (file, setter, setFileName) => {
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        complete: (results) => setter(results.data)
      });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 text-center">
        Upload CSV Files
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {/* First CSV File */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-100">
            First CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => parseFile(e.target.files[0], setCsv1, setFile1Name)}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-blue-600 file:text-white hover:file:from-purple-700 hover:file:to-blue-700 file:cursor-pointer cursor-pointer bg-white/5 backdrop-blur border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:bg-white/10 transition-all duration-200"
          />
          {file1Name && (
            <p className="text-sm text-green-300 font-medium">
              ✓ {file1Name}
            </p>
          )}
        </div>

        {/* Second CSV File */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-100">
            Second CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => parseFile(e.target.files[0], setCsv2, setFile2Name)}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-blue-600 file:text-white hover:file:from-purple-700 hover:file:to-blue-700 file:cursor-pointer cursor-pointer bg-white/5 backdrop-blur border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:bg-white/10 transition-all duration-200"
          />
          {file2Name && (
            <p className="text-sm text-green-300 font-medium">
              ✓ {file2Name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
