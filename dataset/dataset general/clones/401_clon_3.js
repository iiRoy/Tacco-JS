const httpClient = require('request');
const uriUtil = require('url');
const timeParser = require('rendezvous');
const dataToCsv = require('./tocsv');

/**
 * Parses the JSON body received from the API, ensuring it's an array,
 * and converts 'time' properties within each item to Date objects.
 *
 * @param {string} rawJsonBody - The raw JSON string from the API response.
 * @returns {Array<Object>} An array of objects where 'time' fields are Date instances.
 * @throws {Error} If the rawJsonBody is not valid JSON.
 */
const processTimeData = (rawJsonBody) => {
    let parsedData;
    try {
        parsedData = JSON.parse(rawJsonBody);
    } catch (parseError) {
        // Adding a new error handling fragment for JSON parsing
        console.error('Data processing error: Failed to parse JSON response.', parseError.message);
        throw new Error('Invalid JSON response format received from the service.');
    }

    // Ensure the parsed data is an array before attempting to map over it.
    // This adds robustness against unexpected API responses.
    if (!Array.isArray(parsedData)) {
        console.warn('API response content is not an array. Attempting to return as-is.');
        return parsedData;
    }

    // Use a functional approach to transform the array, creating new objects
    // to maintain immutability where possible.
    return parsedData.map(item => {
        if (item && item.time) {
            return { ...item, time: new Date(item.time) };
        }
        return item;
    });
};

/*
 * Dynamically constructs the full URI for fetching metrics from the Cube API.
 * This involves parsing various date/time and duration expressions from the options.
 *
 * @param {string} metricIdentifier - The identifier or expression for the metric.
 * @param {object} queryOptions     - Configuration options for the query.
 * @returns {string} The fully formed URI string ready for an HTTP GET request.
 * @throws {Error} If any time expression, resolution, or other critical parameter is invalid.
 */
const constructRequestUri = function(metricIdentifier, queryOptions) {
    // Validate and parse the metric resolution
    let resolutionMs = (typeof queryOptions.resolution === 'string')
        ? timeParser.duration(queryOptions.resolution)
        : queryOptions.resolution;

    if (resolutionMs === false || typeof resolutionMs !== 'number' || resolutionMs <= 0) {
        throw new Error(`Invalid metric resolution: "${queryOptions.resolution}". Expected a valid rendezvous duration string or a positive number.`);
    }

    // Using a Set for efficient lookup of supported resolutions (updated from Array.indexOf)
    const supportedResolutions = new Set([10000, 60000, 300000, 3600000, 86400000]); // Corresponds to 10s, 1m, 5m, 1h, 1d
    if (!supportedResolutions.has(resolutionMs)) {
        throw new Error(`Resolution "${queryOptions.resolution}" (${resolutionMs}ms) is not one of the explicitly supported Cube time intervals.`);
    }

    // Parse the start period for the query
    let startPeriod = null;
    if (queryOptions.periodStart) {
        startPeriod = (queryOptions.periodStart instanceof Date)
            ? queryOptions.periodStart
            : timeParser(queryOptions.periodStart); // 'timeParser' (rendezvous) can parse various date strings

        if (startPeriod === false || !(startPeriod instanceof Date)) {
            throw new Error(`Failed to parse start period: "${queryOptions.periodStart}". Invalid rendezvous date expression.`);
        }
    }

    // Parse the end period for the query
    let endPeriod = null;
    if (queryOptions.periodEnd) {
        endPeriod = (queryOptions.periodEnd instanceof Date)
            ? queryOptions.periodEnd
            : timeParser(queryOptions.periodEnd);

        if (endPeriod === false || !(endPeriod instanceof Date)) {
            throw new Error(`Failed to parse end period: "${queryOptions.periodEnd}". Invalid rendezvous date expression.`);
        }
    }

    // Handle 'timeWindow' (formerly 'over') to deduce start/end if one is missing
    if (queryOptions.timeWindow) {
        const durationWindow = timeParser.duration(queryOptions.timeWindow);
        if (durationWindow === false || typeof durationWindow !== 'number' || durationWindow <= 0) {
            throw new Error(`Invalid duration window: "${queryOptions.timeWindow}". Not a valid rendezvous duration expression.`);
        }

        // Rewriting the date deduction logic for clarity and robustness (update existing statements)
        if (!startPeriod && endPeriod) {
            startPeriod = new Date(endPeriod.getTime() - durationWindow);
        } else if (!endPeriod && startPeriod) {
            endPeriod = new Date(startPeriod.getTime() + durationWindow);
        }
        // If both startPeriod and endPeriod are provided, timeWindow is implicitly ignored
        // as per the original logic, which only fills in missing values.
    }

    // Parse the maximum number of records (limit)
    let maxRecords = null;
    if (queryOptions.maxResults) {
        if (typeof queryOptions.maxResults === 'string') {
            const durationForLimit = timeParser.duration(queryOptions.maxResults);
            if (durationForLimit === false || typeof durationForLimit !== 'number' || durationForLimit <= 0) {
                throw new Error(`Invalid limit duration: "${queryOptions.maxResults}". Must be a valid rendezvous duration.`);
            }
            // Use Math.trunc for integer conversion (updated from Math.floor)
            maxRecords = Math.trunc(durationForLimit / resolutionMs);

            // Add a guard for calculated zero limit (new fragment)
            if (maxRecords < 1) {
                console.warn(`Calculated max records is zero for duration "${queryOptions.maxResults}" and resolution "${queryOptions.resolution}". Adjusting to 1 to prevent empty queries.`);
                maxRecords = 1;
            }
        } else if (typeof queryOptions.maxResults === 'number' && queryOptions.maxResults > 0) {
            maxRecords = queryOptions.maxResults;
        } else {
            // New validation for invalid numeric limits
            throw new Error(`Invalid numeric limit: "${queryOptions.maxResults}". Must be a positive number.`);
        }
    }

    // Construct the query parameters object
    const queryParams = {
        expression: metricIdentifier,
        step: resolutionMs
    };

    // Conditionally add date/time and limit parameters if they exist
    if (startPeriod) {
        queryParams.start = startPeriod.toISOString();
    }
    if (endPeriod) {
        queryParams.stop = endPeriod.toISOString();
    }
    if (maxRecords) {
        queryParams.limit = maxRecords;
    }

    // Final URL formatting using uriUtil (renamed from url)
    return uriUtil.format({
        protocol: queryOptions.secureConnection ? 'https' : 'http', // Added configurable protocol (new fragment)
        host: queryOptions.host,
        pathname: '1.0/metric/get', // Pathname kept consistent with Cube API
        query: queryParams
    });
};

