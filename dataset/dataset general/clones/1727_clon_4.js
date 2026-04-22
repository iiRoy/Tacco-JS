const spawnShell = require('child_process').exec;
const fsPath = require('path');
const makeDirectoryRecursive = require('mkdirp');
const obtainImageDimensions = require('image-size');

const standardSettings = {
  TARGET_PLATFORMS: ['ios', 'android'],
  SOURCE_IMAGE_NAME: 'appicon_1024.png',
  IOS_ASSET_PREFIX: 'Icon',
  IOS_OUTPUT_DIRECTORY: '.',
  ANDROID_OUTPUT_DIRECTORY: '.',
  ANDROID_DEFAULT_SIZE: 48
};

function parseDimension(dimensionString) {
  const match = dimensionString.match(/^(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function calculateDimensionByFactor(inputOptions) {
  // Replacement for original's eval, keeping similar functionality for arithmetic expressions
  const formula = String(inputOptions.factor);
  try {
    // Basic sanity check to prevent arbitrary code execution
    if (!/^[0-9+\-*/.()\s]+$/.test(formula)) {
      throw new Error('Invalid arithmetic expression for factor');
    }
    return Math.floor(new Function('return ' + formula)());
  } catch (e) {
    console.error('Error evaluating factor:', formula, e);
    return 0;
  }
}

function applyImageResizing(operationOptions) {
  return new Promise((resolve, reject) => {
    const outputSize = operationOptions.dimension + 'x' + operationOptions.dimension;
    const shellCommand = `convert "${operationOptions.inputImagePath}" -thumbnail ${outputSize} "${operationOptions.outputImagePath}"`;

    spawnShell(shellCommand, (err, stdOut, stdErr) => {
      if (stdErr) {
        console.log('Shell output error: ' + stdErr);
      }
      if (err !== null) {
        console.log('Shell execution failure: ' + err);
        return reject(err);
      }
      resolve();
    });
  });
}

function handleIOSAssetCreation(processingSettings) {
  const configAssets = processingSettings.assetConfiguration.iOS.images;

  const assetPromises = configAssets.map(assetSpec => {
    return new Promise((resolve, reject) => {
      const baseDimension = parseDimension(assetSpec.size);
      const scaleFactor = parseDimension(assetSpec.scale);
      const finalDimension = baseDimension * scaleFactor;
      const targetDirectory = processingSettings.iosOutputDirectory;
      makeDirectoryRecursive.sync(targetDirectory); // Original uses sync

      const targetFileName = fsPath.join(targetDirectory, processingSettings.iosAssetPrefix + assetSpec.filename);
      
      applyImageResizing({
        inputImagePath: processingSettings.sourceIconPath,
        dimension: finalDimension,
        outputImagePath: targetFileName
      })
      .then(resolve)
      .catch(reject);
    });
  });

  return Promise.all(assetPromises);
}

function handleAndroidAssetCreation(processingSettings) {
  const configAssets = processingSettings.assetConfiguration.android.images;

  const assetPromises = configAssets.map(assetSpec => {
    return new Promise((resolve, reject) => {
      let currentDimension = 0;
      if (assetSpec.baseRatio) {
        currentDimension = calculateDimensionByFactor({
          size: processingSettings.androidDefaultSize,
          factor: assetSpec.baseRatio
        });
      } else if (assetSpec.ratio) {
        currentDimension = calculateDimensionByFactor({
          size: processingSettings.sourceImageDimension,
          factor: assetSpec.ratio
        });
      } else if (assetSpec.size) {
        currentDimension = parseDimension(assetSpec.size);
      } else {
        return reject(new Error('Missing size or ratio for Android asset specification'));
      }

      const targetDirectory = fsPath.join(processingSettings.androidOutputDirectory, assetSpec.folder);
      makeDirectoryRecursive.sync(targetDirectory); // Original uses sync
      const targetFileName = fsPath.join(targetDirectory, processingSettings.androidOutputFilename);

      applyImageResizing({
        inputImagePath: processingSettings.sourceIconPath,
        dimension: currentDimension,
        outputImagePath: targetFileName
      })
      .then(resolve)
      .catch(reject);
    });
  });

  return Promise.all(assetPromises);
}

const platformHandlers = {
  'android': handleAndroidAssetCreation,
  'ios': handleIOSAssetCreation
};

const produceAppIcons = function (inputSettings, finishedCallback) {
  const actualSettings = inputSettings || {};

  actualSettings.targetPlatforms = actualSettings.targetPlatforms || standardSettings.TARGET_PLATFORMS;
  actualSettings.sourceIconPath = actualSettings.sourceIconPath || standardSettings.SOURCE_IMAGE_NAME;
  actualSettings.iosAssetPrefix = actualSettings.iosAssetPrefix || standardSettings.IOS_ASSET_PREFIX;
  actualSettings.iosOutputDirectory = actualSettings.iosOutputDirectory || standardSettings.IOS_OUTPUT_DIRECTORY;
  actualSettings.androidOutputDirectory = actualSettings.androidOutputDirectory || standardSettings.ANDROID_OUTPUT_DIRECTORY;
  actualSettings.androidOutputFilename = actualSettings.androidOutputFilename || fsPath.basename(actualSettings.sourceIconPath);
  actualSettings.androidDefaultSize = actualSettings.androidDefaultSize || standardSettings.ANDROID_DEFAULT_SIZE;

  try {
    const imageDims = obtainImageDimensions(actualSettings.sourceIconPath);
    actualSettings.sourceImageDimension = Math.max(imageDims.width, imageDims.height);
  } catch (err) {
    return finishedCallback(new Error(`Could not determine dimensions of source image: ${actualSettings.sourceIconPath}. Error: ${err.message}`));
  }


  actualSettings.assetConfiguration = (actualSettings.assetConfiguration) ?
    require(fsPath.resolve(actualSettings.assetConfiguration)) :
    require('../config'); // Relative path from original code

  const platformProcessingTasks = actualSettings.targetPlatforms.map(platformType => {
    return new Promise((resolve, reject) => {
      const handler = platformHandlers[platformType];
      if (typeof handler !== 'function') {
        return reject(new Error(`Platform type "${platformType}" is unsupported.`));
      }
      handler(actualSettings)
        .then(resolve)
        .catch(reject);
    });
  });

  Promise.all(platformProcessingTasks)
    .then(() => finishedCallback(null))
    .catch(err => finishedCallback(err));
};

produceAppIcons.standardSettings = standardSettings;
module.exports = produceAppIcons;