const APPLICATION_SERVER_HOST = "http://tapit.nodejitsu.com";
// APPLICATION_SERVER_HOST = "http://192.168.1.105"; // Alternative local development endpoint
const APPLICATION_SERVER_PORT = "80";

// Data store access credentials and endpoints.
const REDIS_SERVER_PORT = 6379;
const REDIS_SERVER_HOST = 'nodejitsudb6981647929.redis.irstack.com';
const REDIS_AUTH_SECRET = 'nodejitsudb6981647929.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4';

// Core framework imports and setup.
const webFramework = require('express');
const httpUtility = require('http'); // Required for explicit server creation
const persistenceManager = require('redis');
const path = require('path'); // For path manipulation

// Create the main web application instance.
const serverApp = webFramework();
const httpServer = httpUtility.createServer(serverApp); // Use http.createServer explicitly
const realtimeCommManager = require('socket.io').listen(httpServer);

// Helper function to establish a Redis client connection and authenticate.
const createAuthenticatedRedisClient = (port, host, authSecret) => {
  const client = persistenceManager.createClient(port, host);
  client.on('error', (err) => {
    console.error(`ERROR: Redis client error: ${err.message}`);
  });
  client.auth(authSecret, (errorOccurred) => {
    if (errorOccurred) {
      console.error(`CRITICAL: Failed to authenticate Redis client: ${errorOccurred.message}`);
      // In a real application, consider a more robust failure mechanism, e.g., process.exit(1)
      throw errorOccurred;
    }
    console.log('INFO: Redis client successfully authenticated.');
  });
  return client;
};

// Establish the primary data store connection.
const centralDataStore = createAuthenticatedRedisClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST, REDIS_AUTH_SECRET);

// Configure the web application middleware and view engine.
serverApp.use(webFramework.json()); // For parsing application/json
serverApp.use(webFramework.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
serverApp.use(webFramework.static(path.join(__dirname, 'public_assets'))); // Serve static files from 'public_assets' directory
serverApp.set('view engine', 'pug'); // Set Pug (formerly Jade) as the templating engine
serverApp.set('views', path.join(__dirname, 'views')); // Specify the views directory

// Begin listening for incoming HTTP requests on the specified port.
httpServer.listen(APPLICATION_SERVER_PORT, () => {
  console.log(`INFO: Application server listening on port ${APPLICATION_SERVER_PORT}`);
});

// Utility function for generating unique identifiers.
const generateUniqueGameId = () => {
    // Generates a unique string using current timestamp and a random part.
    // Ensures a reasonable length and uniqueness probability for game IDs.
    const timestampPart = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10); // Take a shorter random slice
    return `game-${timestampPart}-${randomPart}`;
};

// Utility function to sanitize user input strings for display or storage.
const cleanseInputString = (dirtyString) => {
    if (typeof dirtyString !== 'string') {
        return ''; // Return empty string for non-string inputs
    }
    // Removes non-alphanumeric characters and trims whitespace.
    // This is suitable for player handles/nicknames.
    return dirtyString.replace(/[^a-zA-Z0-9]/g, '').trim();
};

// --- API Endpoint Definitions ---

// Root endpoint: displays the main application interface.
serverApp.get('/', (incomingRequest, outgoingResponse) => {
  console.log('DEBUG: Received GET request for root path.');
  outgoingResponse.render('homepage_view');
});

// Endpoint for initiating a new game session.
serverApp.get('/game-creation-wizard', (incomingRequest, outgoingResponse) => {
  const newGameIdentifier = generateUniqueGameId();
  const renderingData = {
    serverAddress: APPLICATION_SERVER_HOST,
    serverPort: APPLICATION_SERVER_PORT,
    gameReferenceId: newGameIdentifier
  };

  // Add the newly created game ID to the set of active games in the data store.
  centralDataStore.sadd('active_game_identifiers', newGameIdentifier, (addError, addResult) => {
    if (addError) {
      console.error(`ERROR: Failed to add game ID ${newGameIdentifier} to data store: ${addError.message}`);
      return outgoingResponse.status(500).send('Internal Server Error: Could not create game.');
    }
    console.log(`INFO: New game session created with ID: ${newGameIdentifier}`);
    outgoingResponse.render('game_creation_form', renderingData);
  });
});

