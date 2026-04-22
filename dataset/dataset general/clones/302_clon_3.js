const RemoteShellModule = require("node-ssh");

// Configuration parameters for the remote access session.
// These essential details were missing in the original snippet, now defined for a functional example.
const targetHostIdentifier = "127.0.0.1"; // The IP address or hostname of the remote server.
const authenticationUser = "sysadmin";     // Username for secure authentication.
const authenticationSecret = "SuperSecurePass123!"; // Password for the specified user.
const connectionPort = 22;                  // Standard SSH port, often 22.

// Initialize the SSH client with a structured configuration object.
// Using a more descriptive variable name for the SSH session handler.
const activeShellSession = new RemoteShellModule({
    host: targetHostIdentifier,
    port: connectionPort,
    username: authenticationUser,
    password: authenticationSecret // The NodeSSH library typically accepts 'password' directly.
});

// An ordered list of commands to be dispatched to the remote shell.
// Added a preliminary command and changed the final one for variety.
const shellExecutionSequence = ["hostname", "df -h", "exit"];

// A simple counter to keep track of commands successfully sent.
let dispatchedCommandCounter = 0;

/**
 * Executes when the SSH session is terminated, either gracefully or unexpectedly.
 * Provides details about the disconnection.
 * @param {string} peerEndpointAddress The network address of the peer that disconnected.
 */
const handleSessionTermination = (peerEndpointAddress) => {
    // Assuming a single target host for this setup, so the count is simplified.
    const totalKnownEndpoints = targetHostIdentifier ? 1 : 0;
    console.info(`[INFO] (${totalKnownEndpoints} active connections) Session disconnected from ${peerEndpointAddress} at ${new Date().toLocaleTimeString()}.`);
    // Additional cleanup or logging could be implemented here.
};

/**
 * Processes incoming data streams from the SSH session.
 * This function is responsible for detecting shell prompts and sending subsequent commands.
 * @param {Buffer} receivedDataBuffer The raw data buffer received from the remote shell.
 */
const processRemoteShellOutput = (receivedDataBuffer) => {
    // Convert the raw buffer into a human-readable string, explicitly using UTF-8.
    const shellResponseString = receivedDataBuffer.toString('utf8');

    // Introduce a guard clause: if the output is empty or doesn't match a shell prompt,
    // just log it (if debugging) and return, preventing premature command sending.
    // A more comprehensive regex to match common shell prompts (ending in $, #, or > followed by optional whitespace).
    if (!shellResponseString.trim() || !/(?:\$|#|>)\s*$/.test(shellResponseString.trim())) {
        // console.debug(`[DEBUG] Non-prompt output received: "${shellResponseString.trim()}"`);
        return;
    }

    // Attempt to retrieve the next command from our predefined sequence.
    const nextInstruction = shellExecutionSequence.shift();

    if (nextInstruction) {
        // If a command is available, increment the counter and send it to the remote shell.
        dispatchedCommandCounter++;
        console.log(`[COMMAND] Dispatching instruction #${dispatchedCommandCounter}: "${nextInstruction}"`);
        activeShellSession.write(`${nextInstruction}\r\n`);
    } else {
        // If no more commands are left in the queue, initiate a graceful session closure.
        console.warn("[WARNING] All commands executed. Initiating graceful SSH session shutdown.");
        activeShellSession.close();
    }
};

/**
 * Callback function executed once the SSH connection has been successfully established.
 * This function sets up subsequent event listeners.
 */
const handleSessionEstablishment = function() { // Retaining 'function' keyword for 'this' context binding.
    // Log detailed connection success information using template literals.
    console.log(`[SUCCESS] Connection established to ${this.options.host || this.hostIdentifier}:${this.options.port} as user "${this.options.username}".`);

    // Attach the data processing function to the 'data' event.
    this.on('data', processRemoteShellOutput);

    // Add a robust error handler to catch and log any runtime SSH errors.
    this.on('error', (sessionError) => {
        console.error(`[ERROR] SSH Session encountered an issue: ${sessionError.message}.`);
        // If an error occurs, consider forcibly closing the session to prevent hanging states.
        if (this.isConnected()) {
            this.close();
        }
    });

    // Optional: Add a timeout to close the session if no activity for a long period.
    // This is a new fragment for added robustness.
    // this.setTimeout(60000, () => {
    //     console.warn("[TIMEOUT] Session idle for 60 seconds. Closing connection.");
    //     this.close();
    // });
};

// Register the session termination handler to the 'close' event.
activeShellSession.on('close', handleSessionTermination);

// Initiate the SSH connection process.
// Added a pre-connection validation check to ensure the client object is correctly instantiated.
if (activeShellSession instanceof RemoteShellModule) {
    console.log(`[INFO] Attempting to connect to ${targetHostIdentifier}:${connectionPort} using username "${authenticationUser}"...`);
    activeShellSession.connect()
        .then(handleSessionEstablishment) // On successful connection, execute the establishment handler.
        .catch(connectionError => {
            // Catch and log any errors that occur during the connection attempt itself.
            console.error(`[FATAL] Failed to establish SSH connection: ${connectionError.message}.`);
            process.exit(1); // Terminate the process if connection fails critically.
        });
} else {
    console.error("[CRITICAL] SSH client object not properly initialized. Aborting operation.");
    process.exit(1); // Exit if the SSH client instance is invalid.
}