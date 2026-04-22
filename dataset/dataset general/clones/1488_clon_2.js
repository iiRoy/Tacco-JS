/*
 * This module provides a JavaScript implementation for segmenting images based on the algorithm presented in:
 *
 *    "Efficient Graph-Based Image Segmentation"
 *    Pedro F. Felzenszwalb and Daniel P. Huttenlocher
 *    International Journal of Computer Vision, 59(2) September 2004.
 *
 * Public Interface:
 * -----------------
 *
 *    VisualPartitioner(sourceImageURL, processSettings)
 *
 * The `processSettings` object accepts the following configuration parameters:
 * * `blurFactor` - Defines the sigma for Gaussian pre-smoothing. Default is 0.5.
 * * `groupSensitivity` - The threshold value central to the segmentation algorithm. Default is 500.
 * * `minimumRegionPixels` - Specifies the smallest acceptable segment size in pixels. Default is 20.
 * * `exportAsDataURI` - A callback function designed to receive the segmentation result as a data URL string.
 * * `onCompletion` - A function to be invoked once the processing is finished. This function receives a
 *                  single argument: a result object containing the following properties:
 *    * `spatialWidth` - The width of the input image in pixels.
 *    * `spatialHeight` - The height of the input image in pixels.
 *    * `numRegions` - The total number of distinct segments identified.
 *    * `partitionMap` - A Uint32Array of `spatialWidth * spatialHeight` elements, where each element
 *                       represents the segment index for a corresponding pixel. The segment index for
 *                       pixel `(row, col)` is `partitionMap(row * spatialWidth + col)`, where `row`
 *                       is the y-coordinate and `col` is the x-coordinate.
 *
 * Usage Example:
 * --------------
 *
 * Displaying the segmentation output on an HTML canvas:
 *
 *    function assignRandomColorsToRegions(regionCount, partitionMap, renderData) {
 *      const imgWidth = renderData.width;
 *      const imgHeight = renderData.height;
 *      const pixelRGBA = renderData.data;
 *      const colorPalette = new Uint8Array(regionCount * 3);
 *      for (let k = 0; k < colorPalette.length; ++k)
 *        colorPalette[k] = Math.floor(256 * Math.random());
 *      for (let y = 0; y < imgHeight; ++y) {
 *        for (let x = 0; x < imgWidth; ++x) {
 *          const regionID = partitionMap[y * imgWidth + x];
 *          pixelRGBA[4 * (y * imgWidth + x) + 0] = colorPalette[3 * regionID + 0];
 *          pixelRGBA[4 * (y * imgWidth + x) + 1] = colorPalette[3 * regionID + 1];
 *          pixelRGBA[4 * (y * imgWidth + x) + 2] = colorPalette[3 * regionID + 2];
 *          pixelRGBA[4 * (y * imgWidth + x) + 3] = 255; // Alpha channel
 *        }
 *      }
 *    }
 *
 *    VisualPartitioner('/assets/images/sample.png', {
 *      blurFactor: 1.0,
 *      groupSensitivity: 750,
 *      minimumRegionPixels: 50,
 *      onCompletion: function(resultInfo) {
 *        const outputCanvas = document.createElement('canvas');
 *        outputCanvas.width = resultInfo.spatialWidth;
 *        outputCanvas.height = resultInfo.spatialHeight;
 *        const drawContext = outputCanvas.getContext('2d');
 *        const currentImageData = drawContext.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
 *        assignRandomColorsToRegions(resultInfo.numRegions, resultInfo.partitionMap, currentImageData);
 *        drawContext.putImageData(currentImageData, 0, 0);
 *        document.body.appendChild(outputCanvas);
 *      }
 *    });
 *
 * (c) 2023, Imaginary Labs.
 */
