import React, { useEffect, useState } from 'react';
import { compareLeads, createDownloadableCSV } from '../utils/csvComparer';

/**
 * Component to display lead comparison results between Facebook and HighLevel
 */
export default function LeadComparisonResult({ csv1, csv2 }) {
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [combinedCsvUrl, setCombinedCsvUrl] = useState(null);
  const [missingCsvUrl, setMissingCsvUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMissingLeads, setFilteredMissingLeads] = useState([]);

  useEffect(() => {
    // Only run comparison when both CSVs are available
    if (csv1.length > 0 && csv2.length > 0) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Assume csv1 is Facebook leads and csv2 is HighLevel leads
        const result = compareLeads(csv1, csv2);
        setComparisonResult(result);
        
        // Create downloadable CSVs if there are missing leads
        if (result.hasMissingLeads) {
          const missingCsv = createDownloadableCSV(
            result.missingLeads,
            'missing_facebook_leads.csv'
          );
          setMissingCsvUrl(missingCsv.url);

          const combinedCsv = createDownloadableCSV(
            result.combinedLeads,
            'combined_leads.csv'
          );
          setCombinedCsvUrl(combinedCsv.url);

          // Initialize filtered leads
          setFilteredMissingLeads(result.missingLeads);
        }
      } catch (err) {
        console.error('Error comparing leads:', err);
        setError('An error occurred while comparing the leads. Please check your CSV files.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setComparisonResult(null);
      setCombinedCsvUrl(null);
      setMissingCsvUrl(null);
      setFilteredMissingLeads([]);
    }
  }, [csv1, csv2]);

  // Filter missing leads based on search term
  useEffect(() => {
    if (comparisonResult && comparisonResult.missingLeads) {
      if (!searchTerm.trim()) {
        setFilteredMissingLeads(comparisonResult.missingLeads);
      } else {
        const filtered = comparisonResult.missingLeads.filter(lead => {
          return Object.values(lead).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
        setFilteredMissingLeads(filtered);
      }
    }
  }, [searchTerm, comparisonResult]);

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      if (combinedCsvUrl) URL.revokeObjectURL(combinedCsvUrl);
      if (missingCsvUrl) URL.revokeObjectURL(missingCsvUrl);
    };
  }, [combinedCsvUrl, missingCsvUrl]);

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-blue-200">Analyzing leads...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl border border-white/20 p-6">
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!comparisonResult) {
    return null;
  }

  const { missingLeads, hasMissingLeads } = comparisonResult;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Lead Comparison Results
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-blue-200">
            Facebook Leads: {csv1.length}
          </span>
          <span className="text-sm text-blue-200">
            HighLevel Leads: {csv2.length}
          </span>
        </div>
      </div>

      {hasMissingLeads ? (
        <div className="space-y-4">
          <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-amber-200">
                <p className="font-semibold mb-2">
                  Found {missingLeads.length} leads in Facebook that are missing from HighLevel.
                </p>
                <p className="text-sm">
                  These leads were matched by email and phone number. You can review all missing leads below,
                  download them separately, or download a combined CSV with all your existing HighLevel leads
                  plus the missing Facebook leads.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Missing Leads Download */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-medium mb-2">Missing Leads</h4>
              <p className="text-blue-200 text-sm mb-4">
                Download a CSV file containing only the leads that are in Facebook but missing from HighLevel.
              </p>
              <a 
                href={missingCsvUrl} 
                download="missing_facebook_leads.csv"
                className="inline-flex items-center px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Missing Leads
              </a>
            </div>

            {/* Combined CSV Download */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-medium mb-2">Combined Leads</h4>
              <p className="text-blue-200 text-sm mb-4">
                Download a CSV file containing all HighLevel leads plus the missing Facebook leads.
              </p>
              <a 
                href={combinedCsvUrl} 
                download="combined_leads.csv"
                className="inline-flex items-center px-4 py-2 bg-green-600/80 hover:bg-green-700/80 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Combined CSV
              </a>
            </div>
          </div>

          {/* Full Missing Leads Preview */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">All Missing Leads ({missingLeads.length})</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
                <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
                  {filteredMissingLeads.length} of {missingLeads.length}
                </span>
              </div>
            </div>
            <div className="max-h-96 overflow-auto border border-white/20 rounded-lg bg-black/20">
              {filteredMissingLeads.length > 0 ? (
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider border-r border-white/10">
                        #
                      </th>
                      {Object.keys(filteredMissingLeads[0] || missingLeads[0] || {}).map((key, i) => (
                        <th key={i} className="px-3 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider border-r border-white/10 last:border-r-0">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredMissingLeads.map((lead, i) => (
                      <tr key={i} className={`hover:bg-white/10 transition-colors ${i % 2 === 0 ? 'bg-white/5' : 'bg-black/10'}`}>
                        <td className="px-3 py-2 text-xs text-blue-300 font-mono border-r border-white/10">
                          {i + 1}
                        </td>
                        {Object.keys(lead).map((key, j) => (
                          <td key={j} className="px-3 py-2 text-sm text-gray-300 border-r border-white/10 last:border-r-0">
                            <div className="max-w-xs truncate" title={lead[key] || ''}>
                              {lead[key] || '-'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-400">No leads found matching "{searchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-blue-300 text-center">
              {searchTerm ? (
                <>Showing {filteredMissingLeads.length} of {missingLeads.length} leads matching "{searchTerm}"</>
              ) : (
                <>Total: {missingLeads.length} leads missing from HighLevel CRM</>
              )}
            </div>
          </div>

          {/* Combined Dataset Preview */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Combined Dataset Preview</h4>
              <span className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded">
                {comparisonResult.combinedLeads.length} total leads
              </span>
            </div>
            <div className="max-h-64 overflow-auto border border-white/20 rounded-lg bg-black/20">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider border-r border-white/10">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider border-r border-white/10">
                      Source
                    </th>
                    {Object.keys(comparisonResult.combinedLeads[0] || {}).slice(0, 4).map((key, i) => (
                      <th key={i} className="px-3 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider border-r border-white/10 last:border-r-0">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {comparisonResult.combinedLeads.slice(0, 10).map((lead, i) => {
                    const isFromFacebook = i >= csv2.length;
                    return (
                      <tr key={i} className={`hover:bg-white/10 transition-colors ${i % 2 === 0 ? 'bg-white/5' : 'bg-black/10'}`}>
                        <td className="px-3 py-2 text-xs text-blue-300 font-mono border-r border-white/10">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2 text-xs border-r border-white/10">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isFromFacebook
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {isFromFacebook ? 'Facebook' : 'HighLevel'}
                          </span>
                        </td>
                        {Object.keys(lead).slice(0, 4).map((key, j) => (
                          <td key={j} className="px-3 py-2 text-sm text-gray-300 border-r border-white/10 last:border-r-0">
                            <div className="max-w-xs truncate" title={lead[key] || ''}>
                              {lead[key] || '-'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-blue-300 text-center">
              Showing first 10 of {comparisonResult.combinedLeads.length} total leads
              ({csv2.length} from HighLevel + {missingLeads.length} from Facebook)
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">All Leads Are Synced!</h4>
          <p className="text-blue-200 text-sm">
            All Facebook leads are already present in your HighLevel CRM. No action needed.
          </p>
        </div>
      )}
    </div>
  );
}
