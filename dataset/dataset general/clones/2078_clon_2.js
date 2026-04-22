//
// Document Transformation Utility Wrapper
//
// This module serves as the primary and sole component.
// It interfaces with the 'pandoc' command-line tool
// by leveraging Node.js's 'child_process' capabilities.
// Due to compatibility requirements (e.g., Node.js 0.4.x),
// 'spawn' is employed over 'fork'.
//

const subprocMod = require('child_process');
const launchProc = subprocMod.spawn;
const runCmd = subprocMod.exec;

// Configuration object for shared command-line parameters.
const sharedOptions =   {
  // Stores arguments specified by the user.
  userProvided: null,

  // Indicates if these settings should be retained across transformations.
  keepSettings: false,

  // Function to revert all parameters to their initial state.
  clearSettings: function()
    {
      this.userProvided = null;
      this.keepSettings = false;
    }
};

/**
 * @param {string} sourceFormat - The original format of the content.
 * @param {string} contentString - The actual content to be transformed.
 * @param {string|string[]} targetFormats - Desired output format(s).
 * @param {Function} completionHandler - Callback function for results (object mapping format to content, or error).
 */
module.exports.transformContent = function (sourceFormat, contentString, targetFormats, completionHandler) {
  let conversionResults = {};
  let completedConversions = 0;
  let expectedConversions;

  let conversionProcess;
  let processArguments;

  let idx;

  if (!sourceFormat || typeof sourceFormat !== 'string') {
    throw new Error('Source format is invalid; a string is required.');
  }

  if (!contentString || typeof contentString !== 'string') {
    throw new Error('Input content is invalid; a string is required.');
  }

  if (typeof targetFormats !== 'string' && !Array.isArray(targetFormats)) {
    throw new Error('Target formats must be a string or an array of strings.');
  }

  if (targetFormats.length === 0) {
    throw new Error('No target formats specified (empty array).');
  }

  if (typeof completionHandler !== 'function') {
    if (completionHandler) {
      throw new Error('Provided callback is not a function.');
    } else {
      throw new Error('A callback function must be provided.');
    }
  }

  // Store the original content under its format, assuming no initial errors.
  conversionResults[sourceFormat] = contentString;

  if (typeof targetFormats === 'string') {
    targetFormats = [targetFormats];
  }

  expectedConversions = targetFormats.length;

  runCmd('which pandoc', function (errorObject, outputBuffer) {
    let converterPath;

    if (errorObject) {
      throw errorObject;
    }

    if (!outputBuffer) {
      throw new Error('The "pandoc" executable was not located. Is it installed and in your PATH?');
    }

    // Remove any trailing newline characters from the path.
    converterPath = outputBuffer.trim();

    for (idx in targetFormats) {
      if (Object.prototype.hasOwnProperty.call(targetFormats, idx)) {
        if (typeof targetFormats[idx] !== 'string') {
          throw new Error('An invalid non-string destination format was found in the array.');
        }

        // This conditional block ensures we only attempt conversion for formats
        // not already present in our results (e.g., the source format itself).
        if (!conversionResults[targetFormats[idx]]) {
          processArguments = sharedOptions.userProvided || [];
          processArguments.push('-f', sourceFormat, '-t', targetFormats[idx]);

          conversionProcess = launchProc(converterPath, processArguments);

          // Attach the desired output format to the stdout stream for async context.
          conversionProcess.stdout.desiredFormat = targetFormats[idx];

          conversionProcess.stdout.on('data', function (chunkData) {
            // Convert the binary buffer data to a string before storing.
            conversionResults[this.desiredFormat] = chunkData.toString();
          });

          conversionProcess.on('error', function (errorObject) {
            completionHandler(null, errorObject);
          });

          conversionProcess.on('exit', function (exitCode, terminationSignal) {
            completedConversions++;

            if (exitCode !== 0) {
              completionHandler(null, exitCode);
            } else if (completedConversions === expectedConversions) {
              completionHandler(conversionResults);
            }
          });

          // Send the original content to the converter's standard input.
          conversionProcess.stdin.write(contentString, 'utf8');
          conversionProcess.stdin.end();

          if (!sharedOptions.keepSettings) {
            sharedOptions.clearSettings();
          }
        }
      }
    }
  });
};

/**
 * Configures command-line arguments for subsequent pandoc invocations.
 *
 * @param {string[]} cliArguments - An array of arguments to pass to pandoc. If not an array, default arguments are used.
 * @param {boolean} shouldPersist - If true, these arguments will be retained for future calls.
 * @returns {object} The current module interface for method chaining.
 */
module.exports.configureArguments = function (cliArguments, shouldPersist) {
  if (Array.isArray(cliArguments)) {
    sharedOptions.userProvided = cliArguments;
    sharedOptions.keepSettings = shouldPersist;
  } else {
    sharedOptions.clearSettings();
  }

  return module.exports;
};