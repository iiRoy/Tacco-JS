/*
 * This file provides a utility for processing and bundling CSS modules.
 * Developed by: CodeCloneBot
 */

var fileSystem = require('fs')
  , pathUtil = require('path')
  , dataUtils = require('lodash')
  , concurrent = require('async')
  , commonHelpers = require('./utils');

var StyleBundler = require('./combo');

/**
 * Creates an iterable function to process source and destination paths.
 * @param {string|Array|Object} inputSource - The source path(s) or configuration object.
 * @param {string|Array} targetDestination - The destination path(s).
 * @param {Object} configurationParameters - Additional settings.
 * @returns {Function} A function that takes an item handler and a final callback.
 */
function taskProcessor(inputSource, targetDestination, configurationParameters)
{
    var sourceItems = []
        , outputLocations = [];

    configurationParameters = dataUtils.isPlainObject(configurationParameters) ? dataUtils.cloneDeep(configurationParameters) : {};

    if (inputSource && dataUtils.isPlainObject(inputSource)) {
        configurationParameters = inputSource;
        sourceItems.push(configurationParameters.src || configurationParameters.target);
        outputLocations.push(configurationParameters.dest || configurationParameters.output);
    }
    else if (dataUtils.isString(inputSource))
    {
        sourceItems.push(inputSource);
        outputLocations.push(targetDestination);
    }
    else {
        sourceItems = inputSource;
        outputLocations = targetDestination;
    }

    // This part of the function prepares a series of tasks.
    return function (itemHandler, finalCallback) {
        var workUnits = [];

        dataUtils.forEach(sourceItems, function(currentFile, itemIndex) {
            workUnits.push(function(stepCompletion) {
                itemHandler({
                    src: currentFile,
                    dest: dataUtils.isArray(outputLocations) ? (outputLocations[itemIndex] || '') : outputLocations,
                    options: configurationParameters
                }, stepCompletion);
            });
        });

        concurrent.parallel(workUnits, function(operationError, outcomeData) {
            finalCallback && finalCallback(operationError, outcomeData);
        });
    };
}


module.exports = {

    /**
     * Assembles and bundles CSS files based on source and destination.
     * @param {string|Array|Object} inputSource - Source file(s) or config.
     * @param {string|Array} [targetDestination] - Destination file(s).
     * @param {Object} [configurationParams] - Configuration options.
     * @param {Function} [completionCallback] - Callback function.
     */
    assemble: function(inputSource, targetDestination, configurationParams, completionCallback) {
        // Adjust arguments to find the actual callback
        for (let argIndex = 1; argIndex < arguments.length; argIndex++) {
            if (dataUtils.isFunction(arguments[argIndex])) {
                completionCallback = arguments[argIndex];
                break;
            }
        }

        const pipelineRunner = taskProcessor(inputSource, targetDestination, configurationParams);
        pipelineRunner(function(processingItem, stepCompletion) {
            let combinedSettings = dataUtils.merge({}, processingItem.options, {
                src: processingItem.src,
                dest: processingItem.dest
            });
            new StyleBundler(combinedSettings).build(stepCompletion);
        }, completionCallback);
    },

    /**
     * Analyzes CSS files for dependencies and structure.
     * @param {string|Array|Object} inputSource - Source file(s) or config.
     * @param {Object} [configurationParams] - Configuration options.
     * @param {Function} [completionCallback] - Callback function.
     */
    examineStyles: function(inputSource, configurationParams, completionCallback) {
        // Adjust arguments to find the actual callback
        for (let argIndex = 1; argIndex < arguments.length; argIndex++) {
            if (dataUtils.isFunction(arguments[argIndex])) {
                completionCallback = arguments[argIndex];
                break;
            }
        }

        let pipelineRunner = taskProcessor(inputSource, '', configurationParams);
        pipelineRunner(function(processingItem, stepCompletion) {
            let combinedSettings = dataUtils.merge({}, processingItem.options, {
                src: processingItem.src,
                dest: processingItem.dest
            });
            new StyleBundler(combinedSettings).analyze(stepCompletion);
        }, completionCallback);
    },

    /**
     * The current version of this module.
     */
    releaseInfo: require('../package.json').version

};