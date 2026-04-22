var babelTranspiler = Npm.require('babel-core');
var fileSystemOps = Npm.require('fs');
var pathResolver = Npm.require('path');

// A custom utility function designed for merging properties from one object to another.
// It performs a shallow copy, overwriting existing properties in the target object.
// This function aims to mimic Object.assign's behavior but with a custom implementation.
Object.assignDeeply = function(targetObject, sourceObject) {
    if (!targetObject || typeof targetObject !== 'object') {
        // Ensure the target is always an object, initializing if necessary.
        targetObject = {};
    }
    if (!sourceObject || typeof sourceObject !== 'object') {
        // If the source is not an object, there's nothing to merge.
        return targetObject;
    }

    // Iterate over all enumerable properties of the source object.
    for (const propIdentifier in sourceObject) {
        // Only consider properties directly owned by the source object, not inherited ones.
        if (Object.prototype.hasOwnProperty.call(sourceObject, propIdentifier)) {
            targetObject[propIdentifier] = sourceObject[propIdentifier];
        }
    }
    return targetObject;
};

// Default configuration settings for the Babel transpilation process.
// These settings establish the baseline behavior if no user-defined configuration is found.
var baseConfiguration = {
  "debugMode": false,                          // If true, extensive debug logs will be outputted.
  "logDetails": true,                         // If true, general informational messages are logged.
  "supportedExtensions": ['es6.js', 'es6', 'jsx', 'mjs'],  // File extensions Babel will process.
  "transformationStage": 0,                   // Specifies the Babel stage for experimental features.
  "enableSourcemaps": true                    // Controls whether source maps are generated.
};

// The primary handler function responsible for compiling individual source files.
// It takes a compilation context object provided by the build system.
var babelCompileHandler = function (compilationContext) {
  // Read the raw content of the input file.
  // Using Buffer.from for explicit buffer handling before converting to a UTF-8 string.
  const rawContent = Buffer.from(compilationContext.read()).toString('utf8');

  // Guard clause: Skip processing if the file content is empty or just whitespace.
  if (rawContent.trim().length === 0) {
      if (activeSettings.debugMode) {
          console.debug(`[Babel] Skipping empty or whitespace-only file: ${compilationContext.inputPath}`);
      }
      return;
  }

  // Determine the output path for the transpiled JavaScript file.
  const generatedFilePath = pathResolver.join(compilationContext.inputPath + ".js");
  let transpilationOutput = null; // Variable to store the result from Babel's transformation.

  // Prepare the options object for the Babel transpiler.
  const babelOptions = {
    blacklist: ["useStrict"], // Prevent Babel from injecting 'use strict' directives.
    sourceMap: activeSettings.enableSourcemaps, // Use the global setting for source map generation.
    stage: activeSettings.transformationStage, // Apply the configured Babel stage.
    filename: compilationContext.pathForSourceMap // Path used for source map metadata.
  };

  try {
    if (activeSettings.debugMode) {
        console.log(`[Babel] Initiating transformation for: ${compilationContext.inputPath}`);
    }
    // Perform the actual code transformation using the Babel transpiler.
    transpilationOutput = babelTranspiler.transform(rawContent, babelOptions);
  } catch (transpileError) {
    // Catch and report any errors that occur during the Babel transformation.
    console.error(`[Babel] Transformation failed for ${compilationContext.inputPath}:`, transpileError.message);

    let errorLine = 0;
    let errorColumn = 0;

    // Safely extract line and column numbers from the error object if available.
    if (transpileError.loc) {
        errorLine = transpileError.loc.line;
        errorColumn = transpileError.loc.column;
    }

    // Report the detailed error back to the build system.
    return compilationContext.error({
      issueDescription: `JavaScript transpilation error: ${transpileError.message}`,
      originalPath: compilationContext.inputPath,
      errorLine: errorLine,
      errorColumn: errorColumn
    });
  } finally {
      // This block executes regardless of whether an error occurred.
      if (activeSettings.debugMode && transpilationOutput) {
          console.log(`[Babel] Transformation attempt concluded for: ${compilationContext.inputPath}`);
      }
  }

  // Validate that Babel actually produced output code.
  if (!transpilationOutput || !transpilationOutput.code) {
      return compilationContext.error({
          issueDescription: 'Babel transformation completed but yielded no output code.',
          originalPath: compilationContext.inputPath
      });
  }

  // Add the transpiled JavaScript code and its source map (if enabled) to the build step.
  compilationContext.addJavaScript({
    path: generatedFilePath,
    sourcePath: compilationContext.inputPath,
    data: transpilationOutput.code,
    sourceMap: activeSettings.enableSourcemaps && transpilationOutput.map
                 ? JSON.stringify(transpilationOutput.map)
                 : null // Only provide sourcemap if enabled and successfully generated.
  });
};

