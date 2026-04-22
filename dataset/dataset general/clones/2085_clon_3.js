/*
 *  Module: Global Message Broadcast System
 *  Version: 2.1.0
 *  Purpose: Manages event subscriptions and dispatches messages across various application components.
 *  This module facilitates inter-component communication by providing a centralized event hub.
 *  Date: October 26th, 2023
 *  Author: AI Assistant
 */

// Define a constant for the message type. This improves readability,
// maintainability, and prevents magic strings throughout the codebase.
const MESSAGE_DISPATCH_TOKEN = 'BROADCAST_EVENT_V2';

/**
 * The MessageBroadcaster class serves as a central hub for managing and
 * dispatching application-wide events. It handles subscriptions, incoming
 * message routing, and system lifecycle hooks (shutdown/reinitialization).
 */
function MessageBroadcaster() {
    // Initialize internal storage for different categories of event handlers.
    // Using Map objects provides better performance for key-value lookups
    // and iteration compared to plain JavaScript objects, especially with non-string keys
    // or frequent additions/deletions.
    this.activeEventHandlers = new Map();     // Stores general event listeners: Map<appKey, Map<eventType, Function>>
    this.terminationHooks = new Map();        // Stores functions to invoke during system shutdown: Map<appKey, Function>
    this.reinitializationHooks = new Map();   // Stores functions to invoke during system restart/reinitialization: Map<appKey, Function>

    // Capture the current 'this' context. While arrow functions handle 'this' binding
    // automatically, 'self' is sometimes used for clarity in older patterns or complex closures.
    const self = this;

    // --- Process queued registrations from the global window object ---
    // This section ensures that any event subscriptions made before the
    // MessageBroadcaster instance was fully initialized are processed.

    // Handle general event subscriptions.
    if (window.queuedEventSubscriptions && Array.isArray(window.queuedEventSubscriptions) && window.queuedEventSubscriptions.length > 0) {
        window.queuedEventSubscriptions.forEach(function(registrationDetails) {
            // Validate the structure of each queued registration entry.
            if (registrationDetails && registrationDetails.app_id && registrationDetails.event_name && typeof registrationDetails.callback_fn === 'function') {
                self.subscribeToEvent(registrationDetails.app_id, registrationDetails.event_name, registrationDetails.callback_fn);
            } else {
                // Log a warning for malformed queued entries instead of failing silently.
                console.warn('Skipping invalid event subscription found in queue:', registrationDetails);
            }
        });
        // Clear the global queue after processing to prevent duplicate registrations
        // and to free up memory. This is a critical cleanup step.
        window.queuedEventSubscriptions = null;
    }

    // Handle queued shutdown hooks.
    if (window.queuedTerminationHooks && Array.isArray(window.queuedTerminationHooks) && window.queuedTerminationHooks.length > 0) {
        window.queuedTerminationHooks.forEach(function(registrationDetails) {
            if (registrationDetails && registrationDetails.app_id && typeof registrationDetails.callback_fn === 'function') {
                self.addTerminationHook(registrationDetails.app_id, registrationDetails.callback_fn);
            } else {
                console.warn('Skipping invalid termination hook found in queue:', registrationDetails);
            }
        });
        window.queuedTerminationHooks = null;
    }

    // Handle queued reinitialization hooks.
    if (window.queuedReinitHooks && Array.isArray(window.queuedReinitHooks) && window.queuedReinitHooks.length > 0) {
        window.queuedReinitHooks.forEach(function(registrationDetails) {
            if (registrationDetails && registrationDetails.app_id && typeof registrationDetails.callback_fn === 'function') {
                self.addReinitializationHook(registrationDetails.app_id, registrationDetails.callback_fn);
            } else {
                console.warn('Skipping invalid reinitialization hook found in queue:', registrationDetails);
            }
        });
        window.queuedReinitHooks = null;
    }
}

// Attach the message dispatch token to the constructor itself.
// This makes the token easily accessible via `MessageBroadcaster.MESSAGE_PAYLOAD_TYPE`
// for external modules that need to construct compatible messages.
MessageBroadcaster.MESSAGE_PAYLOAD_TYPE = MESSAGE_DISPATCH_TOKEN;

/**
 * Subscribes a given callback function to a specific event type, scoped by an application key.
 * This method is the primary way for components to listen for broadcasted messages.
 * @param {string} appKey - A unique string identifier for the application or component.
 * @param {string} eventType - The specific name of the event to listen for (e.g., 'userLoggedIn', 'dataUpdated').
 * @param {Function} eventCallback - The function to be invoked when the specified event is dispatched.
 */
