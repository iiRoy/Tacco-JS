/**
 * A sophisticated utility for processing and bundling CSS modules,
 * enhancing modularity and optimizing delivery.
 * Developed by: [Your Name/Alias]
 * Contact: [Your Email]
 */

const filesystem = require('fs');
const pathHandler = require('path');
const util = require('lodash'); // Renamed lodash to util for brevity
// The original `async` dependency is replaced by native Promises for modern async flow.
const StyleBundler = require('./combo'); // Renamed CssCombo to StyleBundler

/**
 * Creates a task processor function capable of handling multiple source-destination pairs
 * and executing an operation handler for each, leveraging Promises for concurrent execution.
 *
 * @param {string|string[]|object} inputSource - The source file(s) or a configuration object.
 * @param {string|string[]} [outputTarget=''] - The destination path(s) for the processed output.
 * @param {object} [baseProcessingOptions={}] - Base options to be applied to all tasks.
 * @returns {function(function(object): Promise<any>): Promise<any[]>} A function that takes an async operation handler
 *                                                                    and returns a Promise resolving with results of all tasks.
 */
const createTaskProcessor = (inputSource, outputTarget = '', baseProcessingOptions = {}) => {
    let sourceFiles = [];
    let targetDestinations = [];
    let effectiveOptions = baseProcessingOptions ? { ...baseProcessingOptions } : {}; // Ensure options are cloned

    // Validate base options type
    if (!util.isObject(effectiveOptions)) {
        console.warn("Warning: Provided base processing options are not a plain object. Using an empty object.");
        effectiveOptions = {};
    }

    // Determine input and output based on the format of inputSource
    if (util.isObject(inputSource) && !util.isArray(inputSource)) {
        // Case 1: inputSource is a single configuration object (e.g., { src: 'a', dest: 'b', options: {} })
        // Merge this config directly into effective options.
        effectiveOptions = { ...effectiveOptions, ...inputSource };
        sourceFiles.push(effectiveOptions.src || effectiveOptions.target); // 'target' is an alternative for 'src'
        targetDestinations.push(effectiveOptions.dest || effectiveOptions.output); // 'output' is an alternative for 'dest'
    } else if (util.isString(inputSource)) {
        // Case 2: inputSource is a single string path
        sourceFiles.push(inputSource);
        targetDestinations.push(outputTarget); // outputTarget is expected to be the destination path here
    } else if (util.isArray(inputSource)) {
        // Case 3: inputSource is an array of source paths
        sourceFiles = inputSource;
        targetDestinations = outputTarget; // outputTarget can be an array or a single string destination
    } else {
        // Default or error handling for unhandled inputSource types
        console.error("Error: Unrecognized input configuration for the task processor. No tasks will be generated.");
        return (operationHandler) => Promise.resolve([]); // Return a resolved promise with an empty array
    }

    // Guard clause: Ensure there are valid source files to process
    if (!util.isArray(sourceFiles) || sourceFiles.length === 0) {
        console.info("No valid source files identified for processing. Skipping task execution.");
        return (operationHandler) => Promise.resolve([]);
    }

    /**
     * Returns a function that executes an operation handler for each task item.
     * @param {function(object): Promise<any>} operationHandler - An async function that takes a task configuration object
     *                                                            and returns a Promise.
     * @returns {Promise<any[]>} A Promise that resolves with an array of results from all executed tasks.
     */
    return (operationHandler) => {
        // Basic validation for the operation handler
        if (typeof operationHandler !== 'function') {
            return Promise.reject(new Error("The provided operation handler must be a function that returns a Promise."));
        }

        // Map each source file to a Promise-based operation
        const processingPromises = sourceFiles.map((currentFile, idx) => {
            // Construct the specific configuration for the current task item
            const taskConfiguration = {
                source: currentFile,
                target: util.isArray(targetDestinations) ? (targetDestinations[idx] || '') : targetDestinations,
                config: effectiveOptions
            };
            // Execute the operation handler for the current task, expecting it to return a Promise
            return operationHandler(taskConfiguration);
        });

        // Use Promise.all to concurrently execute all tasks and wait for their completion
        return Promise.all(processingPromises);
    };
};