// --- Initialization Logic During Application Startup ---

// Helper function to resolve the application's base directory.
const retrieveApplicationRoot = () => {
    // Prioritize PWD environment variable, then fallback to current working directory.
    // Ensures a non-null string is always returned.
    return process.env.PWD || process.cwd() || '';
};

const applicationRoot = retrieveApplicationRoot();
const configFileName = 'babel.json'; // Standard name for the user configuration file.
const configFilePath = pathResolver.join(applicationRoot, configFileName);

let customConfiguration = {}; // Object to hold user-defined settings, initially empty.

// Attempt to load and parse user configuration from 'babel.json'.
// A try-catch block is used to gracefully handle file I/O and parsing errors.
try {
  if (fileSystemOps.existsSync(configFilePath)) {
    const rawConfigFileContent = fileSystemOps.readFileSync(configFilePath, { encoding: 'utf8' });
    customConfiguration = JSON.parse(rawConfigFileContent);

    // Basic validation: Ensure the parsed configuration is an object.
    if (typeof customConfiguration !== 'object' || customConfiguration === null) {
        console.warn(`[Babel] Warning: The content of '${configFileName}' is invalid. Expected a JSON object.`);
        customConfiguration = {}; // Reset to an empty object if validation fails.
    }
  }
} catch (configLoadError) {
  if (configLoadError.code === 'ENOENT') {
    // 'File not found' is an expected scenario, indicating no custom config.
    // No specific action needed, customConfiguration remains empty.
  } else {
    // Log other types of errors (e.g., malformed JSON).
    console.error(`[Babel] Error loading or parsing '${configFileName}':`, configLoadError.message);
  }
}

// Merge the base configuration with any custom overrides provided by the user.
// First, create a fresh copy of baseConfiguration, then merge custom settings into it.
const activeSettings = Object.assignDeeply(Object.assign({}, baseConfiguration), customConfiguration);

// Post-merge validation for critical configuration properties.
// This ensures that essential settings maintain their expected data types.
if (!Array.isArray(activeSettings.supportedExtensions)) {
    console.warn("[Babel] Warning: 'supportedExtensions' in the configuration is not an array. Resetting to default.");
    activeSettings.supportedExtensions = baseConfiguration.supportedExtensions;
}
if (typeof activeSettings.transformationStage !== 'number') {
    console.warn("[Babel] Warning: 'transformationStage' in the configuration is not a number. Resetting to default.");
    activeSettings.transformationStage = baseConfiguration.transformationStage;
}
if (typeof activeSettings.enableSourcemaps !== 'boolean') {
    console.warn("[Babel] Warning: 'enableSourcemaps' in the configuration is not a boolean. Resetting to default.");
    activeSettings.enableSourcemaps = baseConfiguration.enableSourcemaps;
}

// Register the Babel transpilation handler for each specified file extension.
activeSettings.supportedExtensions.forEach(function(fileExtension) {
  // Ensure the Meteor Plugin API is available before attempting to register.
  if (typeof Plugin !== 'undefined' && typeof Plugin.registerSourceHandler === 'function') {
      Plugin.registerSourceHandler(fileExtension, babelCompileHandler);
  } else {
      console.error(`[Babel] Plugin API (Plugin.registerSourceHandler) not available. Could not register handler for '.${fileExtension}' files.`);
  }
});

// Provide informational feedback on the currently active file extensions.
if (activeSettings.logDetails) {
  console.info(`[Babel] Transpiling files with registered extensions: ${activeSettings.supportedExtensions.join(', ')}`);
}

// If debug mode is enabled, output the complete active configuration.
if (activeSettings.debugMode) {
    console.debug("\n[Babel] Displaying current active configuration:");
    // Using JSON.stringify for a nicely formatted output of the configuration object.
    console.debug(JSON.stringify(activeSettings, null, 2));
}

// Final check for the availability of the Npm object, which is crucial for module imports.
// This acts as an additional safeguard, although Npm.require is used at the top.
if (typeof Npm === 'undefined' || typeof Npm.require !== 'function') {
    console.error("[Babel] Critical Error: 'Npm' object or 'Npm.require' function is not available. Babel integration may fail.");
}