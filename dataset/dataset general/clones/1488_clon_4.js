class PixelGrid {
    constructor(inputImageData) {
        this.pixelWidth = inputImageData.width;
        this.pixelHeight = inputImageData.height;
        this.pixelChannelData = new Float32Array(inputImageData.data);
    }

    getPixelChannelValue(xCoord, yCoord, channel) {
        const baseIndex = 4 * (yCoord * this.pixelWidth + xCoord);
        return this.pixelChannelData[baseIndex + channel];
    }

    setPixelChannelValue(xCoord, yCoord, channel, value) {
        const baseIndex = 4 * (yCoord * this.pixelWidth + xCoord);
        this.pixelChannelData[baseIndex + channel] = value;
    }

    getLinearPixelIndex(xCoord, yCoord) {
        return yCoord * this.pixelWidth + xCoord;
    }

    // Applies a 1D convolution kernel first horizontally, then vertically
    performSymmetricConvolution(convolutionKernel) {
        const tempPixelBuffer = new Float32Array(this.pixelChannelData);
        const kernelHalfLength = convolutionKernel.length;
        const channelCount = 4;

        // Horizontal pass
        for (let y = 0; y < this.pixelHeight; ++y) {
            for (let x = 0; x < this.pixelWidth; ++x) {
                for (let c = 0; c < 3; ++c) { // Process R, G, B channels
                    let accumulatedSum = convolutionKernel[0] * this.getPixelChannelValue(x, y, c);
                    for (let k = 1; k < kernelHalfLength; ++k) {
                        const leftNeighbor = this.getPixelChannelValue(Math.max(x - k, 0), y, c);
                        const rightNeighbor = this.getPixelChannelValue(Math.min(x + k, this.pixelWidth - 1), y, c);
                        accumulatedSum += convolutionKernel[k] * (leftNeighbor + rightNeighbor);
                    }
                    tempPixelBuffer[channelCount * this.getLinearPixelIndex(x, y) + c] = accumulatedSum;
                }
                // Alpha channel is copied without modification in the horizontal pass
                tempPixelBuffer[channelCount * this.getLinearPixelIndex(x, y) + 3] = this.getPixelChannelValue(x, y, 3);
            }
        }

        // Vertical pass (modifies internal pixelChannelData directly)
        for (let y = 0; y < this.pixelHeight; ++y) {
            for (let x = 0; x < this.pixelWidth; ++x) {
                for (let c = 0; c < 3; ++c) { // Process R, G, B channels
                    let accumulatedSum = convolutionKernel[0] * tempPixelBuffer[channelCount * this.getLinearPixelIndex(x, y) + c];
                    for (let k = 1; k < kernelHalfLength; ++k) {
                        const upNeighbor = tempPixelBuffer[channelCount * this.getLinearPixelIndex(x, Math.max(y - k, 0)) + c];
                        const downNeighbor = tempPixelBuffer[channelCount * this.getLinearPixelIndex(x, Math.min(y + k, this.pixelHeight - 1)) + c];
                        accumulatedSum += convolutionKernel[k] * (upNeighbor + downNeighbor);
                    }
                    this.setPixelChannelValue(x, y, c, accumulatedSum);
                }
                // Alpha channel is copied without modification in the vertical pass
                this.setPixelChannelValue(x, y, 3, tempPixelBuffer[channelCount * this.getLinearPixelIndex(x, y) + 3]);
            }
        }
    }

    exportToImageData() {
        const outputClampedData = new Uint8ClampedArray(this.pixelChannelData.length);
        for (let i = 0; i < this.pixelChannelData.length; ++i) {
            outputClampedData[i] = Math.round(Math.max(0, Math.min(255, this.pixelChannelData[i])));
        }
        return new ImageData(outputClampedData, this.pixelWidth, this.pixelHeight);
    }
}

class ComponentForest {
    constructor(nodeCount, initialThresholdValue) {
        this.totalComponents = nodeCount;
        this.parentPointer = new Int32Array(nodeCount);
        this.rankValue = new Int32Array(nodeCount);
        this.componentVolume = new Int32Array(nodeCount);
        this.componentDecisionThresholds = new Float32Array(nodeCount);

        for (let i = 0; i < nodeCount; ++i) {
            this.parentPointer[i] = i;
            this.componentVolume[i] = 1;
            this.componentDecisionThresholds[i] = initialThresholdValue;
        }
    }

    findComponentRepresentative(nodeIndex) {
        let currentElement = nodeIndex;
        while (currentElement !== this.parentPointer[currentElement]) {
            currentElement = this.parentPointer[currentElement];
        }
        // Path compression
        let pathTraversal = nodeIndex;
        while (pathTraversal !== this.parentPointer[pathTraversal]) {
            let nextInPath = this.parentPointer[pathTraversal];
            this.parentPointer[pathTraversal] = currentElement;
            pathTraversal = nextInPath;
        }
        return currentElement;
    }

