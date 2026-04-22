// --- Module: XMPP Chat Client Configuration and Operation ---
//
// This script establishes a connection to an XMPP server,
// participates in a group chat, and implements a basic echo mechanism
// for incoming messages, avoiding self-echoes.
// It leverages the 'simple-xmpp' external library for communication.
//
// Copyright (c) 2023 [Your Name or Entity]
// This code is provided under the terms of the MIT License.
// For full license details, please refer to the accompanying LICENSE file
// or the original source documentation.
//

// Incorporate the essential XMPP communication library
const messagingService = require('../lib/simple-xmpp'); // Renamed 'xmpp' to 'messagingService'

// Helper function to safely retrieve and validate command-line inputs
const retrieveExecutionArguments = () => {
    // We're interested in arguments beyond the node executable and script path
    const suppliedArguments = process.argv.slice(2);

    // Enforce minimum required arguments for connection
    const MIN_REQUIRED_ARGS = 3;
    if (suppliedArguments.length < MIN_REQUIRED_ARGS) {
        console.error("Critical Error: Insufficient command-line parameters supplied.");
        console.error("Expected usage: node your_script.js <user_id@domain> <secure_pass> <server_host> [optional_port_number]");
        // Terminate process with an error code
        process.exit(1);
    }
    return suppliedArguments;
};

// Fetch and store the processed command-line arguments
const runtimeParameters = retrieveExecutionArguments(); // Renamed 'argv' to 'runtimeParameters', added helper

// Extract individual configuration elements for clarity
const designatedUserIdentifier = runtimeParameters[0];
const authenticationKey = runtimeParameters[1];
const targetServerAddress = runtimeParameters[2];
// An optional fourth argument can specify a custom port
const customConnectionPort = runtimeParameters[3];

// Utility to create a user-friendly display name from a full JID
const deriveDisplayHandle = (fullJid) => {
    const atSymbolPosition = fullJid.indexOf('@');
    // If '@' is found, take the part before it; otherwise, use the full JID
    return atSymbolPosition !== -1 ? fullJid.substring(0, atSymbolPosition) : fullJid;
};

// Aggregate all connection configuration settings into a single object
const clientConfiguration = { // Renamed 'options' to 'clientConfiguration'
    userJid: designatedUserIdentifier,       // Renamed 'jid' to 'userJid'
    accessPassword: authenticationKey,       // Renamed 'password' to 'accessPassword'
    hostAddress: targetServerAddress,        // Renamed 'host' to 'hostAddress'
    clientNickname: deriveDisplayHandle(designatedUserIdentifier), // Renamed 'nick' to 'clientNickname', used helper
    // Default XMPP port 5222, overridden if a valid custom port is provided
    networkPort: customConnectionPort ? parseInt(customConnectionPort, 10) : 5222
};

// Define constants for configuration values to improve readability and maintainability
const CONFERENCE_ROOM_DOMAIN_PREFIX = 'test@conference.';
const ECHO_MESSAGE_INDICATOR = true; // Renamed boolean literal 'true' to a constant

// Register an event listener for successful connection establishment
messagingService.on('online', () => { // Renamed 'online' event handler
    console.log('Status: XMPP client has successfully authenticated and is online!'); // Rewritten log message

    // Construct the full group chat room identifier
    const groupChatTarget = `${CONFERENCE_ROOM_DOMAIN_PREFIX}${clientConfiguration.hostAddress}/${clientConfiguration.clientNickname}`;
    
    // Attempt to join the specified group chat room
    messagingService.join(groupChatTarget); // Renamed 'xmpp' to 'messagingService'
    console.log(`Action: Attempting to enter group chat room: "${groupChatTarget}"`); // Added specific action log
});

// Register an event listener for incoming group chat messages
messagingService.on('groupchat', (chatRoom, messageOriginator, receivedContent, messageTimestamp) => { // Renamed parameters
    const currentClientAlias = clientConfiguration.clientNickname; // Cached client's nickname for comparison

    // Display the incoming message with more context
    console.log(`[${chatRoom}] <${messageOriginator}>: ${receivedContent} (Received at: ${new Date(messageTimestamp).toLocaleTimeString()})`);

    // Implement the echo logic: only echo if the message is not from this client
    // and if the message content is not empty or just whitespace.
    if (messageOriginator !== currentClientAlias && receivedContent && receivedContent.trim().length > 0) {
        const echoResponsePrefix = `Echo from ${currentClientAlias} to ${messageOriginator}: `; // New intermediate variable
        const fullEchoMessage = `${echoResponsePrefix}${receivedContent}`; // Construct the full response

        // Send the echoed message back to the group chat
        messagingService.send(chatRoom, fullEchoMessage, ECHO_MESSAGE_INDICATOR); // Used constant for boolean
        console.log(`Response: Echoed message back to "${messageOriginator}" in "${chatRoom}".`); // Added log for echo action
    } else if (messageOriginator === currentClientAlias) {
        // Optional: Can add a log here to confirm own messages are ignored for echo
        // console.debug(`Debug: Skipping echo for own message: "${receivedContent}"`);
    } else {
        // Optional: Log if an incoming message was deemed too short or empty to echo
        // console.debug(`Debug: Message from ${messageOriginator} was too brief to echo.`);
    }
});

// Register an event listener for any errors encountered by the messaging service
messagingService.on('error', (problemDetails) => { // Renamed 'err' to 'problemDetails'
    // Using console.warn for non-fatal errors, console.error for critical ones
    console.warn('Alert: An operational issue or connection error has occurred:', problemDetails);
    // Future enhancement: Could implement automatic reconnection attempts here
    // let errorCounter = (global.errorCounter || 0) + 1; // Example of adding a global counter
    // global.errorCounter = errorCounter;
    // if (errorCounter > 5) { console.error("Too many errors, exiting..."); process.exit(1); }
});

// Initiate the actual connection process to the XMPP server
messagingService.connect({ // Renamed 'xmpp.connect' to 'messagingService.connect'
    jid: clientConfiguration.userJid,       // Accessing from the new configuration object
    password: clientConfiguration.accessPassword,
    host: clientConfiguration.hostAddress,
    port: clientConfiguration.networkPort   // Using the dynamically determined network port
});

// Add a graceful shutdown handler for SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\nProcess Termination Signal (SIGINT) received. Disconnecting XMPP client...');
    // Attempt to gracefully disconnect from the XMPP server
    if (messagingService && typeof messagingService.disconnect === 'function') {
        messagingService.disconnect();
    }
    // Exit the process cleanly
    process.exit(0);
});