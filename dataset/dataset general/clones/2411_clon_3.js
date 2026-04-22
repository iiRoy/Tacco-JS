/**
 * Global configuration constants for the application's interactive console.
 * These settings define standard parameters and command strings.
 * Using Object.freeze to ensure these configurations are immutable.
 */
const CONSOLE_INTERACTION_SETTINGS = Object.freeze({
    /** The DOM element ID where the virtual terminal will be rendered. */
    DISPLAY_AREA_ID: 'terminal',
    /** Default width (columns) for the virtual terminal. */
    DEFAULT_TERMINAL_WIDTH: 80,
    /** Default height (rows) for the virtual terminal. */
    DEFAULT_TERMINAL_HEIGHT: 25,
    /** The specific string that, when received, signals an exit command. */
    REMOTE_EXIT_SEQUENCE: "\r\nexit\r\n",
    /** The event name emitted to gracefully terminate the server-side session. */
    SERVER_KILL_SIGNAL: 'terminateSession'
});

/**
 * A basic internal logging utility to trace application flow and debug issues.
 * Logs messages to the browser console if available.
 * @param {string} messageContent - The textual content of the log message.
 */
function recordConsoleActivity(messageContent) {
    if (typeof console !== 'undefined' && console.log) {
        console.log(`[AppSession] ${messageContent}`);
    }
}

/**
 * Initiates the interactive console session. This involves establishing a WebSocket connection
 * and configuring the virtual terminal emulator for user interaction.
 * This function is exposed globally via the `window` object.
 */