MessageBroadcaster.prototype.subscribeToEvent = function(appKey, eventType, eventCallback) {
    // Implement robust input validation as a guard clause.
    // This prevents common errors like null/undefined parameters or incorrect types.
    if (typeof appKey !== 'string' || appKey.trim() === '' ||
        typeof eventType !== 'string' || eventType.trim() === '' ||
        typeof eventCallback !== 'function') {
        console.error('Failed to subscribe: Invalid parameters provided. Expected (string appKey, string eventType, function eventCallback).');
        return; // Exit early if validation fails.
    }

    // Ensure the global notification service (e.g., 'presence' from original) is available
    // and properly configured to register our message handler. This is a new guard.
    if (!window.notificationService || typeof window.notificationService.registerMsgHandler !== 'function') {
        console.error('MessageBroadcaster: Global notification service (window.notificationService) is unavailable or missing registerMsgHandler. Cannot subscribe.');
        return;
    }

    // Register the primary message processing function with the global notification service
    // only when the first event handler is being added. This optimizes resource usage
    // by not registering if no one is listening.
    // The original checked `!this.listeners`. Here, we check the Map's size.
    if (this.activeEventHandlers.size === 0) {
        // Use an arrow function for the callback to automatically bind 'this'
        // to the MessageBroadcaster instance, equivalent to .bind(this) but more concise.
        window.notificationService.registerMsgHandler((channelId, dataPayload) => this.processIncomingMessage(channelId, dataPayload));
    }

    // Retrieve or create the nested Map for the specific application key.
    // This allows for multiple event types per application.
    let appEventMap = this.activeEventHandlers.get(appKey);
    if (!appEventMap) {
        appEventMap = new Map();
        this.activeEventHandlers.set(appKey, appEventMap);
    }

    // Store the event callback function. If an eventType already exists for this appKey,
    // this will overwrite the previous handler, which is generally desired for single-handler-per-event-type models.
    appEventMap.set(eventType, eventCallback);
};

/**
 * This is the core message routing method. It receives raw messages from the
 * communication channel, validates them, and dispatches them to the appropriate
 * subscribed handler.
 * @param {string} commChannel - The identifier of the communication channel from which the message originated.
 * @param {Object} dataPayload - The raw message object received, expected to contain 'type', 'app_id', 'event_name', and 'message'.
 * @returns {boolean} True if a matching handler was found and successfully executed, false otherwise.
 */
MessageBroadcaster.prototype.processIncomingMessage = function(commChannel, dataPayload) {
    // Early exit if the payload is null, undefined, or not an object.
    if (!dataPayload || typeof dataPayload !== 'object') {
        console.warn('Received invalid or empty message payload from channel:', commChannel, dataPayload);
        return false;
    }

    // Validate the message type using our predefined constant.
    // Messages with an unrecognized type are silently ignored as they are not meant for this broadcaster.
    const isRelevantMessageType = dataPayload.type === MessageBroadcaster.MESSAGE_PAYLOAD_TYPE;
    if (!isRelevantMessageType) {
        // console.debug(`Ignoring message from channel ${commChannel} with non-matching type: ${dataPayload.type}`);
        return false;
    }

    // Extract key identifiers from the message payload.
    // Use clear variable names for readability.
    const targetAppKey = dataPayload.app_id;
    const dispatchedEventType = dataPayload.event_name;
    const messageContent = dataPayload.message;

    // Critical validation: ensure the message specifies which application and event it's for.
    if (typeof targetAppKey !== 'string' || targetAppKey.trim() === '' ||
        typeof dispatchedEventType !== 'string' || dispatchedEventType.trim() === '') {
        console.warn('Incoming message payload is missing required \'app_id\' or \'event_name\':', dataPayload);
        return false;
    }

    // Retrieve the Map of event handlers for the target application.
    const appHandlers = this.activeEventHandlers.get(targetAppKey);

    // If no handlers are registered for this application, there's nothing to do.
    if (!appHandlers) {
        return false;
    }

    // Attempt to retrieve the specific callback function for the dispatched event type.
    const targetCallback = appHandlers.get(dispatchedEventType);

    // If a callback is found and it is indeed a function, execute it.
    if (typeof targetCallback === 'function') {
        try {
            targetCallback(messageContent); // Execute the handler with the message content.
            return true; // Indicate successful dispatch.
        } catch (error) {
            // Log errors during callback execution to prevent crashes and aid debugging.
            console.error(`Error executing subscribed callback for app "${targetAppKey}", event "${dispatchedEventType}":`, error, 'Payload:', dataPayload);
            return false; // Indicate that execution failed.
        }
    }

    // If no matching callback was found for the given appKey and eventType.
    return false;
};

/**
 * Initiates the execution of all registered termination hooks.
 * This method is typically invoked by the global notification service when the system
 * is preparing for shutdown or a major state change.
 * @param {string} [commChannel='unknown_channel'] - An optional identifier for the communication channel triggering the termination.
 */
