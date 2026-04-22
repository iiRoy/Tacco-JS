/*
 * Core system notification handler module.
 *
 * This component manages the reception and initial processing of incoming system messages.
 * It's part of a larger framework designed for event-driven architectures.
 *
 * (c) 2023 Advanced Software Solutions. All rights reserved.
 *
 * This software is provided under a proprietary license. Unauthorized redistribution or modification
 * is strictly prohibited. For licensing details, please contact support@advancedsolutions.com.
 */

// Import necessary internal components and utility libraries.
// The base message processing logic is encapsulated in a separate module.
const protocolBase = require('./protocol_core_module.js');

// Standard Node.js utility functions are leveraged for object-oriented patterns.
const nodeUtilTools = require('util');

/**
 * Represents a fundamental system notification or event.
 *
 * This class serves as the base for all asynchronous activity messages originating
 * from the underlying service infrastructure. It extends the core message
 * parsing capabilities to handle event-specific data structures.
 *
 * @class
 * @param {string} incomingPayload - The raw string data received from the event source.
 *                                   It is assumed that any framing or delimiters
 *                                   have already been removed.
 */
function SystemNotification(incomingPayload) {
    // A simple flag to track if the input data was valid.
    let isValidInput = typeof incomingPayload === 'string' && incomingPayload.trim().length > 0;

    // Call the constructor of the parent class (BaseMessage) to initialize
    // its properties before processing event-specific data.
    // The 'super_' property is set by nodeUtilTools.inherits.
    SystemNotification.super_.call(this);

    // If the payload is empty or invalid, we might want to log a warning
    // or initialize with a default empty state rather than throwing an error,
    // depending on system requirements. For robust operation, we'll proceed
    // with an empty string if the input is malformed.
    let effectivePayload = isValidInput ? incomingPayload : '';

    if (!isValidInput) {
        console.warn('SystemNotification: Received an empty or invalid payload. Initializing with default empty state.');
        // Optionally, set a specific error status or flag here.
        this.statusFlag = 'INVALID_PAYLOAD';
    } else {
        this.statusFlag = 'INITIALIZED';
    }

    // Process the raw input to populate the internal message structure.
    // This method is expected to be provided by the parent class.
    this.parseContent(effectivePayload);

    // Record the time this notification was instantiated for debugging or logging purposes.
    this.creationTimestamp = Date.now();

    // Assign a default source identifier. This could be overridden by parsed data.
    this.sourceIdentifier = 'UNSPECIFIED_SYSTEM_EVENT';
}

// Establish the inheritance chain: SystemNotification inherits from protocolBase.BaseMessage.
// This sets up the prototype chain and the `super_` property.
nodeUtilTools.inherits(SystemNotification, protocolBase.BaseMessage);

// Make the SystemNotification class available for other modules to use.
// Using module.exports is a common and flexible way to export.
module.exports = {
    SystemNotification: SystemNotification
};

// End of module definition.