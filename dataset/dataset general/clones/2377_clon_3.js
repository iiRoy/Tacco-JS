'use strict';

const filesystemMod = require('fs'); // Core Node.js file system utilities
const jsonCommentRemover = require('strip-json-comments'); // Utility to strip comments from JSON
const loaderAssist = require('loader-utils'); // Webpack loader utility functions
const ConfigLocator = require('rcloader'); // Tool to locate configuration files like .jscsrc
const CodeStyleEvaluator = require('jscs'); // The actual code style checker library

/**
 * Merges properties from source objects into a target object.
 * This function acts as a simple polyfill for Object.assign.
 * @param {object} targetObject - The object to which properties will be assigned.
 * @param {...object} sourceObjects - One or more source objects whose enumerable properties will be copied.
 * @returns {object} The modified target object.
 */
const assignProperties = function (targetObject) {
  // Begin iteration from the second argument (first source object)
  for (let currentArgIndex = 1; currentArgIndex < arguments.length; currentArgIndex += 1) {
    const currentSource = arguments[currentArgIndex];

    // Ensure the source object is valid before attempting to iterate its properties
    if (currentSource && typeof currentSource === 'object') {
      // Iterate over all enumerable properties of the current source object
      for (const propertyName in currentSource) {
        // Only copy own properties, not those from the prototype chain
        if (Object.prototype.hasOwnProperty.call(currentSource, propertyName)) {
          targetObject[propertyName] = currentSource[propertyName];
        }
      }
    }
  }
  return targetObject;
};

// Initialize a configuration file finder instance for '.jscsrc' files.
// The custom loader simply returns the path, as the file content will be read separately.
const configFinderInstance = new ConfigLocator('.jscsrc', null, {
  loader: (filePath) => filePath,
});

/**
 * Synchronously retrieves the configuration object for the current resource.
 * It searches for a .jscsrc file relative to the resource path.
 * @this {object} - Webpack loader context.
 * @returns {object} - The parsed configuration object, or an empty object if no config is found.
 * @throws {Error} - If the configuration file exists but is malformed JSON.
 */
const retrieveConfigurationSync = function () {
  const resourceContextPath = this.resourcePath; // Path of the file being processed by the loader.
  const configFilePath = configFinderInstance.for(resourceContextPath); // Find config path.

  // If no config file path string is returned, assume no configuration is present.
  if (typeof configFilePath !== 'string' || configFilePath.length === 0) {
    return {}; // Return an empty configuration.
  }

  // Register the configuration file as a dependency for webpack's watch mode.
  this.addDependency(configFilePath);

  // Read the configuration file content synchronously.
  const rawFileContent = filesystemMod.readFileSync(configFilePath, 'utf8');

  let parsedConfigData = {};
  try {
    // Strip comments and then parse the JSON content.
    const cleanJsonContent = jsonCommentRemover(rawFileContent);
    parsedConfigData = JSON.parse(cleanJsonContent);
  } catch (parseError) {
    // If JSON parsing fails, throw an error indicating a malformed config.
    throw new Error(`Failed to parse JSCS configuration file '${configFilePath}': ${parseError.message}`);
  }

  return parsedConfigData;
};

/**
 * Asynchronously retrieves the configuration object for the current resource.
 * It searches for a .jscsrc file relative to the resource path.
 * @this {object} - Webpack loader context.
 * @param {function(Error|null, object): void} completionCallback - Callback function to be invoked with the result.
 */
const retrieveConfigurationAsync = function (completionCallback) {
  const currentResourcePath = this.resourcePath; // The full path to the module being loaded.
  const loaderContext = this; // Store context for use in nested callbacks.

  // Locate the configuration file asynchronously.
  configFinderInstance.for(currentResourcePath, function (finderError, locatedConfigPath) {
    if (finderError) {
      return completionCallback(finderError); // Pass on any errors from the config finder.
    }

    // If no configuration file path is found, return an empty config.
    if (typeof locatedConfigPath !== 'string' || locatedConfigPath.length === 0) {
      return completionCallback(null, {});
    }

    // Add the found config file as a build dependency.
    loaderContext.addDependency(locatedConfigPath);

    // Read the content of the configuration file asynchronously.
    filesystemMod.readFile(locatedConfigPath, 'utf8', function (readFileErr, fileData) {
      if (readFileErr) {
        return completionCallback(readFileErr); // Handle file read errors.
      }

      let parsedOptions = {};
      try {
        // Remove comments from the file content and then parse it as JSON.
        const cleanData = jsonCommentRemover(fileData);
        parsedOptions = JSON.parse(cleanData);
      } catch (parsingException) {
        // If parsing fails, report it as an error to the callback.
        return completionCallback(new Error(`Error parsing JSCS config '${locatedConfigPath}': ${parsingException.message}`));
      }

      // Successfully retrieved and parsed the configuration.
      completionCallback(null, parsedOptions);
    });
  });
};

/**
 * Executes the code style evaluation on the provided source code.
 * This function integrates loader options, query parameters, and the loaded configuration.
 * @this {object} - Webpack loader context.
 * @param {string} inputCodeContent - The JavaScript source code string to be checked.
 * @param {object} baseConfiguration - The configuration object loaded from .jscsrc.
 * @returns {void}
 * @throws {Error} - If `failOnHint` is true and style violations are found, or if an emitter is unavailable.
 */
