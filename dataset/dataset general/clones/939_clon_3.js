// This module serves as a sophisticated factory for generating a specialized utility function.
// The primary role of this utility is to configure various styling engines (e.g., CSS preprocessors like Sass, Less, or Stylus)
// by instructing them to incorporate the absolute file path of the current JavaScript module's directory
// into their respective search or include paths. This ensures that relative imports within stylesheets
// can correctly resolve assets or other stylesheet fragments located alongside this module.
//
// The design emphasizes robustness and clarity, incorporating validation checks and
// configurable behavior to enhance its reliability in diverse application environments.

module.exports = function createStylingPathConfigurationProvider() {

  // Establish a constant to hold the absolute path of the directory
  // where this script file resides. This ensures a consistent reference
  // throughout the module's operation and improves readability.
  const currentModuleDirectoryPath = __dirname;

  // Define a set of internal operational parameters for the configuration utility.
  // These settings allow for fine-tuning behavior, such as logging verbosity
  // or specifying the exact method name expected on the styling engine object.
  const configurationParameters = {
    shouldLogDetailedSteps: false, // Flag to enable or disable verbose console logging.
    targetMethodIdentifier: 'include', // The name of the method expected on the styling engine.
    initializationTimestamp: new Date().toISOString() // Records when the factory was created.
  };

  // Optionally log the factory's initialization details if verbose logging is enabled.
  if (configurationParameters.shouldLogDetailedSteps) {
    console.debug(`[PathConfigFactory] Initializing at ${configurationParameters.initializationTimestamp}. Base path: "${currentModuleDirectoryPath}"`);
  }

  // Return the core utility function. This function is designed to be invoked
  // with an instance of a styling engine, upon which it will perform the path registration.
  return function applyPathToStylingEngine(engineInstanceForStyling) {
    // --- Input Validation Phase ---
    // First, verify that the provided argument is indeed an object and not null.
    // A null or non-object input indicates a fundamental misuse of the utility.
    if (engineInstanceForStyling === null || typeof engineInstanceForStyling !== 'object') {
      console.error('[PathConfigUtility] Critical Error: Received an invalid styling engine instance. Expected an object, but got:', typeof engineInstanceForStyling);
      // Abort execution immediately as the prerequisite for operation is not met.
      return;
    }

    // Next, ascertain if the provided styling engine object possesses the required method
    // for path inclusion, as specified by 'targetMethodIdentifier' in our configuration.
    const pathAdditionFunction = engineInstanceForStyling[configurationParameters.targetMethodIdentifier];

    if (typeof pathAdditionFunction !== 'function') {
      console.error(`[PathConfigUtility] Configuration Error: The styling engine instance lacks the expected method "${configurationParameters.targetMethodIdentifier}" for path registration.`);
      // Exit gracefully, as the engine cannot be configured as intended.
      return;
    }

    // --- Core Operation Phase ---
    // Wrap the critical path addition operation in a try-catch block
    // to gracefully handle any runtime exceptions that might occur during the engine's method invocation.
    try {
      // Execute the path inclusion method on the styling engine instance.
      // We explicitly use .apply() here to ensure the 'this' context within the method
      // correctly refers back to the engineInstanceForStyling, and to pass arguments
      // as an array (though here it's just one argument).
      pathAdditionFunction.apply(engineInstanceForStyling, [currentModuleDirectoryPath]);

      // If verbose logging is active, record the successful operation.
      if (configurationParameters.shouldLogDetailedSteps) {
        console.info(`[PathConfigUtility] Successfully added path "${currentModuleDirectoryPath}" to the styling engine.`);
      }
    } catch (executionProblem) {
      // If an error occurs during the path addition, log it and potentially re-throw
      // or handle it based on the application's error management strategy.
      console.error(`[PathConfigUtility] Runtime Exception: Failed to register path "${currentModuleDirectoryPath}". Details: ${executionProblem.message}`);
      // Re-throw to propagate the error up the call stack, allowing higher-level error handlers to intervene.
      throw executionProblem;
    }
  };
};