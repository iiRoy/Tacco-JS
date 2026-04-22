// Core system dependencies for server operations
var filesystemModule = require('fs');
var networkModule    = require('net');
var httpModule       = require('http');
var webFramework     = require('express');

// Custom utility modules for game logic and data handling
var commandMapper = require('./lib/alias');     // Manages client-side command aliasing
var eventDetector = require('./lib/trigger');   // Scans incoming data for specific patterns and triggers actions
var dataProcessor = require('./lib/formatter'); // Handles display formatting of raw game data

// --- Configuration Loading and Initial Setup ---

// Define constants for logging output styling and identification
const LOG_PREFIX_COLOR = '\033[36m'; // ANSI escape code for cyan text
const LOG_RESET_COLOR = '\033[0m';  // ANSI escape code to reset text formatting
const APP_LOG_IDENTIFIER = '[ gateway ]'; // Identifier prefix for all application logs

// Helper function for consistent console logging
var outputStatus = function(statusMessage) {
  console.log(`${LOG_PREFIX_COLOR}${APP_LOG_IDENTIFIER}${LOG_RESET_COLOR} → ${statusMessage}`);
};

// Attempt to load application settings from a JSON file.
// This includes critical parameters like MUD server host/port and web server port.
let applicationSettings;
try {
  const configFilePath = 'config/config.json';
  const rawConfigFile = filesystemModule.readFileSync(configFilePath, 'utf8');
  applicationSettings = JSON.parse(rawConfigFile);
  outputStatus(`Application settings successfully loaded from ${configFilePath}.`);
} catch (error) {
  // If configuration fails to load, log the error and terminate the process
  outputStatus(`CRITICAL ERROR: Failed to load application settings: ${error.message}. Application cannot start.`);
  process.exit(1); // Exit with a non-zero status code indicating failure
}

// Instantiate the web application framework and create an HTTP server
var webApp             = webFramework();
var httpServerInstance = httpModule.createServer(webApp);
// Initialize Socket.IO to listen on the HTTP server, enabling real-time communication
var socketServer       = require('socket.io').listen(httpServerInstance);

// --- Core Utility Functions ---

/**
 * Crafts a structured message payload for sending data to connected clients.
 * @param {string} instructionType - A string indicating the type of instruction or command.
 * @param {any} payloadContent - The actual data content to be sent.
 * @returns {object} A JSON-like object representing the message.
 */
var craftMessagePayload = function(instructionType, payloadContent) {
  return { instruction: instructionType, content: payloadContent };
};

// --- Web Application Configuration ---

// Configure Express.js:
// Set the directory where template files (e.g., EJS) are located
webApp.set('views', __dirname + '/views');
// Enable serving static files (CSS, JavaScript, images) from the 'public' directory
webApp.use(webFramework.static(__dirname + '/public'));

// --- Web Application Route Definitions ---

// Define the primary route for the web application (e.g., the root URL '/')
webApp.get('/', function(clientRequest, serverResponse) {
  // Render the main 'index.ejs' template
  serverResponse.render('index.ejs', {
    layout: false, // Indicate that no master layout template should be used
    locals: { gameName: applicationSettings.name } // Pass the game's name to the template
  });
});

// --- Socket.IO Event Handling for Real-time Client Connections ---

// Maintain a count of currently active client connections for monitoring
let activeClientCount = 0;

