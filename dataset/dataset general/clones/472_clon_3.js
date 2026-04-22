// This module serves as the primary configuration and bootstrapping point for the server-side application.
// Its purpose is to initialize critical runtime features, load essential dependencies,
// and consolidate various configuration fragments into a single, cohesive export object.
// The entire process aims to provide a robust and extensible foundation for the application.

// --- Section 1: JavaScript Runtime Environment Setup ---

// Retrieve the specialized module responsible for dynamically transforming JavaScript code at runtime.
// This enables the use of modern ECMAScript features without a prior build step.
const codeTranspilationEngine = require("node-jsx");

// Define the specific parameters for the code transpilation process.
// These settings dictate which file types are to be processed and which language features are activated.
const transpilerConfiguration = {
  "sourceFileExtension": ".js",           // Specifies that files with the '.js' extension should be processed.
  "enableModernJSFeatures": true          // Activates support for ECMAScript 2015 (ES6) and subsequent versions.
};

// Attempt to install and activate the code transpilation engine with the defined configuration.
// A guard clause ensures that the `install` method exists before attempting to call it,
// preventing potential runtime errors if the module is malformed or missing.
if (codeTranspilationEngine && typeof codeTranspilationEngine.install === 'function') {
  codeTranspilationEngine.install(transpilerConfiguration);
  // A console message provides feedback on the successful initialization of the transpiler.
  console.info('Application runtime transpiler successfully initialized for modern JavaScript syntax.');
} else {
  // A warning is logged if the transpiler cannot be properly configured, indicating a potential issue.
  console.warn('CRITICAL WARNING: Node-JSX transpiler module not found or its install method is missing. Modern JS features may not be fully supported.');
}

// --- Section 2: Fundamental Application Dependencies and Utilities ---

// Load a collection of essential polyfills. These scripts provide implementations for newer
// JavaScript features or browser APIs that might be absent in the current Node.js environment,
// ensuring broader compatibility and consistent behavior across different platforms.
const coreCompatibilityLayer = require("./polyfills.js");
// Note: The 'coreCompatibilityLayer' variable itself is not directly used after the 'require' call,
// as polyfills typically modify the global environment as a side effect.

// Import a specialized utility function designed for performing deep merges of configuration objects.
// This function is particularly useful for applying default values or combining complex settings.
const configurationComposer = require("./addons/utilities.js").deepConfigurationMerger; // Renamed the exported property.

// --- Section 3: Assembling the Main Application Configuration ---

// Fetch the primary server-side configuration object. This module typically contains
// settings and components that are central to the server's operational logic.
const primaryServerApplicationSettings = require("./Ambidex.server.js");

// Define a collection of optional, pluggable modules or extensions for the application.
// These are components that enhance functionality and can be conditionally included.
const auxiliaryModuleExtensions = {
  "enabledPlugins": { // Renamed the 'addons' key to 'enabledPlugins'.
    "TemporalDisplayUnit": require("./addons/tardis/TardisGallery.server.js"), // Renamed 'TardisGallery' to 'TemporalDisplayUnit'.
  }
};

// Retrieve a set of common initialization parameters that are shared across various parts
// of the application, potentially including both server and client-side contexts.
const sharedBaseInitializationParameters = require("./init.common.js");

// Combine the auxiliary module extensions with the shared base initialization parameters.
// The `configurationComposer` ensures that defaults from the base parameters are applied
// to the extensions, creating a robust and complete configuration segment.
const consolidatedExtensionSettings = configurationComposer(
  auxiliaryModuleExtensions,
  sharedBaseInitializationParameters
);

// Perform the final aggregation of all configuration segments.
// The object spread syntax is utilized for a clean and efficient merge,
// combining the primary server settings with the consolidated extension configurations.
const finalExportableConfiguration = {
  ...primaryServerApplicationSettings,
  ...consolidatedExtensionSettings
};

// --- Section 4: Module Export ---

// Export the comprehensive and fully assembled configuration object.
// This object represents the application's complete setup, ready to be consumed
// by other modules that depend on these integrated settings and components.
module.exports = finalExportableConfiguration;