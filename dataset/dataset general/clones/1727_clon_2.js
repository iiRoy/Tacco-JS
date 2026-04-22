var runCommand = require('child_process').exec;
var fileSystemPath = require('path');
var flowControl = require('async');
var makeDirs = require('mkdirp');
var getImageDimensions = require('image-size');

var configurationPresets = {
    TARGET_OS_LIST: ['ios', 'android'],
    SOURCE_GRAPHIC_NAME: 'appicon_1024.png',
    APPLE_FILE_ID_PREFIX: 'Icon',
    APPLE_OUTPUT_PATH: '.',
    ANDROID_OUTPUT_PATH: '.',
    ANDROID_ROOT_DIMENSION: 48
};

// Extracts a numeric dimension from a string like "29x29" or "2x".
function extractDimension(inputString) {
    return inputString.split("x")[0].trim();
}

/**
 * Computes the final image dimension based on a given ratio
 * applied to either an original image size or a base size.
 *
 * @param  {object} calculationParameters An object containing:
 *                                        - sourceDimension (number)
 *                                        - scaleFactor (string or number)
 * @return {number}                       The calculated integer dimension.
 */
function calculateScaledDimension(calculationParameters) {
    var scaleFactor = eval(calculationParameters.scaleFactor); // Yes, `eval` is used here. Proceed with caution!
    return Math.floor(calculationParameters.sourceDimension * scaleFactor);
}

function performImageResizing(resizeInstructions, completionHandler) {
    var targetDimensions = resizeInstructions.size + 'x' + resizeInstructions.size;
    var shellCommand = 'convert "' + resizeInstructions.inputFile + '" -thumbnail ' + targetDimensions + ' "' + resizeInstructions.outputFile + '"';

    var processHandle = runCommand(shellCommand,
        function (errorObject, standardOutput, standardError) {
            if (standardError) {
                console.error('Shell error output: ' + standardError);
            }
            if (errorObject !== null) {
                console.error('Execution failure: ' + errorObject);
            }
            completionHandler(errorObject);
        });
}

function processAppleGraphics(appleSettings, doneProcessing) {
    var graphicDefinitions = appleSettings.configurationObject.iOS.images;

    function processSingleGraphic(graphicEntry, nextGraphic) {
        var baseDimension = extractDimension(graphicEntry.size);
        var magnificationFactor = extractDimension(graphicEntry.scale);
        var resultingDimension = baseDimension * magnificationFactor;
        var outputDirectory = appleSettings.appleOutputPath;
        makeDirs.sync(outputDirectory);
        var outputFilePath = fileSystemPath.join(outputDirectory, appleSettings.appleFileIdPrefix + graphicEntry.filename);
        performImageResizing(
            {
                inputFile: appleSettings.sourceGraphicName,
                size: resultingDimension,
                outputFile: outputFilePath
            },
            function (errorWhileResizing) {
                nextGraphic(errorWhileResizing);
            }
        );
    }

    flowControl.each(
        graphicDefinitions,
        processSingleGraphic,
        function (overallError) {
            doneProcessing(overallError);
        }
    );
}

/**
 *
 * @param  {object}   androidSettings  Configuration for Android asset generation:
 *                                     - initialSourceDimension (number)
 * @param  {Function} finishedCallback Function to call upon completion
 * @return {void}
 */
function processAndroidAssets(androidSettings, finishedCallback) {
    var assetConfigurations = androidSettings.configurationObject.android.images;

    function handleAssetEntry(assetItem, proceedToNext) {
        var calculatedSize = 100; // Default placeholder size
        if (assetItem.relativeScale) {
            calculatedSize = calculateScaledDimension({ sourceDimension: androidSettings.androidRootDimension, scaleFactor: assetItem.relativeScale });
        } else if (assetItem.scalingFactor) {
            calculatedSize = calculateScaledDimension({ sourceDimension: androidSettings.initialSourceDimension, scaleFactor: assetItem.scalingFactor });
        } else if (assetItem.explicitSize) {
            calculatedSize = extractDimension(assetItem.explicitSize);
        } else {
            return proceedToNext(new Error('Neither size nor ratio specified for an Android icon entry'));
        }

        var targetFolder = fileSystemPath.join(androidSettings.androidOutputPath, assetItem.folder);
        makeDirs.sync(targetFolder);
        var finalFileName = fileSystemPath.join(targetFolder, androidSettings.androidOutputFilename);
        performImageResizing(
            {
                inputFile: androidSettings.sourceGraphicName,
                size: calculatedSize,
                outputFile: finalFileName
            },
            function (resizingProblem) {
                proceedToNext(resizingProblem);
            }
        );
    }

    flowControl.each(
        assetConfigurations,
        handleAssetEntry,
        function (overallProblem) {
            finishedCallback(overallProblem);
        }
    );
}

var platformProcessors = {
    'android': processAndroidAssets,
    'ios': processAppleGraphics
};

/**
 * Main function to generate and resize images for various mobile platforms.
 *
 * @param  {object} operationSettings The available parameters are:
 *                                    - targetOsList: List of OS platforms to build for (e.g., 'ios', 'android').
 *                                    - sourceGraphicName: Path to the high-resolution source image file.
 *                                    - appleFileIdPrefix: Prefix for iOS image filenames.
 *                                    - appleOutputPath: Directory for iOS icon output.
 *                                    - androidOutputPath: Directory for Android icon output.
 *                                    - androidOutputFilename: Desired filename for Android icons.
 *                                    - androidRootDimension: Base dimension for Android ratio calculations.
 * @return {void}
 */
var batchImageResizer = function (operationSettings, finalCompletion) {
    operationSettings = operationSettings || {};

    operationSettings.targetOsList = operationSettings.targetOsList || configurationPresets.TARGET_OS_LIST;
    operationSettings.sourceGraphicName = operationSettings.sourceGraphicName || configurationPresets.SOURCE_GRAPHIC_NAME;
    operationSettings.appleFileIdPrefix = operationSettings.appleFileIdPrefix || configurationPresets.APPLE_FILE_ID_PREFIX;
    operationSettings.appleOutputPath = operationSettings.appleOutputPath || configurationPresets.APPLE_OUTPUT_PATH;
    operationSettings.androidOutputPath = operationSettings.androidOutputPath || configurationPresets.ANDROID_OUTPUT_PATH;
    operationSettings.androidOutputFilename = operationSettings.androidOutputFilename || fileSystemPath.basename(operationSettings.sourceGraphicName);
    operationSettings.androidRootDimension = operationSettings.androidRootDimension || configurationPresets.ANDROID_ROOT_DIMENSION;

    var sourceDimensions = getImageDimensions(operationSettings.sourceGraphicName);
    operationSettings.initialSourceDimension = Math.max(sourceDimensions.width, sourceDimensions.height);

    // Load the platform-specific configuration data, either custom or default.
    operationSettings.configurationObject = (operationSettings.configurationObject) ? require(fileSystemPath.resolve(operationSettings.configurationObject)) : require('./default_config_data');

    flowControl.each(
        operationSettings.targetOsList,
        function (platformType, platformDone) {
            if (typeof platformProcessors[platformType] !== 'function') {
                return platformDone(new Error('The specified platform type "' + platformType + '" is currently unsupported.'));
            }
            platformProcessors[platformType](operationSettings, platformDone);
        },
        finalCompletion
    );
};

batchImageResizer.configurationPresets = configurationPresets;
module.exports = batchImageResizer;