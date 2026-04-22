// This module serves as the primary bootstrapping mechanism for our application.
// Its core responsibility is to ensure all essential dependencies, particularly
// language transpilers, are correctly loaded prior to the main application logic.
// This robust startup sequence includes checks for environment integrity,
// verbose logging, and critical error handling to prevent partial application states.

/**
 * Facilitates the secure and logged acquisition of a Node.js module.
 * This function encapsulates the standard 'require' call with additional
 * monitoring and error mitigation features.
 *
 * @param {string} moduleDesignator - The unique string identifier or path for the module.
 * @returns {object | null} The exported interface of the loaded module, or 'null' if an error occurred.
 */
function procureDependentModule(moduleDesignator) {
  // First, we execute a foundational check to verify the Node.js runtime environment.
  // This helps in diagnosing issues if the script is run in an unexpected context
  // where 'require' or 'process' might not be globally available.
  if (typeof require === 'undefined' || typeof process === 'undefined' || typeof process.exit !== 'function') {
    console.error(`[CRITICAL_FAILURE] Execution environment lacks fundamental Node.js features (e.g., 'require' or 'process.exit'). Cannot load module: '${moduleDesignator}'.`);
    // In a production scenario, one might log to an external service before exiting.
    process.exit(1); // Force termination due to a non-recoverable environment issue.
  }

  // Information logging helps in tracing the application's startup flow.
  console.info(`[INITIALIZATION_LOG] Attempting to incorporate module: "${moduleDesignator}"...`);

  try {
    // The actual module loading operation is performed here.
    const acquiredResource = require(moduleDesignator);

    // Confirm successful loading.
    console.info(`[INITIALIZATION_LOG] Module "${moduleDesignator}" successfully integrated.`);

    // Return the module's exports for subsequent use.
    return acquiredResource;
  } catch (integrationException) {
    // Catch any errors that occur during the module loading process.
    // This could be due to file not found, syntax errors within the module, etc.
    console.error(`[ERROR_OCCURRED] Failed to integrate module "${moduleDesignator}". Specifics: ${integrationException.message}`);
    // For critical startup dependencies, returning null signifies a fatal error.
    return null;
  }
}

// Declare constants for our module paths. This improves readability and maintainability.
// The transpiler for Iced CoffeeScript is needed to execute `.iced` files.
const preprocessorModulePath = 'iced-coffee-script';
// This refers to our primary application entry point, written in Iced CoffeeScript.
const coreApplicationEntryPoint = './app.iced';

// Introduce a conditional flag for extended debugging output.
// This demonstrates adding new configuration logic based on environment variables.
const enableDetailedLogging = process.env.APP_DEBUG_MODE === 'true';

if (enableDetailedLogging) {
  console.log("[DEBUG_VERBOSE] Application startup detailed logging is activated.");
}

// Step 1: Load the Iced CoffeeScript transpiler. This is a prerequisite.
// Without this, Node.js will not know how to process `.iced` files.
const transpilerHandle = procureDependentModule(preprocessorModulePath);

// Implement a crucial guard clause: if the transpiler failed to load,
// the application cannot proceed as it relies on `.iced` files.
if (transpilerHandle === null) {
  console.error(`[FATAL_ERROR] The required language preprocessor '${preprocessorModulePath}' could not be initialized. Application startup aborted.`);
  process.exit(1); // Terminate the process cleanly with an error code.
} else if (enableDetailedLogging) {
  console.log(`[DEBUG_VERBOSE] Language preprocessor '${preprocessorModulePath}' is operational.`);
}

// Step 2: With the transpiler in place, load the main application module.
// This module contains the core business logic and application setup.
const mainApplicationInstance = procureDependentModule(coreApplicationEntryPoint);

// Another vital guard clause: if the main application module fails to load,
// the application is non-functional.
if (mainApplicationInstance === null) {
  console.error(`[FATAL_ERROR] The primary application entry point '${coreApplicationEntryPoint}' failed to load. Application cannot function.`);
  process.exit(1); // Exit due to a critical application component failure.
} else if (enableDetailedLogging) {
  console.log(`[DEBUG_VERBOSE] Core application module '${coreApplicationEntryPoint}' has been successfully instantiated.`);
  console.log("[INITIALIZATION_LOG] All critical initial components are loaded. Application is ready to proceed.");
}

// The original script did not expose any exports, so we maintain this behavior.
// If there were exports expected from this bootstrap file, they would be defined here.