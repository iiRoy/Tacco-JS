let networkLink = null;
let activeIndex = 0; // Represents the current active content index, initialized to the first page.

// --- Configuration Constants ---
// These values would typically be loaded from an environment config or a dedicated settings file.
const CONNECTION_SERVICE_URL = "https://your.bosh.service.com/http-bind/"; // Original BOSH_SERVICE
const PUB_SUB_HOST_IDENTIFIER = "pubsub.your.domain.com"; // Original PUBSUB_SERVER
const PUB_SUB_CHANNEL_PATH = "/user/events"; // Original PUBSUB_NODE

// --- Helper Functions for UI Output ---

/**
 * Generates a formatted timestamp string.
 * @returns {string} Current time in HH:MM:SS format.
 */
function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Outputs a general message to the primary log display area.
 * Each message is prepended with a timestamp.
 * @param {string} messageText - The message string to display.
 */
function outputMessageToLog(messageText) {
    if (!messageText || messageText.trim() === "") {
        console.warn("Application Log: Attempted to log an empty message.");
        return; // Guard clause for empty messages
    }
    const logContainer = document.getElementById('systemLog'); // Renamed from 'log'
    if (logContainer) {
        const entryDiv = document.createElement('div');
        entryDiv.textContent = `[${getCurrentTimestamp()}] ${messageText}`;
        // Prepending ensures newest messages are at the top.
        logContainer.prepend(entryDiv);
    } else {
        console.error("Application Log: System log container (ID 'systemLog') not found.");
    }
}

/**
 * Displays diagnostic or debugging information in a dedicated area.
 * Includes a timestamp and appends messages.
 * @param {string} diagnosticMessage - The diagnostic message to display.
 */
function displayDiagnosticInfo(diagnosticMessage) {
    if (!diagnosticMessage || diagnosticMessage.trim() === "") {
        console.debug("Diagnostic Output: Attempted to display empty diagnostic info.");
        return; // Guard clause for empty messages
    }
    const debugContainer = document.getElementById('debugOutput'); // Renamed from 'debug'
    if (debugContainer) {
        const infoDiv = document.createElement('div');
        infoDiv.textContent = `[${getCurrentTimestamp()}] ${diagnosticMessage}`;
        // Appending for diagnostic info usually means oldest at top, newest at bottom.
        debugContainer.append(infoDiv);
    } else {
        console.error("Diagnostic Output: Debug output container (ID 'debugOutput') not found.");
    }
    // Also mirror to console for enhanced debugging experience
    console.debug(`DIAG: ${diagnosticMessage}`);
}

/**
 * Clears all content from the primary log display.
 */
function clearLogDisplay() {
    const logContainer = document.getElementById('systemLog');
    if (logContainer) {
        logContainer.innerHTML = '';
        outputMessageToLog("System log display cleared."); // Add a new message after clearing
    }
}

/**
 * Clears all content from the diagnostic information display.
 */
function clearDiagnosticDisplay() {
    const debugContainer = document.getElementById('debugOutput');
    if (debugContainer) {
        debugContainer.innerHTML = '';
        displayDiagnosticInfo("Diagnostic output display cleared.");
    }
}

// --- Network Communication Handlers ---

/**
 * Publishes an update for the specified content index to the network via pubsub.
 * @param {number} pageIndex - The numerical index of the page to publish.
 */
function broadcastPageUpdate(pageIndex) {
    // Input validation: Ensure pageIndex is a non-negative integer
    if (typeof pageIndex !== 'number' || !Number.isInteger(pageIndex) || pageIndex < 0) {
        outputMessageToLog(`Error: Invalid content index provided for broadcast: ${pageIndex}. Must be a non-negative integer.`);
        displayDiagnosticInfo(`Invalid page index for broadcast attempt: ${pageIndex}`);
        return; // Guard clause
    }

    // Check if network link and pubsub service are ready
    if (!networkLink || !networkLink.pubsub || typeof networkLink.pubsub.sendPublication !== 'function') {
        outputMessageToLog("Network link or pubsub service not initialized for publishing operations.");
        displayDiagnosticInfo("Failed to publish: Network link or pubsub module not ready.");
        return;
    }

    try {
        const publicationPayload = [String(pageIndex)]; // Ensure data type consistency (e.g., array of strings)
        networkLink.pubsub.sendPublication(
            networkLink.sessionIdentifier, // Renamed 'jid' to 'sessionIdentifier' for clarity
            PUB_SUB_HOST_IDENTIFIER,
            PUB_SUB_CHANNEL_PATH,
            publicationPayload,
            outputMessageToLog // Callback for logging publication status
        );
        activeIndex = pageIndex; // Update the global active index upon successful publication
        outputMessageToLog(`Content index ${pageIndex} broadcasted successfully.`);
    } catch (error) {
        outputMessageToLog(`Failed to broadcast content index ${pageIndex} due to an error: ${error.message}`);
        displayDiagnosticInfo(`Publication error encountered: ${error.message}`);
    }
}

