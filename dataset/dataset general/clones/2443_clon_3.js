const httpModule = require('http');
const httpsModule = require('https');
const urlParser = require('url');
const pathHandler = require('path');
const jsonStreamProtocol = require('json-line-protocol').JsonLineProtocol;
const appConfiguration = require('./config');
const fileSystem = require('fs');

// Helper function to send standard HTTP responses
const sendHttpResponse = (responseObj, statusCode, contentType, messageBody) => {
    responseObj.writeHead(statusCode, { 'Content-Type': contentType });
    responseObj.end(messageBody);
};

// Basic MIME type mapping for serving static assets
const assetMimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    'default': 'application/octet-stream'
};

// Create and configure the primary HTTP server
const webServiceHost = httpModule.createServer((clientRequest, serverResponse) => {
    const parsedUrl = urlParser.parse(clientRequest.url, true);
    const requestPath = parsedUrl.pathname;
    console.info(`Request received for: ${requestPath}`);

    // Basic validation for path traversal attempts
    if (!requestPath || requestPath.includes('..') || requestPath.includes('%2e%2e')) {
        console.warn(`Blocked potential path traversal attempt: ${requestPath}`);
        sendHttpResponse(serverResponse, 400, 'text/plain', '400 Bad Request: Invalid path characters.');
        return;
    }

    // Handle the specific real-time data stream endpoint
    if (requestPath === '/stream') {
        console.log('Initiating real-time data stream service...');

        // Guard against missing Twitter credentials
        if (!appConfiguration.twitter_username || !appConfiguration.twitter_password) {
            console.error('Configuration error: Twitter credentials are not provided.');
            sendHttpResponse(serverResponse, 503, 'text/plain', '503 Service Unavailable: Twitter credentials missing.');
            return;
        }

        const dataProcessor = new jsonStreamProtocol();
        const apiUser = appConfiguration.twitter_username;
        const apiPass = appConfiguration.twitter_password;

        // Construct authorization header dynamically
        const basicAuthHeader = `Basic ${Buffer.from(`${apiUser}:${apiPass}`).toString('base64')}`;

        const twitterStreamOptions = {
            hostname: 'stream.twitter.com',
            port: 443,
            path: '/1.1/statuses/filter.json?track=javascript,nodejs,webdev', // Changed filter terms
            headers: {
                'Authorization': basicAuthHeader,
                'User-Agent': 'CustomNodeStreamClient/1.1' // Added a custom User-Agent
            }
        };

        // Set up Server-Sent Events headers
        serverResponse.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Establish connection to Twitter streaming API
        const streamConnection = httpsModule.get(twitterStreamOptions, (apiResponse) => {
            console.log(`Connected to Twitter API. Status code: ${apiResponse.statusCode}`);

            if (apiResponse.statusCode !== 200) {
                console.error(`Twitter API responded with non-200 status: ${apiResponse.statusCode}`);
                sendHttpResponse(serverResponse, 502, 'text/plain', `502 Bad Gateway: Twitter API error ${apiResponse.statusCode}`);
                streamConnection.destroy(); // Terminate upstream connection
                return;
            }

            apiResponse.on('data', (incomingDataChunk) => {
                dataProcessor.feed(incomingDataChunk);
            });

            apiResponse.on('end', () => {
                console.log('Twitter stream ended by remote server.');
                // serverResponse.end(); // Do not forcefully end client response, let it manage reconnection
            });

            apiResponse.on('error', (streamError) => {
                console.error(`Error during Twitter stream processing: ${streamError.message}`);
                // serverResponse.end(); // If client is still connected, this will error.
            });
        }).on('error', (connectionIssue) => {
            console.error(`Failed to establish HTTPS connection to Twitter: ${connectionIssue.message}`);
            sendHttpResponse(serverResponse, 500, 'text/plain', '500 Internal Server Error: Could not reach Twitter API.');
        });

        // Process incoming JSON objects from the stream
        dataProcessor.on('value', (processedValue) => {
            // Only send data if it contains a 'text' property (likely a tweet)
            if (processedValue && processedValue.text) {
                serverResponse.write('event: tweet_data\n'); // Changed event name
                serverResponse.write(`data: ${JSON.stringify(processedValue)}\n\n`);
            } else {
                // Log non-tweet data for debugging, but don't send to client
                console.debug('Received non-tweet or malformed data from stream.');
            }
        });

        // Handle client disconnection for proper resource cleanup
        clientRequest.on('close', () => {
            console.log('Client closed connection to /stream. Terminating upstream Twitter stream.');
            streamConnection.destroy();
        });

    } else { // Serve static files for other requests
        let staticFilePath = requestPath;

        // Map root or home paths to default index file
        if (staticFilePath === '/' || staticFilePath === '/landing') { // Added an alternative default path
            staticFilePath = '/index.html';
        }

        // Construct the full path to the static file within a designated 'public' directory
        const baseContentDirectory = pathHandler.normalize(pathHandler.join(process.cwd(), 'public_html')); // Changed folder name
        const fullLocalFilePath = pathHandler.normalize(pathHandler.join(baseContentDirectory, staticFilePath));
        console.log(`Attempting to retrieve static asset: ${fullLocalFilePath}`);

        // Ensure the requested file is within the allowed static content directory
        if (!fullLocalFilePath.startsWith(baseContentDirectory)) {
            console.warn(`Forbidden access: Requested path outside content directory: ${fullLocalFilePath}`);
            sendHttpResponse(serverResponse, 403, 'text/plain', '403 Forbidden: Access to requested resource is denied.');
            return;
        }

        // Check file existence and permissions asynchronously
        fileSystem.access(fullLocalFilePath, fileSystem.constants.F_OK | fileSystem.constants.R_OK, (accessErr) => { // Check for read permission
            if (accessErr) {
                console.warn(`Static file not found or unreadable: ${fullLocalFilePath}`);
                sendHttpResponse(serverResponse, 404, 'text/plain', '404 Not Found: The requested file could not be located.');
                return;
            }

            // Read the file content from disk
            fileSystem.readFile(fullLocalFilePath, (readErr, fileBuffer) => { // Removed 'binary' encoding, Node handles buffer by default
                if (readErr) {
                    console.error(`Error reading static file ${fullLocalFilePath}: ${readErr.message}`);
                    sendHttpResponse(serverResponse, 500, 'text/plain', `500 Internal Server Error: Could not read file.`);
                    return;
                }

                // Determine Content-Type based on file extension
                const fileExtension = pathHandler.extname(fullLocalFilePath).toLowerCase();
                const contentType = assetMimeTypes[fileExtension] || assetMimeTypes['default'];

                serverResponse.writeHead(200, { 'Content-Type': contentType, 'Content-Length': fileBuffer.length }); // Added Content-Length
                serverResponse.end(fileBuffer);
            });
        });
    }
});

// Configure server listening parameters with defaults
const listenPort = appConfiguration.server_port || 9000; // Changed default port
const listenAddress = appConfiguration.server_address || '0.0.0.0'; // Changed default address

// Start the server and handle potential startup errors
webServiceHost.listen(listenPort, listenAddress, () => {
    console.log(`Service operational at http://${listenAddress}:${listenPort}/`);
    console.log('To stop the server, press Ctrl+C.');
}).on('error', (startupError) => {
    console.error(`Failed to start HTTP server: ${startupError.message}`);
    process.exit(1); // Indicate a critical startup failure
});