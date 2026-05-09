// Centralized application configuration settings for easy management
const systemSettings = {
  // Web server configuration parameters
  webServer: {
    dataEndpoint: '/api/data_stream', // Specific path for receiving incoming data payloads
    listeningPort: 8080,               // The TCP port on which the HTTP server will listen
    listeningHost: '0.0.0.0',          // Host interface to bind to ('0.0.0.0' listens on all available interfaces)
    enableAccessLogs: true             // Flag to control detailed request/response logging to console
  },
  // Redis database settings for the client responsible for subscribing to channels
  dataSubscriber: {
    connectionHost: '127.0.0.1',       // IP address or hostname of the Redis subscriber instance
    connectionPort: 6379,              // Port number for the Redis subscriber connection
    requiresAuthentication: true,      // Set to 'true' if the Redis subscriber requires a password
    authenticationKey: 'sub_secure_pass_xyz' // Password for the Redis subscriber client
  },
  // Redis database settings for the client responsible for publishing messages
  dataPublisher: {
    connectionHost: '127.0.0.1',       // IP address or hostname of the Redis publisher instance
    connectionPort: 6379,              // Port number for the Redis publisher connection
    requiresAuthentication: true,      // Set to 'true' if the Redis publisher requires a password
    authenticationKey: 'pub_secure_pass_abc' // Password for the Redis publisher client
  },
  // Socket.IO specific configurations for the WebSocket server
  websocketConfig: {
    verbosityLevel: 3                  // Socket.IO logging verbosity (0=off, 1=error, 2=warn, 3=info/debug)
  },
  // Security settings for API endpoints, primarily for incoming POST requests
  apiSecurity: {
    sharedSecret: 'secureStreamKey_12345' // Secret key required to authenticate incoming data pushes
  },
  // Redis channel pattern for subscriptions (e.g., '*' for all, 'mychannel.*' for specific patterns)
  channelSubscriptionPattern: '*'      // Wildcard pattern to subscribe to all Redis channels
};

// --- CORE SERVER LOGIC IMPLEMENTATION ---

// Import necessary external modules using 'const' for immutability
const redisClientModule = require('redis');
const expressFramework = require('express');
const socketIoModule = require('socket.io');

/**
 * Helper function to instantiate and configure a Redis client.
 * Includes connection logging and error handling.
 * @param {number} port - The Redis server port.
 * @param {string} host - The Redis server host.
 * @param {boolean} authRequired - True if authentication is needed.
 * @param {string} password - The password for authentication.
 * @param {string} clientName - A descriptive name for the client (e.g., 'Publisher', 'Subscriber').
 * @returns {object} The configured Redis client instance.
 */
function createAndConfigureRedisClient(port, host, authRequired, password, clientName) {
  const client = redisClientModule.createClient(port, host); // Create a new Redis client instance

  // Authenticate if required
  if (authRequired) {
    client.auth(password, (err) => {
      if (err) {
        console.error(`[Redis ${clientName}] CRITICAL: Authentication failed for ${host}:${port}. Error: ${err.message}`);
        // In a production scenario, you might want to exit the process or implement a retry mechanism here.
      } else {
        console.log(`[Redis ${clientName}] Successfully authenticated to ${host}:${port}.`);
      }
    });
  }

  // Event listener for successful connection
  client.on('connect', () => {
    console.log(`[Redis ${clientName}] Connection established with ${host}:${port}.`);
  });

  // Event listener for connection errors
  client.on('error', (err) => {
    console.error(`[Redis ${clientName}] Connection error detected for ${host}:${port}. Details: ${err.message}`);
  });

  return client;
}

// Initialize Redis publisher and subscriber clients based on system settings
const streamPublisher = createAndConfigureRedisClient(
  systemSettings.dataPublisher.connectionPort,
  systemSettings.dataPublisher.connectionHost,
  systemSettings.dataPublisher.requiresAuthentication,
  systemSettings.dataPublisher.authenticationKey,
  'Publisher'
);

const streamSubscriber = createAndConfigureRedisClient(
  systemSettings.dataSubscriber.connectionPort,
  systemSettings.dataSubscriber.connectionHost,
  systemSettings.dataSubscriber.requiresAuthentication,
  systemSettings.dataSubscriber.authenticationKey,
  'Subscriber'
);