socketServer.sockets.on('connection', function(clientSocket) {
  activeClientCount++;
  outputStatus(`New client (${clientSocket.id}) connected. Total active clients: ${activeClientCount}.`);

  // Establish a new TCP connection to the backend game server (MUD) for this client
  var gameServerConnection = networkModule.createConnection(applicationSettings.port, applicationSettings.host);
  // Ensure that data received from the MUD is interpreted as UTF-8 text
  gameServerConnection.setEncoding('utf8');

  outputStatus(`Client ${clientSocket.id} is now linked to game server at ${applicationSettings.host}:${applicationSettings.port}.`);

  // --- Game Server (MUD) Event Handlers ---

  // Handle incoming data chunks from the game server
  gameServerConnection.on('data', function(rawDataChunk) {
    // Process the raw data: scan for configured triggers and format for display
    var detectedActions = eventDetector.scan(rawDataChunk); // Identify any actions to take based on content
    var processedOutput = dataProcessor.go(rawDataChunk);   // Format the raw data for client display

    // Emit the processed data as a 'worldUpdate' message to the connected client
    clientSocket.emit('message', craftMessagePayload('worldUpdate', processedOutput));

    // If any triggers were detected, send the corresponding commands back to the game server
    if (Array.isArray(detectedActions) && detectedActions.length > 0) {
      for (let idx = 0; idx < detectedActions.length; idx++) {
        // Append a newline character as MUDs typically expect commands to be line-terminated
        gameServerConnection.write(detectedActions[idx] + '\n');
      }
    }
  });

  // Handle errors that occur on the game server connection
  gameServerConnection.on('error', (err) => {
    outputStatus(`Game server connection error for client ${clientSocket.id}: ${err.message}.`);
    // Inform the client about the connection issue
    clientSocket.emit('message', craftMessagePayload('serverError', 'Connection to game server lost or failed.'));
    clientSocket.disconnect(true); // Force client disconnection
  });

  // Handle the event when the game server connection is gracefully closed
  gameServerConnection.on('close', () => {
    outputStatus(`Game server connection closed for client ${clientSocket.id}.`);
    // Inform the client about the termination
    clientSocket.emit('message', craftMessagePayload('serverDisconnect', 'Game server connection terminated.'));
    clientSocket.disconnect(true); // Ensure client is also disconnected
  });

  // --- Client Socket Event Handlers ---

  // Handle incoming 'message' events from the connected client
  clientSocket.on('message', function(incomingMessage) {
    // Basic input validation: ensure the message is a non-empty string
    if (typeof incomingMessage !== 'string' || incomingMessage.trim() === '') {
      outputStatus(`Received invalid or empty message from client ${clientSocket.id}.`);
      clientSocket.emit('message', craftMessagePayload('error', 'Invalid message format received.'));
      return; // Stop processing invalid messages
    }

    const trimmedMessage = incomingMessage.trim();

    // Check for special client-side commands (e.g., alias management, trigger management)
    if (/^;alias add/i.test(trimmedMessage)) {
      commandMapper.register(trimmedMessage);
      clientSocket.emit('message', craftMessagePayload('status', 'Alias entry successfully added.'));
    } else if (/^;alias ls/i.test(trimmedMessage)) {
      clientSocket.emit('message', craftMessagePayload('listAliases', commandMapper.retrieveAll()));
    } else if (/^;alias rm/i.test(trimmedMessage)) {
      commandMapper.deregister(trimmedMessage);
      clientSocket.emit('message', craftMessagePayload('status', 'Alias entry successfully removed.'));
    } else if (/^;trigger add/i.test(trimmedMessage)) {
      eventDetector.register(trimmedMessage);
      clientSocket.emit('message', craftMessagePayload('status', 'Trigger pattern successfully added.'));
    } else if (/^;trigger ls/i.test(trimmedMessage)) {
      clientSocket.emit('message', craftMessagePayload('listTriggers', eventDetector.retrieveAll()));
    } else if (/^;trigger rm/i.test(trimmedMessage)) {
      eventDetector.deregister(trimmedMessage);
      clientSocket.emit('message', craftMessagePayload('status', 'Trigger pattern successfully removed.'));
    } else {
      // If no special command, process the message as a game command and send it to the MUD
      // Apply any defined aliases before sending to the game server
      gameServerConnection.write(commandMapper.transformInput(trimmedMessage) + '\n'); // Add newline
    }
  });

  // Handle client disconnection event
  clientSocket.on('disconnect', () => {
    activeClientCount--;
    outputStatus(`Client ${clientSocket.id} disconnected. Remaining active clients: ${activeClientCount}.`);
    // Ensure the corresponding game server connection is closed when the client disconnects
    if (gameServerConnection && !gameServerConnection.destroyed) {
      gameServerConnection.end(); // Gracefully close the MUD connection
      outputStatus(`Game server connection for client ${clientSocket.id} terminated.`);
    }
  });

});

// --- Server Activation ---

// Retrieve the listening port for the web server from application settings,
// defaulting to 6660 if not specified.
const listeningPort = applicationSettings.webPort || 6660;

// Start the HTTP server to listen for incoming network connections
httpServerInstance.listen(listeningPort, () => {
  outputStatus(`Web gateway and Socket.IO server are now operational on port ${listeningPort}.`);
  outputStatus(`Access the application via your browser at http://localhost:${listeningPort}.`);
});

// --- Graceful Shutdown Handler ---

// Listen for SIGINT (Ctrl+C) signal to perform a graceful shutdown
process.on('SIGINT', () => {
  outputStatus('Received SIGINT signal. Initiating graceful server shutdown...');
  httpServerInstance.close(() => {
    outputStatus('HTTP server has been successfully closed.');
    // In a more complex scenario, one might also iterate through and close all active
    // gameServerConnection instances here if they were globally managed.
    process.exit(0); // Exit the process with a success code
  });
});