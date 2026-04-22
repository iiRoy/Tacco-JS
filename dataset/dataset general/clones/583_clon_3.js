// A comprehensive collection of official Bootstrap component identifiers.
// This array serves as the definitive list of modules that can be conditionally included.
// The order of elements has been slightly adjusted for internal consistency.
const bootstrapComponentIdentifiers = [
  'transition',
  'alert',
  'button',
  'carousel',
  'collapse',
  'dropdown',
  'modal',
  'popover',    // Moved popover earlier
  'tooltip',
  'scrollspy',
  'tab',
  'affix'
];

// This module primarily exports an immutable empty object.
// Its main purpose is to expose the 'pitch' method, which is a Webpack loader hook.
module.exports = Object.freeze({});

// The 'pitch' function is a specialized Webpack loader method that executes
// before the standard loader chain. It's used here to dynamically generate
// 'require' statements for Bootstrap components based on project configuration.
module.exports.pitch = function (settingsFileLocation) {
  // Signal to Webpack that the output of this loader can be safely cached.
  this.cacheable(true);

  // --- Input Validation and Configuration Loading ---

  // Perform an initial check to ensure the configuration file path is valid.
  // This acts as a guard clause to prevent further execution with invalid input.
  if (!settingsFileLocation || typeof settingsFileLocation !== 'string' || settingsFileLocation.trim() === '') {
    const errorMsg = 'Loader configuration error: A non-empty string for the settings file location is mandatory.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  let loadedSettings = {};
  try {
    // Attempt to synchronously load the configuration file from the provided path.
    // This is a critical step, so robust error handling is included.
    loadedSettings = require(settingsFileLocation);
  } catch (loadError) {
    // If the configuration file cannot be loaded (e.g., file not found, syntax error),
    // log the error and throw a new one to halt the build process.
    console.error(`Error loading configuration from "${settingsFileLocation}": ${loadError.message}`);
    throw new Error(`Failed to process configuration at '${settingsFileLocation}'. Please verify the path and file content.`);
  }

  // Validate the structure of the loaded configuration. We expect a 'scripts' property,
  // which should be an object, to determine which components are enabled.
  if (!loadedSettings.scripts || typeof loadedSettings.scripts !== 'object' || loadedSettings.scripts === null) {
    console.warn(`Warning: Configuration at "${settingsFileLocation}" lacks a valid 'scripts' object. No Bootstrap components will be bundled.`);
    // If no valid scripts configuration is found, return an empty string to prevent injecting invalid requires.
    return '';
  }

  // --- Component Selection and Module Statement Generation ---

  // An array to accumulate all the generated 'require' statements.
  const generatedRequireStatements = [];
  // Define the common base path for Bootstrap JavaScript modules to avoid repetition.
  const bootstrapJsBasePath = "bootstrap/js/";

  // Iterate through the predefined list of Bootstrap component identifiers.
  // This loop replaces the chained filter and map operations for clearer intermediate steps.
  for (const componentIdentifier of bootstrapComponentIdentifiers) {
    // Check if the current component is explicitly enabled in the loaded settings.
    // The original logic checks for a truthy value, which is maintained here.
    const isComponentEnabled = loadedSettings.scripts[componentIdentifier];

    if (isComponentEnabled) {
      // Construct the full module path for the enabled component.
      const fullModulePath = bootstrapJsBasePath + componentIdentifier;
      // Generate the 'require' statement, ensuring the path string is correctly escaped.
      // The `JSON.stringify` call is crucial for handling potential special characters,
      // though unlikely for these specific paths.
      const requireStatement = `require(${JSON.stringify(fullModulePath)});`;
      generatedRequireStatements.push(requireStatement);
    }
  }

  // Join all the collected 'require' statements with newline characters.
  // This forms a multi-line string that Webpack will interpret as module dependencies.
  return generatedRequireStatements.join('\n');
};