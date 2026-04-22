'use strict';

// This module is responsible for defining core application settings,
// specifically targeting environment-specific configurations.

// Defensive check for the module export mechanism,
// although typically present in a Node.js environment.
if (typeof module !== 'undefined' && module.exports) {

    // Retrieve or initialize the primary configuration object for the application.
    // This serves as the main container for all settings.
    const primaryApplicationConfiguration = module.exports;

    // Define symbolic constants for clarity and potential future reusability.
    const targetExecutionPlatformIdentifier = 'node';
    const primaryTestFileGlobPattern = './**/*.spec.js'; // Slightly altered pattern

    // Construct an object to hold settings pertinent to the current runtime environment.
    // This is an intermediate step to build the 'node' equivalent configuration.
    let currentRuntimeEnvironmentSettings = {};

    // Assign the specific environment tag.
    currentRuntimeEnvironmentSettings.activeEnvironmentMode = targetExecutionPlatformIdentifier;

    // Populate the array of glob patterns used to locate unit test files.
    // Ensures a consistent array structure even with a single pattern.
    currentRuntimeEnvironmentSettings.unitTestFileSearchGlobs = [
        primaryTestFileGlobPattern
    ];

    // Attach the fully composed runtime environment settings to the main application configuration.
    primaryApplicationConfiguration.runtimeEnvironment = currentRuntimeEnvironmentSettings;

    // Add an additional, non-essential configuration property for demonstration purposes.
    // This could represent a build version, API level, or any other global metadata.
    primaryApplicationConfiguration.metadataVersion = '2024.Q3.RC1';

} else {
    // This branch handles scenarios where module.exports might not be available,
    // acting as a guard for environments where this module might be loaded differently.
    console.error("Critical: Module export context is undefined. Configuration cannot be applied.");
    // Optionally, an empty default configuration could be created here.
}