(function() {
  // Helper to generate a normalized Gaussian convolution kernel.
  function generateGaussianKernel(smoothness) {
    smoothness = Math.max(smoothness, 0.01);
    const kernelLength = Math.ceil(smoothness * 4) + 1;
    const convolutionMask = new Float64Array(kernelLength);
    let totalMagnitude = 0;
    let idx;
    for (idx = 0; idx < kernelLength; ++idx) {
      const kernelValue = Math.exp(-0.5 * Math.pow(idx / smoothness, 2));
      totalMagnitude += Math.abs(kernelValue);
      convolutionMask[idx] = kernelValue;
    }
    // Adjust sum for symmetry (center counted once, others twice).
    totalMagnitude = 2 * totalMagnitude - Math.abs(convolutionMask[0]);
    for (idx = 0; idx < kernelLength; ++idx)
      convolutionMask[idx] /= totalMagnitude;
    return convolutionMask;
  }

  // Applies a 1D convolution filter symmetrically across image data.
  function performEvenFiltering(rasterData, convolutionKernel) {
    const imgWidth = rasterData.width;
    const imgHeight = rasterData.height;
    const inputBuffer = rasterData.data;
    const tempPixelStore = new Float64Array(inputBuffer.length); // Use Float64 for precision
    let row, col, channel, offset;

    // First, apply filter horizontally.
    for (row = 0; row < imgHeight; ++row) {
      for (col = 0; col < imgWidth; ++col) {
        for (channel = 0; channel < 3; ++channel) { // RGB channels
          let currentSum = convolutionKernel[0] * inputBuffer[4 * (row * imgWidth + col) + channel];
          for (offset = 1; offset < convolutionKernel.length; ++offset) {
            currentSum += convolutionKernel[offset] * (
              inputBuffer[4 * (row * imgWidth + Math.max(col - offset, 0)) + channel] +
              inputBuffer[4 * (row * imgWidth + Math.min(col + offset, imgWidth - 1)) + channel]
            );
          }
          tempPixelStore[4 * (row * imgWidth + col) + channel] = currentSum;
        }
      }
    }

    // Then, apply filter vertically.
    for (row = 0; row < imgHeight; ++row) {
      for (col = 0; col < imgWidth; ++col) {
        for (channel = 0; channel < 3; ++channel) { // RGB channels
          let currentSum = convolutionKernel[0] * tempPixelStore[4 * (row * imgWidth + col) + channel];
          for (offset = 1; offset < convolutionKernel.length; ++offset) {
            currentSum += convolutionKernel[offset] * (
              tempPixelStore[4 * (Math.max(row - offset, 0) * imgWidth + col) + channel] +
              tempPixelStore[4 * (Math.min(row + offset, imgHeight - 1) * imgWidth + col) + channel]
            );
          }
          // Store result back into original imageData buffer, clamping to 0-255.
          inputBuffer[4 * (row * imgWidth + col) + channel] = Math.round(Math.max(0, Math.min(255, currentSum)));
        }
      }
    }
  }

  // Blurs the provided image data using a Gaussian filter.
  function blurPictureData(rasterData, smoothness) {
    const gaussianFilter = generateGaussianKernel(smoothness);
    performEvenFiltering(rasterData, gaussianFilter);
  }

  // Computes edge weights between adjacent pixels.
  function deriveEdgeWeights(rasterData, processSettings) {
    const imgWidth = rasterData.width;
    const imgHeight = rasterData.height;
    const rawPixelColors = rasterData.data;
    // Maximum number of edges: horizontal, vertical, and two diagonals for each pixel.
    const maxEdgeCount = 4 * imgWidth * imgHeight - 3 * imgWidth - 3 * imgHeight + 2;
    let currentEdgeIndex = 0;
    const linkageWeights = {
      nodeA: new Uint32Array(maxEdgeCount), // Source pixel index
      nodeB: new Uint32Array(maxEdgeCount), // Destination pixel index
      edgeWeight: new Float64Array(maxEdgeCount) // Euclidean distance in RGB space
    };
    let pixel1Idx, pixel2Idx;

    for (let r = 0; r < imgHeight; ++r) {
      for (let c = 0; c < imgWidth; ++c) {
        const currentPixelFlatIdx = r * imgWidth + c;

        // Horizontal edge (right neighbor)
        if (c < imgWidth - 1) {
          pixel1Idx = currentPixelFlatIdx;
          pixel2Idx = r * imgWidth + c + 1;
          linkageWeights.nodeA[currentEdgeIndex] = pixel1Idx;
          linkageWeights.nodeB[currentEdgeIndex] = pixel2Idx;
          const px1_rgb_start = 4 * pixel1Idx;
          const px2_rgb_start = 4 * pixel2Idx;
          linkageWeights.edgeWeight[currentEdgeIndex] = Math.sqrt(
            Math.pow(rawPixelColors[px1_rgb_start + 0] - rawPixelColors[px2_rgb_start + 0], 2) +
            Math.pow(rawPixelColors[px1_rgb_start + 1] - rawPixelColors[px2_rgb_start + 1], 2) +
            Math.pow(rawPixelColors[px1_rgb_start + 2] - rawPixelColors[px2_rgb_start + 2], 2)
          );
          ++currentEdgeIndex;
        }

        // Vertical edge (bottom neighbor)
        if (r < imgHeight - 1) {
          pixel1Idx = currentPixelFlatIdx;
          pixel2Idx = (r + 1) * imgWidth + c;
          linkageWeights.nodeA[currentEdgeIndex] = pixel1Idx;
          linkageWeights.nodeB[currentEdgeIndex] = pixel2Idx;
          const px1_rgb_start = 4 * pixel1Idx;
          const px2_rgb_start = 4 * pixel2Idx;
          linkageWeights.edgeWeight[currentEdgeIndex] = Math.sqrt(
            Math.pow(rawPixelColors[px1_rgb_start + 0] - rawPixelColors[px2_rgb_start + 0], 2) +
            Math.pow(rawPixelColors[px1_rgb_start + 1] - rawPixelColors[px2_rgb_start + 1], 2) +
            Math.pow(rawPixelColors[px1_rgb_start + 2] - rawPixelColors[px2_rgb_start + 2], 2)
          );
          ++currentEdgeIndex;
        }

        // Diagonal edge (bottom-right neighbor)
        if ((c < imgWidth - 1) && (r < imgHeight - 1)) {
          pixel1Idx = currentPixelFlatIdx;
          pixel2Idx = (r + 1) * imgWidth + c + 1;
          linkageWeights.nodeA[currentEdgeIndex] = pixel1Idx;
          linkageWeights.nodeB[currentEdgeIndex] = pixel2Idx;
          const px1_rgb_start = 4 * pixel1Idx;
          const px2_rgb_start = 4 * pixel2Idx;
          linkageWeights.edgeWeight[currentEdgeIndex] = Math.sqrt(
            Math.pow(rawPixelColors[px1_rgb_start + 0] - rawPixelColors[px2_rgb_start + 0], 2) +
            Math.pow(rawPixelColors[px1_rgb_start + 1] - rawPixelColors[px2_rgb_start + 1], 2) +
            Math.pow(rawPixelColors[px1_rgb_start + 2] - rawPixelColors[px2_rgb_start + 2], 2)
          );
          ++currentEdgeIndex;
        }

        // Diagonal edge (top-right neighbor)
        if ((c < imgWidth - 1) && (r > 0)) {
          pixel1Idx = currentPixelFlatIdx;
          pixel2Idx = (r - 1) * imgWidth + c + 1;
          linkageWeights.nodeA[currentEdgeIndex] = pixel1Idx;
          linkageWeights.nodeB[currentEdgeIndex] = pixel2Idx;
          const px1_rgb_start = 4 * pixel1Idx;
          const px2_rgb_start = 4 * pixel2Idx;
          linkageWeights.edgeWeight[currentEdgeIndex] = Math.sqrt(
            Math.pow(rawPixelColors[px1_rgb_start + 0] - rawPixelColors[px2_rgb_start + 0], 2) +
            Math.pow(rawPixelColors[px1_rgb_start + 1] - rawPixelColors[px2_rgb_start + 1], 2) +
            Math.pow(rawPixelColors[px1_rgb_start + 2] - rawPixelColors[px2_rgb_start + 2], 2)
          );
          ++currentEdgeIndex;
        }
      }
    }
    return linkageWeights;
  }

  // Sorts the edge connections based on their calculated weights in ascending order.
  function arrangeBoundaryCosts(linkageWeights) {
    const numEdges = linkageWeights.edgeWeight.length;
    const originalOrder = new Uint32Array(numEdges);
    for (let k = 0; k < numEdges; ++k)
      originalOrder[k] = k;

    const nodeA_orig = linkageWeights.nodeA;
    const nodeB_orig = linkageWeights.nodeB;
    const edgeWeight_orig = linkageWeights.edgeWeight;

    // Sort array of indices based on edge weights.
    originalOrder.sort((idx1, idx2) => edgeWeight_orig[idx1] - edgeWeight_orig[idx2]);

    // Create new typed arrays for sorted data.
    const sortedNodeA = new Uint32Array(numEdges);
    const sortedNodeB = new Uint32Array(numEdges);
    const sortedEdgeWeight = new Float64Array(numEdges);

    for (let k = 0; k < numEdges; ++k) {
      const sortedIdx = originalOrder[k];
      sortedNodeA[k] = nodeA_orig[sortedIdx];
      sortedNodeB[k] = nodeB_orig[sortedIdx];
      sortedEdgeWeight[k] = edgeWeight_orig[sortedIdx];
    }

    linkageWeights.nodeA = sortedNodeA;
    linkageWeights.nodeB = sortedNodeB;
    linkageWeights.edgeWeight = sortedEdgeWeight;
  }

  // Initializes a Disjoint Set Union (DSU) data structure.
  function buildComponentStructure(totalElements, initialThreshold) {
    const componentForest = {
      elementCount: totalElements,
      setRank: new Uint8Array(totalElements), // Rank for union by rank optimization
      parentArray: new Uint32Array(totalElements), // Parent pointer for each element
      componentSize: new Uint32Array(totalElements), // Size of each component
      mergeThresholds: new Float64Array(totalElements) // Internal threshold for merging
    };
    for (let k = 0; k < totalElements; ++k) {
      componentForest.componentSize[k] = 1;
      componentForest.parentArray[k] = k; // Each element is initially its own parent
      componentForest.mergeThresholds[k] = initialThreshold;
    }
    return componentForest;
  }

  // Finds the representative (root) of the set containing `elementIndex` using path compression.
  function findSetRoot(componentForest, elementIndex) {
    let current = elementIndex;
    while (current !== componentForest.parentArray[current])
      current = componentForest.parentArray[current];
    // Path compression: set parent of elementIndex to the root.
    componentForest.parentArray[elementIndex] = current;
    return current;
  }

  // Merges two sets represented by their roots `rootA` and `rootB` using union by rank.
  function uniteSets(componentForest, rootA, rootB) {
    if (componentForest.setRank[rootA] > componentForest.setRank[rootB]) {
      componentForest.parentArray[rootB] = rootA;
      componentForest.componentSize[rootA] += componentForest.componentSize[rootB];
    } else {
      componentForest.parentArray[rootA] = rootB;
      componentForest.componentSize[rootB] += componentForest.componentSize[rootA];
      if (componentForest.setRank[rootA] === componentForest.setRank[rootB])
        componentForest.setRank[rootB]++;
    }
    componentForest.elementCount--; // Decrement total number of disjoint sets
  }

  // Implements the graph-based segmentation algorithm.
  function executeGraphSegmentation(rasterData, processSettings) {
    const groupSensitivity = processSettings.groupSensitivity;
    const smallestSegment = processSettings.minimumRegionPixels;
    const boundaryConnections = deriveEdgeWeights(rasterData, processSettings);
    let rootA, rootB;

    arrangeBoundaryCosts(boundaryConnections); // Sort edges by weight

    const componentForest = buildComponentStructure(
      rasterData.width * rasterData.height,
      groupSensitivity
    );

    // Iteratively merge components based on edge weights and internal thresholds.
    for (let i = 0; i < boundaryConnections.nodeA.length; ++i) {
      rootA = findSetRoot(componentForest, boundaryConnections.nodeA[i]);
      rootB = findSetRoot(componentForest, boundaryConnections.nodeB[i]);

      if (rootA !== rootB &&
          boundaryConnections.edgeWeight[i] <= componentForest.mergeThresholds[rootA] &&
          boundaryConnections.edgeWeight[i] <= componentForest.mergeThresholds[rootB]) {
        uniteSets(componentForest, rootA, rootB);
        rootA = findSetRoot(componentForest, rootA); // Find new root after potential merge
        componentForest.mergeThresholds[rootA] = boundaryConnections.edgeWeight[i] +
                                                  (groupSensitivity / componentForest.componentSize[rootA]);
      }
    }

    // Second pass: merge components smaller than the minimum size.
    for (let i = 0; i < boundaryConnections.nodeA.length; ++i) {
      rootA = findSetRoot(componentForest, boundaryConnections.nodeA[i]);
      rootB = findSetRoot(componentForest, boundaryConnections.nodeB[i]);
      if (rootA !== rootB &&
          (componentForest.componentSize[rootA] < smallestSegment ||
           componentForest.componentSize[rootB] < smallestSegment)) {
        uniteSets(componentForest, rootA, rootB);
      }
    }
    return componentForest;
  }

  // Creates a map associating each pixel with its final segment ID.
  function buildPartitionIndex(componentForest, rasterData, processSettings) {
    const imgWidth = rasterData.width;
    const imgHeight = rasterData.height;
    const partitionMap = new Uint32Array(imgWidth * imgHeight);
    const componentToIdMap = [];
    let nextAvailableID = 0;

    for (let r = 0; r < imgHeight; ++r) {
      for (let c = 0; c < imgWidth; ++c) {
        const currentPixelFlatIdx = r * imgWidth + c;
        const segmentRoot = findSetRoot(componentForest, currentPixelFlatIdx);
        let assignedID = componentToIdMap[segmentRoot];
        if (assignedID === undefined) {
          assignedID = nextAvailableID;
          componentToIdMap[segmentRoot] = nextAvailableID++;
        }
        partitionMap[currentPixelFlatIdx] = assignedID;
      }
    }
    return partitionMap;
  }

  // Orchestrates the entire image segmentation process.
  function calculateVisualSegments(rasterData, processSettings) {
    blurPictureData(rasterData, processSettings.blurFactor);
    const componentForest = executeGraphSegmentation(rasterData, processSettings);
    const partitionMap = buildPartitionIndex(componentForest, rasterData, processSettings);

    if (processSettings.onCompletion) {
      // Create a copy of the RGB data as the original `rasterData.data` might be modified later.
      const colorChannels = new Uint8ClampedArray(rasterData.data);
      processSettings.onCompletion({
        spatialWidth: rasterData.width,
        spatialHeight: rasterData.height,
        numRegions: componentForest.elementCount, // Final count of unique segments
        partitionMap: partitionMap,
        rawPixelColors: colorChannels
      });
    }

    if (processSettings.exportAsDataURI)
      produceDataURIOutput(rasterData.width, rasterData.height, partitionMap, processSettings);
  }

  // Generates and outputs a Data URI representation of the segmented image.
  function produceDataURIOutput(spatialWidth, spatialHeight, partitionMap, processSettings) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = spatialWidth;
    tempCanvas.height = spatialHeight;
    const renderContext = tempCanvas.getContext('2d');
    const outputImageData = renderContext.createImageData(spatialWidth, spatialHeight);
    const pixelRGBA = outputImageData.data;

    for (let i = 0; i < partitionMap.length; ++i) {
      const segmentID = partitionMap[i];
      // Encode segment ID into RGB channels.
      pixelRGBA[4 * i + 0] = segmentID & 255;
      pixelRGBA[4 * i + 1] = (segmentID >>> 8) & 255;
      pixelRGBA[4 * i + 2] = (segmentID >>> 16) & 255;
      pixelRGBA[4 * i + 3] = 255; // Full opacity
    }
    renderContext.putImageData(outputImageData, 0, 0);
    processSettings.exportAsDataURI(tempCanvas.toDataURL());
  }

  // Callback for successful image loading.
  function handleImageReady(graphicElement, processSettings) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = graphicElement.width;
    tempCanvas.height = graphicElement.height;
    const drawContext = tempCanvas.getContext('2d');
    drawContext.drawImage(graphicElement, 0, 0);
    const pixelData = drawContext.getImageData(0, 0, graphicElement.width, graphicElement.height);
    calculateVisualSegments(pixelData, processSettings);
  }

  // Callback for image loading errors.
  function reportImageFailure(graphicElement) {
    console.error('Failed to load image from source:', graphicElement.src);
    alert('Failed to load an image: ' + graphicElement.src);
  }

  // Public API function for image segmentation.
  window.VisualPartitioner = function(sourceImageURL, processSettings) {
    processSettings = processSettings || {}; // Ensure settings object exists
    // Set default configuration parameters if not provided.
    if (processSettings.blurFactor === undefined) processSettings.blurFactor = 0.5;
    if (processSettings.groupSensitivity === undefined) processSettings.groupSensitivity = 500;
    if (processSettings.minimumRegionPixels === undefined) processSettings.minimumRegionPixels = 20;

    const graphicElement = new Image();
    graphicElement.src = sourceImageURL;
    graphicElement.crossOrigin = null; // Allow cross-origin image loading if necessary
    graphicElement.onerror = () => reportImageFailure(graphicElement);
    graphicElement.onload = () => handleImageReady(graphicElement, processSettings);
  };
}).call(this);