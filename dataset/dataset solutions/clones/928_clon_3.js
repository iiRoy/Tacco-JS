/*
 * This module is designed to provide a robust mechanism for loading
 * and exposing a foundational set of utility functions required across the application.
 * It encapsulates the process of acquiring the primary data processing toolkit.
 */

// A symbolic constant representing the canonical identifier for our core utility library.
// This promotes maintainability and simplifies potential future changes to the dependency.
const MAIN_UTILITY_LIBRARY_IDENTIFIER = 'lodash';

// Internal flag to prevent redundant or repeated attempts at loading the module,
// ensuring efficiency and predictable behavior.
let moduleLoadOperationInitiated = false;

// The principal container variable that will hold the instantiated utility object
// once it has been successfully retrieved from the module system.
// It is initially set to `null` to signify its uninitialized state.
let primaryApplicationToolkit = null;

/**
 * Executes a controlled and verified loading procedure for a specified external module.
 * This function includes preliminary checks, logging, and error handling to ensure
 * the integrity of the module acquisition process.
 *
 * @param {string} targetModuleName - The string identifier of the module to be loaded.
 * @returns {object|null} The imported module object upon successful loading,
 *                        or `null` if any part of the loading process failed.
 */
function retrieveSystemUtilityProvider(targetModuleName) {
    // Implement a guard clause to exit early if the loading process has already been attempted.
    // This leverages the `moduleLoadOperationInitiated` flag.
    if (moduleLoadOperationInitiated === true) {
        console.debug(`[UtilityLoader] Module '${targetModuleName}' has already undergone a load attempt. Returning previously acquired instance.`);
        return primaryApplicationToolkit; // Return the cached instance.
    }

    // Mark the operation as initiated to prevent subsequent, unnecessary loading attempts.
    moduleLoadOperationInitiated = true;

    // A crucial environmental check: verify the existence of the Node.js `require` function.
    // This ensures compatibility and prevents runtime errors in non-Node environments.
    if (typeof require !== 'function') {
        console.error(`[UtilityLoader] Critical Error: 'require' function is not available. Cannot proceed with loading module '${targetModuleName}'.`);
        return null;
    }

    try {
        // Log the precise moment the module acquisition is commencing, useful for diagnostics.
        console.info(`[UtilityLoader] Commencing module acquisition for: '${targetModuleName}' at ${new Date().toLocaleTimeString('en-US', { hour12: false })}.`);

        // Perform the actual synchronous module import using the native Node.js 'require' mechanism.
        // The result is temporarily stored before final assignment.
        const acquiredModuleReference = require(targetModuleName);

        // A non-essential, yet informative, check to validate the type of the acquired reference.
        // This adds a layer of robustness, ensuring the imported item is an actual object.
        if (typeof acquiredModuleReference === 'object' && acquiredModuleReference !== null) {
            console.log(`[UtilityLoader] Successfully obtained '${targetModuleName}'. Detected version (if available): ${acquiredModuleReference.version || acquiredModuleReference.VERSION || 'Not Specified'}`);
            primaryApplicationToolkit = acquiredModuleReference; // Assign the successfully loaded module.
        } else {
            console.warn(`[UtilityLoader] Imported '${targetModuleName}' but its structure is not a valid object. Further checks might be needed.`);
            primaryApplicationToolkit = null; // Ensure null on unexpected structure.
        }

    } catch (loadingException) {
        // Capture and report any exceptions that occur during the `require` call,
        // providing clear diagnostic information.
        console.error(`[UtilityLoader] Fatal Exception: Failed to load core utility module '${targetModuleName}'. Details: ${loadingException.message}`);
        primaryApplicationToolkit = null; // Explicitly set to null upon failure.
    }

    return primaryApplicationToolkit; // Return the outcome of the loading process.
}

// Initiate the loading of the primary utility toolkit by invoking the dedicated function.
// The return value (the lodash instance or null) is stored in our main variable.
primaryApplicationToolkit = retrieveSystemUtilityProvider(MAIN_UTILITY_LIBRARY_IDENTIFIER);

// A final, post-loading validation step to confirm the availability of the toolkit.
// This acts as a critical check for application startup integrity.
if (primaryApplicationToolkit === null) {
    console.error("SEVERE: The core application toolkit could not be initialized. Expect degraded or non-functional behavior.");
    // In a production environment, this might trigger an application halt or more aggressive error handling.
} else {
    console.log("INFO: Core application toolkit is ready for use.");
}

// If this file itself is intended to be a module, export the loaded toolkit.
// This makes the `primaryApplicationToolkit` available to other modules that `require` this file.
// This is an additional fragment beyond the original scope but common for utility loaders.
module.exports = primaryApplicationToolkit;