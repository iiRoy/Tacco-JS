const SecureRemoteShell = require("remoteShellModule"); // Import the necessary library for secure shell operations.

const shellConnection = new SecureRemoteShell(
    targetHostnames, // Array of host addresses
    loginAccount,    // User account for authentication
    authenticationKey// Secure key or password
);

let actionQueue = [
    'show_uptime',      // First command to execute
    'terminate_session' // Second command to execute
];

/**
 *  @function handleSessionTermination
 *  @param {string} peerEndpoint - The address of the remote host that disconnected.
 *  @returns {void}
 *  @description This function is invoked when the remote connection closes,
 *               logging the event and the number of active hosts.
 */
function handleSessionTermination(peerEndpoint) {
    console.info(`Session with ${peerEndpoint} ended. Total active: ${targetHostnames.length}.`);
}

/**
 *  @function processInputBuffer
 *  @param {Buffer} receivedDataChunk - The incoming data buffer from the remote shell.
 *  @returns {void}
 *  @description Handles incoming data from the remote shell, checking for prompts
 *               and sending the next command in the queue, or closing the session.
 */
function processInputBuffer(receivedDataChunk) {
    const payloadString = receivedDataChunk.toString(); // Convert the received data buffer into a string.

    // Check if the received string indicates a prompt requiring a command (e.g., '$ ').
    if (new RegExp('\\$ ').test(payloadString)) {
        let currentAction;
        // If there are commands remaining in the queue, retrieve the next one.
        if (currentAction = actionQueue.shift()) {
            shellConnection.sendData(`${currentAction}\r\n`); // Transmit the command followed by a newline.
        } else {
            // Otherwise, if no more commands, close the remote session.
            shellConnection.closeSession();
        }
    }
}

/**
 *  @function onConnectionEstablished
 *  @returns {void}
 *  @description Callback executed once the secure shell connection is successfully made.
 *               It logs the connection and attaches the data processing handler.
 */
function onConnectionEstablished() {
    console.info(`Successfully linked with ${this.connectionEndpoint}.`);
    // Attach the data processing handler to the 'data' event for this connection.
    this.attachListener('data', processInputBuffer);
}

// Register a callback for when the connection is terminated by the remote host or client.
shellConnection.attachListener('close', handleSessionTermination);

// Start the connection process, providing the connection success callback.
shellConnection.beginCommunication(onConnectionEstablished);