window.initializeSession = function() {
    // Declare all local variables at the top for clarity, as per some coding conventions.
    let currentBrowserLocation;
    let clientWebSocket;
    let virtualDisplayEmulator;
    let outputDomElement;

    recordConsoleActivity('Starting console session initialization...');

    // Retrieve detailed information about the current page's URL.
    currentBrowserLocation = document.location;

    // Dynamically construct the full server endpoint URL for the WebSocket connection.
    // This ensures the connection uses the same protocol and host as the current page.
    const fullServerEndpointUrl = `${currentBrowserLocation.protocol}//${currentBrowserLocation.host}`;
    recordConsoleActivity(`Attempting WebSocket connection to: ${fullServerEndpointUrl}`);

    try {
        // Attempt to establish a new WebSocket connection using the global `io` object (Socket.IO client).
        // The established connection handle is stored both locally and globally for broader access.
        clientWebSocket = window.activeWebSocketClient = io.connect(fullServerEndpointUrl);
    } catch (connectionError) {
        // If the connection fails immediately (e.g., `io` is not defined, or severe network issue),
        // log the error and notify the user.
        recordConsoleActivity(`ERROR: WebSocket connection failed to initialize: ${connectionError.message}`);
        alert('Could not establish a connection to the server. Please check your network or try again.');
        return; // Exit the function gracefully if connection cannot be made.
    }

    // Initialize the VT100-compatible virtual terminal emulator.
    // It's configured with predefined dimensions and targets a specific DOM element ID.
    virtualDisplayEmulator = new VT100(
        CONSOLE_INTERACTION_SETTINGS.DEFAULT_TERMINAL_WIDTH,
        CONSOLE_INTERACTION_SETTINGS.DEFAULT_TERMINAL_HEIGHT,
        CONSOLE_INTERACTION_SETTINGS.DISPLAY_AREA_ID
    );
    recordConsoleActivity(`Virtual terminal emulator configured for ID: ${CONSOLE_INTERACTION_SETTINGS.DISPLAY_AREA_ID}`);

    // Obtain a reference to the actual DOM element where the terminal output will be rendered.
    outputDomElement = document.getElementById(CONSOLE_INTERACTION_SETTINGS.DISPLAY_AREA_ID);

    // Critical guard clause: Verify that the target display element exists in the DOM.
    if (!outputDomElement) {
        recordConsoleActivity(`CRITICAL ERROR: Display element with ID '${CONSOLE_INTERACTION_SETTINGS.DISPLAY_AREA_ID}' was not found.`);
        alert('Initialization failed: Terminal display area is missing. Cannot proceed.');
        // Attempt to clean up any partially established WebSocket connection.
        if (clientWebSocket) {
            window.shutDownClientConnection();
        }
        return; // Terminate function execution if the display element is absent.
    }

    // Register a callback function to handle character input originating from the virtual terminal.
    // The second parameter to `getch` (often an instance reference) is not utilized here.
    virtualDisplayEmulator.getch(function(typedCharacter) {
        // Only process and emit input if the character is valid and the WebSocket is active.
        if (typedCharacter && clientWebSocket && clientWebSocket.connected) {
            recordConsoleActivity(`Sending user input: '${typedCharacter.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`);
            clientWebSocket.emit('data', typedCharacter);
        } else {
            recordConsoleActivity("Warning: Input ignored due to invalid character or disconnected socket.");
        }
    });

    // Configure the cursor for the virtual terminal: make it visible and blinking within its container.
    // The '1' signifies visibility, 'true' enables blinking, and `outputDomElement` provides context.
    virtualDisplayEmulator.curs_set(1, true, outputDomElement);

    // Set focus on the terminal's display element to capture keyboard input.
    // A slight delay is introduced to ensure the DOM is fully rendered and ready to receive focus.
    setTimeout(() => {
        outputDomElement.focus();
        recordConsoleActivity('Terminal display element successfully gained focus.');
    }, 100); // 100ms delay for UI readiness.

    // --- WebSocket Event Handlers Configuration ---

    // Event handler for 'data' messages received from the WebSocket server.
    clientWebSocket.on('data', function(networkPayload) {
        // Check if the received payload is a specific command to exit the session.
        if (networkPayload === CONSOLE_INTERACTION_SETTINGS.REMOTE_EXIT_SEQUENCE) {
            recordConsoleActivity('Received remote exit command. Initiating local session termination.');
            window.shutDownClientConnection();
        } else if (typeof networkPayload === 'string' && networkPayload.length > 0) {
            // If it's valid data, write it directly to the virtual terminal.
            virtualDisplayEmulator.write(networkPayload);
            // Optionally, automatically scroll the terminal to the bottom if new lines are detected.
            if (networkPayload.includes('\n')) {
                outputDomElement.scrollTop = outputDomElement.scrollHeight;
            }
        } else {
            recordConsoleActivity("Warning: Received empty or non-string data from the server, ignoring.");
        }
    });

    // Event handler for the 'end' signal from the WebSocket server, indicating connection closure.
    clientWebSocket.on('end', function(finalData) {
        recordConsoleActivity('WebSocket connection terminated by the remote server.');
        // Hide the cursor immediately as the session is no longer active.
        virtualDisplayEmulator.curs_set(0, true);
        // Write any last pieces of data or messages received during the termination sequence.
        if (finalData) {
            virtualDisplayEmulator.write(finalData);
        }
        // Disable further user input to the virtual terminal.
        virtualDisplayEmulator.disableInput(); // Assumes VT100 instance has this method.
    });

    // New Event: Handler for successful WebSocket connection establishment.
    clientWebSocket.on('connect', () => {
        recordConsoleActivity('Successfully established WebSocket connection to server.');
        virtualDisplayEmulator.write("\r\n--- Connected to the remote session ---\r\n");
    });

    // New Event: Handler for WebSocket disconnection.
    clientWebSocket.on('disconnect', (reasonForDisconnect) => {
        recordConsoleActivity(`WebSocket client disconnected. Reason: ${reasonForDisconnect}`);
        virtualDisplayEmulator.write(`\r\n--- Disconnected from remote session (${reasonForDisconnect}) ---\r\n`);
        virtualDisplayEmulator.curs_set(0, true); // Hide cursor on disconnect.
        virtualDisplayEmulator.disableInput(); // Prevent further input.
    });

    // New Event: Handler for any errors occurring on the WebSocket.
    clientWebSocket.on('error', (encounteredError) => {
        recordConsoleActivity(`ERROR: WebSocket communication error: ${encounteredError.message || encounteredError}`);
        virtualDisplayEmulator.write(`\r\n--- WebSocket Error: ${encounteredError.message || 'Unknown network error'} ---\r\n`);
        virtualDisplayEmulator.curs_set(0, true);
        virtualDisplayEmulator.disableInput();
    });

    recordConsoleActivity('Console session initialization completed successfully.');
    // No explicit return value is required for this initialization function.
};

