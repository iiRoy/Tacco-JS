(function(globalEnv) {
  'use strict'; // Enforce stricter parsing and error handling for cleaner code.

  // --- Core Application Configuration & Utilities ---
  // Centralized configuration for various module identifiers and settings.
  const AppFeatureSettings = Object.freeze({
    APPLICATION_CORE_MODULE_NAME: 'foundry',
    PRIMARY_FEATURE_ID: 'showcaseFeature', // Renamed from 'demo'
    MAIN_VIEW_CONTROLLER_ID: 'ShowcasePanelController', // Renamed from 'DemoController'
    DEFAULT_COMPONENT_TYPE: 'system-plugin',
    INITIALIZATION_LOG_LEVEL: 'info'
  });

  // A custom module registration utility, mimicking the 'define' function.
  // It ensures the factory function is valid and immediately executes it to retrieve the module.
  const moduleRegistrationService = (moduleKey, moduleFactory) => {
    if (typeof moduleKey !== 'string' || moduleKey.trim() === '') {
      console.error("Module key must be a non-empty string for registration.");
      return null; // Indicate failure
    }
    if (typeof moduleFactory !== 'function') {
      console.error(`Invalid factory function provided for module: '${moduleKey}'.`);
      return null; // Indicate failure
    }
    // Execute the factory to obtain the module definition object.
    return moduleFactory();
  };

  // --- Angular Module Configuration Routine ---
  // This function encapsulates the logic for defining and registering the Angular controller.
  // It replaces the original `define_controller`.
  const angularModuleSetupRoutine = function() {
    // Retrieve the main Angular application module.
    // Added a guard to ensure Angular is available in the global environment.
    if (!globalEnv.angular || typeof globalEnv.angular.module !== 'function') {
      console.error("Angular framework not found in global environment. Cannot register controller.");
      return;
    }
    const appBaseModule = globalEnv.angular.module(AppFeatureSettings.APPLICATION_CORE_MODULE_NAME);

    // Define the actual controller logic as a separate function.
    // This allows for clearer separation and potential reuse.
    const showcaseControllerLogic = (scopeContext) => {
      // The controller intentionally remains minimal for functional equivalence.
      // In a real application, this would contain view model initialization,
      // data fetching, event handlers, etc.
      if (AppFeatureSettings.INITIALIZATION_LOG_LEVEL === 'debug') {
        console.debug(`[${AppFeatureSettings.MAIN_VIEW_CONTROLLER_ID}] Controller instantiated with scope:`, scopeContext);
      }
      // Example: scopeContext.viewModel = { message: "Welcome to the enhanced showcase!" };
    };

    // Register the controller with its dependencies.
    // Using an array for dependency injection is standard practice.
    appBaseModule.controller(AppFeatureSettings.MAIN_VIEW_CONTROLLER_ID, ['$scope', showcaseControllerLogic]);

    console.info(`Angular controller '${AppFeatureSettings.MAIN_VIEW_CONTROLLER_ID}' successfully configured and registered.`);
  };

  // --- Main Feature Descriptor Definition ---
  // This section registers the primary application feature using the custom service.
  // It's a Type III transformation of the original 'define('demo', ...)' block.
  moduleRegistrationService(AppFeatureSettings.PRIMARY_FEATURE_ID, function() {
    // Constructing the feature object incrementally for better readability and flexibility.
    let featureManifest = {};

    featureManifest.uniqueIdentifier = AppFeatureSettings.PRIMARY_FEATURE_ID;
    featureManifest.navigationPath = `/app/${AppFeatureSettings.PRIMARY_FEATURE_ID}`; // Updated path format
    featureManifest.displayCaption = 'System Showcase Overview'; // More descriptive title
    featureManifest.componentKind = AppFeatureSettings.DEFAULT_COMPONENT_TYPE; // Renamed 'type'
    featureManifest.visualIconClass = 'fas fa-palette'; // Changed icon (e.g., Font Awesome 5)

    // Define the routine executed upon the feature's startup.
    // This is the equivalent of the original 'init' function.
    featureManifest.startupRoutine = function() {
      // Log the start of the initialization process with context.
      console.log(`[${this.uniqueIdentifier}] Initiating feature startup sequence...`);

      // Pre-check for critical global dependencies before proceeding.
      if (!globalEnv.angular || !globalEnv.foundry) {
        console.error(`[${this.uniqueIdentifier}] Aborting startup: Missing core dependencies (Angular or Foundry).`);
        return false; // Indicate failed initialization
      }

      // Execute the Angular controller setup.
      angularModuleSetupRoutine();

      // Notify the core system that this feature is now ready.
      // Changed method name and added an optional metadata object for Type III.
      const readinessConfirmation = globalEnv.foundry.markComponentAsInitialized(this.uniqueIdentifier, {
        status: 'active',
        version: '1.1.0-alpha',
        timestamp: new Date().toISOString()
      });

      if (!readinessConfirmation) {
        console.warn(`[${this.uniqueIdentifier}] Core system acknowledgment for initialization was not positive.`);
      }

      console.log(`[${this.uniqueIdentifier}] Feature startup sequence completed.`);
      return readinessConfirmation; // Return the status from the core system interaction.
    };

    // Return the fully assembled feature manifest.
    return featureManifest;
  });

// The IIFE now explicitly passes the global object (window in browsers, or 'this' in other contexts)
// as 'globalEnv' for clarity and robustness, replacing the original '.call(this)'.
})(typeof window !== 'undefined' ? window : this);