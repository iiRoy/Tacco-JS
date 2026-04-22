const procUtils = require('child_process'); // Renamed module for process utilities

/**
 * Manages configuration settings for content transformation operations.
 * This object holds user-defined options and controls their persistence.
 */
const conversionConfig = {
  // User-provided command-line arguments for the transformation tool.
  userSuppliedArguments: [],

  // Flag indicating whether the custom arguments should be retained across multiple calls.
  shouldRetainArguments: false,

  /**
   * Resets the configuration to its default state, clearing any
   * user-supplied arguments and disabling persistence.
   */
  resetConfiguration: function() {
    this.userSuppliedArguments = []; // Ensure it's an empty array, not null
    this.shouldRetainArguments = false;
  }
};

/**
 * Helper function to validate if a value is a non-empty string.
 * @param {*} value The value to check.
 * @returns {boolean} True if the value is a non-empty string, false otherwise.
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Transforms content from one markup format to potentially multiple others
 * using an external conversion utility (pandoc).
 *
 * @param {string} sourceFormat The input markup's format identifier (e.g., 'markdown').
 * @param {string} sourceText The actual content to be transformed.
 * @param {string|string[]} targetFormats An array of desired output formats, or a single format string.
 * @param {function(Error|null, Object<string, string>|null)} completionHandler
 *   A callback function that receives either an error object (if conversion fails)
 *   or an object mapping target format identifiers to their converted content.
 */
