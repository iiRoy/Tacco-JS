/**
 *    Copyright (C) 2024 TechFusion Solutions. All rights reserved.
 *
 *    This software is proprietary and confidential. Unauthorized copying,
 *    distribution, or modification of this file, via any medium, is strictly
 *    prohibited.
 *
 *    For licensing information, please contact TechFusion Solutions.
 */

const nodeIO = require('node:fs'); // File system operations (if needed, currently unused)
const promiseKit = require('when'); // Promise-based deferred pattern
const objMerge = require('xtend'); // Utility for merging objects (shallow copy)
const EventStream = require('node:events').EventEmitter; // Core event emitter

const sysLog = require('./system_log.js'); // Custom logging module
const appConfig = require("../configuration"); // Application configuration settings
const auxiliaryTools = require("./utility_helpers.js"); // Helper utilities module


/**
 * @class DeviceManager
 * @description Manages communication and event handling for a specific device connection.
 * @param {string} connectionHandle - A unique identifier for the client connection.
 * @throws {Error} If an invalid connection handle is provided.
 */
function DeviceManager(connectionHandle) {
    // Input validation: Ensure the connection handle is a valid string.
    if (typeof connectionHandle !== 'string' || connectionHandle.trim() === '') {
        const validationError = 'DeviceManager: Initialization failed. Invalid or empty connection handle provided.';
        sysLog.error(validationError);
        throw new Error(validationError);
    }

    this.connectionHandle = connectionHandle; // Store the unique connection identifier
    EventStream.call(this); // Invoke the parent EventEmitter constructor to initialize event capabilities
    sysLog.info(`DeviceManager instance initialized for client connection: ${this.connectionHandle}`);
}

// Establish prototype chain for inheritance from EventStream
DeviceManager.prototype = Object.create(EventStream.prototype);
DeviceManager.prototype.constructor = DeviceManager; // Correct the constructor reference