// Configure the Redis subscriber to listen for pattern-matched messages
streamSubscriber.on("pmessage", (patternMatch, messageChannel, rawPayload) => {
  try {
    // Attempt to parse the incoming JSON payload
    const parsedData = JSON.parse(rawPayload);
    // Emit the parsed data to all connected Socket.IO clients on the specific channel.
    // 'volatile' ensures that if a client is not ready to receive, the message is dropped.
    websocketServer.sockets.volatile.emit(messageChannel, parsedData);

    // Log the emission if access logs are enabled
    if (systemSettings.webServer.enableAccessLogs) {
      console.log(`[WebSocket] Data emitted to channel '${messageChannel}' (matched pattern: '${patternMatch}')`);
    }
  } catch (parseError) {
    // Log an error if JSON parsing fails
    console.error(`[Subscriber] Failed to parse JSON payload for channel '${messageChannel}'. Error: ${parseError.message}`);
  }
});

// Subscribe the Redis client to the configured channel pattern
streamSubscriber.psubscribe(systemSettings.channelSubscriptionPattern, (err, count) => {
  if (err) {
    console.error(`[Subscriber] Error subscribing to pattern '${systemSettings.channelSubscriptionPattern}': ${err.message}`);
  } else {
    console.log(`[Subscriber] Successfully subscribed to pattern: '${systemSettings.channelSubscriptionPattern}' (total subscriptions: ${count})`);
  }
});


// Initialize the Express application instance
const mainWebServer = expressFramework();

// Apply Express middleware for static files and body parsing
mainWebServer.use(expressFramework.static(__dirname + '/public')); // Serve static assets from the '/public' directory
mainWebServer.use(expressFramework.json());                       // Middleware to parse incoming JSON request bodies
mainWebServer.use(expressFramework.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies

// Start the HTTP server and bind it to the specified port and host
const httpServerInstance = mainWebServer.listen(
  systemSettings.webServer.listeningPort,
  systemSettings.webServer.listeningHost,
  () => {
    console.log(`[Web Server] Operational: Listening on http://${systemSettings.webServer.listeningHost}:${systemSettings.webServer.listeningPort}`);
  }
);

// Define the POST endpoint for receiving and publishing data
mainWebServer.post(systemSettings.webServer.dataEndpoint, (incomingRequest, serverResponse) => {
  // Guard clause: Check if the request body is present
  if (!incomingRequest.body || Object.keys(incomingRequest.body).length === 0) {
    console.warn('[API] Received POST request with an empty or missing body.');
    return serverResponse.status(400).send('Bad Request: Request body cannot be empty.');
  }

  // Destructure the request body to extract security key, target channel, and the remaining payload
  const { securityKey, targetChannel, ...messagePayload } = incomingRequest.body;

  // Guard clause: Validate the provided security key
  if (securityKey !== systemSettings.apiSecurity.sharedSecret) {
    console.warn('[API] Unauthorized access attempt detected due to invalid security key.');
    return serverResponse.status(401).send('Unauthorized: The provided security key is invalid.');
  }

  // Guard clause: Validate the target channel
  if (!targetChannel || typeof targetChannel !== 'string' || targetChannel.trim() === '') {
    console.warn('[API] Received request without a valid "targetChannel" in the payload.');
    return serverResponse.status(400).send('Bad Request: "targetChannel" is missing or invalid.');
  }

  // Attempt to publish the message to Redis
  try {
    const payloadToSend = JSON.stringify(messagePayload); // Convert the remaining payload back to JSON string
    streamPublisher.publish(targetChannel, payloadToSend);
    console.log(`[API] Successfully published message to Redis channel '${targetChannel}'.`);
    serverResponse.status(200).send('Data successfully published to the stream.');
  } catch (serializationError) {
    console.error(`[API] Failed to serialize message payload for channel '${targetChannel}'. Error: ${serializationError.message}`);
    serverResponse.status(500).send('Internal Server Error: Failed to process message payload.');
  }
});

// Initialize Socket.IO server and attach it to the existing HTTP server instance
const websocketServer = socketIoModule(httpServerInstance);

// Configure Socket.IO connection/disconnection logging based on verbosity level
websocketServer.sockets.on('connection', (clientSocket) => {
  if (systemSettings.websocketConfig.verbosityLevel >= 1) { // Log connections if verbosity is 1 or higher
    console.log(`[Socket.IO] New client connected: ${clientSocket.id}`);
  }
  clientSocket.on('disconnect', () => {
    if (systemSettings.websocketConfig.verbosityLevel >= 1) { // Log disconnections
      console.log(`[Socket.IO] Client disconnected: ${clientSocket.id}`);
    }
  });
  // Additional Socket.IO event listeners or configurations could be added here.
});

// Note on Socket.IO log level:
// The original `io.configure` and `io.set('log level', ...)` methods are deprecated in modern Socket.IO.
// Logging is now typically handled by passing options directly to the `socketIoModule()` constructor
// or by using a separate logging framework. For this Type III clone, I've replaced the intent
// with custom console logs controlled by `systemSettings.websocketConfig.verbosityLevel` for clarity.