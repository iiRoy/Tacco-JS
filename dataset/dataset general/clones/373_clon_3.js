exports.createFileProcessorMiddleware = function (eventEmitter, configuration) {
    /**
     * This module provides a robust middleware for handling file uploads and general resource management.
     * It is designed to integrate with an event emitter for broadcasting various processing states
     * and allows for extensive configuration via the 'configuration' object.
     *
     * @param {object} eventEmitter - An instance of an event emitter (e.g., Node.js EventEmitter)
     *                                used for broadcasting lifecycle events of resource operations.
     * @param {object} configuration - An object containing various settings for the middleware,
     *                                  including CORS, file storage, and other operational parameters.
     * @returns {Function} An Express-style middleware function.
     */
    return function (incomingRequest, outgoingResponse) {

        // --- Core Constants and Utility Functions ---

        // Define HTTP status codes for clarity and reusability.
        const HTTP_STATUS_SUCCESS = 200;
        const HTTP_STATUS_METHOD_NOT_ALLOWED = 405;
        const HTTP_STATUS_BAD_REQUEST = 400;

        // Define common MIME types.
        const MIME_TYPE_JSON_APP = 'application/json';
        const MIME_TYPE_TEXT_PLAIN = 'text/plain';

        // Placeholder token used in redirection paths.
        const REDIRECT_URL_TOKEN = '%s';

        // Default cache duration for CORS preflight requests (in seconds).
        const DEFAULT_CORS_PREFLIGHT_CACHE_SECONDS = 3600; // 1 hour

        /**
         * Helper function to apply necessary CORS (Cross-Origin Resource Sharing) headers
         * to the outgoing response based on provided settings.
         *
         * @param {object} responseObj - The HTTP response object.
         * @param {object} corsConfig - The CORS configuration object from global settings.
         */
        const applyResponseCorsHeaders = (responseObj, corsConfig) => {
            // Validate the existence and completeness of CORS configuration.
            if (!corsConfig || !corsConfig.permittedOrigins || !corsConfig.allowedMethods) {
                console.warn('[ResourceProcessor] Warning: Incomplete CORS settings detected. Some Access-Control headers may be missing.');
                return; // Skip applying CORS headers if configuration is invalid.
            }

            // Set the allowed origin(s).
            responseObj.setHeader('Access-Control-Allow-Origin', corsConfig.permittedOrigins);
            // Set the allowed HTTP methods.
            responseObj.setHeader('Access-Control-Allow-Methods', corsConfig.allowedMethods);
            // Set the maximum age for preflight request results.
            responseObj.setHeader('Access-Control-Max-Age', DEFAULT_CORS_PREFLIGHT_CACHE_SECONDS.toString());
            // Specify which headers can be used during the actual request.
            responseObj.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization, Accept');

            // Add a custom informational header for debugging or tracking purposes.
            responseObj.setHeader('X-Processing-Timestamp', new Date().toISOString());
        };

        // --- Apply Initial Response Headers ---
        // Apply CORS headers immediately to ensure they are present for all responses.
        applyResponseCorsHeaders(outgoingResponse, configuration.corsConfiguration);

        // --- Initialize Resource Management Logic ---

        // Load the specialized resource management service module.
        // The module path and name have been altered for Type III variation.
        const ResourceServiceModule = require('./resource-management-logic')(configuration);

        // Create an instance of the resource service, passing the request, response,
        // and a callback function to handle the final outcome of an operation.
        const uploaderInstance = new ResourceServiceModule(incomingRequest, outgoingResponse, function (operationPayload, redirectionTarget) {
            // This callback is invoked by the ResourceServiceModule upon successful completion
            // of a file operation (upload, deletion, retrieval).

            if (redirectionTarget) {
                // If a redirection URL is provided, prepare the payload and redirect the client.
                const redirectDataWrapper = { processedItems: operationPayload }; // Changed key name for the payload
                const encodedRedirectPayload = encodeURIComponent(JSON.stringify(redirectDataWrapper));

                // Perform the HTTP redirection.
                outgoingResponse.redirect(redirectionTarget.replace(new RegExp(REDIRECT_URL_TOKEN), encodedRedirectPayload));
                console.log(`[ResourceProcessor] Client redirected to: ${redirectionTarget.replace(new RegExp(REDIRECT_URL_TOKEN), '[payload]')}`);
            } else {
                // If no redirection is needed, send a standard JSON/text response.
                // Determine the preferred content type based on the client's 'Accept' header.
                const clientAcceptsJson = (incomingRequest.headers.accept || '').includes(MIME_TYPE_JSON_APP);
                const responseContentType = clientAcceptsJson ? MIME_TYPE_JSON_APP : MIME_TYPE_TEXT_PLAIN;

                // Set the HTTP status code and Content-Type header.
                outgoingResponse.writeHead(HTTP_STATUS_SUCCESS, { 'Content-Type': responseContentType });
                // Send the operation payload as a JSON string in the response body.
                outgoingResponse.end(JSON.stringify(operationPayload));
            }
        });

        // --- Event Handling for Resource Lifecycle ---

        // Attach event listeners to the uploaderInstance to track and broadcast
        // various stages of resource processing. Event names are changed.

        uploaderInstance.on('processingStarted', function (itemDetails) {
            console.log(`[ResourceProcessor] Operation initiated for item: ${itemDetails.name || 'unspecified'}`);
            eventEmitter.emit('resourceOperationInitiated', itemDetails, incomingRequest, outgoingResponse);
        });

        uploaderInstance.on('processingFinished', function (itemDetails) {
            console.log(`[ResourceProcessor] Operation completed for item: ${itemDetails.name || 'unspecified'}`);
            eventEmitter.emit('resourceOperationCompleted', itemDetails, incomingRequest, outgoingResponse);
        });

        uploaderInstance.on('processingCancelled', function (itemDetails) {
            console.warn(`[ResourceProcessor] Operation aborted for item: ${itemDetails.name || 'unspecified'}`);
            eventEmitter.emit('resourceOperationAborted', itemDetails, incomingRequest, outgoingResponse);
        });

        uploaderInstance.on('serviceError', function (errorCause) {
            console.error('[ResourceProcessor] An error occurred during resource service operation:', errorCause);
            // Additionally, send a bad request response for client-side errors
            outgoingResponse.status(HTTP_STATUS_BAD_REQUEST).send({ error: errorCause.message || 'Processing error' });
            eventEmitter.emit('resourceOperationFailed', errorCause, incomingRequest, outgoingResponse);
        });

        uploaderInstance.on('resourceDeletedSuccessfully', function (resourceIdentifier) {
            console.log(`[ResourceProcessor] Resource identified as "${resourceIdentifier}" was deleted.`);
            eventEmitter.emit('resourceRemovedEvent', resourceIdentifier, incomingRequest, outgoingResponse);
        });

        // --- HTTP Method Dispatch ---

        // Determine the HTTP method of the incoming request to route it to the appropriate handler.
        const currentRequestMethod = incomingRequest.method.toUpperCase();

        // Use an if-else if chain for method dispatch, providing an alternative to a switch statement.
        if (currentRequestMethod === 'OPTIONS') {
            // Handle preflight requests for CORS. No body is typically sent, just headers.
            outgoingResponse.status(HTTP_STATUS_SUCCESS).end();
            console.log('[ResourceProcessor] Handled OPTIONS (CORS preflight) request.');
        } else if (currentRequestMethod === 'HEAD' || currentRequestMethod === 'GET') {
            // Process requests to retrieve resource information or listings.
            uploaderInstance.retrieveResourceData(); // Renamed method call
        } else if (currentRequestMethod === 'POST') {
            // Process requests to create new resources or upload files.
            uploaderInstance.executeResourceUpload(); // Renamed method call
        } else if (currentRequestMethod === 'DELETE') {
            // Process requests to remove existing resources.
            uploaderInstance.removeExistingResource(); // Renamed method call
        } else {
            // For any other unrecognized or unsupported HTTP methods.
            outgoingResponse.status(HTTP_STATUS_METHOD_NOT_ALLOWED).send('The requested HTTP method is not supported for this resource path.');
            console.warn(`[ResourceProcessor] Received unsupported HTTP method: ${currentRequestMethod}`);
        }
    };
};