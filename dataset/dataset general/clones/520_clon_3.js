(function () {
  "use strict";

  // Core module imports for network and data processing
  const resourceParser = require('url');
  const webServer = require('http');
  const queryParamProcessor = require('querystring');
  const NotifierService = require('node-pusher'); // Renamed Pusher to NotifierService

  // Configuration constants for the server environment
  const SERVER_HOST = '127.0.0.1'; // Localhost IP
  const SERVER_PORT = 8080; // Changed port from 1337 to 8080

  // Variables for the notification client instance and its credentials
  let notificationClient;
  const appIdentifier = process.argv[2]; // Application ID from command-line arguments
  const accessKey = process.argv[3]; // API Key from command-line arguments
  const secretKey = process.argv[4]; // API Secret from command-line arguments

  // --- Server Setup and Initialization ---

  // Function to perform initial setup and validation
  const initializeService = () => {
    // Validate that all necessary credentials are provided
    if (!appIdentifier || !accessKey || !secretKey) {
      console.error('ERROR: Missing required startup parameters.');
      console.error('Usage: node server_app.js <application_id> <api_key> <api_secret>');
      process.exit(1); // Exit with an error code
    }

    // Instantiate the notification client with the provided credentials
    notificationClient = new NotifierService({
      applicationId: appIdentifier, // Renamed 'appId'
      apiKey: accessKey,           // Renamed 'key'
      apiSecret: secretKey         // Renamed 'secret'
    });
    console.log('INFO: Notifier service client successfully configured.');
  };

  initializeService(); // Execute the initialization routine

  // --- HTTP Response Utilities ---

  /**
   * Crafts and sends an HTTP response back to the client.
   * @param {http.ServerResponse} outgoingResponse - The server response object.
   * @param {number} statusCode - The HTTP status code (e.g., 200 OK, 400 Bad Request).
   * @param {any} responsePayload - The data to be sent in the response body.
   * @param {object} additionalHeaders - Optional object containing extra HTTP headers.
   */
  const sendHttpResponse = (outgoingResponse, statusCode, responsePayload, additionalHeaders = {}) => {
    const standardHeaders = {
      'Content-Type': 'application/json; charset=utf-8' // Default content type
    };
    const finalHeaders = { ...standardHeaders, ...additionalHeaders }; // Merge headers

    let serializedPayload = '';
    if (responsePayload !== undefined && responsePayload !== null) {
      try {
        serializedPayload = JSON.stringify(responsePayload);
        finalHeaders['Content-Length'] = Buffer.byteLength(serializedPayload, 'utf8'); // Accurate length
      } catch (serializationIssue) {
        console.error('ERROR: Failed to serialize response payload:', serializationIssue.message);
        // Fallback to a generic error message if the intended payload cannot be serialized
        serializedPayload = JSON.stringify({ error: 'Internal server error during data serialization.' });
        finalHeaders['Content-Length'] = Buffer.byteLength(serializedPayload, 'utf8');
        statusCode = 500; // Force a 500 status if serialization fails
      }
    } else {
        finalHeaders['Content-Length'] = 0; // No content
    }

    outgoingResponse.writeHead(statusCode, finalHeaders); // Write headers and status code
    outgoingResponse.end(serializedPayload); // Send the response body
  };

  /**
   * Generates and sends an HTTP error response.
   * @param {http.ServerResponse} outgoingResponse - The server response object.
   * @param {number} statusCode - The HTTP status code for the error.
   * @param {string} errorDescription - A descriptive error message.
   * @param {object} supplementaryDetails - Optional object for additional error context.
   */
  const sendErrorResponse = (outgoingResponse, statusCode, errorDescription, supplementaryDetails = {}) => {
      const errorBody = {
          status: 'error',
          message: errorDescription,
          ...supplementaryDetails
      };
      sendHttpResponse(outgoingResponse, statusCode, errorBody);
  };

  /**
   * Applies Cross-Origin Resource Sharing (CORS) headers to the response.
   * Also handles preflight OPTIONS requests.
   * @param {http.IncomingMessage} incomingRequest - The incoming request object.
   * @param {http.ServerResponse} outgoingResponse - The outgoing response object.
   */
  const applyCorsHeaders = (incomingRequest, outgoingResponse) => {
    const clientOrigin = incomingRequest.headers.origin || '*';
    outgoingResponse.setHeader('Access-Control-Allow-Origin', clientOrigin);
    outgoingResponse.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); // Explicitly allow methods
    outgoingResponse.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, X-Requested-With');
    outgoingResponse.setHeader('Access-Control-Max-Age', 3600); // Cache preflight response for 1 hour

    // For preflight requests (OPTIONS method), send a 204 No Content response
    if (incomingRequest.method === 'OPTIONS') {
        outgoingResponse.writeHead(204, outgoingResponse.getHeaders()); // Use existing headers
        outgoingResponse.end();
        return true; // Indicate that the request has been handled
    }
    return false; // Indicate that the request needs further processing
  };

  // --- Request Body Parsing ---

  /**
   * Asynchronously parses the incoming request body based on its Content-Type.
   * @param {http.IncomingMessage} incomingRequest - The incoming request object.
   * @param {function(object): void} dataProcessedCallback - Callback function to receive the parsed data.
   */
  const parseRequestBody = (incomingRequest, dataProcessedCallback) => {
    let rawPayloadBuffer = [];
    incomingRequest.on('data', (dataChunk) => {
      rawPayloadBuffer.push(dataChunk);
    });

    incomingRequest.on('end', () => {
      const receivedPayload = Buffer.concat(rawPayloadBuffer).toString('utf8');
      const contentType = incomingRequest.headers['content-type'];
      let parsedData = {};

      if (contentType && contentType.includes('application/json')) {
        try {
          parsedData = JSON.parse(receivedPayload || '{}'); // Parse JSON, default to empty object
        } catch (parsingError) {
          console.warn('WARNING: JSON body parsing failed:', parsingError.message);
          // parsedData remains {}
        }
      } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        try {
          parsedData = queryParamProcessor.parse(receivedPayload || ''); // Parse URL-encoded, default to empty string
        } catch (parsingError) {
          console.warn('WARNING: URL-encoded body parsing failed:', parsingError.message);
          // parsedData remains {}
        }
      } else if (receivedPayload.length > 0) {
          console.warn(`WARNING: Unrecognized content-type '${contentType}' for non-empty payload. Attempting JSON parse as a fallback.`);
          try {
              parsedData = JSON.parse(receivedPayload);
          } catch (e) {
              console.warn("Fallback JSON parse also failed. Payload ignored.");
          }
      }
      dataProcessedCallback(parsedData);
    });

    // Handle potential errors during request stream processing
    incomingRequest.on('error', (streamError) => {
        console.error('ERROR: Request stream encountered an error:', streamError.message);
        dataProcessedCallback({}); // Return empty data on stream error
    });
  };

  // --- Main Request Handlers ---

  /**
   * Processes incoming POST requests, acting as a proxy for notification service operations.
   * @param {http.IncomingMessage} incomingRequest - The incoming request object.
   * @param {http.ServerResponse} outgoingResponse - The outgoing response object.
   */
  const handlePostRequest = (incomingRequest, outgoingResponse) => {
    parseRequestBody(incomingRequest, (requestData) => {
      // Prioritize `targetChannel`, then `channelNameAlias`, then `channel` for flexibility
      const targetChannel = requestData.targetChannel || requestData.channelNameAlias || requestData.channel;

      // Ensure a channel identifier is present
      if (!targetChannel) {
        return sendErrorResponse(outgoingResponse, 400, 'Missing required channel identifier for operation.', {
          expectedParameters: ['targetChannel', 'eventName', 'eventData', 'clientSocketId (for authentication)']
        });
      }

      // Handle event triggering request
      if (requestData.eventName) {
        if (!requestData.eventData) {
            return sendErrorResponse(outgoingResponse, 400, 'Event data is required when triggering an event.');
        }
        const { eventName, eventData, clientSocketId } = requestData; // Destructure for clarity

        notificationClient.trigger(
          targetChannel,
          eventName,
          eventData,
          clientSocketId, // Optional: exclude a specific client socket
          (operationError, sentStatus, serviceResponse) => {
            if (operationError) {
              console.error('NOTIFICATION_SERVICE_ERROR: Event trigger failed:', operationError.message);
              return sendErrorResponse(outgoingResponse, 500, 'Failed to trigger notification event.', {
                details: operationError.message
              });
            }
            // Respond with success and relevant details from the notification service
            sendHttpResponse(outgoingResponse, serviceResponse ? serviceResponse.statusCode : 200, {
              status: 'success',
              message: 'Notification event successfully triggered.',
              channel: targetChannel,
              event: eventName,
              serviceResponseStatus: serviceResponse ? serviceResponse.statusCode : 200
            });
          }
        );
        return; // Exit after handling event trigger
      }

      // Handle client authentication request
      if (requestData.clientSocketId) {
        const { clientSocketId } = requestData;
        const authenticationDetails = {
          userId: 'anonymous_client', // Default user ID, could be dynamically assigned
          clientIpAddress: incomingRequest.socket.remoteAddress, // Client IP from TCP socket
          clientPortNumber: incomingRequest.socket.remotePort // Client port from TCP socket
        };
        const authenticationToken = notificationClient.auth(clientSocketId, targetChannel, authenticationDetails);
        return sendHttpResponse(outgoingResponse, 200, authenticationToken);
      }

      // If no valid operation (event trigger or authentication) is specified
      sendErrorResponse(outgoingResponse, 400, 'Invalid request payload. Specify "eventName" or "clientSocketId".', {
        supportedOperations: ['trigger_event', 'authenticate_client']
      });
    });
  };

  /**
   * The primary request dispatch function for the HTTP server.
   * @param {http.IncomingMessage} incomingRequest - The incoming request object.
   * @param {http.ServerResponse} outgoingResponse - The outgoing response object.
   */
  const requestDispatcher = (incomingRequest, outgoingResponse) => {
    // Apply CORS headers and check for preflight OPTIONS requests
    if (applyCorsHeaders(incomingRequest, outgoingResponse)) {
        return; // If it was an OPTIONS request, it's already handled
    }

    switch (incomingRequest.method) {
      case 'POST':
        handlePostRequest(incomingRequest, outgoingResponse);
        break;
      case 'GET':
        // For GET requests, provide basic API information and status
        sendHttpResponse(outgoingResponse, 200, {
          application: 'Notifier Proxy Service',
          version: '1.2.0', // Updated version information
          status: 'online',
          apiAccessKeyHint: accessKey.substring(0, 4) + '...', // Masked API key for security
          serverAddress: `${SERVER_HOST}:${SERVER_PORT}`
        });
        break;
      default:
        // Respond with 405 Method Not Allowed for unsupported HTTP methods
        outgoingResponse.setHeader('Allow', 'GET, POST, OPTIONS'); // Inform client of allowed methods
        sendErrorResponse(outgoingResponse, 405, 'HTTP Method Not Allowed for this resource.');
        break;
    }
  };

  // --- Server Startup ---

  // Create and start the HTTP server, listening on the specified host and port.
  webServer.createServer(requestDispatcher).listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(`INFO: Notifier proxy server is now active on http://${SERVER_HOST}:${SERVER_PORT}/`);
    console.log('INFO: Waiting for incoming client connections...');
  });

})(); // End of Immediately Invoked Function Expression