import Papa from 'papaparse';

/**
 * CSV Comparison Utility for comparing Facebook Ads leads with HighLevel CRM leads
 *
 * This utility:
 * 1. Normalizes data from both sources
 * 2. Matches leads by email or phone number
 * 3. Identifies Facebook leads missing from HighLevel
 * 4. Creates a combined CSV with all leads
 */

/**
 * Normalizes email addresses for comparison
 * @param {string} email - Email address to normalize
 * @returns {string} Normalized email address
 */
const normalizeEmail = (email) => {
  if (!email) return '';
  return String(email).trim().toLowerCase();
};

/**
 * Normalizes phone numbers by removing non-digit characters
 * @param {string} phone - Phone number to normalize
 * @returns {string} Normalized phone number (digits only)
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
};

/**
 * Detects if a CSV is tab-delimited by checking the first line
 * @param {string} csvText - Raw CSV text content
 * @returns {boolean} True if tab-delimited, false otherwise
 */
const isTabDelimited = (csvText) => {
  const firstLine = csvText.split('\n')[0];
  return firstLine.includes('\t') && !firstLine.includes(',');
};

/**
 * Detects if a CSV is UTF-16 encoded
 * @param {File} file - CSV file to check
 * @returns {Promise<boolean>} True if UTF-16 encoded, false otherwise
 */
const isUTF16Encoded = async (file) => {
  // Read the first few bytes to check for UTF-16 BOM
  const buffer = await file.arrayBuffer();
  const view = new Uint8Array(buffer.slice(0, 2));
  
  // Check for UTF-16 BOM (0xFF 0xFE or 0xFE 0xFF)
  return (view[0] === 0xFF && view[1] === 0xFE) || 
         (view[0] === 0xFE && view[1] === 0xFF);
};

/**
 * Parses CSV data with appropriate encoding and delimiter detection
 * @param {File} file - CSV file to parse
 * @param {Function} callback - Callback function to receive parsed data
 */
const parseCSVWithEncoding = async (file, callback) => {
  const isUTF16 = await isUTF16Encoded(file);
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const delimiter = isTabDelimited(content) ? '\t' : ',';
    
    // Use PapaParse with detected delimiter
    Papa.parse(content, {
      header: true,
      delimiter: delimiter,
      skipEmptyLines: true,
      complete: callback
    });
  };
  
  // Use appropriate encoding based on detection
  if (isUTF16) {
    reader.readAsText(file, 'UTF-16');
  } else {
    reader.readAsText(file, 'UTF-8');
  }
};

/**
 * Compares Facebook leads with HighLevel leads to find missing entries
 * @param {Array} facebookLeads - Array of Facebook lead objects
 * @param {Array} highLevelLeads - Array of HighLevel lead objects
 * @returns {Object} Object containing missing leads and combined data
 */
const compareLeads = (facebookLeads, highLevelLeads) => {
  // Determine field mappings
  const fbEmailField = determineField(facebookLeads[0], ['email', 'Email', 'EMAIL']);
  const fbPhoneField = determineField(facebookLeads[0], ['phone_number', 'phone', 'Phone', 'PHONE']);
  const fbNameField = determineField(facebookLeads[0], ['full_name', 'name', 'Name', 'FULL_NAME']);
  
  const hlEmailField = determineField(highLevelLeads[0], ['Email', 'email', 'EMAIL']);
  const hlPhoneField = determineField(highLevelLeads[0], ['Phone', 'phone', 'PHONE']);
  
  // Normalize HighLevel leads for lookup
  const highLevelMap = new Map();
  highLevelLeads.forEach(lead => {
    const email = normalizeEmail(lead[hlEmailField]);
    const phone = normalizePhone(lead[hlPhoneField]);
    
    if (email) highLevelMap.set(email, lead);
    if (phone) highLevelMap.set(phone, lead);
  });
  
  // Find missing leads
  const missingLeads = [];
  
  facebookLeads.forEach(fbLead => {
    const email = normalizeEmail(fbLead[fbEmailField]);
    const phone = normalizePhone(fbLead[fbPhoneField]);
    
    // Check if this lead exists in HighLevel
    const existsByEmail = email && highLevelMap.has(email);
    const existsByPhone = phone && highLevelMap.has(phone);
    
    if (!existsByEmail && !existsByPhone) {
      missingLeads.push(fbLead);
    }
  });
  
  // Create combined dataset
  const combinedLeads = [...highLevelLeads];
  
  // Map Facebook fields to HighLevel format for missing leads
  missingLeads.forEach(fbLead => {
    const mappedLead = mapFacebookToHighLevel(fbLead, highLevelLeads[0], {
      fbEmailField,
      fbPhoneField,
      fbNameField,
      hlEmailField,
      hlPhoneField
    });
    combinedLeads.push(mappedLead);
  });
  
  return {
    missingLeads,
    combinedLeads,
    hasMissingLeads: missingLeads.length > 0
  };
};

/**
 * Determines the appropriate field name from a list of possible names
 * @param {Object} obj - Object to check for field names
 * @param {Array} possibleNames - Array of possible field names
 * @returns {string} The matching field name or first possible name
 */
const determineField = (obj, possibleNames) => {
  if (!obj) return possibleNames[0];
  
  for (const name of possibleNames) {
    if (obj.hasOwnProperty(name)) {
      return name;
    }
  }
  
  return possibleNames[0];
};

/**
 * Maps a Facebook lead to HighLevel format
 * @param {Object} fbLead - Facebook lead object
 * @param {Object} hlTemplate - HighLevel lead template
 * @param {Object} fieldMap - Mapping of field names
 * @returns {Object} Mapped lead in HighLevel format
 */
const mapFacebookToHighLevel = (fbLead, hlTemplate, fieldMap) => {
  const { fbEmailField, fbPhoneField, fbNameField } = fieldMap;
  const mappedLead = {};
  
  // Initialize with empty values for all HighLevel fields
  Object.keys(hlTemplate).forEach(key => {
    mappedLead[key] = '';
  });
  
  // Map known fields
  mappedLead['Email'] = fbLead[fbEmailField] || '';
  mappedLead['Phone'] = fbLead[fbPhoneField] || '';
  
  // Handle name fields
  if (fbLead[fbNameField]) {
    const nameParts = fbLead[fbNameField].split(' ');
    if (nameParts.length > 0) {
      mappedLead['First Name'] = nameParts[0] || '';
      mappedLead['Last Name'] = nameParts.slice(1).join(' ') || '';
    }
  }
  
  // Add a tag to indicate this is from Facebook
  if (mappedLead.hasOwnProperty('Tags')) {
    mappedLead['Tags'] = 'Facebook Lead';
  }
  
  return mappedLead;
};

/**
 * Converts an array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @returns {string} CSV string
 */
const convertToCSV = (data) => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return value.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Creates a downloadable CSV blob
 * @param {Array} data - Array of objects to convert to CSV
 * @param {string} filename - Name of the file to download
 * @returns {Blob} CSV blob
 */
const createDownloadableCSV = (data, filename) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  return {
    blob,
    url: URL.createObjectURL(blob),
    filename
  };
};

export {
  parseCSVWithEncoding,
  compareLeads,
  createDownloadableCSV
};
