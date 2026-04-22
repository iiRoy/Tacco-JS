const classifierDefinition = require('./cascade.js');
const OffscreenCanvasAPI = require('canvas');

/**
 * A utility function to intelligently parse invocation arguments.
 * If multiple arguments are supplied, they are mapped to predefined keys.
 * If a single argument is supplied, it is assumed to be an options object.
 * This provides flexibility for function calls.
 * @param {IArguments} rawArgs - The `arguments` object from the calling function.
 * @param {string[]} argKeys - An array of string keys to map positional arguments to.
 * @returns {object} An object containing the parsed arguments.
 */
const parseInvocationArgs = (rawArgs, argKeys) => {
  // Defensive check: ensure rawArgs is iterable.
  if (!Array.isArray(rawArgs)) {
    console.error("Invalid arguments: Expected an array-like structure for rawArgs.");
    return {}; // Return empty object on error.
  }

  const totalArgs = rawArgs.length;

  if (totalArgs > 1) {
    // When multiple arguments are passed, create an object by mapping them to provided keys.
    // This assumes a positional mapping.
    return argKeys.reduce((acc, currentKey, index) => {
      // Only assign if a corresponding value exists in rawArgs.
      if (index < rawArgs.length) {
        acc[currentKey] = rawArgs[index];
      }
      return acc;
    }, {});
  } else if (totalArgs === 1) {
    // If only one argument is provided, it's likely an options object itself.
    // Perform a shallow copy to prevent external modification issues.
    return { ...rawArgs[0] };
  } else {
    // No arguments, return an empty configuration.
    return {};
  }
};

/**
 * Converts a given canvas image to a grayscale representation.
 * It returns a new canvas with the grayscaled image.
 * @param {OffscreenCanvasAPI.Canvas} sourceCanvas - The input canvas to be grayscaled.
 * @returns {OffscreenCanvasAPI.Canvas} A new canvas containing the grayscale image.
 */
const convertCanvasToGrayscale = (sourceCanvas) => {
  // Input validation: Ensure a valid canvas object is provided.
  if (!sourceCanvas || typeof sourceCanvas.getContext !== 'function') {
    console.error("Invalid canvas provided for grayscale conversion. Returning a dummy canvas.");
    return new OffscreenCanvasAPI.Canvas(1, 1); // Return a minimal canvas to avoid further errors.
  }

  const { width: imgWidth, height: imgHeight } = sourceCanvas;
  const sourceContext = sourceCanvas.getContext("2d");

  // Retrieve the original image data from the source canvas.
  const originalImageData = sourceContext.getImageData(0, 0, imgWidth, imgHeight);
  const inputPixelData = originalImageData.data; // Raw pixel array (RGBA)

  // Create a new canvas to store the grayscale result.
  const grayscaleCanvas = new OffscreenCanvasAPI.Canvas(imgWidth, imgHeight);
  const grayscaleContext = grayscaleCanvas.getContext("2d");

  // Create a new ImageData object for the grayscale canvas.
  const grayscaleImageData = grayscaleContext.createImageData(imgWidth, imgHeight);
  const outputPixelData = grayscaleImageData.data; // Raw pixel array for output

  // Process each pixel to convert to grayscale.
  // The loop iterates backwards over the pixel data array, processing 4 components (RGBA) at a time.
  // Grayscale conversion: Y = 0.299*R + 0.587*G + 0.114*B (standard luminance formula).
  // The original code uses 0.3, 0.59, 0.11 which is a common approximation.
  for (let i = imgWidth * imgHeight * 4 - 4; i >= 0; i -= 4) {
    const red = inputPixelData[i];
    const green = inputPixelData[i + 1];
    const blue = inputPixelData[i + 2];

    // Calculate the grayscale value using a weighted average.
    const grayValue = Math.floor(red * 0.3 + green * 0.59 + blue * 0.11);

    // Set the R, G, B channels of the output pixel to the calculated grayscale value.
    outputPixelData[i] = grayValue;     // Red channel
    outputPixelData[i + 1] = grayValue; // Green channel
    outputPixelData[i + 2] = grayValue; // Blue channel
    outputPixelData[i + 3] = 255;       // Alpha channel (fully opaque)
  }

  // Put the processed image data back onto the grayscale canvas.
  grayscaleContext.putImageData(grayscaleImageData, 0, 0);

  return grayscaleCanvas; // Return the newly created grayscale canvas.
};

