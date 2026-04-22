// This module facilitates fetching analytical data from a remote service.
// It uses a custom client library to authenticate and retrieve specific metrics.

// Importing the core analytics client library.
const analyticsClientModule = require('../lib/ga');

// --- Configuration Parameters ---
// These values would typically be loaded from environment variables or a config file.
const serviceAccountIdentifier = ''; // Represents the GA property ID, e.g., 'UA-XXXXX-Y'
const authenticationUsername = '';   // User for API authentication
const authenticationSecret = '';     // Password/key for API authentication

// --- Initialize the Analytics Service Client ---
// Creates an instance of the analytics client with provided credentials.
const dataAggregationService = new analyticsClientModule.GA({
  user: authenticationUsername,
  password: authenticationSecret
});

// --- Data Query Definitions ---
// Defines the specific dimensions and metrics to be retrieved from the analytics service.
const requestedDataDimensions = [
  'ga:date' // Primary dimension: Date of data collection
];

const requestedDataMetrics = [
  'ga:pageviews',           // Total page views
  'ga:visitors',            // Unique visitors
  'ga:transactions',        // Number of e-commerce transactions
  'ga:transactionRevenue'   // Total revenue from transactions
];

/**
 * Helper function to format a date object into 'YYYY-MM-DD' string.
 * @param {Date} dateObj - The date object to format.
 * @returns {string} Formatted date string.
 */
const formatDateForQuery = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Main Execution Flow ---
// Attempts to authenticate with the analytics service.
dataAggregationService.login(function handleAuthenticationResponse(loginError, sessionToken) {
  // Guard clause: Check for authentication errors.
  if (loginError) {
    console.error('Authentication Failed:', loginError.message || 'Unknown login error.');
    // Optionally, exit the process or retry.
    return;
  }

  // Define the date range for the data query.
  // Using Date objects for manipulation, then formatting for the API.
  const queryStartDate = new Date('2012-07-01');
  const queryEndDate = new Date('2012-07-02');

  // Prepare the query configuration object.
  const reportQueryConfiguration = {
    'ids': `ga:${serviceAccountIdentifier}`, // Combine prefix with the account ID
    'start-date': formatDateForQuery(queryStartDate),
    'end-date': formatDateForQuery(queryEndDate),
    // Join dimension and metric arrays into comma-separated strings.
    'dimensions': requestedDataDimensions.join(','),
    'metrics': requestedDataMetrics.join(','),
    'sort': 'ga:date' // Ensure data is sorted by date
  };

  // Validate essential query parameters before making the request.
  if (!reportQueryConfiguration.ids || reportQueryConfiguration.ids === 'ga:') {
    console.error('Error: Analytics account identifier is missing or invalid.');
    return;
  }

  // Fetch the actual report data using the configured options.
  dataAggregationService.get(reportQueryConfiguration, function handleDataRetrieval(fetchError, reportRows) {
    // Another guard clause: Check for data retrieval errors.
    if (fetchError) {
      console.error('Data Retrieval Failed:', fetchError.message || 'Unknown data fetch error.');
      return;
    }

    // Check if any data was returned.
    if (!reportRows || reportRows.length === 0) {
      console.log('No data entries found for the specified query.');
      return;
    }

    // --- Output Processing ---
    // Define the header row for the CSV-like output.
    const outputHeader = ['date', 'pageviews', 'visitors', 'transactions', 'sales'];
    console.log(outputHeader.join(',')); // Print the header.

    // Iterate through each data entry (row) received from the analytics service.
    reportRows.forEach(function processIndividualRecord(dataRecord) {
      // Initialize the buffer for the current row's output.
      let currentOutputBuffer = '';

      // Extract the primary dimension (date) from the first dimension entry.
      // Assuming 'ga:date' is always the first dimension as per 'requestedDataDimensions'.
      const primaryDimensionValue = dataRecord.dimensions[0]['ga:date'];
      currentOutputBuffer += primaryDimensionValue;

      // Append each requested metric value to the buffer.
      requestedDataMetrics.forEach(function appendMetricValue(metricKey) {
        // Assuming metrics are also in the first entry of the metrics array.
        currentOutputBuffer += ',' + dataRecord.metrics[0][metricKey];
      });

      // Print the fully constructed row to the console.
      console.log(currentOutputBuffer);
    });
  });
});