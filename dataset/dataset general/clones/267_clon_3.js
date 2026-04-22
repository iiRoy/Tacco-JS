// This module provides a robust system for inter-tab communication via browser's local storage.
// It allows different browser tabs or windows to broadcast and receive messages,
// acting as a simple, stateless event bus.
// Author: A. N. Other <https://example.com/another-dev>

/**
 * Core class for handling cross-tab broadcasts.
 * Utilizes the Web Storage API for communication.
 */
var SystemBroadcast = function() {
    // Configuration for the broadcast channel.
    const configDefaults = {
        channelKey: 'cross_tab_broadcast_channel', // Identifier for the localStorage entry
        instanceTagLength: 10 // Desired length for this instance's unique ID
    };

    // Attempt to initialize the communication channel.
    this._channelKey = configDefaults.channelKey;
    this._isChannelReady = this._checkStorageAvailability(); // Flag indicating if localStorage can be used
    this._instanceTag = null; // Unique identifier for this particular broadcast instance
    this._lastBroadcastTimestamp = 0; // Timestamp of the last message sent by this instance

    // If local storage isn't available, we can't proceed.
    if (!this._isChannelReady) {
        console.warn("SystemBroadcast: Local storage is not supported or accessible. Functionality will be limited.");
        return; // Early exit if fundamental requirement is not met
    }

    // Generate a unique ID for this instance.
    this._instanceTag = this._createRandomIdentifier(configDefaults.instanceTagLength);

    // Set up the listener for incoming messages on the broadcast channel.
    this._initializeChannelListener();

    // Mapping for specific event handlers.
    this._registeredEventHandlers = {
        'audiostate': this._processMediaStatusUpdate.bind(this)
        // Future event types can be added here.
    };
};

/**
 * Retrieves the unique identifier for this broadcasting instance.
 * @returns {string|null} The instance's unique tag, or null if not initialized.
 */
SystemBroadcast.prototype.getInstanceTag = function() {
    return this._instanceTag;
};

/**
 * Determines if the browser's local storage is available and functional.
 * This is a fundamental check for the system's operation.
 * @returns {boolean} True if local storage is ready, false otherwise.
 */
SystemBroadcast.prototype._checkStorageAvailability = function() {
    try {
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        // This can happen if storage is full, or privacy settings block it.
        return false;
    }
};

/**
 * Checks if the broadcast system is fully operational.
 * This depends on local storage availability.
 * @returns {boolean} True if the system is ready to broadcast/receive.
 */
SystemBroadcast.prototype.isOperational = function() {
    return this._isChannelReady;
};

/**
 * Generates a random alphanumeric string to serve as a unique instance identifier.
 * @param {number} [desiredLength=8] - The length of the identifier to generate.
 * @returns {string} A randomly generated string.
 */
SystemBroadcast.prototype._createRandomIdentifier = function(desiredLength = 8) {
    // Guard against invalid length.
    if (typeof desiredLength !== 'number' || desiredLength <= 0) {
        console.warn("SystemBroadcast: Invalid length provided for identifier generation. Using default (8).");
        desiredLength = 8;
    }

    const characterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let resultChars = []; // Using an array for potentially better performance with many concatenations

    for (let currentIdx = 0; currentIdx < desiredLength; ++currentIdx) {
        const randomIndex = Math.floor(Math.random() * characterPool.length);
        resultChars.push(characterPool.charAt(randomIndex));
    }

    return resultChars.join('');
};

/**
 * Sets up the event listener for 'storage' events on the window object.
 * This listener is crucial for receiving messages from other tabs/windows.
 * @returns {void}
 */
SystemBroadcast.prototype._initializeChannelListener = function() {
    if (!this.isOperational()) {
        console.warn("SystemBroadcast: Cannot initialize listener, channel is not operational.");
        return;
    }

    const selfReference = this; // Capture 'this' for use within the event handler scope.

    window.addEventListener('storage', function(storageEvent) {
        // Ensure the event is relevant to our specific channel key.
        if (storageEvent.key === selfReference._channelKey) {
            const receivedValue = storageEvent.newValue;

            // Only process if there's actual data and it's not null/empty.
            if (receivedValue) {
                try {
                    const parsedData = JSON.parse(receivedValue);
                    selfReference._processIncomingBroadcast(parsedData);
                } catch (parsingError) {
                    console.error("SystemBroadcast: Failed to parse incoming message as JSON.", parsingError);
                }
            }
        }
    });
};

