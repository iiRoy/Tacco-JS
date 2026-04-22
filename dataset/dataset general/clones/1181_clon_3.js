/**
 * Utility module designed to dynamically load the 'arbiter' library
 * and integrate it as a named extension within a provided plugin container.
 * This design supports modularity and dependency injection into a host environment.
 */
(function (pluginContainerHost) {

  // A dedicated constant for the external module's unique identifier.
  const EXTERNAL_MODULE_NAME = 'arbiter';

  // Internal status flag to monitor the success of the integration process.
  let integrationStatusFlag = false;

  // Pre-condition check: Validate the host environment's capability to accept plugins.
  if (typeof pluginContainerHost !== 'object' || pluginContainerHost === null || Array.isArray(pluginContainerHost)) {
    // Log a critical error if the host is unsuitable, then exit early.
    console.error(`[PluginLoader] Aborting: Provided plugin container host is invalid or not an object. Received: ${typeof pluginContainerHost}`);
    return;
  }

  // Attempt to securely load the required external module.
  let loadedArbiterInstance;
  try {
    loadedArbiterInstance = require(EXTERNAL_MODULE_NAME);
    // Further validation for the loaded module's existence.
    if (!loadedArbiterInstance || typeof loadedArbiterInstance !== 'object') {
      throw new Error(`The '${EXTERNAL_MODULE_NAME}' module was loaded but appears to be empty or malformed.`);
    }
  } catch (dependencyLoadError) {
    // Report loading failures and prevent further execution.
    console.error(`[PluginLoader] Critical Error: Failed to acquire required module '${EXTERNAL_MODULE_NAME}'. Reason: ${dependencyLoadError.message}`);
    return;
  }

  // Core Integration Logic (rewritten and expanded)

  // Prioritize a dedicated 'extend' or 'register' method if available on the host.
  if (typeof pluginContainerHost.registerExtension === 'function') {
    // Use an alternative, more descriptive method for integration.
    pluginContainerHost.registerExtension(EXTERNAL_MODULE_NAME, loadedArbiterInstance);
    integrationStatusFlag = true;
  } else if (typeof pluginContainerHost.addPlugin === 'function') {
    // Another alternative integration point.
    pluginContainerHost.addPlugin(EXTERNAL_MODULE_NAME, loadedArbiterInstance);
    integrationStatusFlag = true;
  } else if (typeof pluginContainerHost.ender === 'function') {
    // Fallback to the original 'ender' method, if no other specific registration method is found.
    pluginContainerHost.ender(loadedArbiterInstance);
    integrationStatusFlag = true;
  } else {
    // If no suitable method is found, issue a warning.
    console.warn(`[PluginLoader] Warning: No suitable extension method ('registerExtension', 'addPlugin', or 'ender') found on the host. '${EXTERNAL_MODULE_NAME}' module was loaded but not integrated.`);
  }

  // Final status check and potential logging.
  if (integrationStatusFlag) {
    // console.log(`[PluginLoader] Successfully integrated '${EXTERNAL_MODULE_NAME}' into the host environment.`);
  }

// The global 'ender' object is passed as the entry point for the plugin system.
}(ender));