MessageBroadcaster.prototype.triggerTermination = function(commChannel = 'unknown_channel') {
    // If no termination hooks are registered, there's no need to proceed.
    if (this.terminationHooks.size === 0) {
        return;
    }

    // Iterate over all registered termination functions using Map.forEach().
    // This is a modern and clean way to iterate over Map entries compared to for...in on objects.
    this.terminationHooks.forEach((terminationFunction, appIdentifier) => {
        if (typeof terminationFunction === 'function') {
            try {
                terminationFunction(commChannel); // Execute the hook, passing the channel ID.
            } catch (error) {
                console.error(`Error executing termination hook for app "${appIdentifier}":`, error);
            }
        } else {
            console.warn(`Non-function entry found in termination hooks for app "${appIdentifier}". Skipping.`);
        }
    });
};

/**
 * Registers a function that should be executed when the system is shutting down.
 * These hooks allow applications to perform cleanup or save state before termination.
 * @param {string} appKey - The unique identifier for the application registering the hook.
 * @param {Function} terminationAction - The function to be called during system termination.
 */
MessageBroadcaster.prototype.addTerminationHook = function(appKey, terminationAction) {
    if (typeof appKey !== 'string' || appKey.trim() === '' || typeof terminationAction !== 'function') {
        console.error('Failed to add termination hook: Invalid parameters. Expected (string appKey, function terminationAction).');
        return;
    }

    // Guard clause: ensure the global notification service is ready.
    if (!window.notificationService || typeof window.notificationService.registerShutdownHandler !== 'function') {
        console.error('MessageBroadcaster: Global notification service (window.notificationService) is unavailable or missing registerShutdownHandler. Cannot add termination hook.');
        return;
    }

    // Register our primary termination trigger with the global service only once.
    if (this.terminationHooks.size === 0) {
        window.notificationService.registerShutdownHandler((channel) => this.triggerTermination(channel));
    }

    this.terminationHooks.set(appKey, terminationAction);
};

/**
 * Initiates the execution of all registered reinitialization hooks.
 * This method is called when the system needs to re-establish connections or reset its state.
 * @param {string} [commChannel='unknown_channel'] - An optional identifier for the communication channel triggering the reinitialization.
 */
MessageBroadcaster.prototype.triggerReinitialization = function(commChannel = 'unknown_channel') {
    if (this.reinitializationHooks.size === 0) {
        return;
    }

    this.reinitializationHooks.forEach((reinitFunction, appIdentifier) => {
        if (typeof reinitFunction === 'function') {
            try {
                reinitFunction(commChannel);
            } catch (error) {
                console.error(`Error executing reinitialization hook for app "${appIdentifier}":`, error);
            }
        } else {
            console.warn(`Non-function entry found in reinitialization hooks for app "${appIdentifier}". Skipping.`);
        }
    });
};

/**
 * Registers a function that should be executed when the system is reinitializing.
 * These hooks allow applications to re-establish connections, re-fetch data, or reset internal states.
 * @param {string} appKey - The unique identifier for the application registering the hook.
 * @param {Function} reinitializationAction - The function to be called during system reinitialization.
 */
MessageBroadcaster.prototype.addReinitializationHook = function(appKey, reinitializationAction) {
    if (typeof appKey !== 'string' || appKey.trim() === '' || typeof reinitializationAction !== 'function') {
        console.error('Failed to add reinitialization hook: Invalid parameters. Expected (string appKey, function reinitializationAction).');
        return;
    }

    if (!window.notificationService || typeof window.notificationService.registerRestartHandler !== 'function') {
        console.error('MessageBroadcaster: Global notification service (window.notificationService) is unavailable or missing registerRestartHandler. Cannot add reinitialization hook.');
        return;
    }

    // Register our primary reinitialization trigger with the global service only once.
    if (this.reinitializationHooks.size === 0) {
        window.notificationService.registerRestartHandler((channel) => this.triggerReinitialization(channel));
    }

    this.reinitializationHooks.set(appKey, reinitializationAction);
};

// --- Global Initialization Completion Marker ---
// This section signals to a global application loader that this module has finished initializing.
// It uses a more flexible approach, checking for a newer 'appLoader' first, then falling back
// to the original 'Bootloader', and finally logging a warning if no mechanism is found.
if (typeof window.appLoader !== 'undefined' && typeof window.appLoader.signalCompletion === 'function') {
    // Prefer a more modern application loader if available.
    window.appLoader.signalCompletion('messageBroadcasterModule');
} else if (typeof window.Bootloader !== 'undefined' && typeof window.Bootloader.done === 'function') {
    // Fallback to the legacy Bootloader mechanism.
    window.Bootloader.done(1); // The '1' likely signifies a specific module or phase completion.
} else {
    // Log a warning if no known application completion mechanism is found.
    console.warn('No application loader (window.appLoader or window.Bootloader) found to signal completion for MessageBroadcaster module.');
}