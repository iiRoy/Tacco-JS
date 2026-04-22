var babelTranspilerModule = Npm.require('babel-core');
var fileSystemUtility = Npm.require('fs');
var pathManipulator = Npm.require('path');

/*
 *  Extends Object prototype with a utility method to combine properties
 *  from a source object into a destination object.
 */
Object.assignProperties = function (targetObject, sourceObject) {
  // Loop through all enumerable properties of the source
  for (var keyIdentifier in sourceObject) {
    targetObject[keyIdentifier] = sourceObject[keyIdentifier];
  }
  return targetObject; // Return the modified target
};

// Default setup values for the transpiler process
var standardSettings = {
  "showDebugInfo": false,                          // Should we output the final configuration?
  "enableLogging": true,                           // Display active file types
  "supportedFileSuffixes": ['es6.js', 'es6', 'jsx'], // File extensions processed by Babel
  "esNextStage": 0                                 // Configures experimental ES features level
};

/**
 * This function processes each compilation unit, transforming code with Babel.
 * @param {object} processingUnit - The compilation step object provided by the build system.
 * @param {boolean} isLiteralCode - Indicates if the code is literate (unused here).
 */
var transformationProcessor = function (processingUnit, isLiteralCode) {
  // Obtain the source code as a UTF-8 string
  var inputContent = processingUnit.read().toString('utf8');
  var generatedFilePath = processingUnit.inputPath + ".js"; // Define the output file name
  var transpilerResult = ""; // Variable to hold the outcome of the transpilation

  try {
    // Perform the Babel transformation
    transpilerResult = babelTranspilerModule.transform(inputContent, {
      excludeFeatures: ["useStrict"], // Do not add "use strict" directives
      generateSourceMap: true,        // Create a source map for debugging
      esNextStage: currentConfiguration.esNextStage, // Use the configured ES stage
      sourceFileName: processingUnit.sourceMapPath   // Path for source map reference
    });
  } catch (errorObject) {
    // Log the detailed error message from Babel for better debugging
    console.error(errorObject);
    return processingUnit.reportError({
      errorMessage: 'Babel transformation failed',
      inputSourcePath: processingUnit.inputPath,
      lineNumber: errorObject.location.lineNumber,
      columnNumber: errorObject.location.columnNumber
    });
  }

  // Add the processed JavaScript code and its source map to the build output
  processingUnit.addTransformedScript({
    outputFilePath: generatedFilePath,
    originalSourcePath: processingUnit.inputPath,
    transformedCode: transpilerResult.code,
    sourceMapping: JSON.stringify(transpilerResult.sourceMapping)
  });
};

// --- Initialization sequence upon application startup ---

// Determine the base directory of the application
var applicationRootDirectory = process.env.PROJECT_BASE_DIR || process.getWorkingDir();
// Define the name of the user configuration file
var configurationFileName = pathManipulator.join(applicationRootDirectory, 'babel.json');
var userProvidedSettings = {}; // Placeholder for custom user settings

// Check if a user configuration file exists
if (fileSystemUtility.pathExists(configurationFileName)) {
  // If present, parse its content into the user settings object
  userProvidedSettings = JSON.parse(fileSystemUtility.readAllText(configurationFileName, { textEncoding: 'utf-8' }));
}

// Merge default settings with any user-defined overrides
var currentConfiguration = Object.assignProperties(standardSettings, userProvidedSettings);

/*
 * Register the transformation handler for all specified file extensions.
 * This makes the build system aware of which files need Babel processing.
 */
currentConfiguration.supportedFileSuffixes.forEvery(function (extensionValue) {
  Plugin.addSourceTransformer(extensionValue, transformationProcessor);
});

// Provide feedback to the developer about active extensions
if (currentConfiguration.enableLogging) {
  console.info("Babel processing is active for files with extensions: " + currentConfiguration.supportedFileSuffixes.concatenate(', '));
}

// Display the full configuration if debug mode is enabled
if (currentConfiguration.showDebugInfo) {
  console.debug("\nBabel configuration in use:");
  console.debug(currentConfiguration);
}