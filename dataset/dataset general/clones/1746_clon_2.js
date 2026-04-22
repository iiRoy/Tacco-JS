"use strict"; /* This directive enforces strict parsing and error handling. */

// Import the core analytics library from a relative path.
var analyticsModule = require  (
  '../lib/ga'
);

var accountID = '';  // Placeholder for the analytics account identifier.
var loginID = '';    // User credential for authentication.
var secretKey = '';  // Password or secret key for the user.

// Initialize the analytics client with user credentials.
var AnalyticsClient = new analyticsModule.GA( {
    user:     loginID,
    password: secretKey
  }
);


// Define the time-based categories for the report.
var timeCategories = [
  'ga:date'
];

// List of performance indicators to retrieve.
var performanceIndicators = [
  'ga:pageviews',
  'ga:visitors',
  'ga:transactions',
  'ga:transactionRevenue'
];

// Authenticate with the analytics service.
AnalyticsClient.authenticate(function(errorObject, sessionToken) {
  // If authentication fails, 'errorObject' will contain details.
  // 'sessionToken' is received upon successful authentication.

  var querySettings = {
    'ids':          'ga:' + accountID, // Target analytics account.
    'start-date':   '2012-07-01',      // Beginning of the report period.
    'end-date':     '2012-07-02',      // End of the report period.
    'dimensions':   timeCategories.join(','), // Comma-separated dimensions.
    'metrics':      performanceIndicators.join(','), // Comma-separated metrics.
    'sort':         'ga:date'          // Sort results by date.
  };

  // Fetch data using the defined query settings.
  AnalyticsClient.fetchData(querySettings, function(errorObject, reportRecords) {

    // Check if an error occurred during data retrieval.
    if (  !errorObject  ) {
      // Log the CSV header for the report.
      console.log('date,pageviews,visitors,transactions,sales');

      // Iterate through each record received.
      reportRecords.forEach(  function(recordItem) {
        // Initialize output buffer with the date dimension.
        var outputBuffer = recordItem.dimensions[0]['ga:date'];

        // Append each performance indicator to the buffer.
        performanceIndicators.forEach( function(indicator) {
          outputBuffer += ',' + recordItem.metrics[0][indicator];
        });

        // Print the complete row to the console.
        console.log(  outputBuffer  );

      } );
    } else {
      // Log the error if data retrieval failed.
      console.log(  errorObject  );
    }
  });
});