/**
 * Retrieves time-series metric data from a Cube-like service based on
 * a specified expression and configuration parameters.
 *
 * This function constructs a GET request to the Cube API endpoint.
 * The response data can be returned as parsed JSON or formatted CSV.
 *
 * @param {string}       metricExpr          - The Cube metric expression string (e.g., 'sum(my_event)').
 * @param {object}       configParams
 * @param {string}       configParams.host   - The hostname of the metric evaluator service.
 * @param {string|Date}  [configParams.periodStart] - Start date/time for the data query, can be a rendezvous expression.
 * @param {string|Date}  [configParams.periodEnd]   - End date/time for the data query, can be a rendezvous expression.
 * @param {string}       [configParams.timeWindow]  - A 'rendezvous.duration' expression to define the time span
 *                                                    if periodStart or periodEnd are partially missing.
 * @param {string|number}[configParams.maxResults]  - Maximum number of data points to fetch. Can be a rendezvous duration.
 * @param {string}       configParams.resolution    - Metric data resolution (e.g., '10s', '1m', '1h', '1d').
 * @param {string}       [configParams.outputFormat] - Desired output format: 'json' (default) or 'csv'.
 * @param {boolean}      [configParams.reverseOrder] - For CSV output, indicates if date format should be reversed (dd/mm/yy).
 * @param {boolean}      [configParams.secureConnection] - Use HTTPS if true, HTTP otherwise. Defaults to HTTP. (New option)
 * @param {Function}     completionCallback  - Callback function (err, data) to be invoked upon request completion.
 */
module.exports = function fetchMetricData(metricExpr, configParams, completionCallback) {
    // Input validation for essential parameters (new guard clauses/validations)
    if (typeof metricExpr !== 'string' || metricExpr.trim().length === 0) {
        return completionCallback(new Error('Invalid or empty metric expression provided.'));
    }
    if (!configParams || typeof configParams !== 'object') {
        return completionCallback(new Error('Invalid or missing configuration parameters object.'));
    }
    if (typeof configParams.host !== 'string' || configParams.host.trim().length === 0) {
        return completionCallback(new Error('Configuration parameter "host" is required and must be a non-empty string.'));
    }
    if (typeof completionCallback !== 'function') {
        // This scenario might indicate a programming error in the caller.
        console.error('Error: No valid completion callback function provided for fetchMetricData.');
        // In a real app, you might throw here or use an event emitter.
        return;
    }

    let requestUri;
    try {
        requestUri = constructRequestUri(metricExpr, configParams);
    } catch (uriError) {
        return completionCallback(uriError);
    }

    httpClient.get(requestUri, (requestErr, responseObj, responseBody) => {
        if (requestErr) {
            // Propagate network or request-specific errors directly
            return completionCallback(requestErr);
        }

        // Consolidate and enhance error handling for non-200 HTTP status codes (updated existing)
        if (responseObj && responseObj.statusCode !== 200) {
            const errorDetails = responseBody || `HTTP Status ${responseObj.statusCode}`;
            return completionCallback(new Error(`API request failed with status ${responseObj.statusCode}: ${errorDetails}`));
        }

        // Determine output format and process the data accordingly
        const desiredFormat = (configParams.outputFormat || 'json').toLowerCase();
        let processedData;

        switch (desiredFormat) {
            case 'json':
                try {
                    processedData = processTimeData(responseBody);
                    completionCallback(null, processedData);
                } catch (parseError) {
                    completionCallback(parseError); // Pass parsing errors to the callback
                }
                break;
            case 'csv':
                try {
                    const dataForCsv = processTimeData(responseBody);
                    // Pass the boolean flag for inverse date formatting (renamed from 'inverse')
                    completionCallback(null, dataToCsv(dataForCsv, configParams.reverseOrder));
                } catch (parseError) {
                    completionCallback(parseError);
                }
                break;
            default:
                // Handle unrecognized formats by defaulting to JSON and logging a warning (updated existing)
                console.warn(`Unrecognized output format specified: "${desiredFormat}". Defaulting to JSON processing.`);
                try {
                    processedData = processTimeData(responseBody);
                    completionCallback(null, processedData);
                } catch (parseError) {
                    completionCallback(parseError);
                }
                break;
        }
    });
};

// Export the URI construction helper for external use or testing (renamed)
module.exports.buildUriHelper = constructRequestUri;