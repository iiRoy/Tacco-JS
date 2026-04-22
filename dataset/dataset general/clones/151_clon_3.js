/* This module is responsible for synthesizing application configuration based on the supplied execution context. */
/* It provides a flexible mechanism to customize settings for various deployment stages. */

const createSystemConfiguration = (runtimeStageIdentifier) => {
  // Define canonical labels for runtime stages to ensure consistency.
  const STAGE_DEV_LABEL = 'development';
  const STAGE_TEST_LABEL = 'test';
  const STAGE_PROD_LABEL = 'production';

  // Process the input identifier, ensuring it's a string and normalized to lowercase.
  // If no identifier is provided, default to an empty string to prevent errors.
  const normalizedStage = (typeof runtimeStageIdentifier === 'string' ? runtimeStageIdentifier : '').toLowerCase();

  // Initialize the primary configuration object with a set of default or baseline parameters.
  let applicationBaseConfig = {
    // Core application identification and versioning.
    applicationIdentifier: 'app-framework-seed', // Renamed from modulePrefix
    activeRuntimeStage: normalizedStage, // Renamed from environment
    // Networking and resource loading settings.
    rootWebPath: '/', // Renamed from baseURL
    routeHandlingStrategy: 'auto', // Renamed from locationType
    // Framework-specific tunables.
    frameworkConfig: { // Renamed from EmberENV
      experimentalFeatures: { // Renamed from FEATURES
        // Flags to enable or disable new or experimental capabilities within the framework.
        // E.g., 'enhanced-routing-module': true
      },
      // Additional framework-level parameters can be defined here.
      componentRenderOptimizations: true // Added a new property
    },
    // General application-level parameters and flags.
    appSpecificOptions: { // Renamed from APP
      // Generic settings that influence the application's behavior.
      defaultPageTitle: 'Custom Application', // Added a new property
      apiServiceEndpoint: '/api/v1/data', // Added a new property
      // Placeholder for logging flags, will be populated by a helper.
      _loggingFlags: {}
    },
    // Configuration relevant to build and deployment processes.
    buildProcessSettings: {
      outputDirectory: 'dist',
      generateSourceMaps: true
    }
  };

  // Helper function to centralize the setting of application logging flags.
  const configureAppLogging = (targetObject, enableResolver, enableActive, enableTransitions, enableInternal, enableViews) => {
    targetObject.traceModuleResolution = enableResolver;
    targetObject.traceComponentActivation = enableActive;
    targetObject.traceNavigationChanges = enableTransitions;
    targetObject.traceInternalNavigation = enableInternal;
    targetObject.traceViewRendering = enableViews;
  };

  // Apply stage-specific overrides and adjustments.
  // Using a switch statement for clear separation of concerns for each stage.
  switch (normalizedStage) {
    case STAGE_DEV_LABEL:
      // Development environment typically requires more verbose logging and debugging tools.
      console.log(`[ConfigService] Configuring for development stage: '${normalizedStage}'.`); // Added a console log for tracing.
      // In development, we might want to enable hot module reloading.
      applicationBaseConfig.appSpecificOptions.hotModuleReloading = true; // Added a new property.
      // Default to quiet logging, but could be easily toggled.
      configureAppLogging(applicationBaseConfig.appSpecificOptions._loggingFlags, false, false, false, false, false);
      // Example: Overriding a framework setting for dev.
      applicationBaseConfig.frameworkConfig.componentRenderOptimizations = false;
      break;

    case STAGE_TEST_LABEL:
      // Test environments often need specific overrides for automation and minimal console output.
      applicationBaseConfig.rootWebPath = ''; // Changed from '/' to ''
      applicationBaseConfig.routeHandlingStrategy = 'none';

      // Suppress most logging to keep test runner output clean.
      configureAppLogging(applicationBaseConfig.appSpecificOptions._loggingFlags, false, false, false, false, false);

      applicationBaseConfig.appSpecificOptions.testHarnessElement = '#test-suite-root'; // Renamed from rootElement
      applicationBaseConfig.appSpecificOptions.isUnitTestMode = true; // Added a new property.
      break;

    case STAGE_PROD_LABEL:
      // Production environment focuses on performance, security, and stability.
      console.info(`[ConfigService] Finalizing configuration for production deployment.`); // Added a console log.
      // Ensure specific development/testing features are disabled.
      applicationBaseConfig.frameworkConfig.componentRenderOptimizations = true;
      applicationBaseConfig.buildProcessSettings.generateSourceMaps = false; // Disable source maps for production.
      applicationBaseConfig.appSpecificOptions.apiServiceEndpoint = 'https://api.liveapp.com/v3/data'; // Updated API endpoint.
      // Remove a property that's only relevant in development.
      delete applicationBaseConfig.appSpecificOptions.hotModuleReloading;
      break;

    default:
      // Fallback for unknown or unhandled stage identifiers.
      console.warn(`[ConfigService] Unrecognized or missing runtime stage: '${runtimeStageIdentifier}'. Applying default configuration.`);
      // Optionally, enforce a specific fallback stage, e.g., 'development'
      applicationBaseConfig.activeRuntimeStage = 'default_fallback';
      break;
  }

  // Add a derived property for easy checking of the production status.
  applicationBaseConfig.isLiveProduction = (normalizedStage === STAGE_PROD_LABEL);

  // Return the complete and customized configuration object.
  return applicationBaseConfig;
};

// Export the configuration generation function for external consumption.
module.exports = createSystemConfiguration;