    // Merges two sets represented by their root nodes
    uniteSets(rootA, rootB) {
        if (this.rankValue[rootA] > this.rankValue[rootB]) {
            this.parentPointer[rootB] = rootA;
            this.componentVolume[rootA] += this.componentVolume[rootB];
        } else {
            this.parentPointer[rootA] = rootB;
            this.componentVolume[rootB] += this.componentVolume[rootA];
            if (this.rankValue[rootA] === this.rankValue[rootB]) {
                this.rankValue[rootB]++;
            }
        }
        this.totalComponents--;
    }
}

const makeGaussianKernel = (smoothingFactor) => {
    const effectiveSigma = Math.max(smoothingFactor, 0.01);
    const halfKernelSize = Math.ceil(effectiveSigma * 4);
    const kernelArray = new Float32Array(halfKernelSize + 1);
    let currentSum = 0;

    for (let i = 0; i <= halfKernelSize; ++i) {
        const computedValue = Math.exp(-0.5 * Math.pow(i / effectiveSigma, 2));
        currentSum += computedValue;
        kernelArray[i] = computedValue;
    }
    const normalizationDivisor = 2 * currentSum - kernelArray[0];

    return new Float32Array(Array.from(kernelArray, val => val / normalizationDivisor));
};

const formPixelConnections = (pixelGrid) => {
    const { pixelWidth, pixelHeight, pixelChannelData } = pixelGrid;
    const connectionList = [];

    const calculateColorMagnitudeDifference = (idxA, idxB) => {
        const channelOffsetA = 4 * idxA;
        const channelOffsetB = 4 * idxB;
        return Math.sqrt(
            Math.pow(pixelChannelData[channelOffsetA + 0] - pixelChannelData[channelOffsetB + 0], 2) +
            Math.pow(pixelChannelData[channelOffsetA + 1] - pixelChannelData[channelOffsetB + 1], 2) +
            Math.pow(pixelChannelData[channelOffsetA + 2] - pixelChannelData[channelOffsetB + 2], 2)
        );
    };

    for (let y = 0; y < pixelHeight; ++y) {
        for (let x = 0; x < pixelWidth; ++x) {
            const currentPixelLinearIndex = pixelGrid.getLinearPixelIndex(x, y);

            // Right neighbor
            if (x < pixelWidth - 1) {
                const neighborPixelLinearIndex = pixelGrid.getLinearPixelIndex(x + 1, y);
                connectionList.push({
                    nodeA: currentPixelLinearIndex,
                    nodeB: neighborPixelLinearIndex,
                    bondStrength: calculateColorMagnitudeDifference(currentPixelLinearIndex, neighborPixelLinearIndex)
                });
            }
            // Down neighbor
            if (y < pixelHeight - 1) {
                const neighborPixelLinearIndex = pixelGrid.getLinearPixelIndex(x, y + 1);
                connectionList.push({
                    nodeA: currentPixelLinearIndex,
                    nodeB: neighborPixelLinearIndex,
                    bondStrength: calculateColorMagnitudeDifference(currentPixelLinearIndex, neighborPixelLinearIndex)
                });
            }
            // Down-right diagonal neighbor
            if (x < pixelWidth - 1 && y < pixelHeight - 1) {
                const neighborPixelLinearIndex = pixelGrid.getLinearPixelIndex(x + 1, y + 1);
                connectionList.push({
                    nodeA: currentPixelLinearIndex,
                    nodeB: neighborPixelLinearIndex,
                    bondStrength: calculateColorMagnitudeDifference(currentPixelLinearIndex, neighborPixelLinearIndex)
                });
            }
            // Up-right diagonal neighbor (original: (i,j) and (i-1, j+1))
            if (x < pixelWidth - 1 && y > 0) {
                const neighborPixelLinearIndex = pixelGrid.getLinearPixelIndex(x + 1, y - 1);
                connectionList.push({
                    nodeA: currentPixelLinearIndex,
                    nodeB: neighborPixelLinearIndex,
                    bondStrength: calculateColorMagnitudeDifference(currentPixelLinearIndex, neighborPixelLinearIndex)
                });
            }
        }
    }
    return connectionList;
};

class VisualPartitioningEngine {
    static async performPartition(imageSource, userSettings = {}) {
        const finalSettings = {
            smoothingFactor: 0.5,
            mergingSensitivity: 500,
            minimumComponentSize: 20,
            outputDataURLHandler: null,
            completionCallback: null,
            ...userSettings
        };

        const imageAsset = await new Promise((resolve, reject) => {
            const imgElement = new Image();
            imgElement.crossOrigin = null;
            imgElement.onload = () => resolve(imgElement);
            imgElement.onerror = () => reject(new Error('Failed to retrieve image: ' + imageSource));
            imgElement.src = imageSource;
        });

        const workingCanvas = document.createElement('canvas');
        workingCanvas.width = imageAsset.width;
        workingCanvas.height = imageAsset.height;
        const renderingContext = workingCanvas.getContext('2d');
        renderingContext.drawImage(imageAsset, 0, 0);
        const sourcePixelData = renderingContext.getImageData(0, 0, imageAsset.width, imageAsset.height);

        const segmentationResult = VisualPartitioningEngine._processRawImageData(sourcePixelData, finalSettings);

        if (finalSettings.completionCallback) {
            finalSettings.completionCallback(segmentationResult);
        }
        if (finalSettings.outputDataURLHandler) {
            VisualPartitioningEngine._generateOutputDataURL(
                segmentationResult.width,
                segmentationResult.height,
                segmentationResult.indexMap,
                finalSettings.outputDataURLHandler
            );
        }
        return segmentationResult;
    }