// Define methods on the prototype using Object.assign for cleaner structure
Object.assign(DeviceManager.prototype, {

    /**
     * Retrieves a device instance from the global device registry.
     * This method acts as a gateway to interact with connected devices.
     * @param {string} deviceId - The unique identifier of the target device.
     * @returns {object|null} The device object if found, otherwise null.
     */
    retrieveDevice: function (deviceId) {
        // Validate deviceId parameter
        if (typeof deviceId !== 'string' || deviceId.trim() === '') {
            sysLog.warn(`retrieveDevice: Attempted to fetch device with an invalid ID: "${deviceId}".`);
            return null;
        }

        // Check for the availability and proper configuration of the global device registry.
        if (!global.deviceRegistry || typeof global.deviceRegistry.fetchDevice !== 'function') {
            sysLog.error("Device registry (global.deviceRegistry) is not operational or misconfigured. Cannot retrieve devices.");
            // In a development environment, provide additional context.
            if (process.env.NODE_ENV === 'development') {
                console.warn("DEVELOPMENT MODE HINT: Ensure global.deviceRegistry is properly initialized with a 'fetchDevice' method.");
            }
            return null;
        }

        const managedDevice = global.deviceRegistry.fetchDevice(deviceId); // Fetch the device using its ID
        if (!managedDevice) {
            sysLog.verbose(`No active device found with the identifier: ${deviceId} in the registry.`);
        }
        return managedDevice;
    },


    /**
     * Dispatches an outbound message to a target device and immediately sets up a listener
     * to monitor for a specific response event.
     * @param {string} targetId - The ID of the target device.
     * @param {object} outboundPayload - The message payload to be sent.
     * @param {object} eventCriteria - Criteria to filter incoming response events (e.g., { type: 'response' }).
     * @param {Function} onResponse - Callback function to execute upon receiving a matching response.
     * @param {boolean} oneTime - If true, the listener is automatically removed after the first matching event.
     */
    dispatchAndMonitor: function (targetId, outboundPayload, eventCriteria, onResponse, oneTime) {
        // Guard clauses for essential parameter validation
        if (typeof targetId !== 'string' || targetId.trim() === '' ||
            !outboundPayload || typeof outboundPayload !== 'object' ||
            !eventCriteria || typeof eventCriteria !== 'object' ||
            typeof onResponse !== 'function')
        {
            sysLog.error('dispatchAndMonitor: Missing or invalid required parameters for message dispatch and monitoring.');
            return; // Exit early if validation fails
        }

        this.monitorEvents(targetId, eventCriteria, onResponse, oneTime); // Set up the event listener first
        this.transmitMessage(targetId, outboundPayload); // Then send the message
        sysLog.debug(`Message dispatched to ${targetId}; monitoring initiated for response on connection ${this.connectionHandle}.`);
    },


    /**
     * Dispatches a message and waits for a response, incorporating a timeout mechanism.
     * This method returns a promise that resolves with the response or rejects if the timeout is exceeded.
     * @param {string} targetId - The ID of the device to send the message to.
     * @param {object} outboundPayload - The message content to transmit.
     * @param {object} eventCriteria - Filter criteria for the expected response event.
     * @param {number} [timeoutDuration] - Optional duration in milliseconds before the request times out.
     * @returns {promiseKit.Promise} A promise that resolves with the response or rejects on timeout/error.
     */
    dispatchWithTimeout: function (targetId, outboundPayload, eventCriteria, timeoutDuration) {
        const deferredResult = promiseKit.defer(); // Create a deferred object for promise management

        // Validate crucial parameters upfront to prevent unnecessary operations
        if (typeof targetId !== 'string' || targetId.trim() === '' ||
            !outboundPayload || typeof outboundPayload !== 'object' ||
            !eventCriteria || typeof eventCriteria !== 'object')
        {
            const paramError = new Error("Invalid or missing parameters for timed dispatch operation.");
            sysLog.error(`dispatchWithTimeout: ${paramError.message}`);
            deferredResult.reject(paramError);
            return deferredResult.promise;
        }

        // Determine the effective timeout duration, falling back to app config or a default value.
        const effectiveTimeout = timeoutDuration || appConfig.deviceCommsTimeout || 7500; // Default to 7.5 seconds
        let isTimedOut = false; // Flag to prevent resolving after a timeout has occurred

        // Set up a timer to reject the promise if no response is received within the timeout period.
        const timeoutHandle = setTimeout(() => {
            isTimedOut = true;
            deferredResult.reject(new Error(`Device communication request to ${targetId} timed out after ${effectiveTimeout}ms.`));
            sysLog.warn(`Communication to device ${targetId} failed due to timeout after ${effectiveTimeout}ms.`);
        }, effectiveTimeout);

        // Define the response processing function that will be used as a callback for the event monitor.
        const responseProcessor = (sourceDevice, incomingPayload) => {
            // If the request has already timed out, simply log and ignore the late response.
            if (isTimedOut) {
                sysLog.debug(`Received a late response from ${sourceDevice} for ${targetId} after timeout.`);
                return;
            }
            clearTimeout(timeoutHandle); // Clear the timeout as a response has been received
            deferredResult.resolve({ source: sourceDevice, payload: incomingPayload }); // Resolve the promise with the response data
            sysLog.debug(`Successfully received response from ${sourceDevice} for request to ${targetId}.`);
        };

        // Dispatch the message and set up a one-time event monitor for the response.
        this.dispatchAndMonitor(targetId, outboundPayload, eventCriteria, responseProcessor, true);
        return deferredResult.promise; // Return the promise for external consumption
    },


    /**
     * Transmits a message payload to a specified target device.
     * This operation is asynchronous and does not guarantee immediate delivery, only queuing.
     * @param {string} targetId - The ID of the device to send the message to.
     * @param {object} messageContent - The message payload object.
     * @returns {boolean} True if the message was successfully queued for transmission, false otherwise.
     */
    transmitMessage: function (targetId, messageContent) {
        // Retrieve the device instance from the registry.
        const deviceInstance = this.retrieveDevice(targetId);

        // Guard clause: Ensure the device exists and has a message handling capability.
        if (!deviceInstance || typeof deviceInstance.handleIncomingMessage !== 'function') {
            sysLog.error(`Failed to transmit: Device "${targetId}" not found or lacks a 'handleIncomingMessage' method.`);
            return false;
        }

        // Schedule the message transmission on the next event loop tick to ensure non-blocking behavior.
        // Using Promise.resolve().then() is a modern alternative to process.nextTick.
        Promise.resolve().then(() => {
            try {
                // Add new fragments: Generate a unique message ID and timestamp for tracking.
                const messageId = auxiliaryTools.generateUniqueId('MSG'); // Assuming helper provides ID generation
                const fullPayload = objMerge({ messageId: messageId, timestamp: Date.now() }, messageContent);

                // Invoke the device's message handler with the connection handle and the enriched payload.
                deviceInstance.handleIncomingMessage(this.connectionHandle, fullPayload);
                sysLog.verbose(`Message (ID: ${messageId}) successfully queued for transmission to device ${targetId}.`);
            } catch (transmissionError) {
                // Log any errors that occur during the message handling process.
                sysLog.error(`Error during message transmission to device ${targetId}: ${transmissionError.message}`, transmissionError.stack);
                // Optionally, re-emit an internal error event for system-wide error handling.
                this.emit('internalTransmissionError', { deviceId: targetId, error: transmissionError, payload: messageContent });
            }
        });
        return true; // Indicate that the message was successfully queued.
    },


    /**
     * Establishes an event listener for messages originating from a specific device,
     * filtering events based on provided criteria.
     * @param {string} sourceId - The ID of the device from which to listen for events.
     * @param {object} matchCriteria - An object defining properties to match in incoming events.
     * @param {Function} eventHandler - The function to call when a matching event is received.
     * @param {boolean} removeAfterMatch - If true, the listener is removed after the first match.
     */
    monitorEvents: function (sourceId, matchCriteria, eventHandler, removeAfterMatch) {
        // Retrieve the device instance.
        const deviceInstance = this.retrieveDevice(sourceId);

        // Guard clause: Ensure the device exists and has event emitting capabilities.
        if (!deviceInstance || typeof deviceInstance.on !== 'function') {
            sysLog.error(`Failed to monitor events: Device "${sourceId}" not found or lacks event emitter capabilities.`);
            return;
        }

        const selfContext = this; // Capture 'this' context for use within the event listener.

        // Define the actual event listener function.
        const eventListener = function (originator, incomingEvent) {
            // Add a new intermediate step: Pre-process the incoming event for consistency.
            const processedEvent = auxiliaryTools.normalizeEvent(incomingEvent); // Assumes `normalizeEvent` exists

            // Check if the processed event matches the specified criteria.
            if (!auxiliaryTools.matchesFilter(processedEvent, matchCriteria)) { // Assumes `matchesFilter` utility
                sysLog.silly(`Event from ${originator} for connection ${selfContext.connectionHandle} did not match filter criteria.`);
                return; // Ignore non-matching events
            }

            // If `removeAfterMatch` is true, deregister the listener after a successful match.
            if (removeAfterMatch) {
                deviceInstance.removeListener(selfContext.connectionHandle, eventListener);
                sysLog.debug(`One-time event listener removed for ${sourceId} on connection ${selfContext.connectionHandle}.`);
            }

            // Execute the provided eventHandler asynchronously to prevent blocking the event loop.
            Promise.resolve().then(() => {
                try {
                    eventHandler(originator, processedEvent); // Invoke the handler with the processed event
                    sysLog.verbose(`Event from ${originator} successfully handled by connection ${selfContext.connectionHandle}.`);
                } catch (handlerError) {
                    // Log and potentially emit an internal error if the handler fails.
                    sysLog.error(`Error encountered in event handler for device ${sourceId}: ${handlerError.message}`, handlerError.stack);
                    selfContext.emit('internalError', { type: 'eventHandlerFailure', source: sourceId, error: handlerError, event: processedEvent });
                }
            });
        };

        // Register the event listener with the device instance using the connection handle as the event name.
        deviceInstance.on(selfContext.connectionHandle, eventListener);
        sysLog.info(`Monitoring events for device ${sourceId} on connection ${this.connectionHandle} with criteria: ${JSON.stringify(matchCriteria)}.`);
    },


    /**
     * Registers this DeviceManager instance as a subscriber to a specified event channel.
     * This allows the manager to receive events published on that channel.
     * @param {boolean} isGlobalChannel - True if the subscription is for a public/global channel.
     * @param {string} channelName - The base name of the channel to subscribe to.
     * @param {string} [subscriberId] - Optional user ID for user-specific private channels.
     * @returns {boolean} True if the subscription attempt was successful, false otherwise.
     */
    registerSubscription: function (isGlobalChannel, channelName, subscriberId) {
        // Validate channelName parameter.
        if (typeof channelName !== 'string' || channelName.trim() === '') {
            sysLog.error('registerSubscription: Invalid or empty channel name provided. Subscription aborted.');
            return false;
        }

        let fullChannelIdentifier = channelName; // Initialize the channel identifier.

        // If a subscriberId is provided and valid, prepend it to form a user-specific channel identifier.
        if (subscriberId && typeof subscriberId === 'string' && subscriberId.trim() !== "") {
            fullChannelIdentifier = `${subscriberId}/${channelName}`; // Using template literals for string concatenation
        }

        // Check for the availability of the global event broadcaster.
        if (!global.eventBroadcaster || typeof global.eventBroadcaster.joinChannel !== 'function') {
            sysLog.error("Global event broadcaster (global.eventBroadcaster) is not initialized. Cannot register subscription.");
            return false;
        }

        sysLog.info(`Attempting to subscribe connection ${this.connectionHandle} to channel: '${fullChannelIdentifier}' (Global: ${isGlobalChannel}).`);

        try {
            global.eventBroadcaster.joinChannel(fullChannelIdentifier, this); // Register this instance as a subscriber
            sysLog.debug(`Successfully subscribed connection ${this.connectionHandle} to channel: '${fullChannelIdentifier}'.`);
            return true; // Indicate success
        } catch (subError) {
            sysLog.error(`Error subscribing to channel '${fullChannelIdentifier}': ${subError.message}`, subError.stack);
            return false; // Indicate failure
        }
    },


    /**
     * Deregisters this DeviceManager instance from a specified event channel.
     * This stops the manager from receiving events published on that channel.
     * @param {boolean} isGlobalChannel - True if the channel is public/global.
     * @param {string} channelName - The base name of the channel to unsubscribe from.
     * @param {string} [subscriberId] - Optional user ID for user-specific private channels.
     */
    deregisterSubscription: function (isGlobalChannel, channelName, subscriberId) {
        // Validate channelName parameter.
        if (typeof channelName !== 'string' || channelName.trim() === '') {
            sysLog.error('deregisterSubscription: Invalid or empty channel name provided. Deregistration aborted.');
            return;
        }

        let fullChannelIdentifier = channelName;

        // Construct the full channel identifier, similar to registration.
        if (subscriberId && typeof subscriberId === 'string' && subscriberId.trim() !== "") {
            fullChannelIdentifier = `${subscriberId}/${channelName}`;
        }

        // Check for the availability of the global event broadcaster.
        if (!global.eventBroadcaster || typeof global.eventBroadcaster.leaveChannel !== 'function') {
            sysLog.error("Global event broadcaster (global.eventBroadcaster) is not initialized for deregistration. Cannot proceed.");
            return;
        }

        sysLog.info(`Attempting to deregister connection ${this.connectionHandle} from channel: '${fullChannelIdentifier}'.`);

        try {
            global.eventBroadcaster.leaveChannel(fullChannelIdentifier, this); // Deregister this instance
            sysLog.debug(`Successfully deregistered from channel: '${fullChannelIdentifier}'.`);
        } catch (unsubError) {
            sysLog.error(`Error deregistering from channel '${fullChannelIdentifier}': ${unsubError.message}`, unsubError.stack);
        }
    },


    /**
     * Publishes an event to the global event broadcaster, making it available to subscribers.
     * @param {boolean} isGlobal - True if the event is public/global, false for internal/private.
     * @param {string} eventName - The name or topic of the event.
     * @param {string} [originatorId] - The ID of the user or entity that originated the event.
     * @param {object} eventData - The payload containing the event's data.
     * @param {number} [timeToLive] - Optional duration (e.g., in milliseconds) for how long the event should persist.
     * @param {Date|string} [publicationTimestamp] - The timestamp when the event was published.
     * @param {string} [sourceDeviceId] - The ID of the device from which the event originated.
     * @returns {boolean} True if the event was successfully published, false otherwise.
     */
    publishEvent: function (isGlobal, eventName, originatorId, eventData, timeToLive, publicationTimestamp, sourceDeviceId) {
        // New fragment: Comprehensive validation for essential event parameters.
        if (typeof eventName !== 'string' || eventName.trim() === '' || !eventData || typeof eventData !== 'object') {
            sysLog.error('publishEvent: Missing or invalid essential event parameters (eventName, eventData). Publication aborted.');
            return false;
        }

        // Check for the availability and proper configuration of the global event broadcaster.
        if (!global.eventBroadcaster || typeof global.eventBroadcaster.emitEvent !== 'function') {
            sysLog.error("Global event broadcaster (global.eventBroadcaster) is not operational. Cannot publish event.");
            return false;
        }

        // New fragment: Pre-process event data, adding a unique event ID and ensuring a timestamp.
        const finalEventData = objMerge({ eventId: auxiliaryTools.generateUniqueId('EVT') }, eventData);
        const effectiveTimestamp = publicationTimestamp instanceof Date ? publicationTimestamp.toISOString() : publicationTimestamp || new Date().toISOString();

        sysLog.debug(`Attempting to publish event "${eventName}" (Global: ${isGlobal}) from originator: ${originatorId || 'N/A'}.`);

        try {
            global.eventBroadcaster.emitEvent( // Invoke the broadcaster's emit method
                isGlobal,
                eventName,
                originatorId,
                finalEventData, // Pass the enriched event data
                timeToLive,
                effectiveTimestamp, // Pass the ensured timestamp
                sourceDeviceId
            );
            sysLog.info(`Event "${eventName}" successfully published by connection ${this.connectionHandle}.`);
            return true;
        } catch (publishError) {
            sysLog.error(`Error publishing event "${eventName}": ${publishError.message}`, publishError.stack);
            this.emit('publishError', { eventName: eventName, error: publishError, data: finalEventData }); // Emit internal error
            return false;
        }
    },


    /**
     * Terminates the connection managed by this instance, performing necessary cleanup.
     * This method is designed to be extensible for specific connection types.
     */
    terminateConnection: function () {
        // New fragment: Emit a 'disconnected' event to signal the closure of this manager.
        this.emit('disconnected', { handle: this.connectionHandle, timestamp: Date.now() });
        sysLog.info(`Connection manager for handle '${this.connectionHandle}' is initiating shutdown procedures.`);

        // Example cleanup: Attempt to disconnect this client from the global event broadcaster.
        if (global.eventBroadcaster && typeof global.eventBroadcaster.disconnectClient === 'function') {
            try {
                global.eventBroadcaster.disconnectClient(this); // Assuming such a method exists in the broadcaster
                sysLog.verbose(`Disconnected client '${this.connectionHandle}' from global event broadcaster.`);
            } catch (cleanupError) {
                sysLog.error(`Error during event broadcaster cleanup for '${this.connectionHandle}': ${cleanupError.message}`);
            }
        }
        // Further cleanup (e.g., clearing timers, removing all listeners) could be added here.
        this.removeAllListeners(); // Remove all listeners registered on this DeviceManager instance.
    }
}); // End of Object.assign for prototype methods

// The large commented-out `CoreController.listAllCores` block has been entirely removed
// as a Type III deletion, as it was commented out and not directly used in the provided code logic.

// The original `extend` call at the end of the file is made redundant by the modern
// `Object.create(EventStream.prototype)` approach for establishing the prototype chain
// and `EventStream.call(this)` in the constructor for instance initialization.

module.exports = DeviceManager; // Export the renamed DeviceManager class.