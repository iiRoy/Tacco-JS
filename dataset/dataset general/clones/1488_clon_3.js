((globalContext) => {
  'use strict'; // Enforce stricter parsing and error handling

  // This module provides an advanced image partitioning solution,
  // based on the "Efficient Graph-Based Image Segmentation" algorithm
  // by Felzenszwalb and Huttenlocher (2004).
  //
  // The primary interface is `globalContext.ImageSegmenter(inputSource, config)`.
  //
  // Configuration options:
  // * `blurAmount` (number): Gaussian pre-smoothing parameter. Default: 0.5.
  // * `linkThreshold` (number): Core algorithm's edge weight threshold. Default: 500.
  // * `minimumRegionSize` (number): Smallest allowed segment size in pixels. Default: 20.
  // * `outputDataUrlHandler` (function): Callback for receiving the result as a data URL.
  // * `completionCallback` (function): Invoked upon successful segmentation.
  //                                   Receives a result object with:
  //    * `imageWidth` (number): Width of the processed image.
  //    * `imageHeight` (number): Height of the processed image.
  //    * `segmentCount` (number): Total number of identified segments.
  //    * `labelMap` (Uint32Array): A 1D array (`imageWidth * imageHeight`) mapping each pixel
  //                                to its segment's unique identifier.
  // * `failureCallback` (function): Invoked if image loading or processing fails.
  //                                   Receives an error message string.
  //
  // Example usage:
  //
  // globalContext.ImageSegmenter('/assets/photo.png', {
  //   blurAmount: 1.0,
  //   linkThreshold: 750,
  //   minimumRegionSize: 50,
  //   completionCallback: (resultPayload) => {
  //     const outputCanvas = document.createElement('canvas');
  //     outputCanvas.width = resultPayload.imageWidth;
  //     outputCanvas.height = resultPayload.imageHeight;
  //     const ctx = outputCanvas.getContext('2d');
  //     const imageDataBuffer = ctx.createImageData(resultPayload.imageWidth, resultPayload.imageHeight);
  //     const pixelDataView = imageDataBuffer.data;
  //
  //     // Simple visualization: assign random colors to segments
  //     const uniqueColors = new Map();
  //     for (let i = 0; i < resultPayload.labelMap.length; ++i) {
  //       const segmentId = resultPayload.labelMap[i];
  //       if (!uniqueColors.has(segmentId)) {
  //         uniqueColors.set(segmentId, [
  //           Math.floor(Math.random() * 256),
  //           Math.floor(Math.random() * 256),
  //           Math.floor(Math.random() * 256)
  //         ]);
  //       }
  //       const color = uniqueColors.get(segmentId);
  //       pixelDataView[4 * i + 0] = color[0];
  //       pixelDataView[4 * i + 1] = color[1];
  //       pixelDataView[4 * i + 2] = color[2];
  //       pixelDataView[4 * i + 3] = 255; // Fully opaque
  //     }
  //     ctx.putImageData(imageDataBuffer, 0, 0);
  //     document.body.appendChild(outputCanvas);
  //   },
  //   failureCallback: (errMsg) => console.error('Segmentation failed:', errMsg)
  // });
  //
  // K. Yamaguchi (2013) - Refactored and extended by clone generation expert (2023).

  const PIXEL_CHANNEL_COUNT = 4; // RGBA
  const COLOR_CHANNEL_COUNT = 3; // RGB

  /**
   * Calculates the linear index for a pixel's specific channel.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @param {number} imgWidth - Image width.
   * @param {number} channel - Channel index (0=R, 1=G, 2=B, 3=A).
   * @returns {number} The linear index in a 1D pixel array.
   */
  const getPixelChannelIndex = (x, y, imgWidth, channel) => {
    return (y * imgWidth + x) * PIXEL_CHANNEL_COUNT + channel;
  };

  /**
   * Generates a normalized Gaussian filter kernel.
   * @param {number} spreadFactor - The sigma parameter for the Gaussian distribution.
   * @returns {Float32Array} A 1D array representing the Gaussian kernel.
   */
  function generateNormalizedBellCurveFilter(spreadFactor) {
    const adjustedSpread = Math.max(spreadFactor, 0.005); // Ensure positive spread
    const filterSpan = Math.ceil(adjustedSpread * 4) + 1;
    const filterKernel = new Float32Array(filterSpan);
    let totalWeightSum = 0;

    for (let currentIdx = 0; currentIdx < filterSpan; ++currentIdx) {
      const kernelValue = Math.exp(-0.5 * Math.pow(currentIdx / adjustedSpread, 2));
      totalWeightSum += kernelValue; // Values are always positive
      filterKernel[currentIdx] = kernelValue;
    }

    // Normalize: sum should be 1.0. The center is counted once, others twice for symmetry.
    totalWeightSum = (2 * totalWeightSum) - filterKernel[0];
    for (let currentIdx = 0; currentIdx < filterSpan; ++currentIdx) {
      filterKernel[currentIdx] /= totalWeightSum;
    }
    return filterKernel;
  }

  /**
   * Applies a symmetric 1D convolution filter across an image, first horizontally then vertically.
   * This is typically used for Gaussian blurring.
   * @param {ImageData} imageRasterData - The ImageData object to be filtered.
   * @param {Float32Array} convolutionKernel - The 1D filter kernel.
   */
  function applySymmetricConvolution(imageRasterData, convolutionKernel) {
    const rasterWidth = imageRasterData.width;
    const rasterHeight = imageRasterData.height;
    const inputPixels = imageRasterData.data;
    const interimPixels = new Float32Array(inputPixels.length); // Stores horizontal pass results

    // --- Horizontal Convolution Pass ---
    for (let yPos = 0; yPos < rasterHeight; ++yPos) {
      for (let xPos = 0; xPos < rasterWidth; ++xPos) {
        for (let channelIdx = 0; channelIdx < COLOR_CHANNEL_COUNT; ++channelIdx) { // Process R, G, B channels
          let channelAccumulator = convolutionKernel[0] * inputPixels[getPixelChannelIndex(xPos, yPos, rasterWidth, channelIdx)];

          for (let kOffset = 1; kOffset < convolutionKernel.length; ++kOffset) {
            const leftPixelIdx = Math.max(0, xPos - kOffset);
            const rightPixelIdx = Math.min(rasterWidth - 1, xPos + kOffset);

            channelAccumulator += convolutionKernel[kOffset] * (
              inputPixels[getPixelChannelIndex(leftPixelIdx, yPos, rasterWidth, channelIdx)] +
              inputPixels[getPixelChannelIndex(rightPixelIdx, yPos, rasterWidth, channelIdx)]
            );
          }
          interimPixels[getPixelChannelIndex(xPos, yPos, rasterWidth, channelIdx)] = channelAccumulator;
        }
      }
    }

    // --- Vertical Convolution Pass ---
    for (let yPos = 0; yPos < rasterHeight; ++yPos) {
      for (let xPos = 0; xPos < rasterWidth; ++xPos) {
        for (let channelIdx = 0; channelIdx < COLOR_CHANNEL_COUNT; ++channelIdx) { // Process R, G, B channels
          let channelAccumulator = convolutionKernel[0] * interimPixels[getPixelChannelIndex(xPos, yPos, rasterWidth, channelIdx)];

          for (let kOffset = 1; kOffset < convolutionKernel.length; ++kOffset) {
            const topPixelIdx = Math.max(0, yPos - kOffset);
            const bottomPixelIdx = Math.min(rasterHeight - 1, yPos + kOffset);

            channelAccumulator += convolutionKernel[kOffset] * (
              interimPixels[getPixelChannelIndex(xPos, topPixelIdx, rasterWidth, channelIdx)] +
              interimPixels[getPixelChannelIndex(xPos, bottomPixelIdx, rasterWidth, channelIdx)]
            );
          }
          // Store result back into original ImageData.data
          imageRasterData.data[getPixelChannelIndex(xPos, yPos, rasterWidth, channelIdx)] = Math.round(channelAccumulator);
        }
      }
    }
  }

  /**
   * Applies Gaussian smoothing to an image's RGB channels.
   * @param {ImageData} inputImageStruct - The ImageData object.
   * @param {number} blurIntensity - The sigma value for the Gaussian filter.
   */
  function processImageForNoiseReduction(inputImageStruct, blurIntensity) {
    const gaussianKernel = generateNormalizedBellCurveFilter(blurIntensity);
    applySymmetricConvolution(inputImageStruct, gaussianKernel);
  }

  /**
   * Computes the Euclidean distance between two RGB pixel colors.
   * @param {Uint8ClampedArray} pixelData - The image's pixel data array.
   * @param {number} indexA - Linear index of the first pixel's red channel.
   * @param {number} indexB - Linear index of the second pixel's red channel.
   * @returns {number} The color distance.
   */
  const calculateColorDistance = (pixelData, indexA, indexB) => {
    let sumSqDiff = 0;
    for (let c = 0; c < COLOR_CHANNEL_COUNT; ++c) {
      sumSqDiff += Math.pow(pixelData[indexA + c] - pixelData[indexB + c], 2);
    }
    return Math.sqrt(sumSqDiff);
  };

  /**
   * Constructs a graph where pixels are nodes and connections are edges with weights
   * based on color difference between adjacent pixels.
   * @param {ImageData} pixelSource - The image data.
   * @param {object} [options] - Configuration options (currently unused, but kept for extensibility).
   * @returns {object} An object containing arrays for node A, node B, and edge weights.
   */
  function formPixelConnectivityGraph(pixelSource, options) {
    const rasterWidth = pixelSource.width;
    const rasterHeight = pixelSource.height;
    const colorChannels = pixelSource.data;
    const totalPixels = rasterWidth * rasterHeight;

    // Estimate max number of edges:
    // (W-1)H (horizontal) + (H-1)W (vertical) + (W-1)(H-1) (diag down-right) + (W-1)(H-1) (diag down-left)
    // = 4WH - 3W - 3H + 2.
    // We'll use a slightly more generous initial size.
    const maxEstimatedEdges = (rasterWidth - 1) * rasterHeight +
                              (rasterHeight - 1) * rasterWidth +
                              (rasterWidth - 1) * (rasterHeight - 1) * 2; // For two diagonals
    const graphLinks = {
      nodeA_indices: new Uint32Array(maxEstimatedEdges),
      nodeB_indices: new Uint32Array(maxEstimatedEdges),
      edgeWeights: new Float32Array(maxEstimatedEdges),
      edgeCount: 0 // Track actual number of edges added
    };

    let currentEdgeIndex = 0;

    // Iterate through each pixel to find neighbors and calculate edge weights
    for (let yCoord = 0; yCoord < rasterHeight; ++yCoord) {
      for (let xCoord = 0; xCoord < rasterWidth; ++xCoord) {
        const currentPixelNode = yCoord * rasterWidth + xCoord;
        const currentPixelRgbaIndex = getPixelChannelIndex(xCoord, yCoord, rasterWidth, 0);

        // Horizontal neighbor (to the right)
        if (xCoord < rasterWidth - 1) {
          const neighborPixelNode = yCoord * rasterWidth + (xCoord + 1);
          const neighborPixelRgbaIndex = getPixelChannelIndex(xCoord + 1, yCoord, rasterWidth, 0);

          graphLinks.nodeA_indices[currentEdgeIndex] = currentPixelNode;
          graphLinks.nodeB_indices[currentEdgeIndex] = neighborPixelNode;
          graphLinks.edgeWeights[currentEdgeIndex] = calculateColorDistance(colorChannels, currentPixelRgbaIndex, neighborPixelRgbaIndex);
          currentEdgeIndex++;
        }

        // Vertical neighbor (below)
        if (yCoord < rasterHeight - 1) {
          const neighborPixelNode = (yCoord + 1) * rasterWidth + xCoord;
          const neighborPixelRgbaIndex = getPixelChannelIndex(xCoord, yCoord + 1, rasterWidth, 0);

          graphLinks.nodeA_indices[currentEdgeIndex] = currentPixelNode;
          graphLinks.nodeB_indices[currentEdgeIndex] = neighborPixelNode;
          graphLinks.edgeWeights[currentEdgeIndex] = calculateColorDistance(colorChannels, currentPixelRgbaIndex, neighborPixelRgbaIndex);
          currentEdgeIndex++;
        }

        // Diagonal neighbor (down-right)
        if (xCoord < rasterWidth - 1 && yCoord < rasterHeight - 1) {
          const neighborPixelNode = (yCoord + 1) * rasterWidth + (xCoord + 1);
          const neighborPixelRgbaIndex = getPixelChannelIndex(xCoord + 1, yCoord + 1, rasterWidth, 0);

          graphLinks.nodeA_indices[currentEdgeIndex] = currentPixelNode;
          graphLinks.nodeB_indices[currentEdgeIndex] = neighborPixelNode;
          graphLinks.edgeWeights[currentEdgeIndex] = calculateColorDistance(colorChannels, currentPixelRgbaIndex, neighborPixelRgbaIndex);
          currentEdgeIndex++;
        }

        // Diagonal neighbor (down-left, only if not on top row)
        if (xCoord > 0 && yCoord < rasterHeight - 1) {
          const neighborPixelNode = (yCoord + 1) * rasterWidth + (xCoord - 1);
          const neighborPixelRgbaIndex = getPixelChannelIndex(xCoord - 1, yCoord + 1, rasterWidth, 0);

          graphLinks.nodeA_indices[currentEdgeIndex] = currentPixelNode;
          graphLinks.nodeB_indices[currentEdgeIndex] = neighborPixelNode;
          graphLinks.edgeWeights[currentEdgeIndex] = calculateColorDistance(colorChannels, currentPixelRgbaIndex, neighborPixelRgbaIndex);
          currentEdgeIndex++;
        }
      }
    }
    graphLinks.edgeCount = currentEdgeIndex; // Update the actual count

    // Resize arrays to actual size if they were over-allocated
    if (graphLinks.edgeCount < maxEstimatedEdges) {
      graphLinks.nodeA_indices = graphLinks.nodeA_indices.subarray(0, graphLinks.edgeCount);
      graphLinks.nodeB_indices = graphLinks.nodeB_indices.subarray(0, graphLinks.edgeCount);
      graphLinks.edgeWeights = graphLinks.edgeWeights.subarray(0, graphLinks.edgeCount);
    }

    return graphLinks;
  }

  /**
   * Sorts the graph connections (edges) based on their weight in ascending order.
   * @param {object} graphStructure - The object containing nodeA_indices, nodeB_indices, edgeWeights.
   */
  function orderGraphConnectionsByWeight(graphStructure) {
    const totalEdges = graphStructure.edgeCount;
    const sortedIndices = new Array(totalEdges);
    for (let i = 0; i < totalEdges; ++i) {
      sortedIndices[i] = i;
    }

    const nodeA_indices = graphStructure.nodeA_indices;
    const nodeB_indices = graphStructure.nodeB_indices;
    const edgeWeights = graphStructure.edgeWeights;

    // Custom sort function that compares edge weights
    sortedIndices.sort((idx1, idx2) => edgeWeights[idx1] - edgeWeights[idx2]);

    // Create temporary arrays to hold sorted data
    const tempNodeA = new Uint32Array(totalEdges);
    const tempNodeB = new Uint32Array(totalEdges);
    const tempWeights = new Float32Array(totalEdges);

    for (let i = 0; i < totalEdges; ++i) {
      const originalIndex = sortedIndices[i];
      tempNodeA[i] = nodeA_indices[originalIndex];
      tempNodeB[i] = nodeB_indices[originalIndex];
      tempWeights[i] = edgeWeights[originalIndex];
    }

    // Replace original arrays with sorted ones
    graphStructure.nodeA_indices = tempNodeA;
    graphStructure.nodeB_indices = tempNodeB;
    graphStructure.edgeWeights = tempWeights;
  }

  /**
   * Initializes a Disjoint Set Union (DSU) data structure for segmentation.
   * Each element starts in its own set, with a calculated initial internal threshold.
   * @param {number} totalElements - The total number of elements (pixels).
   * @param {number} initialThresholdValue - The base threshold constant 'k'.
   * @returns {object} The initialized DSU system.
   */
  function initializeDisjointSetStructure(totalElements, initialThresholdValue) {
    const dsuSystem = {
      elementCount: totalElements, // Number of disjoint sets
      componentRank: new Uint8Array(totalElements), // Rank for union-by-rank optimization
      parentPointer: new Uint32Array(totalElements), // Parent pointer for each element
      componentSize: new Uint32Array(totalElements), // Size of each set (number of elements)
      internalThreshold: new Float32Array(totalElements) // Internal threshold for each set
    };

    for (let i = 0; i < totalElements; ++i) {
      dsuSystem.parentPointer[i] = i; // Each element is its own parent initially
      dsuSystem.componentSize[i] = 1; // Each set has size 1
      dsuSystem.internalThreshold[i] = initialThresholdValue; // Base threshold
    }
    return dsuSystem;
  }

  /**
   * Finds the representative (root) of the set containing `elementIndex`
   * and performs path compression.
   * @param {object} dsuSystem - The DSU data structure.
   * @param {number} elementIndex - The index of the element to find.
   * @returns {number} The root of the set.
   */
  function findRepresentative(dsuSystem, elementIndex) {
    let currentElement = elementIndex;
    // Traverse up the parent pointers until the root is found
    while (currentElement !== dsuSystem.parentPointer[currentElement]) {
      currentElement = dsuSystem.parentPointer[currentElement];
    }
    // Path compression: set all elements in the path to point directly to the root
    dsuSystem.parentPointer[elementIndex] = currentElement; // Direct compression
    return currentElement;
  }

  /**
   * Unites two sets if their roots are different, using union-by-rank.
   * Updates component sizes and decrements the total number of sets.
   * @param {object} dsuSystem - The DSU data structure.
   * @param {number} rootA - The representative of the first set.
   * @param {number} rootB - The representative of the second set.
   */
  function uniteComponents(dsuSystem, rootA, rootB) {
    if (rootA === rootB) return; // Already in the same set

    // Union by rank heuristic
    if (dsuSystem.componentRank[rootA] > dsuSystem.componentRank[rootB]) {
      dsuSystem.parentPointer[rootB] = rootA;
      dsuSystem.componentSize[rootA] += dsuSystem.componentSize[rootB];
    } else {
      dsuSystem.parentPointer[rootA] = rootB;
      dsuSystem.componentSize[rootB] += dsuSystem.componentSize[rootA];
      if (dsuSystem.componentRank[rootA] === dsuSystem.componentRank[rootB]) {
        dsuSystem.componentRank[rootB]++;
      }
    }
    dsuSystem.elementCount--; // One less disjoint set
  }

  /**
   * Segments the image based on the graph structure and DSU algorithm.
   * This is the core of the Felzenszwalb-Huttenlocher algorithm.
   * @param {ImageData} sourceImageData - The image data.
   * @param {object} options - Segmentation options (connectivityConstant, minimumComponentSize).
   * @returns {object} The final DSU structure representing the segments.
   */
  function performGraphSegmentation(sourceImageData, options) {
    const connectivityConstant = options.linkThreshold;
    let minimumComponentSize = Math.max(1, options.minimumRegionSize || 1); // Ensure min size is at least 1

    const pixelLinks = formPixelConnectivityGraph(sourceImageData, options);
    orderGraphConnectionsByWeight(pixelLinks); // Sort edges by weight

    const totalPixels = sourceImageData.width * sourceImageData.height;
    const segmentUniverse = initializeDisjointSetStructure(totalPixels, connectivityConstant);

    // --- Phase 1: Bottom-up merging based on edge weights and internal thresholds ---
    for (let i = 0; i < pixelLinks.edgeCount; ++i) {
      let rootOne = findRepresentative(segmentUniverse, pixelLinks.nodeA_indices[i]);
      let rootTwo = findRepresentative(segmentUniverse, pixelLinks.nodeB_indices[i]);

      // Merge if roots are different and edge weight is below both component's internal thresholds
      if (rootOne !== rootTwo &&
          pixelLinks.edgeWeights[i] <= segmentUniverse.internalThreshold[rootOne] &&
          pixelLinks.edgeWeights[i] <= segmentUniverse.internalThreshold[rootTwo]) {
        uniteComponents(segmentUniverse, rootOne, rootTwo);
        // After union, find the new root of the merged component
        rootOne = findRepresentative(segmentUniverse, rootOne);
        // Update the new component's internal threshold
        segmentUniverse.internalThreshold[rootOne] = pixelLinks.edgeWeights[i] + (connectivityConstant / segmentUniverse.componentSize[rootOne]);
      }
    }

    // --- Phase 2: Merge small components ---
    // This step merges any component smaller than `minimumComponentSize` with an adjacent component.
    // It iterates through the edges again, but now only considering size.
    for (let i = 0; i < pixelLinks.edgeCount; ++i) {
      const rootOne = findRepresentative(segmentUniverse, pixelLinks.nodeA_indices[i]);
      const rootTwo = findRepresentative(segmentUniverse, pixelLinks.nodeB_indices[i]);

      if (rootOne !== rootTwo &&
          (segmentUniverse.componentSize[rootOne] < minimumComponentSize ||
           segmentUniverse.componentSize[rootTwo] < minimumComponentSize)) {
        uniteComponents(segmentUniverse, rootOne, rootTwo);
      }
    }

    return segmentUniverse;
  }

  /**
   * Generates a 1D array mapping each pixel to its final segment label.
   * @param {object} segmentStructure - The final DSU structure.
   * @param {ImageData} originalImageData - The original image data (for dimensions).
   * @returns {Uint32Array} A 1D array where each element is a segment label.
   */
  function generateSegmentLabelMap(segmentStructure, originalImageData) {
    const rasterWidth = originalImageData.width;
    const rasterHeight = originalImageData.height;
    const totalPixels = rasterWidth * rasterHeight;
    const segmentLabels = new Uint32Array(totalPixels);
    const componentToLabelMap = new Map(); // Maps DSU root IDs to sequential labels
    let nextAvailableLabel = 0;

    for (let i = 0; i < totalPixels; ++i) {
      const currentRoot = findRepresentative(segmentStructure, i);
      let assignedLabel = componentToLabelMap.get(currentRoot);

      if (assignedLabel === undefined) {
        assignedLabel = nextAvailableLabel++;
        componentToLabelMap.set(currentRoot, assignedLabel);
      }
      segmentLabels[i] = assignedLabel;
    }
    return segmentLabels;
  }

  /**
   * Orchestrates the entire segmentation pipeline: smoothing, graph building,
   * DSU processing, and label map generation.
   * @param {ImageData} rawImageData - The initial ImageData object.
   * @param {object} processingSettings - Configuration options for segmentation.
   */
  function executeSegmentationPipeline(rawImageData, processingSettings) {
    // 1. Pre-smooth the image to reduce noise
    processImageForNoiseReduction(rawImageData, processingSettings.blurAmount);

    // 2. Perform graph-based segmentation
    const segmentResult = performGraphSegmentation(rawImageData, processingSettings);

    // 3. Generate a pixel-to-segment index map
    const segmentIdentifierMap = generateSegmentLabelMap(segmentResult, rawImageData);

    // 4. Invoke user-defined callbacks
    if (typeof processingSettings.completionCallback === 'function') {
      processingSettings.completionCallback({
        imageWidth: rawImageData.width,
        imageHeight: rawImageData.height,
        segmentCount: segmentResult.elementCount,
        labelMap: segmentIdentifierMap
      });
    }

    if (typeof processingSettings.outputDataUrlHandler === 'function') {
      convertSegmentMapToDataURI(rawImageData.width, rawImageData.height, segmentIdentifierMap, processingSettings);
    }
  }

  /**
   * Converts the segment label map into a visual representation (grayscale based on index)
   * and provides it as a Data URL via a callback.
   * @param {number} outputWidth - Width of the output image.
   * @param {number} outputHeight - Height of the output image.
   * @param {Uint32Array} segmentMapping - The array of segment labels.
   * @param {object} exportOptions - Options containing the `outputDataUrlHandler` callback.
   */
  function convertSegmentMapToDataURI(outputWidth, outputHeight, segmentMapping, exportOptions) {
    const renderCanvas = document.createElement('canvas');
    renderCanvas.width = outputWidth;
    renderCanvas.height = outputHeight;
    const canvasContext = renderCanvas.getContext('2d');

    if (!canvasContext) {
      console.warn("Failed to get 2D context for rendering segment map to Data URL.");
      return;
    }

    const outputImageData = canvasContext.createImageData(outputWidth, outputHeight);
    const pixelBuffer = outputImageData.data; // This is a Uint8ClampedArray

    for (let i = 0; i < segmentMapping.length; ++i) {
      const segmentLabel = segmentMapping[i];
      // Map segment label to RGB channels for visualization.
      // This will produce a unique color for each label up to 2^24-1, but will appear grayscale.
      // For more distinct colors, a colormap would be needed.
      pixelBuffer[4 * i + 0] = (segmentLabel % 256); // Red channel
      pixelBuffer[4 * i + 1] = ((segmentLabel >>> 8) % 256); // Green channel
      pixelBuffer[4 * i + 2] = ((segmentLabel >>> 16) % 256); // Blue channel
      pixelBuffer[4 * i + 3] = 255; // Alpha channel (fully opaque)
    }

    canvasContext.putImageData(outputImageData, 0, 0);
    exportOptions.outputDataUrlHandler(renderCanvas.toDataURL());
  }

  /**
   * Handles successful image loading, then initiates the segmentation process.
   * @param {HTMLImageElement} loadedImageElement - The successfully loaded image.
   * @param {object} processingSettings - Configuration settings for segmentation.
   */
  function handleImageLoadingSuccess(loadedImageElement, processingSettings) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = loadedImageElement.width;
    tempCanvas.height = loadedImageElement.height;
    const tempContext = tempCanvas.getContext('2d');

    if (!tempContext) {
      const errMsg = 'Cannot get 2D context from canvas for image processing.';
      console.error(errMsg);
      if (typeof processingSettings.failureCallback === 'function') {
        processingSettings.failureCallback(errMsg);
      }
      return;
    }

    tempContext.drawImage(loadedImageElement, 0, 0);
    const rawImageData = tempContext.getImageData(0, 0, loadedImageElement.width, loadedImageElement.height);

    try {
      executeSegmentationPipeline(rawImageData, processingSettings);
    } catch (e) {
      const errMsg = `Segmentation algorithm failed: ${e.message}`;
      console.error(errMsg, e);
      if (typeof processingSettings.failureCallback === 'function') {
        processingSettings.failureCallback(errMsg);
      }
    }
  }

  /**
   * Handles image loading errors.
   * @param {HTMLImageElement} failedImageElement - The image that failed to load.
   * @param {object} processingSettings - Configuration settings that might contain a `failureCallback`.
   */
  function handleImageLoadingError(failedImageElement, processingSettings) {
    const errorMsg = `Failed to load image from source: ${failedImageElement.src}`;
    console.error(errorMsg);
    if (typeof processingSettings.failureCallback === 'function') {
      processingSettings.failureCallback(errorMsg);
    }
  }

  /**
   * Main entry point for the image segmentation process.
   * @param {string} sourceImagePath - URL or path to the image.
   * @param {object} userConfig - User-defined configuration options.
   */
  globalContext.ImageSegmenter = function(sourceImagePath, userConfig) {
    // Validate input path
    if (typeof sourceImagePath !== 'string' || !sourceImagePath.trim()) {
      console.error('ImageSegmenter: A valid image source path (string) is required.');
      if (typeof userConfig?.failureCallback === 'function') {
        userConfig.failureCallback('Invalid image source path provided.');
      }
      return;
    }

    // Establish default configuration and merge with user-provided settings
    const defaultSettings = {
      blurAmount: 0.5,
      linkThreshold: 500,
      minimumRegionSize: 20,
      outputDataUrlHandler: null,
      completionCallback: null,
      failureCallback: null,
      crossOriginPolicy: 'anonymous' // Default for loading images from different origins
    };
    const processingSettings = { ...defaultSettings, ...userConfig };

    // Basic validation for numeric parameters
    processingSettings.blurAmount = Math.max(0, Number(processingSettings.blurAmount) || defaultSettings.blurAmount);
    processingSettings.linkThreshold = Math.max(0, Number(processingSettings.linkThreshold) || defaultSettings.linkThreshold);
    processingSettings.minimumRegionSize = Math.max(1, Number(processingSettings.minimumRegionSize) || defaultSettings.minimumRegionSize);

    // Initialize an HTML Image element for loading
    const inputImageLoader = new Image();
    inputImageLoader.src = sourceImagePath;
    inputImageLoader.crossOrigin = processingSettings.crossOriginPolicy; // Handle CORS for images

    // Attach event handlers
    inputImageLoader.onerror = () => handleImageLoadingError(inputImageLoader, processingSettings);
    inputImageLoader.onload = () => handleImageLoadingSuccess(inputImageLoader, processingSettings);
  };

})(this); // Pass the global 'this' context (window in browsers)