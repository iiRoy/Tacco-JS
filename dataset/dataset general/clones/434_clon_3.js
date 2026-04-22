const utilities = require('util');
const networkComm = require('http');
const webSocketLib = require("./vendor/ws");
const base64Encoder = require('./vendor/base64');

// --- Configuration Constants ---
const TWITTER_STREAM_HOST = "stream.twitter.com";
const TWITTER_STREAM_PORT = 80;
const WEBSOCKET_SERVICE_PORT = 8080;
const TWEET_RECORD_DELIMITER = '\r'; // Twitter's streaming API uses carriage return as a record separator

// --- Application Logging Utility ---
function applicationEventLog(message, level = 'info') {
    const timestamp = new Date().toISOString();
    switch (level.toLowerCase()) {
        case 'error':
            console.error(`[ERROR] ${timestamp}: ${message}`);
            break;
        case 'debug':
            utilities.debug(`[DEBUG] ${timestamp}: ${message}`);
            break;
        case 'warn':
            console.warn(`[WARN] ${timestamp}: ${message}`);
            break;
        default: // 'info' or any other
            console.log(`[INFO] ${timestamp}: ${message}`);
    }
}

// --- Command Line Argument Parsing ---
// process.argv contains ['node', 'script_name.js', arg1, arg2, ...]
const commandLineArgs = process.argv.slice(2);
const twitterUserIdentifier = commandLineArgs[0];
const twitterPasscode = commandLineArgs[1];
const defaultMonitoringTopic = "iphone";
const desiredSearchTopic = commandLineArgs[2] || defaultMonitoringTopic;

// --- Pre-flight Validation ---
if (!twitterUserIdentifier || !twitterPasscode) {
    applicationEventLog("Usage: node clone_script.js <twitter_username> <twitter_password> [search_keyword]", 'error');
    applicationEventLog("Example: node clone_script.js myuser mypass sports", 'info');
    process.exit(1); // Terminate process with an error code
}

// --- Twitter API Authentication Setup ---
const encodedAuthString = base64Encoder.encode(`${twitterUserIdentifier}:${twitterPasscode}`);
const twitterRequestHeaders = {
    'Authorization': `Basic ${encodedAuthString}`,
    'Host': TWITTER_STREAM_HOST,
    'User-Agent': 'NodeJS-Clone-Twitter-Stream-Client/1.1', // Custom User-Agent
    'Accept': 'application/json, */*' // Explicitly indicate accepted content types
};

// --- WebSocket Client Management ---
let activeClientConnections = [];
let receivedTweetCount = 0; // Counter for successfully parsed tweets

// --- Establish Connection to Twitter's Streaming API ---
// Using http.request directly for more control and modern Node.js practices
const twitterApiRequestOptions = {
    hostname: TWITTER_STREAM_HOST,
    port: TWITTER_STREAM_PORT,
    path: `/1/statuses/filter.json?track=${encodeURIComponent(desiredSearchTopic)}`, // Ensure topic is URL-encoded
    method: 'GET',
    headers: twitterRequestHeaders
};

