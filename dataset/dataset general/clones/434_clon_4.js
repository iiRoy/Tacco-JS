const utilityLog = console;
const webExchange = require('http');
const channelProvider = require("./vendor/ws"); // Retaining vendor path but renaming module access

// Application configuration details from execution arguments
const loginId = process.argv[2];
const passCode = process.argv[3];
const searchTerm = process.argv[4] || "iphone";

if (!loginId || !passCode) {
  utilityLog.error("Usage: node app.js <twitter_username> <twitter_password> <keyword>");
  process.exit(1); // Terminate process with error code
}

// Credentials for accessing the external data source
const credentialsToken = Buffer.from(`${loginId}:${passCode}`).toString('base64');
const requestHeaders = {
  'Authorization': `Basic ${credentialsToken}`,
  'Host': "stream.twitter.com"
};

// Central registry for currently active client channels
const activeConnections = new Set();

// Configuration for the external content stream request
const streamOptions = {
  hostname: "stream.twitter.com",
  port: 80,
  path: `/1/statuses/filter.json?track=${searchTerm}`,
  method: "GET",
  headers: requestHeaders
};

// Initiating the request to the external service
const outgoingStream = webExchange.request(streamOptions, (incomingStream) => {
  incomingStream.setEncoding("utf8");

  let processingBuffer = '';

  incomingStream.on("data", (dataSegment) => {
    processingBuffer += dataSegment;

    const delimiterPosition = processingBuffer.indexOf('\r');
    // Process content only when a complete message (delimited by '\r') is received.
    if (delimiterPosition !== -1) {
      const parsedContent = processingBuffer.slice(0, delimiterPosition);

      // Forward the extracted content to all registered client channels
      for (const connectionHandle of activeConnections) {
        connectionHandle.send(parsedContent); // Assuming 'send' method exists for client channels
      }

      processingBuffer = processingBuffer.slice(delimiterPosition + 1);
    }
  });

  incomingStream.on("error", (err) => {
    utilityLog.error("Error from external data stream:", err.message);
  });
});

outgoingStream.on("error", (err) => {
  utilityLog.error("Failed to establish request to external stream:", err.message);
});

outgoingStream.end(); // Completes the request setup and initiates the stream

// Setting up a local network channel service for clients
channelProvider.createServer((connectionHandle) => {
  activeConnections.add(connectionHandle); // Enroll new client channel

  connectionHandle.on("open", (resourceIdentifier) => { // Event for successful channel establishment
    utilityLog.log(`Client channel opened: ${resourceIdentifier}`);
  });

  connectionHandle.on("close", () => { // Event for channel termination
    activeConnections.delete(connectionHandle); // Unenroll channel
    utilityLog.log("Client channel terminated.");
  });

  connectionHandle.on("error", (err) => { // Event for channel errors
    utilityLog.error("Client channel error:", err.message);
    activeConnections.delete(connectionHandle); // Ensure channel is removed on error
  });

}).listen(8080, () => {
  utilityLog.log("Local channel service available on port 8080.");
});