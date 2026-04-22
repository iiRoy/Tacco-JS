"use strict";

const statisticsModule = require('../lib/ga');

// A utility function to transform a Node.js-style callback function into a Promise-based one.
const wrapAsPromise = (callbackFunction) => {
  return function(...args) {
    return new Promise((resolveResult, rejectError) => {
      callbackFunction.apply(this, [...args, (errorOutcome, successOutcome) => {
        if (errorOutcome) rejectError(errorOutcome);
        else resolveResult(successOutcome);
      }]);
    });
  };
};

// Centralized configuration for report generation.
const reportConfiguration = Object.freeze({
  reportIdentifier: '', // Corresponds to 'profile'
  accessUser: '',     // Corresponds to 'username'
  accessCredential: ''  // Corresponds to 'password'
});

// Defines the data points to be used as dimensions in the analytics query.
const measurementAspects = Object.freeze([
  'ga:date'
]);

// Defines the quantitative data points (metrics) to be retrieved.
const performanceIndicators = Object.freeze([
  'ga:pageviews',
  'ga:visitors',
  'ga:transactions',
  'ga:transactionRevenue'
]);

// Maps internal Google Analytics indicator names to user-friendly column labels for the output.
const indicatorLabels = Object.freeze({
    'ga:date': 'date',
    'ga:pageviews': 'pageviews',
    'ga:visitors': 'visitors',
    'ga:transactions': 'transactions',
    'ga:transactionRevenue': 'sales'
});

// Asynchronous function to orchestrate the data acquisition and output generation process.
async function orchestrateReportGeneration() {
  const analyticsClient = new statisticsModule.GA({
    user: reportConfiguration.accessUser,
    password: reportConfiguration.accessCredential
  });

  // Promisify the client's login and get methods for async/await usage.
  const clientAuthenticator = wrapAsPromise(analyticsClient.login.bind(analyticsClient));
  const dataFetcher = wrapAsPromise(analyticsClient.get.bind(analyticsClient));

  try {
    // Authenticate the client. The authentication key is not directly used but required for subsequent calls.
    await clientAuthenticator();

    // Construct the parameters for the analytics data query.
    const queryParameters = {
      'ids': `ga:${reportConfiguration.reportIdentifier}`,
      'start-date': '2012-07-01',
      'end-date': '2012-07-02',
      'dimensions': measurementAspects.join(','),
      'metrics': performanceIndicators.join(','),
      'sort': 'ga:date'
    };

    // Fetch the analytics data records.
    const retrievedRecords = await dataFetcher(queryParameters);

    // Generate the header row for the CSV output.
    const headerRow = [indicatorLabels['ga:date']]
      .concat(performanceIndicators.map(indicator => indicatorLabels[indicator]))
      .join(',');

    // Transform each retrieved record into a CSV data row.
    const dataRows = retrievedRecords.map(individualRecord => {
      const dateComponent = individualRecord.dimensions[0]['ga:date'];
      const metricComponents = performanceIndicators.map(indicator => individualRecord.metrics[0][indicator]);
      return [dateComponent].concat(metricComponents).join(',');
    });

    // Combine the header and all data rows, then print the complete CSV to standard output.
    const completeOutput = [headerRow].concat(dataRows).join('\n');
    process.stdout.write(completeOutput + '\n');

  } catch (operationIssue) {
    // If any error occurs during the process, print it to standard error.
    process.stderr.write(String(operationIssue) + '\n');
  }
}

// Initiate the data acquisition process.
orchestrateReportGeneration();