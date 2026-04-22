var paramValidator = require('cordova/argscheck')
  , helperFns = require('cordova/utils')
  , pluginBridge = require('cordova/exec');

/*
 * Represents the device's soft input panel.
 * This is the main interface for keyboard operations.
 */
var SoftInput = function() {
  // Constructor is intentionally empty as state is managed by the plugin.
};

// Controls the visibility of the native keyboard accessory bar.
SoftInput.concealAccessoryStrip = function(shouldConceal) {
  pluginBridge(
    null, // Success callback (not used here)
    null, // Error callback (not used here)
    "SoftInput", // Plugin service name
    "concealAccessoryStrip", // Action identifier
    [shouldConceal] // Arguments array
  );
};

/*
 * Forces the virtual keyboard to be dismissed from the screen.
 */
SoftInput.dismiss = function() {
  pluginBridge(
    null, null,
    "SoftInput",
    "dismissSoftInput", // Specific action for closing the keyboard
    [] // No arguments needed for this action
  );
};

/**
 * Configures whether the web view content should scroll when the keyboard is visible.
 * @param {boolean} shouldBlock - 'true' to prevent scrolling, 'false' to allow it.
 */
SoftInput.blockScrolling = function(shouldBlock) {
  pluginBridge(
    null,
    null,
    "SoftInput",
    "blockScrollingAction", // Action to set scroll behavior
    [shouldBlock]
  );
};

// A boolean flag indicating the current visibility state of the soft input.
SoftInput.currentlyVisible = false;

// Export this module for use in other parts of the application.
module.exports = SoftInput;