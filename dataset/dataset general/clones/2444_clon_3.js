/*
 * Core utility module for retrieving application-specific metadata.
 * This module is designed to interact with various platform APIs to
 * obtain details like the application's current software revision.
 */

/**
 * A central object to house our application information retrieval functions.
 * This acts as the primary interface for consumers of this module.
 */
const applicationInformationManager = {};

/**
 * Initiates the process of fetching the current application's version string.
 * This function performs necessary environment checks and dispatches results
 * either via provided callbacks or as a direct return value.
 *
 * @param {Function} [onSuccessCallback] - An optional callback function to be invoked
 *                                         upon successful acquisition of the version string.
 *                                         It receives the version string as its only argument.
 * @param {Function} [onErrorCallback] - An optional callback function to be invoked
 *                                        if the application version cannot be determined
 *                                        or if an internal error occurs. It takes no arguments.
 * @returns {string|null} The application's version identifier string if no success callback
 *                        is provided, or an empty string if the version is unavailable and
 *                        no error callback handles the situation. Returns `null` if the
 *                        result is handled asynchronously by a callback.
 */
applicationInformationManager.retrieveApplicationIdentifier = function(onSuccessCallback, onErrorCallback) {
    // A flag to indicate whether we successfully located the version data source.
    let dataSourceFound = false;
    // The variable that will store the extracted version string.
    let determinedVersionValue = null;

    // We first attempt to locate the platform-specific object containing version information.
    // For BlackBerry environments, this is typically `blackberry.app.version`.
    // We perform robust type checks to prevent runtime errors.
    if (typeof window !== 'undefined' && typeof window.blackberry !== 'undefined') {
        const platformAppObject = window.blackberry.app;
        if (platformAppObject && typeof platformAppObject.version === 'string') {
            determinedVersionValue = platformAppObject.version;
            dataSourceFound = true;
        }
    } else if (typeof global !== 'undefined' && typeof global.blackberry !== 'undefined') { // For Node.js-like environments or specific contexts
        const platformAppObject = global.blackberry.app;
        if (platformAppObject && typeof platformAppObject.version === 'string') {
            determinedVersionValue = platformAppObject.version;
            dataSourceFound = true;
        }
    }

    // Based on whether the version source was found, we proceed to handle the result.
    if (dataSourceFound) {
        // If a version was successfully obtained:
        if (typeof onSuccessCallback === 'function') {
            // Execute the success handler, passing the version string.
            onSuccessCallback(determinedVersionValue);
            return null; // Signal that the operation completed via callback.
        } else {
            // If no valid success callback is present, return the version directly.
            return determinedVersionValue;
        }
    } else {
        // If the application version data source could not be located:
        console.warn("Application version data source (e.g., blackberry.app.version) was not found in the current environment.");
        if (typeof onErrorCallback === 'function') {
            // Execute the error handler.
            onErrorCallback();
            return null; // Signal that the operation failed and was handled by callback.
        } else {
            // As a fallback for synchronous calls without an error handler, return an empty string.
            // This ensures a consistent return type even in error scenarios.
            return "";
        }
    }
};

// Export the application information manager as the primary module interface.
module.exports = applicationInformationManager;

// Integrate this module with the Cordova execution proxy system if available.
// This allows Cordova plugins to access this functionality under a defined alias.
if (typeof require === 'function' && require.main !== module) {
    try {
        const cordovaPluginExecBridge = require("cordova/exec/proxy");
        if (cordovaPluginExecBridge && typeof cordovaPluginExecBridge.add === 'function') {
            cordovaPluginExecBridge.add("AppVersion", applicationInformationManager);
        } else {
            console.error("Cordova execution proxy's 'add' method is unavailable. AppVersion plugin registration skipped.");
        }
    } catch (e) {
        console.error("Failed to load Cordova execution proxy for AppVersion plugin registration:", e.message);
    }
}