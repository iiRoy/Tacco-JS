var nodeWebModule = require('http'),
	nodeFileIO = require('fs');

// --- Configuration & Utilities ---
const SERVER_PORT_NUM = 4444;
const SERVER_DEBUG_ENABLED = true; // Flag for enabling verbose logging

/**
 * Utility function to safely read file contents.
 * @param {string} filePath - Path to the file.
 * @param {string} encoding - File encoding (e.g., 'utf8').
 * @returns {string|null} File content or null if error.
 */
function retrieveFileContent(filePath, encoding) {
	try {
		if (SERVER_DEBUG_ENABLED) console.log(`[FILE_IO] Attempting to read: ${filePath}`);
		return nodeFileIO.readFileSync(filePath, encoding);
	} catch (ioError) {
		console.error(`[FILE_IO_ERROR] Failed to read ${filePath}:`, ioError.message);
		return null;
	}
}

// --- Main HTTP Server Setup ---
var appServiceHost = nodeWebModule.createServer(function (incomingRequest, outgoingResponse) {
	if (SERVER_DEBUG_ENABLED) {
		console.log(`\n--- Incoming Request ---`);
		console.log(`[REQUEST] URL: ${incomingRequest.url}`);
		console.log(`[REQUEST] Method: ${incomingRequest.method}`);
		console.log(`[REQUEST] Headers:`, incomingRequest.headers['content-type'] || 'N/A');
	}

	try {
		// Delegate request processing to the specialized endpoint handler
		EndpointHandler.processRequest(incomingRequest, outgoingResponse);
	} catch (processingIssue) {
		console.error(`[SERVER_ERROR] Unhandled processing issue for ${incomingRequest.url}:`, processingIssue);
		// Send a generic 500 error if an unexpected error occurs during routing/handling
		outgoingResponse.writeHead(500, { 'Content-Type': 'text/plain' });
		outgoingResponse.end('Internal Server Error: An unexpected issue occurred.');
	}
});

