'use strict';

// Renamed and reordered module imports, using const for explicit declarations.
const coreHttp = require('http');
const webClient = require('restler');
const asyncFlow = require('async');
const templateEngine = require('haml');
const uriParser = require('url');
const fileSystem = require('fs');

// Template management block: Renamed variable and added a constant for the path.
let aggregatedResultsTemplateContent;
const resultsTemplateFilePath = './search-res.haml';

// Using an immediately invoked function expression (IIFE) for template loading.
// Includes improved error handling and logging for the file operation.
(function loadResponseTemplate() {
  fileSystem.readFile(resultsTemplateFilePath, function(fileReadError, fileContentBuffer) {
    if (fileReadError) {
      console.error(`ERROR: Failed to load template from ${resultsTemplateFilePath}:`, fileReadError.message);
      // Fallback content in case the template cannot be loaded.
      aggregatedResultsTemplateContent = '<h1>Template Loading Issue</h1><p>The display template could not be loaded. Please check server configuration.</p>';
      return;
    }
    // Convert buffer to string, explicitly specifying UTF-8 encoding.
    aggregatedResultsTemplateContent = fileContentBuffer.toString('utf8');
    console.log(`INFO: Successfully loaded response template: ${resultsTemplateFilePath}`);
  });
})();

// Server configuration constants for clarity and easy modification.
const AGGREGATOR_PORT = 8124;
const AGGREGATOR_HOST = '127.0.0.1';
const AGGREGATOR_BASE_URL = `http://${AGGREGATOR_HOST}:${AGGREGATOR_PORT}/`;