/**
 * Handles incoming raw data from the network connection, primarily for diagnostic purposes.
 * @param {string} incomingPayload - The raw data string received.
 */
function processRawIncomingData(incomingPayload) {
    displayDiagnosticInfo(`RX: ${incomingPayload}`); // Shortened prefix for brevity
}

/**
 * Handles outgoing raw data to the network connection, primarily for diagnostic purposes.
 * @param {string} outgoingPayload - The raw data string being sent.
 */
function handleRawOutgoingData(outgoingPayload) {
    displayDiagnosticInfo(`TX: ${outgoingPayload}`); // Shortened prefix
}

/**
 * Callback function to handle various connection status changes reported by Strophe.
 * @param {number} connectionState - The status code provided by the Strophe library.
 */
function handleConnectionStatus(connectionState) {
    const connectToggleButton = document.getElementById('connectButton'); // Renamed ID

    // Using a switch statement for structural change and clearer handling of connection states
    switch (connectionState) {
        case Strophe.Status.CONNECTING:
            outputMessageToLog('Network link is attempting to establish a connection...');
            break;
        case Strophe.Status.CONNFAIL:
            outputMessageToLog('Network link connection attempt failed!');
            if (connectToggleButton) {
                connectToggleButton.value = 'initiate'; // Original 'connect'
                connectToggleButton.disabled = false; // Enable button after failure
            }
            break;
        case Strophe.Status.DISCONNECTING:
            outputMessageToLog('Network link is in the process of disconnecting...');
            break;
        case Strophe.Status.DISCONNECTED:
            outputMessageToLog('Network link has been successfully disconnected.');
            if (connectToggleButton) {
                connectToggleButton.value = 'initiate';
                connectToggleButton.disabled = false; // Enable button after disconnect
            }
            clearLogDisplay(); // Clear log on disconnect
            clearDiagnosticDisplay(); // Clear debug on disconnect
            // Reset active index upon disconnection to a default state
            activeIndex = 0;
            outputMessageToLog("Application state reset after network disconnection.");
            break;
        case Strophe.Status.CONNECTED:
            outputMessageToLog('Network link successfully established.');
            if (networkLink) {
                // Send an initial presence update after connection as a standard practice
                networkLink.sendPresenceUpdate($pres()); // Assuming $pres() is a Strophe helper
                displayDiagnosticInfo("Initial presence update sent to the network.");
                if (connectToggleButton) connectToggleButton.disabled = false; // Ensure button is enabled
            } else {
                displayDiagnosticInfo("Network link object not available for sending presence post-connection.");
            }
            break;
        default:
            outputMessageToLog(`Warning: Unrecognized connection state received: ${connectionState}`);
            displayDiagnosticInfo(`Unhandled Strophe status code: ${connectionState}`);
            break;
    }
}

