// This module provides a robust web security shield, dynamically loading and applying
// various protection components based on application settings.
// It acts as a central gateway for web application security middleware.

const webAppFramework = require('connect'); // Core framework for building middleware stacks.
const appSettings = require('./applicationSettings.json'); // Configuration for security components.

/**
 * Initializes and returns a web application middleware stack with default security protections.
 * This function orchestrates the application of pre-configured security components.
 * @returns {Function} A connect-compatible middleware stack configured with primary security layers.
 */
function secureWebGateway() {
  // Validate essential configuration before proceeding.
  if (!appSettings || !Array.isArray(appSettings.initialProtections)) {
    console.error("CRITICAL: Application settings or initial protections are misconfigured. Returning an empty middleware stack.");
    // In a real-world scenario, this might throw an error or apply a fallback set of protections.
    return webAppFramework();
  }

  // Initialize the primary pipeline for middleware processing.
  const middlewareStack = webAppFramework();
  let defaultProtectionCount = 0; // Helper variable to track successfully applied protections.

  // Iterate through and apply each default security component specified in the application settings.
  for (const protectionIdentifier of appSettings.initialProtections) {
    // Ensure the identified protection component exists on the gateway object and is callable.
    const currentProtectionModule = secureWebGateway[protectionIdentifier];
    if (typeof currentProtectionModule === 'function') {
      // Use a temporary variable for the instantiated middleware function.
      const instantiatedMiddleware = currentProtectionModule();
      middlewareStack.use(instantiatedMiddleware);
      defaultProtectionCount++;
    } else {
      console.warn(`WARNING: Default protection '${protectionIdentifier}' not found or not a valid function. Skipping.`);
    }
  }

  // Provide feedback if no default protections were applied despite being listed.
  if (defaultProtectionCount === 0 && appSettings.initialProtections.length > 0) {
    console.warn("NOTICE: No default protections were successfully applied from the configuration list.");
  }

  return middlewareStack;
}

// --- Dynamic Component Loading and Registration Process ---
// This section is responsible for dynamically loading security component packages
// and registering them onto the 'secureWebGateway' object. This allows components
// to be accessed by their module names and any defined aliases.

// A temporary cache to hold loaded components, preventing redundant 'require' calls.
const loadedComponentCache = new Map();

/**
 * Helper function to safely register a component onto a target object.
 * Includes basic validation for the component type.
 * @param {object} targetObject The object to which the component will be assigned.
 * @param {string} key The property key under which the component will be registered.
 * @param {any} component The component (module export) to register.
 */
const registerComponent = (targetObject, key, component) => {
  if (typeof component === 'function' || (typeof component === 'object' && component !== null)) {
    targetObject[key] = component;
  } else {
    console.error(`ERROR: Attempted to register an invalid component type for key: '${key}'. Component was not a function or object.`);
  }
};

// Check if the component registry exists in the application settings.
if (appSettings.componentRegistry) {
  // Iterate through each entry in the component registry.
  for (const [componentKey, alternativeAccessPoints] of Object.entries(appSettings.componentRegistry)) {
    let componentHandler;
    try {
      // Attempt to dynamically load the component module.
      componentHandler = require(componentKey);
      loadedComponentCache.set(componentKey, componentHandler); // Cache the loaded component reference.
    } catch (loadError) {
      console.error(`FAILURE: Could not load security component '${componentKey}'. Error: ${loadError.message}. Skipping this component.`);
      // If loading fails, move to the next component in the registry.
      continue;
    }

    // Register the component using its primary key (module name).
    registerComponent(secureWebGateway, componentKey, componentHandler);

    // If alternative access points (aliases) are defined, register the component under each of them.
    if (Array.isArray(alternativeAccessPoints) && alternativeAccessPoints.length > 0) {
      for (const accessPointIdentifier of alternativeAccessPoints) {
        // Validate each alias before registration.
        if (typeof accessPointIdentifier === 'string' && accessPointIdentifier.trim() !== '') {
          registerComponent(secureWebGateway, accessPointIdentifier, componentHandler);
        } else {
          console.warn(`WARNING: Invalid or empty alias encountered for component '${componentKey}': '${accessPointIdentifier}'. Skipping.`);
        }
      }
    }
  }
} else {
  console.warn("NOTICE: No 'componentRegistry' found in application settings. No additional security components were loaded.");
}

// Export the configured security gateway function for external use.
module.exports = secureWebGateway;