// Creating the HTTP server instance.
coreHttp.createServer(function (clientRequest, serverResponse) {
  // Centralized exception handling for the Node.js process.
  // Enhanced logging and a more robust response for unhandled errors.
  process.addListener('uncaughtException', function (unhandledError) {
    console.error('CRITICAL ERROR: Uncaught exception detected!', unhandledError.stack);
    // Only write headers if they haven't been sent already.
    if (!serverResponse.headersSent) {
        serverResponse.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
    }
    serverResponse.end('An unexpected server error occurred. Please try again or contact support.');
    // In a production environment, consider mechanisms for graceful shutdown or process restart.
  });

  // Definition of external search service providers.
  // Changed from a plain object to an array of objects for better extensibility and metadata.
  const configuredSearchProviders = [
    {
      id: 'googleWebSearch', // Renamed 'goo'
      endpointUrl: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=',
      resultParserType: 'google' // New property to specify the parsing logic
    },
    {
      id: 'twitterMicroblog', // Renamed 'twit'
      endpointUrl: 'http://search.twitter.com/search.json?q=',
      resultParserType: 'twitter' // New property to specify the parsing logic
    }
  ];

  const parsedRequestUri = uriParser.parse(clientRequest.url, true);
  const requestUriPath = parsedRequestUri.pathname;

  console.log(`DEBUG: Incoming request for path: ${requestUriPath}`);

  // Main routing logic using a switch statement.
  switch(requestUriPath) {
    case '/':
      serverResponse.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
      serverResponse.end('Welcome to the Federated Search Aggregator Service!');
      break;

    case '/aggregate':
      const requestQueryParams = parsedRequestUri.query;
      let actualSearchQuery;

      // Enhanced validation for the search query parameter 'q'.
      if (!requestQueryParams || typeof requestQueryParams.q !== 'string' || requestQueryParams.q.trim().length === 0) {
        console.warn('WARN: Bad request - Missing, empty, or invalid search query parameter "q".');
        serverResponse.writeHead(400, {'Content-Type': 'text/plain; charset=utf-8'});
        serverResponse.end('Search query parameter "q" is required and cannot be empty. Example: /aggregate?q=term');
        return; // Early exit for invalid requests.
      }
      actualSearchQuery = requestQueryParams.q.trim(); // Trim whitespace from the query.

      console.log(`INFO: Processing aggregation request for search term: "${actualSearchQuery}"`);

      // Execute parallel data fetching from all configured services.
      asyncFlow.parallel(prepareServiceCallFunctions(actualSearchQuery),
        function (flowCompletionError, aggregatedSourceResults) {
          if (flowCompletionError) {
            console.error('ERROR: An error occurred during parallel data retrieval:', flowCompletionError.message);
            serverResponse.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
            serverResponse.end('Failed to retrieve all search results due to an internal error.');
            return;
          }

          serverResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          const finalConsolidatedItems = [];

          // Consolidating results from all sources into a single array.
          // Replaced nested for loops with a functional `reduce` approach for clarity and efficiency.
          aggregatedSourceResults.reduce((accumulator, currentSourceData) => {
            if (Array.isArray(currentSourceData)) {
                accumulator.push(...currentSourceData); // Spread operator to merge arrays
            } else if (currentSourceData && typeof currentSourceData === 'object') {
                // Handle cases where a service might return a single object or non-array,
                // though typically we expect arrays of items.
                console.warn('WARN: Received non-array result from a search provider:', currentSourceData);
                accumulator.push(currentSourceData); // Add it as is, or filter/transform as needed.
            }
            return accumulator;
          }, finalConsolidatedItems);

          // Prepare data object for HAML templating.
          const renderingContext = {
            items: finalConsolidatedItems,
            searchTerm: actualSearchQuery, // Added search term to context for display
            requestTimestamp: new Date().toISOString() // Added timestamp for rendering
          };

          // Render the HAML template with the consolidated data.
          try {
            const generatedHtmlOutput = templateEngine.render(aggregatedResultsTemplateContent, { locals: renderingContext });
            serverResponse.end(generatedHtmlOutput);
          } catch (templateRenderError) {
            console.error('ERROR: Failed to render HAML template:', templateRenderError.message);
            serverResponse.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
            serverResponse.end('Error generating HTML response due to templating issue.');
          }
        });
      break;

    default:
      console.log(`WARN: Unhandled request path: ${requestUriPath}`);
      serverResponse.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
      serverResponse.end('The requested resource was not found on this server!');
  }

  /**
   * Constructs an array of functions, each designed to fetch data from a specific search provider.
   * These functions are compatible with `async.parallel`.
   * @param {string} currentSearchTerm The query string provided by the client.
   * @returns {Array<Function>} An array of thunk functions, each accepting a callback.
   */
  function prepareServiceCallFunctions(currentSearchTerm) {
    const serviceOperationThunks = [];

    // Iterate through the array of configured search providers.
    for(const providerConfiguration of configuredSearchProviders) {
      // Create a closure for each service call to capture `providerConfiguration` and `currentSearchTerm`.
      serviceOperationThunks.push(function(asyncCompletionCallback) {
        const fullServiceEndpoint = `${providerConfiguration.endpointUrl}${encodeURIComponent(currentSearchTerm)}`; // URL encode the search term.
        // Invoke the external service, passing the full provider configuration for flexible parsing.
        executeExternalServiceRequest(fullServiceEndpoint, providerConfiguration, asyncCompletionCallback);
      });
    }
    return serviceOperationThunks;
  }

  /**
   * Executes an HTTP GET request to an external search service and parses its response.
   * Handles success, failure, error, and timeout conditions.
   * @param {string} targetServiceUrl The complete URL to call for the service.
   * @param {object} serviceProviderDetails Configuration object for the specific service.
   * @param {Function} asyncCompletionCallback The callback function provided by `async.parallel` (err, data).
   */
  function executeExternalServiceRequest(targetServiceUrl, serviceProviderDetails, asyncCompletionCallback) {
    console.log(`DEBUG: Initiating request to ${serviceProviderDetails.id} at: ${targetServiceUrl}`);

    // Using `restler.get` with an explicit timeout.
    const serviceApiRequest = webClient.get(targetServiceUrl, { timeout: 7000 }); // Increased timeout slightly.

    // Event listener for successful HTTP responses.
    serviceApiRequest.on('success', function(rawResponseData, responseMetadata) {
      console.log(`INFO: Received successful response from ${serviceProviderDetails.id}. Status: ${responseMetadata.statusCode}`);

      let processedServiceResults = [];
      let parsedResponseJson;

      try {
        // Attempt to parse the response data as JSON. Handle cases where it might already be an object.
        if (typeof rawResponseData === 'string') {
          parsedResponseJson = JSON.parse(rawResponseData);
        } else {
          parsedResponseJson = rawResponseData; // Assume it's already parsed (e.g., if restler auto-parsed).
        }
      } catch (jsonParsingError) {
        console.error(`ERROR: JSON parsing failed for ${serviceProviderDetails.id} response: ${jsonParsingError.message}`);
        // Return an empty array on parsing error to avoid breaking the parallel flow.
        asyncCompletionCallback(null, []);
        return;
      }

      // Dispatching parsing logic based on `resultParserType` using a lookup object.
      const responseParsers = {
        'google': (dataPayload) => {
          const googleItems = dataPayload.responseData && dataPayload.responseData.results ? dataPayload.responseData.results : [];
          // Using `map` for concise transformation of result objects.
          return googleItems.map(item => ({
            resultUrl: item.url, // Renamed 'url'
            resultTitle: item.titleNoFormatting || item.title, // Prioritize unformatted title.
            sourceId: serviceProviderDetails.id, // Add source identifier to each item.
            snippet: item.content ? item.content.replace(/<\/?b>/g, '') : '' // Clean HTML from snippets
          }));
        },
        'twitter': (dataPayload) => {
          const twitterItems = dataPayload.results || [];
          return twitterItems.map(item => ({
            resultUrl: `https://twitter.com/${item.from_user}/status/${item.id_str || item.id}`, // Use `id_str` for robustness.
            resultTitle: item.text, // Renamed 'text'
            sourceId: serviceProviderDetails.id,
            author: item.from_user
          }));
        }
      };

      const specificParser = responseParsers[serviceProviderDetails.resultParserType];
      if (specificParser) {
        processedServiceResults = specificParser(parsedResponseJson);
      } else {
        console.warn(`WARN: No specific parser found for service type: ${serviceProviderDetails.resultParserType}. Returning raw data for debugging.`);
        // Include raw data for unhandled parser types.
        processedServiceResults.push({
            resultTitle: `Unparsed results from ${serviceProviderDetails.id}`,
            resultUrl: targetServiceUrl,
            sourceId: serviceProviderDetails.id,
            rawDataDump: parsedResponseJson
        });
      }

      asyncCompletionCallback(null, processedServiceResults); // Pass processed results back.
    });

    // Event listener for HTTP failures (e.g., 4xx, 5xx status codes).
    serviceApiRequest.on('fail', function(rawResponseData, responseMetadata) {
        const statusCode = responseMetadata ? responseMetadata.statusCode : 'UNKNOWN';
        console.error(`ERROR: Request to ${serviceProviderDetails.id} failed with HTTP status ${statusCode}. Response body: ${rawResponseData}`);
        asyncCompletionCallback(null, []); // Return empty array on failure, allows other parallel tasks to complete.
    });

    // Event listener for network errors (e.g., DNS issues, connection refused).
    serviceApiRequest.on('error', function(networkError) {
      console.error(`ERROR: Network communication error for ${serviceProviderDetails.id} (${targetServiceUrl}): ${networkError.message}`);
      asyncCompletionCallback(null, []); // Return empty array on error.
    });

    // Event listener for request timeouts.
    serviceApiRequest.on('timeout', function() {
        console.warn(`WARN: Request to ${serviceProviderDetails.id} timed out after 7 seconds.`);
        asyncCompletionCallback(null, []); // Return empty array on timeout.
    });
  }

// Start the HTTP server and log its operational status using the defined constants.
}).listen(AGGREGATOR_PORT, AGGREGATOR_HOST, function() {
  console.log(`INFO: Federated Search Aggregator server is now running at ${AGGREGATOR_BASE_URL}`);
});