// --- Endpoint Management System ---
var EndpointHandler = {
	/**
	 * Processes an incoming HTTP request by finding and executing the appropriate handler.
	 * @param {object} clientReq - The incoming HTTP request object.
	 * @param {object} serverRes - The outgoing HTTP response object.
	 */
	"processRequest": function (clientReq, serverRes) {
		// Guard clause for invalid request objects
		if (!clientReq || !serverRes) {
			console.error("[HANDLER_ERROR] Received invalid request/response objects.");
			serverRes.writeHead(500, { 'Content-Type': 'text/plain' });
			serverRes.end('Server configuration error: Invalid request context.');
			return;
		}

		// Attempt to locate a specific handler for the exact request URL
		let targetProcessor = this.registeredEndpoints[clientReq.url];

		if (!targetProcessor) {
			console.warn(`[HANDLER_WARN] No specific handler found for URL: ${clientReq.url}`);
			// If no handler is found, send a 404 Not Found response
			serverRes.writeHead(404, { 'Content-Type': 'text/plain' });
			serverRes.end(`Resource not found: ${clientReq.url}`);
			return; // Exit after sending 404
		}

		// Execute the found handler, ensuring 'this' context refers to EndpointHandler
		targetProcessor.call(this, clientReq, serverRes);
	},

	/**
	 * Collection of defined API endpoints and their respective processing functions.
	 */
	"registeredEndpoints": {
		"/json": function (clientReq, serverRes) {
			// Reads a JSON file and serves its content.
			// The original 'sleep' call is intentionally omitted as it was commented out.
			if (SERVER_DEBUG_ENABLED) console.log("[ENDPOINT] /json requested.");
			const payloadContent = retrieveFileContent('./message.json', 'utf8');

			if (payloadContent === null) {
				serverRes.writeHead(500, { 'Content-Type': 'text/plain' });
				serverRes.end('Server Error: Could not retrieve JSON data.');
				return;
			}
			serverRes.writeHead(200, { 'Content-Type': 'application/json' });
			serverRes.write(payloadContent.toString()); // Ensure string output
			serverRes.end();
		},

		"/xml": function (clientReq, serverRes) {
			// Reads an XML file and serves its content.
			if (SERVER_DEBUG_ENABLED) console.log("[ENDPOINT] /xml requested.");
			const payloadContent = retrieveFileContent('./message.xml', 'utf8');

			if (payloadContent === null) {
				serverRes.writeHead(500, { 'Content-Type': 'text/plain' });
				serverRes.end('Server Error: Could not retrieve XML data.');
				return;
			}
			serverRes.writeHead(200, { 'Content-Type': 'application/xml' });
			serverRes.write(payloadContent.toString()); // Ensure string output
			serverRes.end();
		},

		// This endpoint demonstrates specific header validation and re-use of another handler.
		"/120/json?arg1=hello&arg2=world": function (clientReq, serverRes) {
			if (SERVER_DEBUG_ENABLED) console.log("[ENDPOINT] /120/json?arg1=hello&arg2=world requested.");
			const mandatoryHeader = "test-header";
			const receivedHeaderValue = clientReq.headers[mandatoryHeader];

			if (!receivedHeaderValue) {
				console.warn(`[VALIDATION_FAIL] Missing required header: ${mandatoryHeader}`);
				serverRes.writeHead(400, { 'Content-Type': 'text/plain' }); // Bad Request
				serverRes.end(`Error: Required header "${mandatoryHeader}" not found.`);
				return;
			}

			// Set a response header based on the incoming request header.
			serverRes.setHeader("test-response-header", receivedHeaderValue);

			// Delegate to the standard /json handler.
			this.registeredEndpoints["/json"](clientReq, serverRes);
		},

		"/json?post": function (clientReq, serverRes) {
			// Handles incoming POST data for JSON content.
			if (SERVER_DEBUG_ENABLED) console.log("[ENDPOINT] /json?post requested (POST data expected).");
			let incomingBuffer = [];

			clientReq.on('error', (requestError) => {
				console.error(`[STREAM_ERROR] Request stream error:`, requestError);
				serverRes.writeHead(500, { 'Content-Type': 'text/plain' });
				serverRes.end('Error processing request stream.');
			});

			clientReq.on('data', function (incomingDataChunk) {
				if (SERVER_DEBUG_ENABLED) console.log(`[POST_DATA] Received chunk size: ${incomingDataChunk.length}`);
				incomingBuffer.push(incomingDataChunk);
			});

			clientReq.on('end', () => {
				const fullIncomingData = Buffer.concat(incomingBuffer).toString();
				if (SERVER_DEBUG_ENABLED) console.log("[POST_DATA] All data received. Content:", fullIncomingData);
				serverRes.writeHead(200, { 'Content-Type': 'application/json' });
				serverRes.write(fullIncomingData);
				serverRes.end();
			});
		},

		"/json/empty": function (clientReq, serverRes) {
			// Responds with an empty JSON response (204 No Content).
			if (SERVER_DEBUG_ENABLED) console.log("[ENDPOINT] /json/empty requested.");
			serverRes.writeHead(204, { 'Content-Type': 'application/json' });
			serverRes.end();
		},

		"/xml/empty": function (clientReq, serverRes) {
			// Responds with an empty XML response (204 No Content).
			if (SERVER_DEBUG_ENABLED) console.log("[ENDPOINT] /xml/empty requested.");
			serverRes.writeHead(204, { 'Content-Type': 'application/xml' });
			serverRes.end();
		}
	}
	// The original 'sleep' utility function is entirely removed as it was commented out in usage.
};

// --- Server Event Handling ---
appServiceHost.on('error', function (operationError) {
	console.error('[SERVER_FATAL_ERROR] HTTP Test Server encountered a critical error:', operationError);
	// Optionally, implement graceful shutdown logic here
	process.exit(1); // Exit with a non-zero code to indicate an error
});

// Start the server listening on the specified port
appServiceHost.listen(SERVER_PORT_NUM, () => {
	console.log(`[SERVER_START] HTTP server successfully launched and listening on port ${SERVER_PORT_NUM}`);
	if (SERVER_DEBUG_ENABLED) {
		console.log(`[SERVER_INFO] Debug logging is currently ENABLED.`);
		console.log(`[SERVER_INFO] Test with: curl http://localhost:${SERVER_PORT_NUM}/json`);
		console.log(`[SERVER_INFO] Test with: curl -H "test-header: myvalue" http://localhost:${SERVER_PORT_NUM}/120/json?arg1=hello&arg2=world`);
		console.log(`[SERVER_INFO] Test with: curl -X POST -d '{"key":"val"}' -H "Content-Type: application/json" http://localhost:${SERVER_PORT_NUM}/json?post`);
	}
});

// Add general unhandled exception and unhandled promise rejection handlers for robustness
process.on('uncaughtException', (error) => {
	console.error('[PROCESS_ERROR] Uncaught Exception:', error);
	// For production, consider logging and then exiting gracefully after cleanup
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('[PROCESS_ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
	// For production, log this but don't necessarily exit immediately unless critical
});