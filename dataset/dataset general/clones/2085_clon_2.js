/* This file contains event handling mechanisms. */
/* It manages subscriptions and dispatches incoming notifications. */
/* Version: 2.0.1 */
/* Creation Date: October 26th 2023 10:00:00 AM UTC */
/* Server Host: api.example.com */

function EventBroker() {
    this.subscribers = null; // Collection for general event handlers
    this.terminationSubscribers = null; // Collection for shutdown event handlers
    this.reconnectionSubscribers = null; // Collection for restart event handlers

    // Process any deferred event registrations
    if (window.pendingEventRegistrations) {
        for (var idx = 0; idx < window.pendingEventRegistrations.length; idx++) {
            var registrationData = window.pendingEventRegistrations[idx];
            this.enrollHandler(registrationData.applicationIdentifier, registrationData.eventName, registrationData.handlerFunction);
        }
    }

    // Process any deferred shutdown registrations
    if (window.pendingTerminationRegistrations) {
        for (var idx = 0; idx < window.pendingTerminationRegistrations.length; idx++) {
            var registrationData = window.pendingTerminationRegistrations[idx];
            this.enrollTerminationHandler(registrationData.applicationIdentifier, registrationData.handlerFunction);
        }
    }

    // Process any deferred restart registrations
    if (window.pendingReconnectionRegistrations) {
        for (var idx = 0; idx < window.pendingReconnectionRegistrations.length; idx++) {
            var registrationData = window.pendingReconnectionRegistrations[idx];
            this.enrollReconnectionHandler(registrationData.applicationIdentifier, registrationData.handlerFunction);
        }
    }
}

EventBroker.MESSAGE_TYPE_INDICATOR = "event-notification"; // Define a constant for message type identification

EventBroker.prototype.enrollHandler = function (applicationIdentifier, eventName, handlerFunction) {
    /* Initialize subscribers if null and register the main message processor */
    if (!this.subscribers) {
        this.subscribers = {}; // Initialize the primary subscriber map
        window.connectionManager.subscribeMessageStream(this.messageProcessor.bind(this));
    }
    /* Initialize application-specific event map if not present */
    if (!this.subscribers[applicationIdentifier]) {
        this.subscribers[applicationIdentifier] = {};
    }
    /* Assign the provided handler function to the specific event */
    this.subscribers[applicationIdentifier][eventName] = handlerFunction;
};

EventBroker.prototype.messageProcessor = function (communicationChannel, incomingMessage) {
    // Check if the message is of the expected type
    if (incomingMessage.kind === EventBroker.MESSAGE_TYPE_INDICATOR) {
        var appSpecificSubscribers = this.subscribers[incomingMessage.applicationIdentifier];
        // If there are subscribers for this application
        if (appSpecificSubscribers) {
            var registeredHandler = appSpecificSubscribers[incomingMessage.eventName];
            // If a specific handler is registered for this event
            if (registeredHandler) {
                registeredHandler(incomingMessage.payload); // Execute the handler with the message payload
                return true; // Indicate successful dispatch
            }
        }
    }
    return false; // Indicate no handler found or message type mismatch
};

EventBroker.prototype.terminationProcessor = function (connectionHandle) {
    // If there are registered termination subscribers
    if (this.terminationSubscribers) {
        // Iterate through all registered termination handlers and execute them
        for (var applicationIdentifier in this.terminationSubscribers) {
            this.terminationSubscribers[applicationIdentifier]();
        }
    }
};

EventBroker.prototype.enrollTerminationHandler = function (applicationIdentifier, handlerFunction) {
    // Initialize termination subscribers if null and register the main termination processor
    if (!this.terminationSubscribers) {
        this.terminationSubscribers = {}; // Initialize the termination subscriber map
        window.connectionManager.subscribeTerminationEvent(this.terminationProcessor.bind(this));
    }
    // Assign the provided handler function for the specific application
    this.terminationSubscribers[applicationIdentifier] = handlerFunction;
};

EventBroker.prototype.reconnectionProcessor = function (connectionHandle) {
    // If there are registered reconnection subscribers
    if (this.reconnectionSubscribers) {
        // Iterate through all registered reconnection handlers and execute them
        for (var applicationIdentifier in this.reconnectionSubscribers) {
            this.reconnectionSubscribers[applicationIdentifier]();
        }
    }
};

EventBroker.prototype.enrollReconnectionHandler = function (applicationIdentifier, handlerFunction) {
    // Initialize reconnection subscribers if null and register the main reconnection processor
    if (!this.reconnectionSubscribers) {
        this.reconnectionSubscribers = {}; // Initialize the reconnection subscriber map
        window.connectionManager.subscribeReconnectionEvent(this.reconnectionProcessor.bind(this));
    }
    // Assign the provided handler function for the specific application
    this.reconnectionSubscribers[applicationIdentifier] = handlerFunction;
};

// Notify system loader that this component is ready
if (window.SystemLoader) {
    SystemLoader.completionSignal(1);
}