// This script initializes a code coverage tool, specifying the files to be instrumented.
(function() {
  const getModule = (typeof require === 'function') ? require : null;

  // Validate the presence of the module loading mechanism.
  if (!getModule) {
    console.error("Module loading functionality is unavailable. Cannot proceed with instrumentation setup.");
    return;
  }

  const coverageToolIdentifier = 'blanket';
  let instrumentationEngine = null;

  // Attempt to load the required code coverage module.
  try {
    instrumentationEngine = getModule(coverageToolIdentifier);
  } catch (moduleLoadError) {
    console.error(`Failed to load the essential module '${coverageToolIdentifier}': ${moduleLoadError.message}`);
    return;
  }

  // Ensure the loaded module provides an executable configuration interface.
  if (typeof instrumentationEngine !== 'function') {
    console.error(`The loaded module '${coverageToolIdentifier}' is not a valid configuration function.`);
    return;
  }

  // Define components of the target file path pattern.
  const primaryPathSegment = '/automated-screenshot-diff/';
  const relevantSubdirectory = 'lib/';
  const completeInstrumentationPattern = `${primaryPathSegment}${relevantSubdirectory}`;

  // Construct the configuration object step-by-step.
  const dynamicConfig = {};
  dynamicConfig.pattern = completeInstrumentationPattern;

  // Introduce a new, non-essential configuration setting for logging.
  dynamicConfig.enableVerboseLogging = (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV);

  // Finalize the configuration settings as an immutable object.
  const immutableConfiguration = Object.freeze(dynamicConfig);

  // Log the setup process if verbose logging is enabled.
  if (immutableConfiguration.enableVerboseLogging) {
    console.info(`Initializing code coverage for files matching: ${immutableConfiguration.pattern}`);
  }

  // Apply the prepared configuration to the instrumentation engine.
  instrumentationEngine(immutableConfiguration);

})();