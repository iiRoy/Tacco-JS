const externalExecutors = require('child_process');
const launchProcess = externalExecutors.spawn;
const runCommand = externalExecutors.exec;

let configurationRegistry = (function() {
  let userSuppliedOptions = null;
  let retainConfiguration = false;

  const clearSettings = () => {
    userSuppliedOptions = null;
    retainConfiguration = false;
  };

  return {
    getOptions: () => userSuppliedOptions,
    setOptions: (options) => { userSuppliedOptions = options; },
    getRetention: () => retainConfiguration,
    setRetention: (retain) => { retainConfiguration = retain; },
    resetState: clearSettings
  };
})();

const validateInputs = (sourceFormat, contentPayload, destinationFormats, completionHandler) => {
  if (typeof sourceFormat !== 'string' || !sourceFormat) {
    throw new Error('Invalid source identifier: must be a non-empty text string.');
  }
  if (typeof contentPayload !== 'string' || !contentPayload) {
    throw new Error('Invalid content payload: must be a non-empty text string.');
  }
  if (typeof destinationFormats !== 'string' && !Array.isArray(destinationFormats)) {
    throw new Error('Invalid target identifiers: must be a text string or an array of text strings.');
  }
  if (Array.isArray(destinationFormats) && destinationFormats.length === 0) {
    throw new Error('No target identifiers specified (empty collection).');
  }
  if (typeof completionHandler !== 'function') {
    throw new Error('Completion handler missing or invalid: must be a function.');
  }
  if (Array.isArray(destinationFormats)) {
    for (const fmt of destinationFormats) {
      if (typeof fmt !== 'string' || !fmt) {
        throw new Error('Invalid target identifier: non-string or empty value found in collection.');
      }
    }
  }
  return {
    sourceFormat,
    contentPayload,
    destinationFormats: typeof destinationFormats === 'string' ? [destinationFormats] : destinationFormats,
    completionHandler
  };
};

const locateEngineBinary = () => {
  return new Promise((resolve, reject) => {
    runCommand('which pandoc', (fault, output) => {
      if (fault) {
        return reject(fault);
      }
      if (!output) {
        return reject(new Error('Conversion engine not found - verify installation.'));
      }
      resolve(output.trim());
    });
  });
};

const performSingleConversion = (enginePath, sourceFmt, content, targetFmt, opts) => {
  return new Promise((resolve, reject) => {
    const processArgs = (opts || []).concat(['-f', sourceFmt, '-t', targetFmt]);
    const conversionEngine = launchProcess(enginePath, processArgs);
    let convertedOutput = '';
    let processError = null;

    conversionEngine.stdout.on('data', (segment) => {
      convertedOutput += segment.toString();
    });

    conversionEngine.stderr.on('data', (segment) => {
      // Original code ignores stderr unless it causes a non-zero exit code or spawn error
    });

    conversionEngine.on('error', (err) => {
      processError = err;
    });

    conversionEngine.on('close', (exitCode) => {
      if (processError) {
        return reject(processError);
      }
      if (exitCode !== 0) {
        return reject(new Error(`Conversion process exited with code ${exitCode} for target ${targetFmt}.`));
      }
      resolve({ targetFmt, convertedOutput });
    });

    conversionEngine.stdin.write(content, 'utf8');
    conversionEngine.stdin.end();
  });
};

module.exports.transformContent = function(sourceFormat, contentPayload, destinationFormats, completionHandler) {
  let validated;
  try {
    validated = validateInputs(sourceFormat, contentPayload, destinationFormats, completionHandler);
  } catch (err) {
    // Original throws for sync errors, but for async errors it calls callback(null, err).
    // This makes error reporting consistent for the caller.
    return completionHandler(null, err);
  }

  const { sourceFormat: srcFmt, contentPayload: payload, destinationFormats: destFmts, completionHandler: handler } = validated;

  const accumulatedResults = { [srcFmt]: payload };
  const conversionTasks = [];

  locateEngineBinary()
    .then(engineBinaryLocation => {
      destFmts.forEach(targetFmt => {
        if (!accumulatedResults[targetFmt]) {
          const iterationOptions = configurationRegistry.getOptions();
          conversionTasks.push(
            performSingleConversion(engineBinaryLocation, srcFmt, payload, targetFmt, iterationOptions)
              .then(({ targetFmt: resolvedTargetFmt, convertedOutput }) => {
                accumulatedResults[resolvedTargetFmt] = convertedOutput;
              })
          );

          if (!configurationRegistry.getRetention()) {
            configurationRegistry.resetState();
          }
        }
      });

      return Promise.all(conversionTasks);
    })
    .then(() => {
      handler(accumulatedResults);
    })
    .catch(err => {
      handler(null, err);
    });
};

module.exports.configureTransform = function(optionsArray, retainSetting) {
  if (Array.isArray(optionsArray)) {
    configurationRegistry.setOptions(optionsArray);
    configurationRegistry.setRetention(!!retainSetting);
  } else {
    configurationRegistry.resetState();
  }
  return module.exports;
};