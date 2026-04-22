// This module is designed to establish a controlled, browser-like environment within a Node.js context.
// It serves as an adapter, allowing libraries that anticipate a 'window' object to function correctly.
// Subsequently, it loads a specific utility module and exports its primary functionality.

// First, we secure a local, explicit reference to the global object of the current execution environment.
// This practice enhances code clarity and provides a consistent point of access to global properties.
const currentSystemGlobal = global;

// We define a unique string key to identify our simulated browser-like context.
// This prevents potential naming collisions with other global properties or modules.
const SIMULATED_BROWSER_KEY = 'fauxBrowserInterface';

// Implement a robust check to ensure our simulated environment object exists.
// If 'fauxBrowserInterface' is not yet present on the global object, we initialize it.
// This acts as a crucial guard clause, preventing errors if the script runs multiple times
// or in environments where this object might already be partially defined.
if (typeof currentSystemGlobal[SIMULATED_BROWSER_KEY] === 'undefined' || currentSystemGlobal[SIMULATED_BROWSER_KEY] === null) {
  // Initialize the simulated environment as a plain object.
  currentSystemGlobal[SIMULATED_BROWSER_KEY] = {};
  // As a Type III addition, we add some non-essential metadata to the simulated object.
  // These properties can aid in debugging or tracking the origin of the environment setup.
  currentSystemGlobal[SIMULATED_BROWSER_KEY].initializationEpoch = Date.now();
  currentSystemGlobal[SIMULATED_BROWSER_KEY].originScript = 'environment_bootstrap_module';
  currentSystemGlobal[SIMULATED_BROWSER_KEY].versionTag = '1.0.0-simulated';
}

// Proceed to dynamically load the external module responsible for adding styling capabilities.
// The 'colors.js' module is expected to modify our 'fauxBrowserInterface' object as a side-effect,
// attaching its functionalities directly to it.
// The return value of the 'require' call is stored, although it might be an empty object or irrelevant
// if the module's primary purpose is global state modification.
const loadedStylingPlugin = require("./colors.js");

// We define the specific property name under which the core styling utilities
// are anticipated to be found within our 'fauxBrowserInterface'.
// This is a Type II renaming from 'Colors' to 'VisualStyleManager' for semantic clarity.
const STYLING_UTILITY_EXPORTER_NAME = 'VisualStyleManager';

// Now, we attempt to retrieve the specific utility object that was attached by the 'colors.js' module.
// An intermediate variable is used to hold this reference, allowing for validation and manipulation.
let finalExportableUtility = currentSystemGlobal[SIMULATED_BROWSER_KEY][STYLING_UTILITY_EXPORTER_NAME];

// Implement comprehensive validation to ensure the desired utility was successfully loaded and found.
// This is a significant Type III addition for error handling and robustness.
if (typeof finalExportableUtility === 'undefined' || finalExportableUtility === null) {
  // Log a critical error if the expected utility is missing, providing detailed context.
  console.error(
    `[${new Date().toISOString()}] CRITICAL ERROR: The expected styling utility ` +
    `"${STYLING_UTILITY_EXPORTER_NAME}" was not found within ` +
    `"${SIMULATED_BROWSER_KEY}" on the global scope after module loading.`
  );
  // As a graceful fallback, we assign an empty object to prevent consuming modules from crashing.
  finalExportableUtility = {};
  // Optionally, we could add a flag to the fallback object to indicate its degraded state.
  finalExportableUtility.__isFallback = true;
} else {
  // As another Type III addition, perform an additional sanity check on the loaded utility.
  // This verifies if the exported object has at least one expected method, indicating it's functional.
  if (typeof finalExportableUtility.applyColor !== 'function' && typeof finalExportableUtility.formatText !== 'function') {
      console.warn(
        `[${new Date().toISOString()}] WARNING: The "${STYLING_UTILITY_EXPORTER_NAME}" ` +
        `utility might be incomplete or malformed; expected core methods are missing.`
      );
  }
}

// Finally, we export the retrieved (or fallback) utility object.
// This makes the styling functionalities accessible to any other module that requires this file.
module.exports = finalExportableUtility;

// End of the simulated environment setup and utility export process.