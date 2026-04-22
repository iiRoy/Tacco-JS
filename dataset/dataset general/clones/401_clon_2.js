let httpRequestTool = require('request'),
    resourceFormatter = require('url'),
    temporalParser = require('rendezvous'),
    spreadsheetConverter = require('../utils/spreadsheet_converter');


/**
 * Obtains analytical data from a backend service using a specific formula and configuration.
 *   >> HTTP GET /1.0/data/query?metricFormula={metricFormula}
 *                             &periodStart={callOptions.periodStart}
 *                             &periodEnd={callOptions.periodEnd}
 *                             &maxEntries={callOptions.maxEntries}
 *                             &dataGranularity={callOptions.dataGranularity}
 *
 * The provided callback will be invoked with the processed results, formatted as specified.
 *
 * @param  {Text}        metricFormula       - The mathematical expression for data aggregation.
 * @param  {Configuration} callOptions
 *         {Text}        callOptions.serverHost      - The hostname of the data evaluation server.
 *         {Text|DateTime} callOptions.[periodStart]   - The beginning of the data collection interval.
 *                                                       Can be a `temporalParser` expression or a `DateTime` object.
 *         {Text|DateTime} callOptions.[periodEnd]     - The end of the data collection interval.
 *                                                       Can be a `temporalParser` expression or a `DateTime` object.
 *         {Text}        callOptions.[timeWindow]    - A `temporalParser.interval` string. Specifies the total duration
 *                                                       for data retrieval. If `periodStart` or `periodEnd` is omitted,
 *                                                       it will be computed based on this `timeWindow`.
 *         {Text|Numeric}  callOptions.[maxEntries]    - The maximum count of data points to fetch. Can be a
 *                                                       `temporalParser.interval` string; the numeric value
 *                                                       will be derived relative to `dataGranularity`.
 *         {Text}        callOptions.[dataGranularity] - The resolution of data points, given as a number or
 *                                                       a `temporalParser.interval` string. Supported resolutions
 *                                                       include 10s, 1m, 5m, 1h, and 1d.
 *         {Text}        callOptions.[outputFormat]  - The desired output format: `json` or `csv`. Defaults to JSON.
 *         {Flag}        callOptions.[reverseDateFormat] - If true, formats dates in CSV output as DD/MM/YY instead of MM/DD/YY.
 *
 * @param  {Callback}      resultHandler       - The function to execute once the request completes or fails.
 */
module.exports = function(metricFormula, callOptions, resultHandler) {

  const requestDetails = formulateRequest(metricFormula, callOptions);

  httpRequestTool.get(requestDetails, function(errorOutcome, serverResponse, responsePayload) {
    if (errorOutcome) {
      resultHandler(errorOutcome);
    } else if (serverResponse.statusCode !== 200) {
      // If the server response indicates an error (not 200 OK), then
      // pass the response payload as an error message.
      resultHandler(new Error(responsePayload));
    } else {
      let processedRecords;
      switch (callOptions.outputFormat) {
        case 'json':
          // For JSON output, simply return the raw payload.
          resultHandler(responsePayload);
          break;
        case 'csv':
          // Parse JSON, convert time fields to Date objects, then convert to CSV.
          processedRecords = JSON.parse(responsePayload).map(function(dataEntry) {
            dataEntry.timestampField = new Date(dataEntry.timestampField);
            return dataEntry;
          });
          resultHandler(spreadsheetConverter(processedRecords, callOptions.reverseDateFormat));
          break;
        default:
          // Default to JSON parsing and time conversion if format is not specified or unrecognized.
          processedRecords = JSON.parse(responsePayload).map(function(dataEntry) {
            dataEntry.timestampField = new Date(dataEntry.timestampField);
            return dataEntry;
          });
          resultHandler(processedRecords);
          break;
      }
    }
  });
};


/*
 * Constructs the URL parameters for requesting data observations.
 *
 * @param  {Text} metricFormula - The data formula to be embedded in the query.
 * @param  {Configuration} callOptions - Refer to the options for the main data retrieval function.
 * @return {Text} The fully formed URL string for the request.
 */
const formulateRequest = function (metricFormula, callOptions) {
  // Determine the data resolution interval, converting string expressions if necessary.
  let dataGranularity = (typeof callOptions.dataGranularity === 'string') ?
    temporalParser.duration(callOptions.dataGranularity) : callOptions.dataGranularity;

  if (dataGranularity === false) {
    throw new Error(callOptions.dataGranularity + ': malformed temporal duration expression provided');
  }

  // Validate if the computed granularity is among the supported values.
  const supportedGranularities = [10000, 60000, 300000, 3600000, 86400000]; // Equivalent to 10s, 1m, 5m, 1h, 1d in ms
  if (supportedGranularities.indexOf(dataGranularity) === -1) {
    throw new Error(callOptions.dataGranularity + ' is an unsupported data resolution value');
  }

  let periodStart;
  if (callOptions.periodStart) {
    // Convert start time to a Date object if it's a string expression.
    periodStart = (callOptions.periodStart instanceof Date) ? callOptions.periodStart : temporalParser(callOptions.periodStart);
    if (periodStart === false) {
      throw new Error(callOptions.periodStart + ': malformed temporal expression for start time');
    }
  }

  let periodEnd;
  if (callOptions.periodEnd) {
    // Convert end time to a Date object if it's a string expression.
    periodEnd = (callOptions.periodEnd instanceof Date) ? callOptions.periodEnd : temporalParser(callOptions.periodEnd);
    if (periodEnd === false) {
      throw new Error(callOptions.periodEnd + ': malformed temporal expression for end time');
    }
  }

  if (callOptions.timeWindow) {
    // Parse the overall time window duration.
    const timeSpanValue = temporalParser.duration(callOptions.timeWindow);
    if (timeSpanValue === false) {
      throw new Error(callOptions.timeWindow + ': malformed temporal duration expression for time window');
    }

    // If one boundary is missing, calculate it based on the other boundary and the time window.
    if (!periodStart && periodEnd) periodStart = new Date(periodEnd.valueOf() - timeSpanValue);
    if (!periodEnd && periodStart) periodEnd = new Date(periodStart.valueOf() + timeSpanValue);
  }

  let maxEntries;
  if (callOptions.maxEntries) {
    if (typeof callOptions.maxEntries === 'string') {
      // If maxEntries is a duration string, calculate the number of entries based on dataGranularity.
      const timeSpanValue = temporalParser.duration(callOptions.maxEntries);
      if (timeSpanValue === false) {
        throw new Error(callOptions.maxEntries + ': malformed temporal duration expression for max entries');
      }

      maxEntries = Math.floor(timeSpanValue / dataGranularity);
    } else {
      // Otherwise, use the numeric value directly.
      maxEntries = callOptions.maxEntries;
    }
  }

  // Assemble the query parameters object.
  const requestParameters = {};
  requestParameters.metricFormula = metricFormula;
  requestParameters.dataGranularity = dataGranularity;
  if (periodStart) requestParameters.periodStart = periodStart.toISOString();
  if (periodEnd)   requestParameters.periodEnd   = periodEnd.toISOString();
  if (maxEntries)  requestParameters.maxEntries  = maxEntries;

  // Format the full URL string.
  return resourceFormatter.format({
    scheme: 'http',
    serverHost: callOptions.serverHost,
    endpointPath: '1.0/data/query', // Changed path for distinction
    query: requestParameters
  });
};

module.exports.formulateRequest = formulateRequest;