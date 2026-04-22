const webEngine = require('node:http');
const addressParser = require('node:url');
const secureFetcher = require('node:https');

// Global error handling for critical system failures outside request/response cycle
process.on('uncaughtException', (systemProblem) => {
    console.error('Critical system malfunction detected:', systemProblem.message);
    // In a production environment, you might log this extensively,
    // send alerts, and gracefully shut down the process.
});

// Function to process data from the Google-like source
const processGoogleResults = (rawPayload) => {
    const dataSegment = rawPayload?.responseData?.results;
    if (!dataSegment) return [];
    return dataSegment.map(item => ({
        url: item.url,
        text: item.titleNoFormatting || item.title // Prefer plain text title
    }));
};

// Function to process data from the Twitter-like source
const processTwitterResults = (rawPayload) => {
    const dataSegment = rawPayload?.results;
    if (!dataSegment) return [];
    return dataSegment.map(item => ({
        url: `http://twitter.com/${item.from_user}/status/${item.id}`,
        text: item.text
    }));
};

// Configuration for external information retrieval points
const externalInformationSources = [
    { id: 'google_web_search', endpoint: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=', dataProcessor: processGoogleResults },
    { id: 'twitter_public_feed', endpoint: 'http://search.twitter.com/search.json?q=', dataProcessor: processTwitterResults }
];

// Asynchronous utility to fetch data from remote services
const fetchRemoteInformation = (sourceConfiguration, searchCriterion) => {
    return new Promise((resolve) => {
        const fullRequestUri = new URL(sourceConfiguration.endpoint + encodeURIComponent(searchCriterion));
        const protocolHandler = fullRequestUri.protocol === 'https:' ? secureFetcher : webEngine;

        const connectionOptions = {
            hostname: fullRequestUri.hostname,
            port: fullRequestUri.port || (fullRequestUri.protocol === 'https:' ? 443 : 80),
            path: fullRequestUri.pathname + fullRequestUri.search,
            method: 'GET'
        };

        const clientConnection = protocolHandler.get(connectionOptions, (serviceResponse) => {
            let receivedDataBuffer = '';
            serviceResponse.on('data', (chunk) => { receivedDataBuffer += chunk; });
            serviceResponse.on('end', () => {
                if (serviceResponse.statusCode >= 200 && serviceResponse.statusCode < 300) {
                    try {
                        const parsedContent = JSON.parse(receivedDataBuffer);
                        resolve(sourceConfiguration.dataProcessor(parsedContent));
                    } catch (parseProblem) {
                        console.error(`Error parsing response from ${fullRequestUri.href}:`, parseProblem.message);
                        resolve([]); // Return empty array on parsing error
                    }
                } else {
                    console.error(`HTTP error from ${fullRequestUri.href}: Status ${serviceResponse.statusCode}`);
                    resolve([]); // Return empty array on HTTP error
                }
            });
        });

        clientConnection.on('error', (networkIssue) => {
            console.error(`Network issue fetching from ${fullRequestUri.href}:`, networkIssue.message);
            resolve([]); // Return empty array on network error
        });
        clientConnection.end();
    });
};

// Function to generate the HTML output for the aggregated results
const generateHtmlResultDisplay = (resultItems) => {
    const listItemHtml = resultItems.map(entry => {
        const safeUrl = String(entry.url).replace(/"/g, '&quot;');
        const safeText = String(entry.text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<li><a href="${safeUrl}">${safeText}</a></li>`;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Gathered Information</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; line-height: 1.6; background-color: #f0f2f5; color: #333; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 25px; font-size: 2em; }
    ul { list-style: none; padding: 0; }
    li { background-color: #ffffff; margin-bottom: 15px; padding: 18px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); transition: transform 0.2s ease-in-out; }
    li:hover { transform: translateY(-3px); }
    a { color: #3498db; text-decoration: none; font-weight: bold; word-break: break-word; }
    a:hover { text-decoration: underline; color: #2980b9; }
  </style>
</head>
<body>
  <h1>Aggregated Search Results</h1>
  <ul>
    ${listItemHtml}
  </ul>
</body>
</html>`;
};

// Handler for the base route
const handleBaseRequest = (incomingRequest, outgoingResponse) => {
    outgoingResponse.writeHead(200, { 'Content-Type': 'text/plain' });
    outgoingResponse.end('Initiate gathering!');
};

// Handler for the information aggregation route
const handleDataAggregation = async (incomingRequest, outgoingResponse, queryParameters) => {
    const searchKey = queryParameters.q;
    if (!searchKey) {
        outgoingResponse.writeHead(400, { 'Content-Type': 'text/plain' });
        outgoingResponse.end('A query parameter "q" is mandatory for this operation.');
        return;
    }

    try {
        const allRetrievalPromises = externalInformationSources.map(source =>
            fetchRemoteInformation(source, searchKey)
        );
        const collectedContentArrays = await Promise.all(allRetrievalPromises);
        const finalAggregatedItems = collectedContentArrays.flat(); // Flatten all results into a single array

        outgoingResponse.writeHead(200, { 'Content-Type': 'text/html' });
        outgoingResponse.end(generateHtmlResultDisplay(finalAggregatedItems));
    } catch (operationIssue) {
        console.error('Data aggregation process encountered an error:', operationIssue);
        outgoingResponse.writeHead(500, { 'Content-Type': 'text/plain' });
        outgoingResponse.end('An internal server error prevented successful aggregation.');
    }
};

// Handler for unrecognized paths
const handleInvalidPath = (incomingRequest, outgoingResponse) => {
    outgoingResponse.writeHead(404, { 'Content-Type': 'text/plain' });
    outgoingResponse.end('Requested Resource Not Found!');
};

// Mapping of URL paths to their respective handler functions
const requestRouteMap = {
    '/': handleBaseRequest,
    '/aggregate': handleDataAggregation
};

// Main server request processing logic
const processIncomingRequest = async (incomingHttpRequest, outgoingHttpResponse) => {
    try {
        const parsedUrlDetails = addressParser.parse(incomingHttpRequest.url, true);
        const currentPath = parsedUrlDetails.pathname;
        const urlQueryParameters = parsedUrlDetails.query;

        const chosenHandler = requestRouteMap[currentPath] || handleInvalidPath;
        await chosenHandler(incomingHttpRequest, outgoingHttpResponse, urlQueryParameters);
    } catch (handlerError) {
        console.error('Unexpected error during request processing:', handlerError);
        // Attempt to send a 500 error if headers haven't been sent yet
        if (!outgoingHttpResponse.headersSent) {
            outgoingHttpResponse.writeHead(500, { 'Content-Type': 'text/plain' });
            outgoingHttpResponse.end('An unforeseen server error occurred.');
        } else {
            // If headers were already sent, we cannot modify the response.
            // Just log the error.
            console.error('Error occurred after response headers were sent for:', incomingHttpRequest.url);
        }
    }
};

// Server startup configuration
const servicePort = 8124;
const serviceHost = "127.0.0.1";

webEngine.createServer(processIncomingRequest).listen(servicePort, serviceHost, () => {
    console.log(`Service now active at http://${serviceHost}:${servicePort}/`);
});