/**
 * Implements a Disjoint Set Union (DSU) data structure to group elements
 * based on a custom similarity function. It's often used for clustering detections.
 * @param {Array<object>} sequence - The array of elements to group.
 * @param {function(object, object): boolean} similarityCheckFn - A function that returns true if two elements are similar.
 * @returns {{groupIndices: number[], groupCount: number}} An object containing an array of group indices for each element
 *   and the total number of unique groups found.
 */
const groupSimilarElements = (sequence, similarityCheckFn) => {
  // Validate input sequence and grouping function.
  if (!Array.isArray(sequence)) {
    console.error("Input 'sequence' must be an array.");
    return { groupIndices: [], groupCount: 0 };
  }
  if (typeof similarityCheckFn !== 'function') {
    console.error("Input 'similarityCheckFn' must be a function.");
    return { groupIndices: [], groupCount: 0 };
  }

  const sequenceLength = sequence.length;
  // Initialize DSU nodes: each element is initially in its own set.
  // parent: stores the parent index, -1 if it's a root.
  // dataItem: reference to the original element.
  // treeRank: used for union by rank optimization.
  const dsuNodes = sequence.map(item => ({
    parent: -1,
    dataItem: item,
    treeRank: 0,
  }));

  // Helper function to find the root of a set and perform path compression.
  const findSetRoot = (nodeIndex) => {
    // If current node is the root, return its index.
    if (dsuNodes[nodeIndex].parent === -1) {
      return nodeIndex;
    }
    // Path compression: set parent to root of parent.
    dsuNodes[nodeIndex].parent = findSetRoot(dsuNodes[nodeIndex].parent);
    return dsuNodes[nodeIndex].parent;
  };

  // Iterate through all pairs to find and union similar elements.
  for (let i = 0; i < sequenceLength; i++) {
    // Skip if the element is marked as non-existent (e.g., already processed/invalidated).
    if (!dsuNodes[i].dataItem) {
      continue;
    }

    const rootOfI = findSetRoot(i); // Find the representative of the current element's set.

    for (let j = 0; j < sequenceLength; j++) {
      // Ensure distinct elements and valid data items.
      if (i !== j && dsuNodes[j].dataItem && similarityCheckFn(dsuNodes[i].dataItem, dsuNodes[j].dataItem)) {
        const rootOfJ = findSetRoot(j); // Find the representative of the other element's set.

        // If roots are different, union the two sets.
        if (rootOfJ !== rootOfI) {
          // Union by rank heuristic: attach smaller rank tree under root of larger rank tree.
          if (dsuNodes[rootOfI].treeRank > dsuNodes[rootOfJ].treeRank) {
            dsuNodes[rootOfJ].parent = rootOfI;
          } else {
            dsuNodes[rootOfI].parent = rootOfJ;
            if (dsuNodes[rootOfI].treeRank === dsuNodes[rootOfJ].treeRank) {
              dsuNodes[rootOfJ].treeRank++; // Increment rank if ranks were equal.
            }
          }
        }
      }
    }
  }

  const finalGroupIndices = new Array(sequenceLength).fill(-1);
  let currentGroupIdentifier = 0; // Counter for unique group IDs.

  // Assign final group identifiers and compress paths one last time.
  for (let i = 0; i < sequenceLength; i++) {
    let elementGroupIndex = -1;
    // Only process if the element exists.
    if (dsuNodes[i].dataItem) {
      // Find the absolute root of this element.
      const trueRootIndex = findSetRoot(i);

      // If this root hasn't been assigned a group ID yet.
      if (dsuNodes[trueRootIndex].treeRank >= 0) { // Using rank >= 0 as a flag for unassigned.
        // Assign a new negative group ID (original used bitwise NOT for distinction).
        dsuNodes[trueRootIndex].treeRank = ~currentGroupIdentifier++;
      }
      // Assign the derived group ID (bitwise NOT back to positive).
      elementGroupIndex = ~dsuNodes[trueRootIndex].treeRank;
    }
    finalGroupIndices[i] = elementGroupIndex;
  }

  return { groupIndices: finalGroupIndices, groupCount: currentGroupIdentifier };
};