/**
 * Terminates the active console session by disconnecting the WebSocket client.
 * This function is exposed globally via the `window` object.
 * @returns {boolean} Returns `true` if a disconnection attempt was made, `false` otherwise.
 */
window.shutDownClientConnection = function() {
    let currentSocketReference = window.activeWebSocketClient;
    let isDisconnectionInitiated = false;

    // Check if there is an existing, valid WebSocket connection to close.
    // We also check for the `emit` method to ensure it's a proper Socket.IO client instance.
    if (currentSocketReference && typeof currentSocketReference.emit === 'function') {
        recordConsoleActivity('Attempting to gracefully shut down the WebSocket connection.');
        // Emit a 'terminateSession' signal to the server, informing it of a client-initiated closure.
        currentSocketReference.emit(CONSOLE_INTERACTION_SETTINGS.SERVER_KILL_SIGNAL, { cause: 'user_request' });

        // Introduce a small delay to allow the 'terminateSession' signal to be sent
        // before the client explicitly disconnects.
        setTimeout(() => {
            if (currentSocketReference && currentSocketReference.connected) {
                currentSocketReference.disconnect(); // Explicitly close the WebSocket connection.
                recordConsoleActivity('WebSocket client explicitly disconnected.');
            } else {
                recordConsoleActivity('WebSocket client was already disconnected or not in a valid state.');
            }
            window.activeWebSocketClient = null; // Clear the global reference to the socket.
        }, 75); // 75ms delay.
        isDisconnectionInitiated = true;
    } else {
        recordConsoleActivity('No active WebSocket connection found to shut down; nothing to do.');
    }

    // Ensure the global reference to the WebSocket client is cleared, regardless of prior state.
    // This helps prevent stale references.
    window.activeWebSocketClient = null;
    return isDisconnectionInitiated;
};

// Hypothetical `VT100` class definition to support assumed methods like `disableInput()`
// This would typically be in a separate file or provided by a library.
/*
function VT100(width, height, elementId) {
    this.width = width;
    this.height = height;
    this.element = document.getElementById(elementId);
    this.inputActive = true; // Internal state for input.

    // Placeholder for actual VT100 initialization logic.
    if (this.element) {
        this.element.innerHTML = `<pre style="width:${width}ch; height:${height}em; overflow-y:scroll; background-color:black; color:lime; font-family:monospace; white-space:pre-wrap;"></pre>`;
        this.displayArea = this.element.querySelector('pre');
        // Add basic input handling for demonstration (e.g., keypress listener)
        this.element.tabIndex = 0; // Make element focusable
        this.element.addEventListener('keypress', (e) => {
            if (this.inputActive && this.charInputCallback) {
                this.charInputCallback(e.key);
            }
        });
    } else {
        console.error(`VT100: Element with ID '${elementId}' not found.`);
    }

    this.charInputCallback = null;

    this.getch = function(callback) {
        this.charInputCallback = callback;
    };

    this.curs_set = function(isVisible, isBlinking, contextElement) {
        // Simulate cursor visibility. In a real VT100, this would manipulate actual cursor.
        // For this clone, it's illustrative.
        console.log(`VT100: Cursor set to visible: ${isVisible}, blinking: ${isBlinking}`);
        if (contextElement) {
            contextElement.style.border = isVisible ? '1px solid lime' : 'none';
        }
    };

    this.write = function(data) {
        if (this.displayArea) {
            this.displayArea.textContent += data;
        }
    };

    this.disableInput = function() {
        this.inputActive = false;
        console.log("VT100: Input disabled.");
        if (this.element) {
            this.element.removeEventListener('keypress', this.charInputCallback); // More robust
            this.element.blur(); // Remove focus
        }
    };
}
*/