// Endpoint for displaying the game start page after creation.
serverApp.get('/game-session/:gameReferenceId/initiate', (incomingRequest, outgoingResponse) => {
  const requestedGameId = incomingRequest.params.gameReferenceId;
  // Basic validation for game ID format.
  if (!requestedGameId || !requestedGameId.startsWith('game-') || requestedGameId.length < 10) { // Added length check
      console.warn(`WARNING: Invalid game reference ID format received: ${requestedGameId}`);
      return outgoingResponse.status(400).send('Bad Request: Invalid game identifier format.');
  }

  const renderingParameters = { gameId: requestedGameId };
  outgoingResponse.render('game_start_page', renderingParameters);
});

// Endpoint for a player to join an existing game session.
serverApp.post('/game-session/:gameReferenceId/participate', (incomingRequest, outgoingResponse) => {
  const targetGameId = incomingRequest.params.gameReferenceId;
  const rawPlayerHandle = incomingRequest.body.playerHandle; // Assuming 'playerHandle' in body

  // Validate player handle
  if (!rawPlayerHandle || typeof rawPlayerHandle !== 'string' || rawPlayerHandle.trim() === '') {
      console.warn(`WARNING: Player handle missing or invalid type for game ${targetGameId}.`);
      return outgoingResponse.status(400).send('Bad Request: Player handle is required and must be a string.');
  }

  const sanitizedPlayerHandle = cleanseInputString(rawPlayerHandle);
  if (sanitizedPlayerHandle.length === 0) {
      console.warn(`WARNING: Player handle became empty after sanitization for game ${targetGameId}. Raw: '${rawPlayerHandle}'`);
      return outgoingResponse.status(400).send('Bad Request: Invalid player handle after sanitization.');
  }
  if (sanitizedPlayerHandle.length > 20) { // Enforce a max length
      console.warn(`WARNING: Player handle too long after sanitization for game ${targetGameId}. Handle: '${sanitizedPlayerHandle}'`);
      return outgoingResponse.status(400).send('Bad Request: Player handle too long.');
  }


  // Check if the game actually exists in the data store.
  centralDataStore.sismember('active_game_identifiers', targetGameId, (lookupError, gameExists) => {
    if (lookupError) {
      console.error(`ERROR: Data store lookup failed for game ${targetGameId}: ${lookupError.message}`);
      return outgoingResponse.status(500).send('Internal Server Error: Could not verify game existence.');
    }

    // If game is not found, return a 404 response.
    if (!gameExists) {
      console.log(`INFO: Attempted to join non-existent game: ${targetGameId}`);
      return outgoingResponse.status(404).send('Game session not found. Please create a new one or check the ID.');
    }

    // Check if the player handle is already taken within this specific game.
    const gamePlayersSetKey = `players_in_game:${targetGameId}`;
    centralDataStore.sismember(gamePlayersSetKey, sanitizedPlayerHandle, (checkError, playerAlreadyExists) => {
      if (checkError) {
        console.error(`ERROR: Data store check for player handle failed for game ${targetGameId}: ${checkError.message}`);
        return outgoingResponse.status(500).send('Internal Server Error: Could not check player handle.');
      }

      if (playerAlreadyExists) {
          console.log(`INFO: Player handle '${sanitizedPlayerHandle}' already in use for game ${targetGameId}.`);
          // Optionally, redirect or send a specific error for duplicate player handles
          return outgoingResponse.status(409).send('Conflict: Player handle already taken in this game. Please choose another.');
      }

      // Add the new player handle to the game's set of participants.
      centralDataStore.sadd(gamePlayersSetKey, sanitizedPlayerHandle, (addPlayerError, addPlayerResult) => {
        if (addPlayerError) {
          console.error(`ERROR: Failed to add player ${sanitizedPlayerHandle} to game ${targetGameId}: ${addPlayerError.message}`);
          return outgoingResponse.status(500).send('Internal Server Error: Could not add player to game.');
        }

        console.log(`INFO: Player '${sanitizedPlayerHandle}' successfully joined game '${targetGameId}'.`);
        const viewRenderOptions = {
          serverAddress: APPLICATION_SERVER_HOST,
          serverPort: APPLICATION_SERVER_PORT,
          gameId: targetGameId,
          playerNickname: sanitizedPlayerHandle,
          joinTimestamp: new Date().toISOString() // ISO string for better representation
        };
        outgoingResponse.render('game_joining_confirmation', viewRenderOptions);
      });
    });
  });
});

