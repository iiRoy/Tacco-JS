const netClient = require('http');
const multipartBuilder = require('form-data');
const diskIO = require('fs');
const webFramework = require('express');
const eventBroadcaster = require('events').EventEmitter; // This module is now unused after removing StreamedPayload
const utilityKit = require('util'); // This module is now unused after removing StreamedPayload

// --- Application Configuration Constants ---
const SERVICE_LISTENING_PORT = 8060;
const TEMP_MAP_LOGIC_FILE = 'temporary_logic.json';
const TEMP_MAP_GEOMETRY_FILE = 'temporary_geometry.dat';
const STATIC_ASSETS_DIRECTORY = 'public_content'; // Renamed from 'static'

// --- Initialize Core Web Application ---
const primaryWebServer = webFramework();

// --- Configure Middleware and Routes ---
primaryWebServer.use(webFramework.static(STATIC_ASSETS_DIRECTORY)); // Serve static files
primaryWebServer.use(webFramework.urlencoded({ extended: true })); // Parse URL-encoded request bodies
primaryWebServer.use(webFramework.json()); // Parse JSON request bodies

// Add a basic health check endpoint
primaryWebServer.get('/health', (clientRequest, serverResponse) => {
    serverResponse.status(200).json({ status: 'online', uptime: process.uptime() });
});

/**
 * Handles incoming POST requests to '/process-map-upload'.
 * This endpoint accepts map configuration and layout data,
 * then forwards it to an appropriate external mapping service.
 */
primaryWebServer.post('/process-map-upload', async (clientRequest, serverResponse) => {
    console.log(`[${new Date().toISOString()}] Incoming map upload request detected.`);

    // Validate existence of request body
    if (!clientRequest.body) {
        console.error('Request body is absent, unable to process.');
        return serverResponse.status(400).send('Error: Request payload cannot be empty.');
    }

    let mapConfigurationData;
    const rawLogicInput = clientRequest.body.mapLogic;
    if (!rawLogicInput) {
        console.error('Missing "mapLogic" field in request.');
        return serverResponse.status(400).send('Error: Map logic data is required.');
    }

    try {
        mapConfigurationData = JSON.parse(rawLogicInput);
    } catch (parseErr) {
        console.error(`JSON parsing failed for map logic: ${parseErr.message}`);
        return serverResponse.status(400).send('Error: Invalid JSON format for map logic.');
    }

    const mapLayoutBinary = Buffer.from(clientRequest.body.mapLayout, 'base64');
    if (!mapLayoutBinary || mapLayoutBinary.length === 0) {
        console.error('Missing or empty "mapLayout" field in request.');
        return serverResponse.status(400).send('Error: Map layout data is required.');
    }

    // Determine the external service endpoint based on client preference
    let destinationServiceUrl;
    const isEuPreference = clientRequest.body.region === 'EU';

    const euServiceOptions = [
        'http://maptest.newcompte.fr/testmap',
        'http://justletme.be:8080/testmap'
    ];
    const northAmericaService = 'http://tagpro-maptest.koalabeast.com/testmap';

    if (isEuPreference) {
        // Select a random EU service from available options
        const randomIndex = Math.floor(Math.random() * euServiceOptions.length);
        destinationServiceUrl = euServiceOptions[randomIndex];
        console.log(`EU region preference detected. Routing to: ${destinationServiceUrl}`);
    } else {
        destinationServiceUrl = northAmericaService;
        console.log(`Defaulting to NA region service: ${destinationServiceUrl}`);
    }

    // Prepare multipart form data for the external service
    const formAssembler = new multipartBuilder();

    // Write data to temporary files for stream-based upload
    try {
        diskIO.writeFileSync(TEMP_MAP_LOGIC_FILE, JSON.stringify(mapConfigurationData));
        diskIO.writeFileSync(TEMP_MAP_GEOMETRY_FILE, mapLayoutBinary);
        console.log('Temporary map data files created successfully.');

        // Append the temporary files as fields to the form
        formAssembler.append('logic_payload', diskIO.createReadStream(TEMP_MAP_LOGIC_FILE));
        formAssembler.append('layout_payload', diskIO.createReadStream(TEMP_MAP_GEOMETRY_FILE));
    } catch (fileOpError) {
        console.error(`Failed to write temporary files: ${fileOpError.message}`);
        // Attempt cleanup even on write error
        try {
            if (diskIO.existsSync(TEMP_MAP_LOGIC_FILE)) diskIO.unlinkSync(TEMP_MAP_LOGIC_FILE);
            if (diskIO.existsSync(TEMP_MAP_GEOMETRY_FILE)) diskIO.unlinkSync(TEMP_MAP_GEOMETRY_FILE);
        } catch (cleanupErr) {
            console.warn(`Failed to clean up temp files after write error: ${cleanupErr.message}`);
        }
        return serverResponse.status(500).send('Internal Server Error: Could not prepare map data for submission.');
    }

    // Submit the form data to the chosen external service
    formAssembler.submit(destinationServiceUrl, (submissionError, upstreamResponse) => {
        // Always attempt to clean up temporary files after submission
        try {
            if (diskIO.existsSync(TEMP_MAP_LOGIC_FILE)) diskIO.unlinkSync(TEMP_MAP_LOGIC_FILE);
            if (diskIO.existsSync(TEMP_MAP_GEOMETRY_FILE)) diskIO.unlinkSync(TEMP_MAP_GEOMETRY_FILE);
            console.log('Temporary map data files removed.');
        } catch (cleanupIssue) {
            console.warn(`Problem during temporary file cleanup: ${cleanupIssue.message}`);
        }

        if (submissionError) {
            console.error(`Error during upstream service submission: ${submissionError.message}`);
            return serverResponse.status(503).send(
                `Upstream Service Unavailable: Failed to submit map. Details: ${submissionError.message}`
            );
        }

        if (!upstreamResponse) {
            console.error('Upstream service returned an empty response object.');
            return serverResponse.status(500).send('Internal Server Error: No response from upstream service.');
        }

        // It is crucial to consume the upstream response stream to prevent memory leaks
        let receivedChunks = [];
        upstreamResponse.on('data', (dataChunk) => {
            receivedChunks.push(dataChunk);
        });

        upstreamResponse.on('end', () => {
            const fullUpstreamResponse = Buffer.concat(receivedChunks).toString('utf8');
            console.log(`Upstream service responded with status ${upstreamResponse.statusCode}.`);
            // console.debug('Full upstream response body:', fullUpstreamResponse); // Uncomment for verbose debugging

            // Extract relevant headers and forward them, potentially adding the full body
            const forwardedHeaders = {
                'upstream-status-code': upstreamResponse.statusCode,
                'upstream-location': upstreamResponse.headers.location || 'N/A',
                'upstream-content-type': upstreamResponse.headers['content-type'] || 'text/plain',
                'upstream-response-body': fullUpstreamResponse // Including body as a header for simplicity here,
                                                              // could also be in the response body itself.
            };

            serverResponse.status(upstreamResponse.statusCode || 200).json(forwardedHeaders);
            console.log('Client response dispatched with upstream headers.');
        });

        upstreamResponse.on('error', (streamReadError) => {
            console.error(`Error reading upstream response stream: ${streamReadError.message}`);
            serverResponse.status(500).send('Internal Server Error: Problem reading upstream service response.');
        });
    });
});

// Start the web server listener
primaryWebServer.listen(SERVICE_LISTENING_PORT, () => {
    console.log(`Web application is now operational on port ${SERVICE_LISTENING_PORT}`);
    console.log(`Access the application via: http://localhost:${SERVICE_LISTENING_PORT}`);
});