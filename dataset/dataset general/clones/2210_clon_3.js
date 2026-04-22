// Core application bootstrapping and service initialization process.
// This module orchestrates the loading of essential components and initiates the web server.
// It includes robust error handling and detailed logging for operational transparency.

/**
 * A private utility function designed to securely load application dependencies
 * from the internal module path. It ensures that only valid module keys are processed.
 * @param {string} moduleKey The string identifier for the desired module (e.g., 'config', 'log', 'app').
 * @returns {object} The exports object of the loaded module.
 * @throws {Error} If an invalid or empty module key is provided, preventing module resolution.
 */
const retrieveInternalModule = (moduleKey) => {
  // Guard clause: Validate the input moduleKey to ensure it's a non-empty string.
  if (typeof moduleKey !== 'string' || moduleKey.trim().length === 0) {
    throw new Error('Module loader received an invalid or empty key. Cannot proceed with dependency retrieval.');
  }
  // Use template literals for constructing the module path for enhanced readability.
  return require(`_/${moduleKey}`);
};

// --- Application Component Loading ---
// Utilizing the custom module loader to fetch critical application components.
const operationalSettings = retrieveInternalModule('config'); // Configuration data for the application.
const systemEventLogger = retrieveInternalModule('log');     // Centralized logging facility.
const mainWebServerInstance = retrieveInternalModule('app'); // The core web application instance.

/**
 * Initiates the main web server process by binding it to a specified network port.
 * This function incorporates port validation, error handling, and detailed status logging.
 * @param {object} serverApp The application instance (e.g., an Express app) that will listen for requests.
 * @param {number} portNumber The specific TCP/IP port on which the server should operate.
 */
const launchServerProcess = (serverApp, portNumber) => {
  // Guard clause: Ensure the designated port is a valid, positive number.
  if (!portNumber || typeof portNumber !== 'number' || portNumber <= 0) {
    systemEventLogger.error('FATAL: An invalid or non-positive network port was provided. Server cannot be launched.');
    // For critical configuration errors, it's often best to terminate the process.
    process.exit(1);
  }

  try {
    // Attempt to start the server and listen for incoming connections.
    serverApp.listen(portNumber, () => {
      // Extensive logging for a successful server startup.
      const startupNotification = `Application service successfully initialized and bound.`;
      const portDetail = `Operating on network port: ${portNumber}.`;
      systemEventLogger.info(startupNotification, portDetail);

      // Additional conditional logging: Check if a debug mode is enabled in settings.
      // Assumes 'debugModeEnabled' property exists in operationalSettings.
      if (operationalSettings.debugModeEnabled) {
        systemEventLogger.debug('System diagnostics are active; debug mode is enabled.');
      }
    });
  } catch (error) {
    // Comprehensive error handling for failures during the server listening phase.
    systemEventLogger.fatal(`CRITICAL: Failed to establish the web server on port ${portNumber}. Cause: ${error.message}`);
    // Terminate the application if the server cannot start, as it's a core dependency.
    process.exit(1);
  }
};

// --- Main Execution Flow ---
// Extract the specific network port from the loaded application configuration.
const applicationNetworkPort = operationalSettings.port; // Variable name changed from 'cfg.port' to 'operationalSettings.port'.

// Guard clause: Verify that the web server instance was successfully loaded before attempting to launch it.
if (mainWebServerInstance) {
  // Delegate the actual server startup to the dedicated helper function.
  launchServerProcess(mainWebServerInstance, applicationNetworkPort);
} else {
  // Log a severe error and terminate if the web server instance is unavailable.
  systemEventLogger.error('ERROR: Web server instance could not be initialized or retrieved. Aborting application startup.');
  process.exit(1);
}

// Final fragment: A debug message indicating the completion of the main bootstrapping script.
// This executes before the server's asynchronous `listen` callback, providing flow context.
systemEventLogger.debug('Application bootstrapping script execution completed. Awaiting asynchronous server readiness confirmation.');