// --- Realtime Communication (Socket.IO) Setup ---

// Handle new client connections to the Socket.IO server.
realtimeCommManager.on('connection', (clientSocket) => {
  console.log(`INFO: New client connected with ID: ${clientSocket.id}`);

  // Create dedicated Redis clients for subscription and publication for this socket.
  // This ensures isolation and proper handling of pub/sub channels.
  const subscriberClient = createAuthenticatedRedisClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST, REDIS_AUTH_SECRET);
  const publisherClient = createAuthenticatedRedisClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST, REDIS_AUTH_SECRET);

  // Event handler for broadcasting messages to a specific channel.
  clientSocket.on('broadcast_message', (targetTopic, messagePayload) => {
    if (!targetTopic || typeof targetTopic !== 'string' || targetTopic.trim() === '') {
        console.warn(`WARNING: Invalid topic received for broadcast from client ${clientSocket.id}.`);
        return; // Ignore invalid broadcast requests.
    }
    console.log(`DEBUG: Client ${clientSocket.id} broadcasting to topic '${targetTopic}': ${JSON.stringify(messagePayload)}`);
    publisherClient.publish(targetTopic, JSON.stringify(messagePayload)); // Stringify payload for Redis
  });

  // Event handler for subscribing to a pattern-based topic.
  clientSocket.on('subscribe_to_pattern', (topicPattern) => {
    if (!topicPattern || typeof topicPattern !== 'string' || topicPattern.trim() === '') {
        console.warn(`WARNING: Invalid topic pattern received for subscription from client ${clientSocket.id}.`);
        return;
    }
    console.log(`DEBUG: Client ${clientSocket.id} subscribing to pattern: ${topicPattern}`);
    subscriberClient.psubscribe(topicPattern);
  });

  // Event listener for messages received on subscribed patterns from Redis.
  subscriberClient.on("pmessage", (matchedPattern, specificTopic, receivedContent) => {
    console.log(`DEBUG: Redis pmessage - Pattern: ${matchedPattern}, Topic: ${specificTopic}, Data: ${receivedContent}`);
    // Emit a generic 'realtime_update' event to the client with the message details.
    try {
        const parsedContent = JSON.parse(receivedContent);
        clientSocket.emit('realtime_update', {
            matchedPattern: matchedPattern,
            targetTopic: specificTopic,
            payloadData: parsedContent
        });
    } catch (parseError) {
        console.error(`ERROR: Failed to parse Redis message content: ${parseError.message}. Content: '${receivedContent}'`);
        // Send raw content if parsing fails, but wrap it for consistency.
        clientSocket.emit('realtime_update', {
            matchedPattern: matchedPattern,
            targetTopic: specificTopic,
            payloadData: receivedContent,
            parseError: parseError.message
        });
    }
  });

  // Handle client disconnection.
  clientSocket.on('disconnect', () => {
    console.log(`INFO: Client disconnected with ID: ${clientSocket.id}`);
    // Clean up Redis client connections associated with this socket.
    // Unsubscribe from all patterns and quit both clients to free resources.
    subscriberClient.unsubscribe();
    subscriberClient.quit();
    publisherClient.quit();
    console.log(`DEBUG: Redis clients for socket ${clientSocket.id} have been gracefully closed.`);
  });
});