applicationEventLog(`Initiating connection to Twitter stream for topic: '${desiredSearchTopic}'`);
const twitterStreamInitiator = networkComm.request(twitterApiRequestOptions, (apiDataResponse) => {
    apiDataResponse.setEncoding("utf8"); // Configure response data encoding

    let accumulatedDataBuffer = ""; // Buffer to store incomplete data chunks

    apiDataResponse.on("data", (dataSegment) => {
        // Guard against empty data segments
        if (!dataSegment || dataSegment.length === 0) {
            applicationEventLog("Received an empty data segment from Twitter stream.", 'debug');
            return;
        }

        accumulatedDataBuffer += dataSegment;

        let recordBoundaryPosition;
        // Process the buffer, extracting complete tweet records delimited by TWEET_RECORD_DELIMITER
        while ((recordBoundaryPosition = accumulatedDataBuffer.indexOf(TWEET_RECORD_DELIMITER)) !== -1) {
            const rawTweetRecord = accumulatedDataBuffer.substring(0, recordBoundaryPosition);
            accumulatedDataBuffer = accumulatedDataBuffer.substring(recordBoundaryPosition + TWEET_RECORD_DELIMITER.length); // Advance the buffer past the delimiter

            // Ignore empty records, often sent as keep-alive signals by Twitter
            if (rawTweetRecord.trim().length === 0) {
                applicationEventLog("Detected a Twitter stream keep-alive signal or empty record.", 'debug');
                continue;
            }

            try {
                // Attempt to parse the raw record as a JSON object (expected format for tweets)
                const tweetPayload = JSON.parse(rawTweetRecord);
                receivedTweetCount++;
                applicationEventLog(`Parsed tweet #${receivedTweetCount} (ID: ${tweetPayload.id_str || 'N/A'})`, 'debug');

                // Distribute the raw JSON tweet data to all currently connected WebSocket clients
                activeClientConnections.forEach((socketInstance) => {
                    // Ensure the socket is open before attempting to send data
                    if (socketInstance && socketInstance.readyState === webSocketLib.OPEN) {
                        socketInstance.send(rawTweetRecord + '\n'); // Append newline for client-side parsing convenience
                    } else {
                        applicationEventLog("Attempted to send data to a non-open WebSocket client.", 'debug');
                    }
                });

            } catch (jsonParsingError) {
                // Log parsing errors, but do not halt the stream
                applicationEventLog(`JSON parsing failure for tweet record: ${jsonParsingError.message}. Raw data (partial): "${rawTweetRecord.substring(0, 150)}..."`, 'error');
            }
        }
    });

    apiDataResponse.on('end', () => {
        applicationEventLog("Twitter stream connection has gracefully ended.", 'info');
    });

    apiDataResponse.on('error', (err) => {
        applicationEventLog(`Error encountered during Twitter stream response: ${err.message}`, 'error');
        // Consider re-attempting connection or exiting based on error type
    });

    applicationEventLog(`Twitter stream connected successfully. Status: ${apiDataResponse.statusCode} ${apiDataResponse.statusMessage}`);

}).on('error', (e) => {
    applicationEventLog(`Critical error establishing Twitter API request: ${e.message}`, 'error');
    process.exit(1); // Exit if initial connection fails
});

twitterStreamInitiator.end(); // Finalize and send the HTTP request

// --- Periodic Status Reporting ---
setInterval(() => {
    applicationEventLog(`Current active WebSocket clients: ${activeClientConnections.length}. Total tweets processed since start: ${receivedTweetCount}.`, 'info');
}, 60 * 1000); // Log status every 60 seconds

// --- Initialize WebSocket Server ---
webSocketLib.createServer((clientSocketInstance) => {
    // Add the new client connection to our collection
    activeClientConnections.push(clientSocketInstance);
    applicationEventLog(`New WebSocket client connected. Total clients: ${activeClientConnections.length}`, 'info');

    clientSocketInstance.on("connect", (requestedResourcePath) => {
        // Event emitted after a successful WebSocket handshake
        applicationEventLog(`WebSocket handshake completed for resource: ${requestedResourcePath}`, 'debug');
    });

    clientSocketInstance.on("close", () => {
        // Remove the disconnected client from the collection
        const initialClientCount = activeClientConnections.length;
        activeClientConnections = activeClientConnections.filter(s => s !== clientSocketInstance);
        applicationEventLog(`WebSocket client disconnected. Remaining clients: ${activeClientConnections.length}. (Removed ${initialClientCount - activeClientConnections.length} connection)`, 'info');
    });

    clientSocketInstance.on("error", (err) => {
        applicationEventLog(`An error occurred with a WebSocket client: ${err.message}`, 'error');
        // Attempt to close the socket if it's still open or connecting
        if (clientSocketInstance.readyState === webSocketLib.OPEN || clientSocketInstance.readyState === webSocketLib.CONNECTING) {
            clientSocketInstance.close();
        }
    });

}).listen(WEBSOCKET_SERVICE_PORT, () => {
    applicationEventLog(`WebSocket server is now listening for connections on port ${WEBSOCKET_SERVICE_PORT}`, 'info');
});