/**
 * Main function to detect objects within a canvas using a Viola-Jones-like cascade classifier.
 * It processes the input image through a pyramid, scans for features, and clusters detections.
 * @param {OffscreenCanvasAPI.Canvas} inputCanvas - The canvas element containing the image to analyze.
 * @param {object} [options] - Configuration options for detection.
 * @param {number} [options.scalingInterval=1] - Determines the interval for scaling the image pyramid.
 * @param {number} [options.minNeighbors=0] - Minimum number of overlapping detections required to form a valid group.
 * @param {object} [options.classifierConfig] - The loaded cascade classifier configuration.
 * @returns {Array<object>} An array of detected objects, each with x, y, width, height, groupNeighbors, and detectionScore.
 */
const performObjectDetection = (inputCanvas, intervalArg, minNeighborsArg) => {
  // Input argument parsing: Use the helper to handle flexible arguments.
  const detectionOptions = ComputerVisionToolkit.parseInvocationArgs(
    arguments,
    ["sourceCanvas", "scalingInterval", "minimumNeighbors"]
  );

  // Apply default values if not explicitly provided or extracted.
  const sourceCanvas = detectionOptions.sourceCanvas || inputCanvas;
  let scalingInterval = detectionOptions.scalingInterval !== undefined ? detectionOptions.scalingInterval : intervalArg;
  let minimumNeighbors = detectionOptions.minimumNeighbors !== undefined ? detectionOptions.minimumNeighbors : minNeighborsArg;
  const activeClassifier = detectionOptions.classifierConfig || classifierDefinition; // Use imported classifier.

  // Basic input validation and default assignment (Type III: guard clauses, updated statements).
  if (!sourceCanvas || typeof sourceCanvas.getContext !== 'function') {
    console.error("Object detection: A valid source canvas is required.");
    return [];
  }
  if (!activeClassifier || !activeClassifier.stage_classifier || !Array.isArray(activeClassifier.stage_classifier)) {
    console.error("Object detection: A valid classifier configuration is required.");
    return [];
  }
  if (typeof scalingInterval !== 'number' || scalingInterval <= 0) {
    console.warn("Object detection: Invalid scaling interval provided. Defaulting to 1.");
    scalingInterval = 1; // Defaulting.
  }
  if (typeof minimumNeighbors !== 'number' || minimumNeighbors < 0) {
    console.warn("Object detection: Invalid minimum neighbors provided. Defaulting to 0 (no grouping).");
    minimumNeighbors = 0; // Defaulting.
  }

  // Pre-process the input canvas: convert to grayscale using our own utility.
  const grayscaleImage = ComputerVisionToolkit.convertCanvasToGrayscale(sourceCanvas);

  // Initialize core detection parameters.
  const currentDetectionState = {
    processedCanvas: grayscaleImage,
    classifier: activeClassifier,
    interval: scalingInterval,
    minNeighbors: minimumNeighbors,
    scaleStep: scalingInterval + 1, // Corresponds to `next` in original.
    scaleFactor: Math.pow(2, 1 / (scalingInterval + 1)), // Scaling factor for pyramid levels.
  };

  // Determine the maximum number of pyramid levels based on canvas and classifier dimensions.
  const minDimensionRatio = Math.min(
    grayscaleImage.width / activeClassifier.width,
    grayscaleImage.height / activeClassifier.height
  );
  currentDetectionState.maxScaleLevels = Math.floor(
    Math.log(minDimensionRatio) / Math.log(currentDetectionState.scaleFactor)
  );

  // Store original feature configurations for the classifier stages.
  // This is a setup step to allow feature modification during scanning and then restoration.
  activeClassifier.stage_classifier.forEach(stage => {
    stage.cachedFeatures = stage.feature; // Store reference to original features.
  });

  // --- Image Pyramid Generation (Internal Helper, formerly 'pre') ---
  const createImagePyramid = () => {
    const { processedCanvas, interval, scaleFactor, scaleStep, maxScaleLevels } = currentDetectionState;

    // The pyramid will store objects, each containing a canvas and its imageData.
    // The size `(maxScaleLevels + scaleStep * 2) * 4` is derived from the original `pyr` array size.
    const pyramidLevels = new Array((maxScaleLevels + scaleStep * 2) * 4);

    // Level 0: The original grayscale canvas itself.
    pyramidLevels[0] = {
      canvas: processedCanvas,
      width: processedCanvas.width,
      height: processedCanvas.height,
      imageData: processedCanvas.getContext("2d").getImageData(0, 0, processedCanvas.width, processedCanvas.height),
    };

    // Generate initial scaled versions (first 'interval' levels).
    // These scales are powers of `scaleFactor` applied to the original image.
    for (let i = 1; i <= interval; i++) {
      const currentScale = Math.pow(scaleFactor, i);
      const scaledWidth = Math.floor(processedCanvas.width / currentScale);
      const scaledHeight = Math.floor(processedCanvas.height / currentScale);

      const newScaledCanvas = new OffscreenCanvasAPI.Canvas(scaledWidth, scaledHeight);
      newScaledCanvas.getContext("2d").drawImage(processedCanvas, 0, 0, processedCanvas.width, processedCanvas.height, 0, 0, scaledWidth, scaledHeight);

      pyramidLevels[i * 4] = {
        canvas: newScaledCanvas,
        width: scaledWidth,
        height: scaledHeight,
        imageData: newScaledCanvas.getContext("2d").getImageData(0, 0, scaledWidth, scaledHeight),
      };
    }

    // Generate further downsampled versions (factor of 2 from previous levels).
    // These levels are used for different sampling offsets within the cascade.
    for (let i = scaleStep; i < maxScaleLevels + scaleStep * 2; i++) {
      const sourcePyramidIndex = i * 4 - scaleStep * 4; // Source is `scaleStep` levels back (e.g., 2 levels if interval=1).
      const sourceCanvasForDownsample = pyramidLevels[sourcePyramidIndex].canvas;

      const downsampledWidth = Math.floor(sourceCanvasForDownsample.width / 2);
      const downsampledHeight = Math.floor(sourceCanvasForDownsample.height / 2);

      const downsampledCanvas = new OffscreenCanvasAPI.Canvas(downsampledWidth, downsampledHeight);
      downsampledCanvas.getContext("2d").drawImage(sourceCanvasForDownsample, 0, 0, sourceCanvasForDownsample.width, sourceCanvasForDownsample.height, 0, 0, downsampledWidth, downsampledHeight);

      pyramidLevels[i * 4] = {
        canvas: downsampledCanvas,
        width: downsampledWidth,
        height: downsampledHeight,
        imageData: downsampledCanvas.getContext("2d").getImageData(0, 0, downsampledWidth, downsampledHeight),
      };
    }

    // Generate 1-pixel shifted, 2x downsampled versions for sub-pixel accuracy.
    // The original code uses specific `drawImage` parameters for cropping.
    for (let i = scaleStep * 2; i < maxScaleLevels + scaleStep * 2; i++) {
      const basePyramidIndex = i * 4 - scaleStep * 4; // Source is `scaleStep` levels back.
      const baseCanvasForShift = pyramidLevels[basePyramidIndex].canvas;

      const shiftedTargetWidth = Math.floor(baseCanvasForShift.width / 2);
      const shiftedTargetHeight = Math.floor(baseCanvasForShift.height / 2);

      // Helper to draw shifted image, accounting for potential 1-pixel crop.
      const drawShiftedImage = (srcX, srcY, srcW, srcH, destW, destH) => {
        const shiftedCanvas = new OffscreenCanvasAPI.Canvas(shiftedTargetWidth, shiftedTargetHeight);
        const ctx = shiftedCanvas.getContext("2d");
        ctx.drawImage(
          baseCanvasForShift, srcX, srcY, srcW, srcH,
          0, 0, destW, destH
        );
        return {
          canvas: shiftedCanvas,
          width: shiftedTargetWidth,
          height: shiftedTargetHeight,
          imageData: ctx.getImageData(0, 0, shiftedTargetWidth, shiftedTargetHeight),
        };
      };

      // Shifted by (1,0)
      pyramidLevels[i * 4 + 1] = drawShiftedImage(
        1, 0, baseCanvasForShift.width - 1, baseCanvasForShift.height,
        shiftedTargetWidth - (shiftedTargetWidth > 0 ? 1 : 0), shiftedTargetHeight
      );

      // Shifted by (0,1)
      pyramidLevels[i * 4 + 2] = drawShiftedImage(
        0, 1, baseCanvasForShift.width, baseCanvasForShift.height - 1,
        shiftedTargetWidth, shiftedTargetHeight - (shiftedTargetHeight > 0 ? 1 : 0)
      );

      // Shifted by (1,1)
      pyramidLevels[i * 4 + 3] = drawShiftedImage(
        1, 1, baseCanvasForShift.width - 1, baseCanvasForShift.height - 1,
        shiftedTargetWidth - (shiftedTargetWidth > 0 ? 1 : 0), shiftedTargetHeight - (shiftedTargetHeight > 0 ? 1 : 0)
      );
    }
    return pyramidLevels;
  };

  // --- Feature Scanning and Classification (Internal Helper, formerly 'core') ---
  const scanPyramidForCandidateObjects = (imagePyramidData) => {
    const { classifier, scaleStep, maxScaleLevels, scaleFactor } = currentDetectionState;

    let currentOverallScaleX = 1;
    let currentOverallScaleY = 1;
    const candidateDetections = [];

    // Offsets for the 4 shifted pyramid levels (dx, dy in original).
    const pixelShiftX = [0, 1, 0, 1];
    const pixelShiftY = [0, 0, 1, 1];

    for (let levelIdx = 0; levelIdx < maxScaleLevels; levelIdx++) {
      // The current pyramid level for calculation is `i * 4 + next * 8` in original.
      // This corresponds to a deeply downsampled level.
      const currentPyramidLevel = imagePyramidData[levelIdx * 4 + scaleStep * 8];
      const effectiveScanWidth = currentPyramidLevel.width - Math.floor(classifier.width / 4);
      const effectiveScanHeight = currentPyramidLevel.height - Math.floor(classifier.height / 4);

      // Pre-calculate pixel data steps for navigating the raw `Uint8ClampedArray`.
      // These steps are specific to the 3 pyramid levels used for feature calculation.
      const dataRowSteps = [
        imagePyramidData[levelIdx * 4].width * 4, // Full resolution
        imagePyramidData[levelIdx * 4 + scaleStep * 4].width * 4, // Half resolution
        imagePyramidData[levelIdx * 4 + scaleStep * 8].width * 4, // Quarter resolution
      ];

      // Pre-calculate padding to jump to the next row in pixel data for each level.
      const dataRowPaddings = [
        imagePyramidData[levelIdx * 4].width * 16 - effectiveScanWidth * 16,
        imagePyramidData[levelIdx * 4 + scaleStep * 4].width * 8 - effectiveScanWidth * 8,
        imagePyramidData[levelIdx * 4 + scaleStep * 8].width * 4 - effectiveScanWidth * 4,
      ];

      // Prepare classifier features for the current pyramid level.
      // This involves re-calculating pixel offsets within the raw image data.
      classifier.stage_classifier.forEach(stage => {
        stage.processedFeatures = stage.cachedFeatures.map(originalFeature => {
          const transformedFeature = {
            size: originalFeature.size,
            px: new Array(originalFeature.size),
            pz: new Array(originalFeature.size),
            nx: new Array(originalFeature.size),
            nz: new Array(originalFeature.size),
          };
          for (let k = 0; k < originalFeature.size; k++) {
            // Recalculate pixel offsets based on the `dataRowSteps` for the current pyramid level.
            transformedFeature.px[k] = originalFeature.px[k] * 4 + originalFeature.py[k] * dataRowSteps[originalFeature.pz[k]];
            transformedFeature.pz[k] = originalFeature.pz[k];
            transformedFeature.nx[k] = originalFeature.nx[k] * 4 + originalFeature.ny[k] * dataRowSteps[originalFeature.nz[k]];
            transformedFeature.nz[k] = originalFeature.nz[k];
          }
          return transformedFeature;
        });
      });

      // Iterate through the 4 sub-pixel shifted versions of the current pyramid level.
      for (let shiftVariant = 0; shiftVariant < 4; shiftVariant++) {
        // Get the pixel data arrays for the three relevant pyramid levels.
        const currentPixelDataSources = [
          imagePyramidData[levelIdx * 4].imageData.data,
          imagePyramidData[levelIdx * 4 + scaleStep * 4].imageData.data,
          imagePyramidData[levelIdx * 4 + scaleStep * 8 + shiftVariant].imageData.data,
        ];

        // Initialize pixel offsets for the current shifted variant.
        let currentPixelDataOffsets = [
          pixelShiftX[shiftVariant] * 8 + pixelShiftY[shiftVariant] * imagePyramidData[levelIdx * 4].width * 8,
          pixelShiftX[shiftVariant] * 4 + pixelShiftY[shiftVariant] * imagePyramidData[levelIdx * 4 + scaleStep * 4].width * 4,
          0, // The deepest pyramid level already accounts for shift in its construction.
        ];

        // Scan across the image for potential object detections.
        for (let yCoord = 0; yCoord < effectiveScanHeight; yCoord++) {
          for (let xCoord = 0; xCoord < effectiveScanWidth; xCoord++) {
            let currentStageAccumulator = 0;
            let detectionWindowPassedAllStages = true;

            // Evaluate the detection window against each stage of the cascade classifier.
            for (let stageIndex = 0; stageIndex < classifier.stage_classifier.length; stageIndex++) {
              const currentClassifierStage = classifier.stage_classifier[stageIndex];
              currentStageAccumulator = 0; // Reset sum for current stage.
              const stageAlphas = currentClassifierStage.alpha;
              const stageFeatures = currentClassifierStage.processedFeatures;

              // Evaluate each feature within the current stage.
              for (let featureIndex = 0; featureIndex < currentClassifierStage.count; featureIndex++) {
                const feature = stageFeatures[featureIndex];

                // Retrieve initial pixel values for positive and negative regions of the feature.
                let positiveMinPixel = currentPixelDataSources[feature.pz[0]][currentPixelDataOffsets[feature.pz[0]] + feature.px[0]];
                let negativeMaxPixel = currentPixelDataSources[feature.nz[0]][currentPixelDataOffsets[feature.nz[0]] + feature.nx[0]];

                if (positiveMinPixel <= negativeMaxPixel) {
                  currentStageAccumulator += stageAlphas[featureIndex * 2]; // Feature indicates negative.
                } else {
                  let pathOptimizationApplied = true; // Flag for shortcut path.
                  // If initial check passes, perform a more detailed comparison across all feature points.
                  for (let pointIndex = 0; pointIndex < feature.size; pointIndex++) {
                    let currentPosPixel, currentNegPixel;
                    if (feature.pz[pointIndex] >= 0) {
                      currentPosPixel = currentPixelDataSources[feature.pz[pointIndex]][currentPixelDataOffsets[feature.pz[pointIndex]] + feature.px[pointIndex]];
                      if (currentPosPixel < positiveMinPixel) {
                        if (currentPosPixel <= negativeMaxPixel) {
                          pathOptimizationApplied = false;
                          break;
                        }
                        positiveMinPixel = currentPosPixel;
                      }
                    }
                    if (feature.nz[pointIndex] >= 0) {
                      currentNegPixel = currentPixelDataSources[feature.nz[pointIndex]][currentPixelDataOffsets[feature.nz[pointIndex]] + feature.nx[pointIndex]];
                      if (currentNegPixel > negativeMaxPixel) {
                        if (positiveMinPixel <= currentNegPixel) {
                          pathOptimizationApplied = false;
                          break;
                        }
                        negativeMaxPixel = currentNegPixel;
                      }
                    }
                  }
                  currentStageAccumulator += (pathOptimizationApplied) ? stageAlphas[featureIndex * 2 + 1] : stageAlphas[featureIndex * 2];
                }
              }

              // Check if the current stage's accumulated value passes its threshold.
              if (currentStageAccumulator < currentClassifierStage.threshold) {
                detectionWindowPassedAllStages = false;
                break; // This window failed a stage, no need to check further stages.
              }
            }

            // If all cascade stages passed, record this as a potential object detection.
            if (detectionWindowPassedAllStages) {
              candidateDetections.push({
                x: (xCoord * 4 + pixelShiftX[shiftVariant] * 2) * currentOverallScaleX,
                y: (yCoord * 4 + pixelShiftY[shiftVariant] * 2) * currentOverallScaleY,
                width: classifier.width * currentOverallScaleX,
                height: classifier.height * currentOverallScaleY,
                groupNeighbors: 1, // Will be updated during grouping.
                detectionScore: currentStageAccumulator, // Renamed from confidence.
              });
            }

            // Advance pixel offsets for the next window in the same row.
            currentPixelDataOffsets[0] += 16;
            currentPixelDataOffsets[1] += 8;
            currentPixelDataOffsets[2] += 4;
          }
          // Reset pixel offsets to the start of the next row, applying padding.
          currentPixelDataOffsets[0] += dataRowPaddings[0];
          currentPixelDataOffsets[1] += dataRowPaddings[1];
          currentPixelDataOffsets[2] += dataRowPaddings[2];
        }
      }
      // Update overall scale for the next pyramid level.
      currentOverallScaleX *= scaleFactor;
      currentOverallScaleY *= scaleFactor;
    }
    return candidateDetections;
  };

  // --- Detection Clustering and Filtering (Internal Helper, formerly 'post') ---
  const refineAndFilterDetections = (initialDetections) => {
    const { minNeighbors, classifier } = currentDetectionState;

    // Restore original features to the classifier for future uses (cleanup).
    classifier.stage_classifier.forEach(stage => {
      stage.feature = stage.cachedFeatures;
    });

    // If no minimum neighbors required, return raw detections without grouping or filtering.
    if (minNeighbors <= 0) {
      return initialDetections;
    }

    // Use the DSU-based grouping function from ComputerVisionToolkit.
    const clusteringResult = ComputerVisionToolkit.groupSimilarElements(initialDetections, (regionA, regionB) => {
      // Define similarity based on bounding box overlap and relative size.
      // Original distance calculation: `Math.floor(r1.width * 0.25 + 0.5)`
      const overlapThreshold = Math.round(regionA.width * 0.25);

      // Check for overlap in X and Y dimensions within the threshold.
      const xOverlaps = regionB.x <= regionA.x + overlapThreshold && regionB.x >= regionA.x - overlapThreshold;
      const yOverlaps = regionB.y <= regionA.y + overlapThreshold && regionB.y >= regionA.y - overlapThreshold;

      // Check for similar width (within 1.5x factor).
      const widthIsSimilar = regionB.width <= Math.round(regionA.width * 1.5) && Math.round(regionB.width * 1.5) >= regionA.width;

      return xOverlaps && yOverlaps && widthIsSimilar;
    });

    const { groupIndices, groupCount } = clusteringResult;
    const aggregatedGroups = Array.from({ length: groupCount }, () => ({
      neighborCount: 0,
      xSum: 0, ySum: 0, widthSum: 0, heightSum: 0,
      maxConfidence: 0,
    }));

    // Aggregate properties for each grouped component.
    initialDetections.forEach((detection, idx) => {
      const groupIdx = groupIndices[idx];
      // Skip if detection was not assigned to a valid group (groupIndex -1).
      if (groupIdx === -1) return;

      const currentGroup = aggregatedGroups[groupIdx];

      if (currentGroup.neighborCount === 0) {
        currentGroup.maxConfidence = detection.detectionScore;
      }

      currentGroup.neighborCount++;
      currentGroup.xSum += detection.x;
      currentGroup.ySum += detection.y;
      currentGroup.widthSum += detection.width;
      currentGroup.heightSum += detection.height;
      currentGroup.maxConfidence = Math.max(currentGroup.maxConfidence, detection.detectionScore);
    });

    const averagedBoundingBoxes = [];
    // Calculate average bounding box for groups that meet the minimum neighbor count.
    aggregatedGroups.forEach(group => {
      if (group.neighborCount >= minNeighbors) {
        const count = group.neighborCount;
        averagedBoundingBoxes.push({
          x: Math.round((group.xSum * 2 + count) / (2 * count)), // Equivalent to (xSum / count) + 0.5, then round.
          y: Math.round((group.ySum * 2 + count) / (2 * count)),
          width: Math.round((group.widthSum * 2 + count) / (2 * count)),
          height: Math.round((group.heightSum * 2 + count) / (2 * count)),
          groupNeighbors: group.neighborCount,
          detectionScore: group.maxConfidence,
        });
      }
    });

    const finalUniqueDetections = [];
    // Filter out smaller bounding boxes that are contained within larger, more confident ones.
    averagedBoundingBoxes.forEach((region1, i) => {
      let isTrulyUnique = true;
      for (let j = 0; j < averagedBoundingBoxes.length; j++) {
        const region2 = averagedBoundingBoxes[j];
        if (i === j) continue; // Don't compare a region to itself.

        const containmentBuffer = Math.round(region2.width * 0.25);

        // Check if region1 is spatially contained within region2, allowing for a small buffer.
        const isSpatiallyContained =
          region1.x >= region2.x - containmentBuffer &&
          region1.y >= region2.y - containmentBuffer &&
          region1.x + region1.width <= region2.x + region2.width + containmentBuffer &&
          region1.y + region1.height <= region2.y + region2.height + containmentBuffer;

        // Additional redundancy condition:
        // A region is considered redundant if a larger, containing region (region2)
        // has significantly more neighbors, or if region1 itself has very few neighbors.
        const redundancyCriteriaMet = region2.groupNeighbors > Math.max(3, region1.groupNeighbors) || region1.groupNeighbors < 3;

        if (isSpatiallyContained && redundancyCriteriaMet) {
          isTrulyUnique = false;
          break;
        }
      }
      if (isTrulyUnique) {
        finalUniqueDetections.push(region1);
      }
    });

    return finalUniqueDetections;
  };

  // --- Execution Workflow ---
  // The original function's flow is `post([core(pre(1),0,0)])`.
  // This means `pre` (createImagePyramid) is called, its result passed to `core` (scanPyramidForCandidateObjects),
  // which returns an array. This array is then wrapped in another array `[...]` and passed to `post` (refineAndFilterDetections).
  // The wrapper `[...]` is likely a quirk of the original code, as `post` immediately accesses `seq[0]`.
  // We will streamline this to pass the array directly.

  const imagePyramid = createImagePyramid();
  const rawCandidateObjects = scanPyramidForCandidateObjects(imagePyramid);
  const finalDetectedObjects = refineAndFilterDetections(rawCandidateObjects);

  return finalDetectedObjects;
};

// --- Module Exports ---
// The main export object, renamed for better semantic meaning.
const ComputerVisionToolkit = module.exports = exports = {
  // Expose core utilities and the main detection function.
  parseInvocationArgs: parseInvocationArgs,
  convertCanvasToGrayscale: convertCanvasToGrayscale,
  groupSimilarElements: groupSimilarElements,
  performObjectDetection: performObjectDetection,
  // Expose the Canvas API for external use if needed, similar to original `ccv.Canvas`.
  CanvasAPI: OffscreenCanvasAPI,
};