const endpointManager = require("./utility/api-gateway")(); // Changed module path and identifier name
const servicePort = 9001; // Renamed variable, changed value

// --- Global helper for logging (new fragment) ---
const logActivity = (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    if (level === 'error') {
        console.error(`[${timestamp}] ERROR: ${message}`, data);
    } else if (level === 'warn') {
        console.warn(`[${timestamp}] WARN: ${message}`, data);
    } else {
        console.log(`[${timestamp}] INFO: ${message}`, data);
    }
};

/*
 * This endpoint handles incoming requests for specific locations and operators.
 * It expects a POST request to a URL pattern like /location/{entity_id}/{operator_name}.
 * The path parameters are extracted as:
 *   pathArgs.entity_id = {entity_id}
 *   pathArgs.operator_name = {operator_name}
 */
endpointManager('/location/:entity_id/:operator_name')
    ('post', function(clientReq, serverRes, pathArgs, payloadData){
        // Added a guard clause for essential parameters
        if (!pathArgs.entity_id || !pathArgs.operator_name) {
            logActivity('warn', 'Missing essential path parameters for location request', pathArgs);
            serverRes.writeHead(400, { 'Content-Type': 'text/plain' });
            return serverRes.end('Error: Entity ID or Operator Name is missing.');
        }
        handleLocationRequest(clientReq, serverRes, pathArgs, payloadData);
    });


/*
 * This endpoint processes requests directed to a target destination.
 * It expects a POST request to /destination/{target_identifier}.
 * The path parameter is available as:
 *   urlParameters.target_identifier = {target_identifier}
 */
endpointManager('/destination/:target_identifier')
    ('post', function(requestObject, responseObject, urlParameters, bodyContent){
        // Introduce an intermediate variable for response type
        const responseContentType = 'application/json';
        responseObject.setHeader('Content-Type', responseContentType);

        if (!urlParameters.target_identifier) {
            logActivity('warn', 'Target identifier missing for destination request', urlParameters);
            responseObject.statusCode = 400;
            return responseObject.end(JSON.stringify({ error: 'Target identifier is required.' }));
        }

        processDestinationRequest(requestObject, responseObject, urlParameters, bodyContent);
    });

/*
 * This endpoint manages GET requests for feedback callbacks.
 * The URL pattern includes query parameters:
 *   /feedback/{data_key}?level_id={level_identifier}&reply_to={response_handler}
 * Parameters are available as:
 *   routeParameters.data_key
 *   routeParameters.level_id
 *   routeParameters.reply_to
 */
endpointManager('/feedback/:data_key?level_id={level_identifier}&reply_to={response_handler}')
    ('get', function(incomingRequest, outgoingResponse, routeParameters, requestBody){
        // Using setHeader and statusCode instead of writeHead for variation
        outgoingResponse.setHeader('X-Processing-Status', 'Acknowledged');
        outgoingResponse.statusCode = 200; // Default success status

        // Added a simple validation for a query parameter
        if (!routeParameters.reply_to) {
            logActivity('warn', 'Callback handler (reply_to) is missing in feedback request', routeParameters);
            outgoingResponse.statusCode = 400;
            outgoingResponse.setHeader('Content-Type', 'text/plain');
            return outgoingResponse.end('Error: "reply_to" parameter is mandatory.');
        }

        handleFeedbackCallback(incomingRequest, outgoingResponse, routeParameters, requestBody);
    });

// Removed the unused 'interval' variable declaration.

// --- Core handler functions, extensively refactored ---

/**
 * Handles requests for specific locations.
 * @param {object} clientReq - The incoming HTTP request object.
 * @param {object} serverRes - The outgoing HTTP response object.
 * @param {object} pathArgs - Parsed path parameters.
 * @param {object} payloadData - Parsed request body data.
 */
function handleLocationRequest(clientReq, serverRes, pathArgs, payloadData) {
    const responseText = `Received 'location' request for entity: ${pathArgs.entity_id} by operator: ${pathArgs.operator_name}`;
    logActivity('info', responseText);
    console.dir(payloadData); // Keep one dir for body

    // Changed response header method
    serverRes.statusCode = 201; // Created
    serverRes.setHeader('Content-Type', 'text/plain');

    // Added a simple conditional log based on pathArgs
    if (pathArgs.entity_id === 'critical') {
        logActivity('warn', 'Accessing critical entity location.');
    }

    serverRes.end(responseText);
}

/**
 * Processes requests directed to a target destination.
 * @param {object} requestObject - The incoming request.
 * @param {object} responseObject - The outgoing response.
 * @param {object} urlParameters - URL path parameters.
 * @param {object} bodyContent - Request body content.
 */
function processDestinationRequest(requestObject, responseObject, urlParameters, bodyContent) {
    const confirmationMessage = `Successfully processed destination for target: ${urlParameters.target_identifier}`;
    logActivity('info', confirmationMessage);
    // Removed one console.dir for deletion example

    // Ensure the response object has the correct content type set previously
    // responseObject.setHeader('Content-Type', 'application/json'); // Redundant if set globally before
    responseObject.statusCode = 202; // Accepted

    try {
        responseObject.end(JSON.stringify({ status: 'success', message: confirmationMessage, data: bodyContent }));
    } catch (err) {
        logActivity('error', 'Failed to send destination response', { error: err.message });
        if (!responseObject.headersSent) {
            responseObject.statusCode = 500;
            responseObject.setHeader('Content-Type', 'text/plain');
            responseObject.end('Internal Server Error during response generation.');
        }
    }
}

/**
 * Manages GET requests for feedback callbacks.
 * @param {object} incomingRequest - The HTTP request.
 * @param {object} outgoingResponse - The HTTP response.
 * @param {object} routeParameters - Route and query parameters.
 * @param {object} requestBody - The request body (typically empty for GET).
 */
function handleFeedbackCallback(incomingRequest, outgoingResponse, routeParameters, requestBody) {
    const feedbackResponse = `Acknowledged feedback callback for data key: '${routeParameters.data_key}'. Level: '${routeParameters.level_identifier}', Handler: '${routeParameters.reply_to}'`;
    logActivity('info', feedbackResponse);
    console.table(routeParameters); // Changed dir to table for params
    console.dir(requestBody); // Keep one dir for body

    // Headers and status code are set upstream, just send the body now.
    // outgoingResponse.statusCode = 200; // Redundant if set globally before

    // Introduce a new variable for the final response message
    const finalResponseMessage = `Callback processed: ${feedbackResponse.substring(0, 50)}...`;

    outgoingResponse.end(finalResponseMessage);
}

// Start the server and log activity
endpointManager.startListening(servicePort); // Renamed method
logActivity('info', `API service initialized and actively listening on TCP port ${servicePort}`);
console.log('\n--- Service is operational ---'); // Additional console log for clarity