/**
 * Dispatches an incoming broadcast payload to the appropriate handler.
 * This method acts as a central router for received messages.
 * @param {Object} broadcastPayload - The deserialized message object received from local storage.
 * @returns {void}
 */
SystemBroadcast.prototype._processIncomingBroadcast = function(broadcastPayload) {
    // Basic validation of the payload structure.
    if (!broadcastPayload || typeof broadcastPayload.messageType !== 'string') {
        console.warn("SystemBroadcast: Received malformed broadcast payload.", broadcastPayload);
        return;
    }

    const handlerFunction = this._registeredEventHandlers[broadcastPayload.messageType];

    if (handlerFunction && typeof handlerFunction === 'function') {
        // Execute the specific handler for this message type.
        handlerFunction(broadcastPayload);
    } else {
        console.info(`SystemBroadcast: No specific handler registered for message type: '${broadcastPayload.messageType}'.`);
    }
};

/**
 * Sends a message to all other tabs/windows listening on the same broadcast channel.
 * @param {string} messageType - A string identifying the type of message (e.g., 'audiostate').
 * @param {Object} messageData - The actual data payload to be sent.
 * @returns {boolean} True if the message was successfully dispatched, false otherwise.
 */
SystemBroadcast.prototype.transmitMessage = function(messageType, messageData) {
    if (!this.isOperational()) {
        console.warn("SystemBroadcast: Cannot transmit message, channel is not operational.");
        return false;
    }

    // Basic validation for message structure.
    if (typeof messageType !== 'string' || messageType.trim() === '') {
        console.error("SystemBroadcast: Message type must be a non-empty string.");
        return false;
    }
    if (typeof messageData !== 'object' || messageData === null) {
        console.error("SystemBroadcast: Message data must be an object.");
        return false;
    }

    // Construct the full broadcast object.
    const fullBroadcastPayload = {
        senderId: this.getInstanceTag(),
        messageType: messageType,
        payload: messageData,
        timestamp: Math.floor(Date.now() / 1000) // Unix timestamp in seconds
    };

    try {
        const serializedPayload = JSON.stringify(fullBroadcastPayload);
        window.localStorage.setItem(this._channelKey, serializedPayload);
        this._lastBroadcastTimestamp = fullBroadcastPayload.timestamp; // Update last sent timestamp
    } catch (storageError) {
        console.error("SystemBroadcast: Failed to store message in local storage. Error:", storageError);
        // If storage is full, this might fail.
        return false;
    }

    return true;
};

/**
 * Specific handler for 'audiostate' messages.
 * This function determines actions based on audio playback status from another instance.
 * @param {Object} statusInfo - The broadcast payload containing audio state details.
 * @returns {void}
 */
SystemBroadcast.prototype._processMediaStatusUpdate = function(statusInfo) {
    // Ignore messages originating from this same instance to prevent self-triggering.
    if (statusInfo.senderId === this.getInstanceTag()) {
        // console.log("SystemBroadcast: Ignoring self-originated audio state update.");
        return;
    }

    // Ensure the payload structure is as expected for an audio state update.
    if (!statusInfo.payload || typeof statusInfo.payload.state !== 'string') {
        console.warn("SystemBroadcast: Malformed audio state update payload received.", statusInfo);
        return;
    }

    // Check the state and react accordingly.
    if (statusInfo.payload.state === 'play') {
        // If another player starts playing, this instance should pause its own playback.
        // Assuming 'player' is a globally accessible object or service.
        if (typeof player !== 'undefined' && typeof player.pause === 'function') {
            console.log("SystemBroadcast: Another instance started playing audio. Pausing local player.");
            player.pause();
        } else {
            console.warn("SystemBroadcast: 'player.pause()' not available to react to audio state change.");
        }
    }
    // Additional states (e.g., 'pause', 'stop') could be handled here.
};