    static _processRawImageData(pixelData, params) {
        const pixelGridInstance = new PixelGrid(pixelData);
        const gaussianSmoothingKernel = makeGaussianKernel(params.smoothingFactor);
        pixelGridInstance.performSymmetricConvolution(gaussianSmoothingKernel);

        const pixelConnections = formPixelConnections(pixelGridInstance);
        pixelConnections.sort((connA, connB) => connA.bondStrength - connB.bondStrength);

        const componentGraph = new ComponentForest(
            pixelGridInstance.pixelWidth * pixelGridInstance.pixelHeight,
            params.mergingSensitivity
        );

        // First pass: initial region merging
        for (const connection of pixelConnections) {
            let rootNodeA = componentGraph.findComponentRepresentative(connection.nodeA);
            let rootNodeB = componentGraph.findComponentRepresentative(connection.nodeB);

            if (rootNodeA !== rootNodeB &&
                connection.bondStrength <= componentGraph.componentDecisionThresholds[rootNodeA] &&
                connection.bondStrength <= componentGraph.componentDecisionThresholds[rootNodeB]) {
                componentGraph.uniteSets(rootNodeA, rootNodeB);
                // Update threshold for the newly formed component
                rootNodeA = componentGraph.findComponentRepresentative(rootNodeA); // Get the new root
                componentGraph.componentDecisionThresholds[rootNodeA] = connection.bondStrength + (params.mergingSensitivity / componentGraph.componentVolume[rootNodeA]);
            }
        }

        // Second pass: merge small components
        for (const connection of pixelConnections) {
            const rootNodeA = componentGraph.findComponentRepresentative(connection.nodeA);
            const rootNodeB = componentGraph.findComponentRepresentative(connection.nodeB);

            if (rootNodeA !== rootNodeB &&
                (componentGraph.componentVolume[rootNodeA] < params.minimumComponentSize ||
                 componentGraph.componentVolume[rootNodeB] < params.minimumComponentSize)) {
                componentGraph.uniteSets(rootNodeA, rootNodeB);
            }
        }

        const segmentLabelMapping = VisualPartitioningEngine._assignUniqueSegmentLabels(
            componentGraph,
            pixelGridInstance.pixelWidth,
            pixelGridInstance.pixelHeight
        );

        return {
            width: pixelGridInstance.pixelWidth,
            height: pixelGridInstance.pixelHeight,
            size: componentGraph.totalComponents,
            indexMap: segmentLabelMapping,
            rgbData: pixelGridInstance.exportToImageData().data
        };
    }

    static _assignUniqueSegmentLabels(componentGraph, gridWidth, gridHeight) {
        const totalPixels = gridWidth * gridHeight;
        const labelAssignmentMap = new Int32Array(totalPixels);
        const representativeToSequentialLabel = new Map();
        let nextAvailableLabel = 0;

        for (let i = 0; i < totalPixels; ++i) {
            const representative = componentGraph.findComponentRepresentative(i);
            if (!representativeToSequentialLabel.has(representative)) {
                representativeToSequentialLabel.set(representative, nextAvailableLabel++);
            }
            labelAssignmentMap[i] = representativeToSequentialLabel.get(representative);
        }
        return labelAssignmentMap;
    }

    static _generateOutputDataURL(width, height, segmentLabelMap, urlHandler) {
        const outputCanvasElement = document.createElement('canvas');
        outputCanvasElement.width = width;
        outputCanvasElement.height = height;
        const outputContext = outputCanvasElement.getContext('2d');
        const outputImageData = outputContext.createImageData(width, height);
        const outputPixelData = outputImageData.data;

        for (let i = 0; i < segmentLabelMap.length; ++i) {
            const labelValue = segmentLabelMap[i];
            outputPixelData[4 * i + 0] = labelValue & 255;
            outputPixelData[4 * i + 1] = (labelValue >>> 8) & 255;
            outputPixelData[4 * i + 2] = (labelValue >>> 16) & 255;
            outputPixelData[4 * i + 3] = 255;
        }
        outputContext.putImageData(outputImageData, 0, 0);
        urlHandler(outputCanvasElement.toDataURL());
    }
}

window.VisualPartitioningEngine = VisualPartitioningEngine;