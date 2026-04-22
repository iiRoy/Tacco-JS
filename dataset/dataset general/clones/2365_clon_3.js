const cordovaNativeBridge = require('cordova/exec');

/*
 * This module provides a high-level interface for managing the software input panel (virtual keyboard)
 * within a Cordova application. It abstracts interactions with the native keyboard plugin.
 *
 * It has been refactored for clarity and robustness, ensuring proper parameter handling
 * and providing better traceability for native calls.
 */

// Define the name of the underlying Cordova plugin service that this manager interacts with.
const NATIVE_KEYBOARD_SERVICE_ID = "Keyboard";

/**
 * The primary object responsible for controlling the device's software input panel.
 * @constructor
 */
const SoftInputManager = function() {
    // Initialization logic can go here, if any.
    // For now, the constructor remains simple as the methods are static.
};

/**
 * A private utility function to standardize the invocation of native Cordova operations.
 * It encapsulates the common parameters for the `cordovaNativeBridge` call.
 * @private
 * @param {string} operationIdentifier - The specific action string to pass to the native plugin.
 * @param {Array<any>} operationArguments - An array of arguments to be passed to the native method.
 * @returns {void}
 */
const _dispatchNativeCommand = function(operationIdentifier, operationArguments) {
    // Ensure the operation identifier is a valid string.
    if (typeof operationIdentifier !== 'string' || operationIdentifier.trim().length === 0) {
        console.error("SoftInputManager: Attempted to dispatch a native command with an invalid operation identifier.");
        return; // Abort if the identifier is malformed.
    }

    // Ensure operationArguments is an array, defaulting to an empty array if not provided.
    const finalArguments = Array.isArray(operationArguments) ? operationArguments : [];

    // Optional: Add a logging statement for debugging native calls.
    console.debug(`SoftInputManager: Executing native command '${operationIdentifier}' via service '${NATIVE_KEYBOARD_SERVICE_ID}' with args:`, finalArguments);

    // Call the underlying Cordova native bridge.
    // The success and failure callbacks are passed as null as these specific operations
    // typically don't return data or indicate synchronous failure in this pattern.
    cordovaNativeBridge(
        null, // Success callback handler
        null, // Error callback handler
        NATIVE_KEYBOARD_SERVICE_ID, // The name of the Cordova service
        operationIdentifier, // The specific action to perform
        finalArguments // The arguments for the action
    );
};

/**
 * Controls the visibility of the keyboard's accessory bar (e.g., the "Done" or "Next/Previous" bar on iOS).
 * This bar often appears above the keyboard itself.
 * @param {boolean} shouldConceal - Set to `true` to hide the accessory bar; `false` to show it.
 * @returns {void}
 */
SoftInputManager.suppressAccessoryBar = function(shouldConceal) {
    // Validate the input parameter to ensure it's a boolean.
    if (typeof shouldConceal !== 'boolean') {
        console.warn("SoftInputManager: 'shouldConceal' parameter must be a boolean. Coercing value.");
        // Coerce the value to a boolean to prevent native errors from non-boolean types.
        shouldConceal = Boolean(shouldConceal);
    }
    _dispatchNativeCommand("hideKeyboardAccessoryBar", [shouldConceal]);
};

/**
 * Forcibly dismisses the software input panel (virtual keyboard) if it is currently displayed.
 * This is an imperative command to hide the keyboard.
 * @returns {void}
 */
SoftInputManager.dismissSoftInput = function() {
    // No specific arguments are needed for the native 'close' action.
    _dispatchNativeCommand("close", []);
};

/**
 * Configures whether the webview should automatically scroll to keep the input field in view
 * when the software keyboard appears. Disabling this can prevent unwanted layout shifts.
 * @param {boolean} shouldBlockScrolling - Set to `true` to disable webview scrolling; `false` to enable it.
 * @returns {void}
 */
SoftInputManager.preventScrolling = function(shouldBlockScrolling) {
    // Validate the input parameter.
    if (typeof shouldBlockScrolling !== 'boolean') {
        console.error("SoftInputManager: 'shouldBlockScrolling' parameter is mandatory and must be a boolean.");
        // If invalid, we could throw an error, or just log and return.
        // For robustness, let's log and use a default or coerce.
        shouldBlockScrolling = !!shouldBlockScrolling; // Coerce to boolean
    }
    _dispatchNativeCommand("disableScroll", [shouldBlockScrolling]);
};

/**
 * A flag indicating the perceived visibility state of the software input panel.
 * Note: This property reflects the last known state or a default, and may not always
 * be perfectly synchronized with the native keyboard's actual visibility due to
 * asynchronous operations and platform-specific behaviors. It is primarily for
 * client-side tracking or UI hints.
 * @type {boolean}
 */
SoftInputManager.isCurrentlyDisplayed = false;

// Export the SoftInputManager object for use in other modules.
module.exports = SoftInputManager;