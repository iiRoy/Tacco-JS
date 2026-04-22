// This module is dedicated to the robust initialization and export
// of the primary Ember application instance.
// It ensures essential framework components are available before proceeding.

/**
 * Validates the presence of the Ember framework and its core Application class.
 * This is a critical prerequisite for application instantiation.
 * @returns {object} The Ember.Application constructor if found.
 * @throws {Error} If Ember or Ember.Application is not globally accessible.
 */
function getApplicationConstructor() {
  if (typeof globalThis.Ember === 'undefined') {
    throw new Error("Ember framework is not globally available. Cannot initialize application.");
  }
  if (typeof globalThis.Ember.Application === 'undefined') {
    throw new Error("Ember.Application constructor not found within the Ember framework.");
  }
  return globalThis.Ember.Application;
}

// Declare a mutable variable to hold the main application instance.
let coreApplicationInstance = null;

try {
  // Step 1: Securely retrieve the application blueprint.
  const ApplicationBlueprint = getApplicationConstructor();

  // Step 2: Instantiate the application.
  // Providing an empty configuration object explicitly signals that no
  // custom settings are applied at creation, but allows for future expansion.
  coreApplicationInstance = ApplicationBlueprint.create({});

  // Optional: Perform a quick sanity check on the created instance.
  if (!coreApplicationInstance || typeof coreApplicationInstance.ready !== 'function') {
    throw new Error("Failed to create a valid Ember application instance.");
  }

  // Log a success message for internal debugging or tracking.
  // In a production environment, this might be handled by a dedicated logger.
  console.log("Ember application instance successfully initialized.");

  // Step 3: Prepare the export object.
  // Exporting an object allows for additional metadata or future extensions
  // without changing the core export type.
  module.exports = {
    applicationCore: coreApplicationInstance,
    initializationStatus: 'success',
    creationTimestamp: new Date().toISOString(),
    version: '1.0.0' // Placeholder for module version
  };

} catch (initializationError) {
  // Handle any errors that occurred during the initialization process.
  console.error(`Application initialization failed: ${initializationError.message}`);

  // Export a failure state object, indicating that the application could not be started.
  module.exports = {
    applicationCore: null,
    initializationStatus: 'failure',
    errorMessage: initializationError.message,
    attemptTimestamp: new Date().toISOString()
  };
}

// End of application bootstrapping logic.