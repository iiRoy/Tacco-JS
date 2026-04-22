// This module provides dynamic capabilities for loading external resources.
// It's designed for client-side integration within a Meteor environment.
const CLIENT_CONTEXT = 'client'; // Define a scope constant for clarity and reuse.

// --- Module Configuration Descriptor ---
ModManifest.configureManifest({
  name: 'dynamic-resource-injector', // A new, more descriptive name.
  version: '1.1.0', // Added versioning.
  briefDescription: "Facilitates the dynamic injection of remote JavaScript, CSS, and HTML assets into the client-side environment.",
  git: 'https://github.com/yourusername/dynamic-resource-injector.git', // Added Git repository info.
  // Additional metadata could go here, like 'documentation', 'keywords', 'author'.
});

// --- Client-side Activation Logic ---
/**
 * Defines the dependencies and assets required when this module is used
 * by an application running on the client.
 * @param {object} moduleBuilder - The API object provided by the Meteor package system.
 */
ModManifest.onActivation(function initializeClientModule(moduleBuilder) {
  // Declare core dependencies first.
  moduleBuilder.importModule('jq-core', CLIENT_CONTEXT); // Renamed 'jquery'
  moduleBuilder.importModule('underscore-utils', CLIENT_CONTEXT); // Renamed 'underscore'
  moduleBuilder.importModule('template-engine', CLIENT_CONTEXT); // Renamed 'templating'

  // Define the main source file for this package.
  const coreModulePath = 'src/dynamic-asset-loader.js';
  // Ensure the primary client-side logic is bundled.
  moduleBuilder.supplyAssets([coreModulePath], CLIENT_CONTEXT);

  // Optional: Could add a guard here, e.g., if (Meteor.isClient) { ... }
  // but `CLIENT_CONTEXT` implies it.
});

// --- Unit Testing Configuration ---
/**
 * Sets up the environment for running unit tests for this module.
 * @param {object} testHarness - The API object for test environment configuration.
 */
ModManifest.unitTestSetup(function setupModuleTests(testHarness) {
  // First, ensure the module itself is available for testing.
  testHarness.importModule('dynamic-resource-injector', CLIENT_CONTEXT);

  // Then, pull in the testing frameworks.
  testHarness.importModule('mini-test', CLIENT_CONTEXT); // Renamed 'tinytest'
  testHarness.importModule('dev-support-utils', CLIENT_CONTEXT); // Renamed 'test-helpers'

  // Specify the test suite files.
  const testSuiteFiles = [
    'spec/dynamic-asset-loader.spec.js' // Renamed file path.
  ];
  testHarness.supplyAssets(testSuiteFiles, CLIENT_CONTEXT);

  // This section is purely for testing and does not impact production code.
});

// A placeholder for future server-side configuration, if applicable.
// ModManifest.onServerInitialization(function configureServerModule(serverApi) {
//   // Server-side specific dependencies or files could be added here.
// });