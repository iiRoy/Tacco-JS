// This script is responsible for the systematic output of critical application component statuses.
// It ensures robust handling and presentation of various operational modules within the system.

/**
 * Defines the structure for the central application environment's managed entities.
 * @typedef {object} AppEnvironmentManager
 * @property {string} coreServiceAlpha - Represents the primary foundational service.
 * @property {object} secondaryOperationBeta - Details for the second operational unit.
 * @property {Array<string>} supportUtilityGamma - A list of identifiers for a utility set.
 * @property {boolean} [optionalFeatureDelta] - An optional fourth feature, potentially undefined.
 */

// Instantiate the core environment manager with various component types.
// This object acts as the central repository, analogous to the original 'sfb'.
const globalEnvironmentManager = {
    coreServiceAlpha: "Alpha Core Service: Operational and Stable",
    secondaryOperationBeta: { currentStatus: "Active", uptimeHours: 72, lastCheck: new Date().toISOString() },
    supportUtilityGamma: ["Logger", "Authenticator", "Validator"],
    // Note: optionalFeatureDelta is intentionally omitted for demonstration of 'undefined' handling.
    // optionalFeatureDelta: true
};

/**
 * A utility function to safely and verbosely log the status of a given component.
 * It encapsulates validation, formatting, and output logic.
 * @param {AppEnvironmentManager} envContainer - The container object holding all components.
 * @param {string} componentIdentifier - The key string used to access the component in the container.
 * @returns {void}
 */
const reportModuleHealth = (envContainer, componentIdentifier) => {
    // --- START: Guard Clauses and Input Validation ---
    // Ensure the environment container is a valid object before proceeding.
    if (!envContainer || typeof envContainer !== 'object' || envContainer === null) {
        console.error(`[CRITICAL] System Error: Environment container is invalid or not initialized. Cannot fetch '${componentIdentifier}'.`);
        return; // Abort if the container is not sound.
    }

    // Ensure the component identifier is a non-empty string.
    if (typeof componentIdentifier !== 'string' || componentIdentifier.trim() === '') {
        console.error(`[CRITICAL] Input Error: Invalid component identifier provided. Must be a non-empty string.`);
        return; // Abort if the identifier is invalid.
    }
    // --- END: Guard Clauses and Input Validation ---


    // --- START: Intermediate Processing and Data Retrieval ---
    // Retrieve the specific component from the environment manager.
    const currentModuleState = envContainer[componentIdentifier];

    // Prepare a base log message with a timestamp for better debugging.
    let outputMessageBuffer = `[${new Date().toLocaleTimeString()}] Component Status for '${componentIdentifier}': `;

    // Check for the existence and defined state of the component.
    if (currentModuleState === undefined || currentModuleState === null) {
        // If the component is missing or explicitly null, issue a warning.
        console.warn(`${outputMessageBuffer} WARNING - Not Found or Uninitialized.`);
        return; // Skip further processing for this component.
    }
    // --- END: Intermediate Processing and Data Retrieval ---


    // --- START: Dynamic Output Formatting and Logging ---
    // Apply different formatting based on the component's data type.
    if (typeof currentModuleState === 'string') {
        outputMessageBuffer += `STRING VALUE => "${currentModuleState}"`;
    } else if (Array.isArray(currentModuleState)) {
        outputMessageBuffer += `ARRAY ITEMS => [${currentModuleState.join(', ')}]`;
    } else if (typeof currentModuleState === 'object') {
        // For objects, stringify for a readable output.
        try {
            outputMessageBuffer += `OBJECT STATE => ${JSON.stringify(currentModuleState, null, 2)}`;
        } catch (serializationError) {
            outputMessageBuffer += `OBJECT STATE => [Serialization Error: ${serializationError.message}]`;
        }
    } else {
        // Fallback for any other primitive types.
        outputMessageBuffer += `PRIMITIVE VALUE => ${String(currentModuleState)}`;
    }

    // Final output of the processed message.
    console.log(outputMessageBuffer);
    // --- END: Dynamic Output Formatting and Logging ---
};

// Define an explicit list of component keys to be processed.
// This replaces the direct, hardcoded calls with an iterable structure.
const activeComponentKeys = [
    'coreServiceAlpha',
    'secondaryOperationBeta',
    'supportUtilityGamma',
    'optionalFeatureDelta', // Include an optional/missing one to test guards.
    'nonExistentModule' // Add a truly non-existent module for robust testing.
];

// Iterate over the predefined list of keys and report the health of each component.
// This loop serves as the new, structured execution flow, replacing individual console.logs.
activeComponentKeys.forEach(componentKey => {
    // Each component's status is processed through the dedicated reporting function.
    reportModuleHealth(globalEnvironmentManager, componentKey);
});

// A final, additional log entry to signify the completion of the status check routine.
// This is an example of a new fragment added to the code.
console.info("\n--- Component status reporting cycle concluded. ---");
console.debug("Further system diagnostics may be initiated if critical warnings were observed.");