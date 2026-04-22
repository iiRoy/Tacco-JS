var runCommand = require('child_process').exec;
var fileSystemPath = require('path');
var flowControl = require('async');
var ensureDirectory = require('mkdirp');
var getImageDimensions = require('image-size');

// Constants for image processing
const IMAGEMAGICK_TOOL = 'convert'; // Assumed ImageMagick is installed and in PATH

// Application-wide configuration defaults
const appConfigPresets = {
  TARGET_OS_LIST: ['ios', 'android'],
  SOURCE_IMAGE_NAME: 'app_icon_source_1024.png',
  APPLE_ICON_PREFIX: 'AppIcon',
  APPLE_OUTPUT_DIR: './ios_assets',
  ANDROID_OUTPUT_DIR: './android_res',
  ANDROID_REFERENCE_SIZE: 48 // Base size in dp for Android scaling
};

/**
 * A simple logger utility. Could be expanded for more advanced logging.
 */
const appLogger = {
  info: (message) => console.log(`[INFO] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`)
};

/**
 * Extracts the first numeric value from a string, typically used for dimensions like "29x29" or "2x".
 * Returns 0 if no valid number is found or input is invalid.
 * @param {string} inputString - The string to parse.
 * @returns {number} The extracted numeric value.
 */
function extractNumericValue(inputString) {
  if (typeof inputString !== 'string' || inputString.length === 0) {
    appLogger.warn('Attempted to extract numeric value from invalid input. Returning 0.');
    return 0;
  }
  const match = inputString.match(/^\d+/); // Matches one or more digits at the start
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Calculates a target dimension based on a base dimension and a scaling factor.
 * Ensures the scaling factor is a valid number.
 * @param {object} params - Object containing calculation parameters.
 * @param {number} params.baseDimension - The base size in pixels.
 * @param {string|number} params.scalingFactor - The ratio to apply (e.g., "1.5" or 1.5).
 * @returns {number} The computed scaled dimension, rounded down to the nearest integer.
 */
function calculateScaledDimension(params) {
  if (!params || typeof params.baseDimension !== 'number' || typeof params.scalingFactor === 'undefined') {
    appLogger.error('Invalid parameters for calculateScaledDimension. Check baseDimension and scalingFactor.');
    return 0;
  }

  // Safely parse the scaling factor, avoiding eval
  let factor = parseFloat(params.scalingFactor);
  if (isNaN(factor)) {
    appLogger.warn(`Invalid scaling factor '${params.scalingFactor}' provided. Using 1.0.`);
    factor = 1.0;
  }

  return Math.floor(params.baseDimension * factor);
}

/**
 * Executes an ImageMagick 'convert' command to resize an image.
 *
 * @param {object} commandOpts - Configuration for the resize operation.
 * @param {string} commandOpts.inputImagePath - Path to the source image file.
 * @param {number} commandOpts.targetPixelSize - The desired dimension (width and height will be square).
 * @param {string} commandOpts.outputImagePath - Path where the resized image will be saved.
 * @param {Function} completionHandler - Callback function (error) when processing is done.
 */
function performImageResizing(commandOpts, completionHandler) {
  if (!commandOpts || !commandOpts.inputImagePath || !commandOpts.targetPixelSize || !commandOpts.outputImagePath) {
    const errMsg = 'Missing required options for image resizing command.';
    appLogger.error(errMsg);
    return completionHandler(new Error(errMsg));
  }

  const dimensionSpec = `${commandOpts.targetPixelSize}x${commandOpts.targetPixelSize}`;
  const shellInstruction = `${IMAGEMAGICK_TOOL} "${commandOpts.inputImagePath}" -thumbnail ${dimensionSpec} -quality 95 "${commandOpts.outputImagePath}"`;

  appLogger.info(`Executing resize: ${shellInstruction}`);

  runCommand(shellInstruction, (operationError, standardOutput, standardError) => {
    if (standardError) {
      appLogger.warn(`ImageMagick STDERR: ${standardError.trim()}`);
    }
    if (operationError) {
      appLogger.error(`Command execution failed: ${operationError.message}`);
    }
    completionHandler(operationError);
  });
}

/**
 * Processes configurations for Apple (iOS) application icons.
 *
 * @param {object} processingSettings - Settings for iOS icon generation.
 * @param {object} processingSettings.projectConfiguration - The full project configuration.
 * @param {string} processingSettings.sourceImageFilename - Path to the original icon image.
 * @param {string} processingSettings.appleIconPrefix - Prefix for iOS icon filenames.
 * @param {string} processingSettings.appleOutputDirectory - Base output directory for iOS icons.
 * @param {Function} completionHandler - Callback function (error) when all iOS icons are processed.
 */
function processAppleIcons(processingSettings, completionHandler) {
  if (!processingSettings || !processingSettings.projectConfiguration || !processingSettings.projectConfiguration.apple || !processingSettings.projectConfiguration.apple.iconDefinitions) {
    return completionHandler(new Error('Invalid or incomplete Apple icon configuration provided.'));
  }

  const iconSpecifications = processingSettings.projectConfiguration.apple.iconDefinitions;

  // Handles a single iOS icon specification.
  const handleSingleAppleIcon = (iconSpec, nextItem) => {
    if (!iconSpec || !iconSpec.size || !iconSpec.scale || !iconSpec.filename) {
      appLogger.warn('Skipping malformed Apple icon definition:', iconSpec);
      return nextItem(); // Skip this one, don't block
    }

    const baseIconDimension = extractNumericValue(iconSpec.size);
    const displayScale = extractNumericValue(iconSpec.scale);
    const computedPixelSize = baseIconDimension * displayScale;

    // Ensure output directory exists for this platform
    const platformOutputDir = processingSettings.appleOutputDirectory;
    try {
      ensureDirectory.sync(platformOutputDir);
    } catch (dirErr) {
      return nextItem(new Error(`Failed to create iOS output directory '${platformOutputDir}': ${dirErr.message}`));
    }

    const outputFileName = `${processingSettings.appleIconPrefix}${iconSpec.filename}`;
    const outputFilePath = fileSystemPath.join(platformOutputDir, outputFileName);

    performImageResizing(
      {
        inputImagePath: processingSettings.sourceImageFilename,
        targetPixelSize: computedPixelSize,
        outputImagePath: outputFilePath
      },
      nextItem // Pass through the callback
    );
  };

  flowControl.each(
    iconSpecifications,
    handleSingleAppleIcon,
    completionHandler
  );
}

/**
 * Processes configurations for Android application icons.
 *
 * @param {object} processingSettings - Settings for Android icon generation.
 * @param {object} processingSettings.projectConfiguration - The full project configuration.
 * @param {string} processingSettings.sourceImageFilename - Path to the original icon image.
 * @param {string} processingSettings.androidOutputDirectory - Base output directory for Android icons.
 * @param {string} processingSettings.androidIconOutputFilename - Desired filename for Android icons (e.g., ic_launcher.png).
 * @param {number} processingSettings.androidReferenceSize - Base dimension in dp for Android scaling.
 * @param {number} processingSettings.sourceImageLargestDimension - Largest dimension of the source image in pixels.
 * @param {Function} completionHandler - Callback function (error) when all Android icons are processed.
 */
function processAndroidIcons(processingSettings, completionHandler) {
  if (!processingSettings || !processingSettings.projectConfiguration || !processingSettings.projectConfiguration.google || !processingSettings.projectConfiguration.google.iconConfigurations) {
    return completionHandler(new Error('Invalid or incomplete Android icon configuration provided.'));
  }

  const iconConfigurations = processingSettings.projectConfiguration.google.iconConfigurations;

  // Handles a single Android icon configuration.
  const handleSingleAndroidIcon = (iconSpec, nextItem) => {
    let targetPixelSize = 0;

    // Determine the target size based on available ratios or explicit size
    if (iconSpec.baseScalingRatio) {
      targetPixelSize = calculateScaledDimension({
        baseDimension: processingSettings.androidReferenceSize,
        scalingFactor: iconSpec.baseScalingRatio
      });
    } else if (iconSpec.sourceRatio) {
      targetPixelSize = calculateScaledDimension({
        baseDimension: processingSettings.sourceImageLargestDimension,
        scalingFactor: iconSpec.sourceRatio
      });
    } else if (iconSpec.explicitSize) {
      targetPixelSize = extractNumericValue(iconSpec.explicitSize);
    } else {
      return nextItem(new Error(`Android icon definition missing valid sizing property (baseScalingRatio, sourceRatio, or explicitSize): ${JSON.stringify(iconSpec)}`));
    }

    if (targetPixelSize <= 0) {
      appLogger.warn(`Calculated target pixel size for Android icon is non-positive (${targetPixelSize}). Skipping:`, iconSpec);
      return nextItem();
    }

    // Construct the full output path for the icon
    const outputBaseFolder = fileSystemPath.join(processingSettings.androidOutputDirectory, iconSpec.destinationFolder);
    try {
      ensureDirectory.sync(outputBaseFolder); // Create directory if it doesn't exist
    } catch (dirErr) {
      return nextItem(new Error(`Failed to create Android output directory '${outputBaseFolder}': ${dirErr.message}`));
    }

    const outputFilePath = fileSystemPath.join(outputBaseFolder, processingSettings.androidIconOutputFilename);

    performImageResizing(
      {
        inputImagePath: processingSettings.sourceImageFilename,
        targetPixelSize: targetPixelSize,
        outputImagePath: outputFilePath
      },
      nextItem
    );
  };

  flowControl.each(
    iconConfigurations,
    handleSingleAndroidIcon,
    completionHandler
  );
}

// Map platform keys to their respective processing functions
const platformProcessors = {
  'android': processAndroidIcons,
  'ios': processAppleIcons
};

/**
 * Utility to merge default options with user-provided options.
 * @param {object} userOptions - Options provided by the user.
 * @returns {object} Merged options.
 */
function applyDefaultOptions(userOptions) {
  const mergedOptions = { ...userOptions }; // Shallow copy

  mergedOptions.platformsToBuild = mergedOptions.platformsToBuild || appConfigPresets.TARGET_OS_LIST;
  mergedOptions.sourceImageFilename = mergedOptions.sourceImageFilename || appConfigPresets.SOURCE_IMAGE_NAME;
  mergedOptions.appleIconPrefix = mergedOptions.appleIconPrefix || appConfigPresets.APPLE_ICON_PREFIX;
  mergedOptions.appleOutputDirectory = mergedOptions.appleOutputDirectory || appConfigPresets.APPLE_OUTPUT_DIR;
  mergedOptions.androidOutputDirectory = mergedOptions.androidOutputDirectory || appConfigPresets.ANDROID_OUTPUT_DIR;
  mergedOptions.androidIconOutputFilename = mergedOptions.androidIconOutputFilename || fileSystemPath.basename(mergedOptions.sourceImageFilename);
  mergedOptions.androidReferenceSize = mergedOptions.androidReferenceSize || appConfigPresets.ANDROID_REFERENCE_SIZE;

  return mergedOptions;
}

/**
 * Main function to orchestrate the generation of application icons for various platforms.
 * This function handles option parsing, image dimension calculation, and dispatches to platform-specific handlers.
 *
 * @param {object} userSettings - User-defined settings for icon generation.
 * @param {string|Array<string>} [userSettings.platformsToBuild] - List of platforms to target (e.g., ['ios', 'android']).
 * @param {string} [userSettings.sourceImageFilename] - Path to the high-resolution source image.
 * @param {string} [userSettings.appleIconPrefix] - Prefix for iOS icon filenames.
 * @param {string} [userSettings.appleOutputDirectory] - Output folder for iOS icons.
 * @param {string} [userSettings.androidOutputDirectory] - Output folder for Android icons.
 * @param {string} [userSettings.androidIconOutputFilename] - Filename for Android icons (e.g., ic_launcher.png).
 * @param {number} [userSettings.androidReferenceSize] - Base DP size for Android scaling.
 * @param {string|object} [userSettings.projectConfiguration] - Path to a custom config file or a config object directly.
 * @param {Function} completionHandler - Callback function (error) invoked when all icon generation is complete.
 */
var generateAppIcons = function (userSettings, completionHandler) {
  // Ensure userSettings is an object and apply defaults
  const currentSettings = applyDefaultOptions(userSettings || {});

  // Input validation for source image file
  if (!currentSettings.sourceImageFilename) {
    return completionHandler(new Error('Source image filename is not defined. Please check settings.'));
  }
  
  appLogger.info(`Starting icon generation from: ${currentSettings.sourceImageFilename}`);

  // Calculate original image dimensions
  let originalImageMetrics;
  try {
    originalImageMetrics = getImageDimensions(currentSettings.sourceImageFilename);
  } catch (dimErr) {
    return completionHandler(new Error(`Failed to get dimensions of source image: ${dimErr.message}`));
  }

  // Store the largest dimension for ratio calculations
  currentSettings.sourceImageLargestDimension = Math.max(originalImageMetrics.width, originalImageMetrics.height);
  if (currentSettings.sourceImageLargestDimension <= 0) {
    return completionHandler(new Error('Source image dimensions are invalid or zero.'));
  }

  // Load the configuration for specific icon definitions
  if (typeof currentSettings.projectConfiguration === 'string') {
    try {
      const configPath = fileSystemPath.resolve(currentSettings.projectConfiguration);
      currentSettings.projectConfiguration = require(configPath);
      appLogger.info(`Loaded custom configuration from: ${configPath}`);
    } catch (configLoadErr) {
      return completionHandler(new Error(`Failed to load custom configuration from '${currentSettings.projectConfiguration}': ${configLoadErr.message}`));
    }
  } else if (!currentSettings.projectConfiguration) {
    // If no custom config specified, load the default one
    try {
      currentSettings.projectConfiguration = require('./config'); // Assuming 'config.js' is relative to this file
      appLogger.info('Loaded default application configuration.');
    } catch (defaultConfigErr) {
      appLogger.warn(`Could not load default config: ${defaultConfigErr.message}. Proceeding without specific icon definitions.`);
      currentSettings.projectConfiguration = { apple: { iconDefinitions: [] }, google: { iconConfigurations: [] } };
    }
  }

  // Ensure platformsToBuild is an array
  let platformsToProcess = Array.isArray(currentSettings.platformsToBuild) ? currentSettings.platformsToBuild : [currentSettings.platformsToBuild];
  platformsToProcess = platformsToProcess.filter(p => p); // Remove any null/undefined entries

  if (platformsToProcess.length === 0) {
      appLogger.warn('No platforms specified for building. Exiting.');
      return completionHandler(null); // No error, just nothing to do
  }


  // Iterate over each specified platform and execute its processor
  flowControl.eachSeries( // Using eachSeries to process platforms sequentially
    platformsToProcess,
    (platformKey, nextPlatform) => {
      const processorFunction = platformProcessors[platformKey];
      if (typeof processorFunction !== 'function') {
        appLogger.warn(`Platform type "${platformKey}" is not supported or has no registered processor. Skipping.`);
        return nextPlatform(); // Continue to the next platform
      }
      appLogger.info(`Processing icons for platform: ${platformKey}`);
      processorFunction(currentSettings, nextPlatform);
    },
    completionHandler // Final callback after all platforms are processed
  );
};

// Expose the default configuration presets
generateAppIcons.presets = appConfigPresets;

// Export the main function
module.exports = generateAppIcons;