// --- Document Ready Event Handler ---
// Using native DOMContentLoaded event listener instead of jQuery's $(document).ready() for modernization
document.addEventListener('DOMContentLoaded', () => {
    outputMessageToLog("Document fully loaded. Initializing application components.");
    displayDiagnosticInfo("DOM Content Loaded event triggered.");

    // Initialize the Strophe connection object using the defined service URL
    networkLink = new Strophe.Connection(CONNECTION_SERVICE_URL);

    // Assign raw data handlers to the network link object for monitoring
    networkLink.rawInputHandler = processRawIncomingData; // Renamed property
    networkLink.rawOutputHandler = handleRawOutgoingData; // Renamed property

    // --- UI Event Listeners ---
    // Retrieve references to essential DOM elements
    const connectToggleButton = document.getElementById('connectButton'); // Renamed ID
    const userIdInput = document.getElementById('userIdentifier'); // Renamed ID from 'jid'
    const passwordInput = document.getElementById('passcode'); // Renamed ID from 'pass'
    const backNavigationButton = document.getElementById('backButton'); // Renamed ID
    const homeNavigationButton = document.getElementById('homeButton'); // Renamed ID
    const forwardNavigationButton = document.getElementById('forwardButton'); // Renamed ID

    // Validate that all essential DOM elements exist before proceeding
    if (!connectToggleButton || !userIdInput || !passwordInput || !backNavigationButton || !homeNavigationButton || !forwardNavigationButton) {
        const missingElements = [];
        if (!connectToggleButton) missingElements.push('connectButton');
        if (!userIdInput) missingElements.push('userIdentifier');
        if (!passwordInput) missingElements.push('passcode');
        if (!backNavigationButton) missingElements.push('backButton');
        if (!homeNavigationButton) missingElements.push('homeButton');
        if (!forwardNavigationButton) missingElements.push('forwardButton');

        outputMessageToLog(`Critical Error: One or more essential UI elements not found: ${missingElements.join(', ')}. Application may not function correctly.`);
        displayDiagnosticInfo("Missing critical DOM elements during initialization. Aborting further UI setup.");
        return; // Halt initialization if critical elements are missing
    }

    // Event listener for the connect/disconnect button
    connectToggleButton.addEventListener('click', () => {
        connectToggleButton.disabled = true; // Disable button immediately to prevent double-clicks

        // Use 'initiate' and 'terminate' instead of 'connect' and 'disconnect' for the button value
        if (connectToggleButton.value === 'initiate') {
            connectToggleButton.value = 'terminate';
            outputMessageToLog("Attempting to establish network connection...");
            try {
                // Strophe method renamed for Type III clone and parameters are passed explicitly
                networkLink.establishSession(
                    userIdInput.value,
                    passwordInput.value,
                    handleConnectionStatus
                );
            } catch (error) {
                outputMessageToLog(`Failed to initiate connection: ${error.message}`);
                displayDiagnosticInfo(`Connection initiation error: ${error.message}`);
                connectToggleButton.value = 'initiate'; // Reset button if error occurs
                connectToggleButton.disabled = false; // Re-enable button
            }
        } else {
            connectToggleButton.value = 'initiate';
            outputMessageToLog("Initiating network disconnection...");
            try {
                networkLink.endSession(); // Renamed method
            } catch (error) {
                outputMessageToLog(`Error during disconnection process: ${error.message}`);
                displayDiagnosticInfo(`Disconnection error: ${error.message}`);
                connectToggleButton.disabled = false; // Re-enable button if error occurs
            }
        }
    });

    // Event listener for the 'Back' navigation button
    backNavigationButton.addEventListener('click', () => {
        outputMessageToLog("Navigating back one content index.");
        if (activeIndex > 0) { // Guard clause: cannot go below index 0
            broadcastPageUpdate(activeIndex - 1);
        } else {
            outputMessageToLog("Already at the first content index (0). Cannot navigate back further.");
            displayDiagnosticInfo("Back navigation blocked: activeIndex is 0.");
        }
    });

    // Event listener for the 'Home' navigation button
    homeNavigationButton.addEventListener('click', () => {
        outputMessageToLog("Returning to home page (content index 0).");
        if (activeIndex !== 0) { // Only publish if not already on the home page
            broadcastPageUpdate(0);
        } else {
            outputMessageToLog("Already on the home page. No action required.");
            displayDiagnosticInfo("Home navigation skipped: already at index 0.");
        }
    });

    // Event listener for the 'Forward' navigation button
    forwardNavigationButton.addEventListener('click', () => {
        outputMessageToLog("Navigating forward one content index.");
        // No explicit maximum page defined; in a real application, a check like
        // `if (activeIndex < MAX_PAGE_INDEX)` would be implemented here.
        broadcastPageUpdate(activeIndex + 1);
    });

    outputMessageToLog("Application initialization complete. Ready for user interaction.");
});

// Assuming 'Strophe' and '$pres' are globally available from external Strophe.js scripts.
// In a modern development environment, these would typically be imported modules.