module.exports.transformContent = function(sourceFormat, sourceText, targetFormats, completionHandler) {
  const conversionResults = {}; // Stores successful transformations
  let pendingConversions = 0; // Counts outstanding conversion tasks
  let overallConversionError = null; // Stores the first encountered error
  let callbackInvoked = false; // Ensures the completion handler is called only once

  /**
   * Invokes the completion handler if it hasn't been called yet.
   * This centralizes callback management to prevent multiple calls and ensures
   * a consistent (err, results) Node.js-style signature.
   * @param {Error|null} err An error object if a failure occurred.
   * @param {Object<string, string>|null} results The successful conversion results.
   */
  function safeCompletionHandler(err, results) {
    if (!callbackInvoked) {
      callbackInvoked = true;
      completionHandler(err, results);
    }
  }

  // --- Input Validation and Pre-processing ---

  if (!isNonEmptyString(sourceFormat)) {
    return safeCompletionHandler(new Error('Invalid source markup format: must be a non-empty string.'), null);
  }

  if (!isNonEmptyString(sourceText)) {
    return safeCompletionHandler(new Error('Invalid source content: must be a non-empty string.'), null);
  }

  // Ensure targetFormats is always an array for consistent processing.
  if (typeof targetFormats === 'string') {
    targetFormats = [targetFormats];
  } else if (!Array.isArray(targetFormats)) {
    return safeCompletionHandler(new Error('Invalid destination formats: must be a string or an array of strings.'), null);
  }

  if (targetFormats.length === 0) {
    return safeCompletionHandler(new Error('No destination formats specified.'), null);
  }

  // Validate each target format and filter out source-to-source conversions.
  const validatedTargetFormats = [];
  for (let idx = 0; idx < targetFormats.length; idx++) {
    const currentTarget = targetFormats[idx];
    if (!isNonEmptyString(currentTarget)) {
      return safeCompletionHandler(new Error(`Invalid destination format provided: non-string or empty value found at index ${idx}.`), null);
    }
    // Optimization: If source format is also a target, directly use sourceText and skip conversion.
    if (currentTarget.toLowerCase() === sourceFormat.toLowerCase()) {
      conversionResults[currentTarget] = sourceText;
    } else {
      validatedTargetFormats.push(currentTarget);
    }
  }

  // If all target formats were the same as the source, or no actual conversions are needed, we're done.
  if (validatedTargetFormats.length === 0 && Object.keys(conversionResults).length > 0) {
    // Adding a slight delay to make it async, similar to how child_process would behave.
    process.nextTick(() => safeCompletionHandler(null, conversionResults));
    return;
  }

  // Validate the completion handler itself.
  if (typeof completionHandler !== 'function') {
    // This case is critical as we can't call the handler. Throw a synchronous error.
    if (completionHandler) {
      throw new Error('Invalid completion handler provided: must be a function.');
    } else {
      throw new Error('No completion handler provided: must be a function.');
    }
  }

  // Store the original content for the source format, if it wasn't already added
  // (e.g., if sourceFormat was not explicitly listed in targetFormats).
  if (!conversionResults[sourceFormat]) {
    conversionResults[sourceFormat] = sourceText;
  }

  // Set the total number of conversions we expect to complete.
  pendingConversions = validatedTargetFormats.length;

  // --- Discover the conversion utility's path ---
  procUtils.exec('which pandoc', (errorObject, standardOutput) => {
    // If an error already occurred (e.g., from an earlier validation or another process failure),
    // prevent further execution and ensure only one callback.
    if (overallConversionError || callbackInvoked) {
      return;
    }

    if (errorObject) {
      return safeCompletionHandler(new Error(`Failed to locate 'pandoc' executable: ${errorObject.message}`), null);
    }

    if (!standardOutput || standardOutput.trim().length === 0) {
      return safeCompletionHandler(new Error('Cannot find pandoc - is it installed and in your PATH environment variable?'), null);
    }

    // Strip any trailing newline characters from the path.
    const executablePath = standardOutput.trim();

    // --- Initiate Conversions for each Target Format ---
    validatedTargetFormats.forEach(targetFmt => {
      // Construct arguments for the current pandoc invocation.
      const cliArguments = [
        ...conversionConfig.userSuppliedArguments, // Include user-defined options
        '-f', sourceFormat,
        '-t', targetFmt
      ];

      // Spawn a new pandoc process for each target format.
      const conversionProcess = procUtils.spawn(executablePath, cliArguments);
      let outputBuffer = ''; // Buffer to accumulate data from stdout for this specific conversion.

      conversionProcess.stdout.on('data', chunkData => {
        outputBuffer += chunkData.toString('utf8'); // Ensure data is treated as UTF-8 string
      });

      conversionProcess.on('error', processError => {
        // If an error occurs during process execution (e.g., path not found, permissions)
        if (!overallConversionError) {
          overallConversionError = new Error(`Pandoc process execution failed for target '${targetFmt}': ${processError.message}`);
        }
        // Mark this conversion as completed (with error)
        if (--pendingConversions === 0) {
          safeCompletionHandler(overallConversionError, null);
        }
      });

      conversionProcess.on('exit', (exitCode, terminationSignal) => {
        // Only proceed if a general error hasn't already been reported and callback not invoked.
        if (overallConversionError || callbackInvoked) {
          return;
        }

        if (exitCode !== 0) {
          // If pandoc exits with a non-zero code, it indicates an error.
          if (!overallConversionError) { // Ensure we only record the first failure
            overallConversionError = new Error(`Pandoc conversion failed for target '${targetFmt}' with exit code ${exitCode}. Signal: ${terminationSignal || 'N/A'}`);
            // In a more advanced Type III, we might try to read stderr here for more detail.
          }
        } else {
          // If successful, store the accumulated output.
          conversionResults[targetFmt] = outputBuffer;
        }

        // Decrement the counter for pending conversions and check if all are done.
        if (--pendingConversions === 0) {
          // If an error was recorded during any conversion, report it. Otherwise, report success.
          safeCompletionHandler(overallConversionError, overallConversionError ? null : conversionResults);
        }
      });

      // Pipe the source content into pandoc's standard input.
      conversionProcess.stdin.write(sourceText, 'utf8');
      conversionProcess.stdin.end();
    });

    // --- Post-conversion cleanup (if not retaining arguments) ---
    if (!conversionConfig.shouldRetainArguments) {
      conversionConfig.resetConfiguration();
    }
  });
};

/**
 * Configures global options for subsequent content transformation calls.
 * These options are passed as command-line arguments to the underlying
 * conversion utility.
 *
 * @param {string[]|null} optionsArray An array of command-line arguments to pass to the
 *   conversion utility. If not an array or null, default arguments will be used.
 * @param {boolean} retain A flag indicating whether these options should persist
 *   across multiple `transformContent` calls.
 * @returns {object} The current module exports, allowing for method chaining.
 */
module.exports.configureOptions = function(optionsArray, retain) {
  if (Array.isArray(optionsArray)) {
    conversionConfig.userSuppliedArguments = optionsArray;
    conversionConfig.shouldRetainArguments = !!retain; // Ensure boolean
  } else {
    // If invalid options are provided (not an array), revert to defaults.
    conversionConfig.resetConfiguration();
  }

  return module.exports; // Enable chaining
};