module.exports = {
    /**
     * Bundles CSS files according to the provided configuration.
     * Supports various input formats for source, destination, and options.
     *
     * @param {string|string[]|object} inputSource - The path(s) to source CSS files or a configuration object.
     * @param {string|string[]} [outputTarget] - The destination path(s) for the bundled output. Optional if part of inputSource.
     * @param {object} [bundleSettings] - Specific settings for the bundling process. Optional.
     * @param {function(Error|null, any[]): void} [onCompletion] - Optional callback function to handle completion or errors.
     * @returns {Promise<any[]>|void} A Promise resolving with results if no callback is provided, otherwise void.
     */
    bundleStyles: async (inputSource, outputTarget, ...additionalArgs) => {
        let bundleSettings = {};
        let onCompletion = null;

        // Parse additional arguments to find settings and the completion callback
        if (additionalArgs.length > 0) {
            const lastArg = additionalArgs[additionalArgs.length - 1];
            if (util.isFunction(lastArg)) {
                onCompletion = lastArg;
                additionalArgs.pop(); // Remove callback from the list
            }
            if (additionalArgs.length > 0 && util.isObject(additionalArgs[0])) {
                bundleSettings = additionalArgs[0];
            } else if (additionalArgs.length > 0) {
                console.warn("Warning: Unrecognized argument provided as bundle settings. Ignoring.");
            }
        }

        // If outputTarget was actually the settings object or callback
        if (util.isObject(outputTarget) && !util.isFunction(outputTarget)) {
            bundleSettings = { ...outputTarget, ...bundleSettings };
            outputTarget = ''; // Reset outputTarget as it was settings
        } else if (util.isFunction(outputTarget)) {
            onCompletion = outputTarget;
            outputTarget = ''; // Reset outputTarget as it was the callback
        }

        // Initialize the task processor
        const taskRunner = createTaskProcessor(inputSource, outputTarget, bundleSettings);

        try {
            // Execute tasks, expecting the operation handler to be async (returning a Promise)
            const operationResults = await taskRunner(async (taskItem) => {
                const finalBundleConfig = {
                    ...taskItem.config, // Inherit options from taskItem
                    source: taskItem.source,
                    target: taskItem.target
                };
                const bundlerInstance = new StyleBundler(finalBundleConfig);
                // Assuming StyleBundler.bundle() is an async operation that returns a Promise
                return await bundlerInstance.bundle();
            });

            // Invoke the completion callback if provided
            if (onCompletion) {
                onCompletion(null, operationResults);
            }
            return operationResults; // Return results if no callback
        } catch (processingError) {
            // Handle any errors during task execution
            if (onCompletion) {
                onCompletion(processingError);
            } else {
                console.error("Error encountered during style bundling:", processingError);
                throw processingError; // Re-throw if no callback to handle it
            }
        }
    },

    /**
     * Analyzes CSS files to extract dependencies or other metadata.
     *
     * @param {string|string[]|object} inputSource - The path(s) to source CSS files or a configuration object.
     * @param {object} [analysisSettings] - Specific settings for the analysis process. Optional.
     * @param {function(Error|null, any[]): void} [onCompletion] - Optional callback function to handle completion or errors.
     * @returns {Promise<any[]>|void} A Promise resolving with results if no callback is provided, otherwise void.
     */
    inspectStyles: async (inputSource, ...additionalArgs) => {
        let analysisSettings = {};
        let onCompletion = null;

        // Parse additional arguments to find settings and the completion callback
        if (additionalArgs.length > 0) {
            const lastArg = additionalArgs[additionalArgs.length - 1];
            if (util.isFunction(lastArg)) {
                onCompletion = lastArg;
                additionalArgs.pop();
            }
            if (additionalArgs.length > 0 && util.isObject(additionalArgs[0])) {
                analysisSettings = additionalArgs[0];
            } else if (additionalArgs.length > 0) {
                console.warn("Warning: Unrecognized argument provided as analysis settings. Ignoring.");
            }
        }

        // For analysis, the outputTarget is typically empty, so we pass an empty string.
        const taskRunner = createTaskProcessor(inputSource, '', analysisSettings);

        try {
            const analysisResults = await taskRunner(async (taskItem) => {
                const finalAnalysisConfig = {
                    ...taskItem.config,
                    source: taskItem.source,
                    target: taskItem.target // Target might still be relevant for some analysis
                };
                const analyzerInstance = new StyleBundler(finalAnalysisConfig);
                // Assuming StyleBundler.analyze() is an async operation
                return await analyzerInstance.analyze();
            });

            if (onCompletion) {
                onCompletion(null, analysisResults);
            }
            return analysisResults;
        } catch (analysisError) {
            if (onCompletion) {
                onCompletion(analysisError);
            } else {
                console.error("Error encountered during style analysis:", analysisError);
                throw analysisError;
            }
        }
    },

    /**
     * Retrieves the current version of the style processing module.
     * Uses optional chaining for safer access to package.json properties.
     */
    currentModuleVersion: require('../package.json')?.version || 'unknown'
};