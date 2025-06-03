import React from 'react';

export default function ComparisonResult({ csv1, csv2, differences }) {
  const formatRowData = (data) => {
    if (!data) return 'No data';
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value || 'empty'}`)
      .join(', ');
  };

  if (csv1.length === 0 && csv2.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Comparison Results
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-blue-200">
            Total rows: {Math.max(csv1.length, csv2.length)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            differences.length === 0
              ? 'bg-green-500/20 text-green-300 border border-green-400/30'
              : 'bg-red-500/20 text-red-300 border border-red-400/30'
          }`}>
            {differences.length === 0 ? 'No differences' : `${differences.length} differences`}
          </span>
        </div>
      </div>

      {differences.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Files are identical!</h4>
          <p className="text-blue-200 text-sm">No differences were found between the two CSV files.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-3">
            <p className="text-sm text-amber-200">
              <strong>Found {differences.length} mismatched row{differences.length !== 1 ? 's' : ''}.</strong>
              Scroll through the results below to see the differences.
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto border border-white/20 rounded-lg bg-black/20">
            {differences.map((idx, index) => (
              <div
                key={idx}
                className={`p-4 border-b border-white/10 last:border-b-0 ${
                  index % 2 === 0 ? 'bg-white/5' : 'bg-black/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-red-300">
                    Row {idx + 1} Mismatch
                  </h5>
                  <span className="text-xs text-blue-300">
                    Difference #{index + 1}
                  </span>
                </div>

                <div className="grid gap-3">
                  <div className="bg-red-500/20 border border-red-400/30 rounded p-3">
                    <div className="text-xs font-medium text-red-300 mb-1">First CSV:</div>
                    <div className="text-sm text-red-200 font-mono break-all">
                      {formatRowData(csv1[idx])}
                    </div>
                  </div>

                  <div className="bg-blue-500/20 border border-blue-400/30 rounded p-3">
                    <div className="text-xs font-medium text-blue-300 mb-1">Second CSV:</div>
                    <div className="text-sm text-blue-200 font-mono break-all">
                      {formatRowData(csv2[idx])}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