const evaluateCodeContent = function (inputCodeContent, baseConfiguration) {
  // Create a mutable configuration object by cloning the base config.
  const effectiveConfig = assignProperties({}, baseConfiguration);

  // Apply loader-specific options (e.g., from webpack.config.js).
  const loaderSpecificOptions = this.getOptions ? this.getOptions() : (this.options && this.options.jscs ? this.options.jscs : {});
  if (loaderSpecificOptions) {
    assignProperties(effectiveConfig, loaderSpecificOptions);
  }

  // Apply query parameters from the resource URL (e.g., ?jscs.emitErrors=true).
  const urlQueryArgs = loaderAssist.parseQuery(this.query);
  if (urlQueryArgs) {
    assignProperties(effectiveConfig, urlQueryArgs);
  }

  // Extract special flags that control loader behavior, rather than JSCS rules.
  const reportErrorsAsWarnings = effectiveConfig.emitErrors === false; // Default: emit errors.
  const haltOnError = effectiveConfig.failOnHint === true; // Default: do not halt.

  // Remove these flags from the configuration passed to the JSCS checker,
  // as they are handled by the loader, not the checker itself.
  delete effectiveConfig.emitErrors;
  delete effectiveConfig.failOnHint;

  // Check for a custom reporter function specified in the config.
  const customReporterFunction = effectiveConfig.reporter;
  delete effectiveConfig.reporter; // Remove it from the checker config.

  // Initialize the code style checker.
  const styleChecker = new CodeStyleEvaluator();
  styleChecker.registerDefaultRules(); // Load all standard JSCS rules.
  styleChecker.configure(effectiveConfig); // Apply the merged configuration.

  // Perform the actual style check on the source code.
  const validationResult = styleChecker.checkString(inputCodeContent);

  // If style violations are detected:
  if (!validationResult.isEmpty()) {
    // If a custom reporter is provided, invoke it.
    if (typeof customReporterFunction === 'function') {
      customReporterFunction.call(this, validationResult);
    } else {
      // Otherwise, format the errors for standard reporting.
      const formattedErrors = validationResult.getErrorList().map(function (issue) {
        return `  Rule: '${issue.rule}'` +
               `\n  Location: Line ${issue.line}, Column ${issue.column}` +
               `\n  Details: ${issue.message}`;
      }).join('\n\n');

      const diagnosticMessage = `Code style violations detected by JSCS:\n\n${formattedErrors}`;

      // Determine the appropriate emitter (error or warning).
      const diagnosticEmitter = reportErrorsAsWarnings ? this.emitWarning : this.emitError;

      if (typeof diagnosticEmitter === 'function') {
        diagnosticEmitter(diagnosticMessage);
      } else {
        // Fallback if the loader context doesn't provide emitWarning/emitError.
        console.error(`WEBPACK LOADER CONTEXT ERROR: No suitable diagnostic emitter found. ` +
                      `Please ensure your webpack version supports 'emitWarning' or 'emitError'.\n` +
                      diagnosticMessage);
        // Even if no emitter, if failOnHint is true, we should still throw.
      }
    }

    // If configured to halt on style errors, throw an exception.
    if (haltOnError) {
      throw new Error('Webpack build halted due to JSCS style violations.');
    }
  }
};

/**
 * The main entry point for the Webpack JSCS loader.
 * This function processes the input JavaScript source code for style compliance.
 * @param {string} inputCode - The raw JavaScript source code.
 * @returns {string|undefined} - The input code (unmodified) for synchronous loaders,
 *                               or undefined for asynchronous loaders (result handled by callback).
 */
module.exports = function (inputCode) {
  // Mark the loader's output as cacheable by Webpack.
  this.cacheable(true);

  // Get the asynchronous callback function provided by Webpack, if available.
  const asyncCompletionCallback = this.async();
  const isSynchronousMode = !asyncCompletionCallback;

  if (isSynchronousMode) {
    // --- Synchronous processing path ---
    let syncConfiguration;
    try {
      syncConfiguration = retrieveConfigurationSync.call(this);
    } catch (configLoadError) {
      // If config loading fails in sync mode, throw immediately.
      throw configLoadError;
    }

    try {
      evaluateCodeContent.call(this, inputCode, syncConfiguration);
    } catch (evaluationException) {
      // If evaluation fails in sync mode (e.g., failOnHint), throw immediately.
      throw evaluationException;
    }

    // Return the original source code, as JSCS doesn't modify it.
    return inputCode;
  } else {
    // --- Asynchronous processing path ---
    const loaderInstance = this; // Capture 'this' context for async operations.

    // Asynchronously load the configuration.
    retrieveConfigurationAsync.call(loaderInstance, function (configError, loadedConfig) {
      if (configError) {
        // If configuration loading fails, pass the error to the async callback.
        return asyncCompletionCallback(configError);
      }

      try {
        // Once config is loaded, evaluate the code content.
        evaluateCodeContent.call(loaderInstance, inputCode, loadedConfig);
      } catch (codeCheckException) {
        // If code evaluation throws an error (e.g., 'failOnHint'), pass it to the async callback.
        return asyncCompletionCallback(codeCheckException);
      }

      // If all checks pass without errors, signal success to Webpack.
      // The original source code is passed through, as it's not modified.
      asyncCompletionCallback(null, inputCode);
    });
  }
};