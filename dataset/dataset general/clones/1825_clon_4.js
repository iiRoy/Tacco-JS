const patternData = require('./cascade.js');
const ImageSurface = require('canvas');

function extractArguments(inputArgs, requiredKeys) {
    if (inputArgs.length === 0) return {};
    if (inputArgs.length === 1) return inputArgs[0];
    return requiredKeys.reduce((acc, key, index) => {
        if (index < inputArgs.length) { // Ensure we don't go out of bounds for inputArgs
            acc[key] = inputArgs[index];
        }
        return acc;
    }, {});
}

function desaturateImage(sourceCanvas) {
    const sourceContext = sourceCanvas.getContext("2d");
    const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const pixelData = imageData.data;

    const resultCanvas = new ImageSurface(sourceCanvas.width, sourceCanvas.height);
    const resultContext = resultCanvas.getContext("2d");
    const resultImageData = resultContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const outputData = resultImageData.data;

    const calculateGrayscale = (r, g, b) => Math.round(r * 0.3 + g * 0.59 + b * 0.11);

    for (let currentPixelIndex = 0; currentPixelIndex < pixelData.length; currentPixelIndex += 4) {
        const grayscaleValue = calculateGrayscale(pixelData[currentPixelIndex], pixelData[currentPixelIndex + 1], pixelData[currentPixelIndex + 2]);
        outputData[currentPixelIndex] = grayscaleValue;
        outputData[currentPixelIndex + 1] = grayscaleValue;
        outputData[currentPixelIndex + 2] = grayscaleValue;
        outputData[currentPixelIndex + 3] = 255;
    }

    resultContext.putImageData(resultImageData, 0, 0);
    return resultCanvas;
}

function clusterElements(elementSequence, similarityPredicate) {
    const totalElements = elementSequence.length;
    const itemStates = elementSequence.map(item => ({
        parentIdx: -1,
        itemRef: item,
        groupRank: 0
    }));

    const locateRepresentative = (index) => {
        let current = index;
        const pathSegments = [];
        while (itemStates[current].parentIdx !== -1) {
            pathSegments.push(current);
            current = itemStates[current].parentIdx;
        }
        pathSegments.forEach(segmentIdx => {
            itemStates[segmentIdx].parentIdx = current;
        });
        return current;
    };

    for (let i = 0; i < totalElements; i++) {
        if (!itemStates[i].itemRef) continue;

        let rootI = locateRepresentative(i);

        for (let j = 0; j < totalElements; j++) {
            if (i === j || !itemStates[j].itemRef) continue;

            if (similarityPredicate(itemStates[i].itemRef, itemStates[j].itemRef)) {
                let rootJ = locateRepresentative(j);

                if (rootI !== rootJ) {
                    if (itemStates[rootI].groupRank > itemStates[rootJ].groupRank) {
                        itemStates[rootJ].parentIdx = rootI;
                    } else {
                        itemStates[rootI].parentIdx = rootJ;
                        if (itemStates[rootI].groupRank === itemStates[rootJ].groupRank) {
                            itemStates[rootJ].groupRank++;
                        }
                        rootI = rootJ;
                    }
                    locateRepresentative(i);
                    locateRepresentative(j);
                }
            }
        }
    }

    const classificationIndices = Array(totalElements).fill(-1);
    let currentCategoryIdentifier = 0;
    const rootToCategoryMap = new Map();

    for (let i = 0; i < totalElements; i++) {
        if (itemStates[i].itemRef) {
            const finalRoot = locateRepresentative(i);
            if (!rootToCategoryMap.has(finalRoot)) {
                rootToCategoryMap.set(finalRoot, currentCategoryIdentifier++);
            }
            classificationIndices[i] = rootToCategoryMap.get(finalRoot);
        }
    }
    return { groupMappings: classificationIndices, numGroups: currentCategoryIdentifier };
}

class VisionProcessor {
    constructor() {
        this.desaturate = desaturateImage;
        this.cluster = clusterElements;
    }

    locateFeatures(inputSurface, intervalSetting, minimumNeighbors) {
        const processingParameters = extractArguments(arguments, ["inputSurface", "intervalSetting", "minimumNeighbors"]);

        processingParameters.inputSurface = this.desaturate(processingParameters.inputSurface);
        processingParameters.featurePattern = patternData;
        processingParameters.scalingFactor = Math.pow(2, 1 / (processingParameters.intervalSetting + 1));
        processingParameters.nextLevelOffset = processingParameters.intervalSetting + 1;
        processingParameters.maxScaleIterations = Math.floor(
            Math.log(Math.min(
                processingParameters.inputSurface.width / processingParameters.featurePattern.width,
                processingParameters.inputSurface.height / processingParameters.featurePattern.height
            )) / Math.log(processingParameters.scalingFactor)
        );

        processingParameters.featurePattern.stage_classifier.forEach(classifier => {
            classifier.originalFeatureData = classifier.feature;
        });

        const generateImagePyramid = (processingSettings) => {
            const { inputSurface, intervalSetting, scalingFactor, nextLevelOffset, maxScaleIterations } = processingSettings;
            const pyramidLayers = new Array((maxScaleIterations + nextLevelOffset * 2) * 4);
            const pyramidPixelData = new Array((maxScaleIterations + nextLevelOffset * 2) * 4);

            pyramidLayers[0] = inputSurface;
            pyramidPixelData[0] = {
                width: pyramidLayers[0].width,
                height: pyramidLayers[0].height,
                data: pyramidLayers[0].getContext("2d").getImageData(0, 0, pyramidLayers[0].width, pyramidLayers[0].height).data
            };

            for (let i = 1; i <= intervalSetting; i++) {
                const currentScale = Math.pow(scalingFactor, i);
                pyramidLayers[i * 4] = new ImageSurface(
                    Math.floor(inputSurface.width / currentScale),
                    Math.floor(inputSurface.height / currentScale)
                );
                pyramidLayers[i * 4].getContext("2d").drawImage(inputSurface, 0, 0, inputSurface.width, inputSurface.height, 0, 0, pyramidLayers[i * 4].width, pyramidLayers[i * 4].height);
                pyramidPixelData[i * 4] = {
                    width: pyramidLayers[i * 4].width,
                    height: pyramidLayers[i * 4].height,
                    data: pyramidLayers[i * 4].getContext("2d").getImageData(0, 0, pyramidLayers[i * 4].width, pyramidLayers[i * 4].height).data
                };
            }

            for (let i = nextLevelOffset; i < maxScaleIterations + nextLevelOffset * 2; i++) {
                pyramidLayers[i * 4] = new ImageSurface(
                    Math.floor(pyramidLayers[i * 4 - nextLevelOffset * 4].width / 2),
                    Math.floor(pyramidLayers[i * 4 - nextLevelOffset * 4].height / 2)
                );
                pyramidLayers[i * 4].getContext("2d").drawImage(pyramidLayers[i * 4 - nextLevelOffset * 4], 0, 0, pyramidLayers[i * 4 - nextLevelOffset * 4].width, pyramidLayers[i * 4 - nextLevelOffset * 4].height, 0, 0, pyramidLayers[i * 4].width, pyramidLayers[i * 4].height);
                pyramidPixelData[i * 4] = {
                    width: pyramidLayers[i * 4].width,
                    height: pyramidLayers[i * 4].height,
                    data: pyramidLayers[i * 4].getContext("2d").getImageData(0, 0, pyramidLayers[i * 4].width, pyramidLayers[i * 4].height).data
                };
            }

            const xOffsets = [0, 1, 0, 1];
            const yOffsets = [0, 0, 1, 1];

            for (let i = nextLevelOffset * 2; i < maxScaleIterations + nextLevelOffset * 2; i++) {
                for (let q = 1; q < 4; q++) {
                    pyramidLayers[i * 4 + q] = new ImageSurface(
                        Math.floor(pyramidLayers[i * 4 - nextLevelOffset * 4].width / 2),
                        Math.floor(pyramidLayers[i * 4 - nextLevelOffset * 4].height / 2)
                    );

                    const sourceLayer = pyramidLayers[i * 4 - nextLevelOffset * 4];
                    const destLayer = pyramidLayers[i * 4 + q];
                    const destCtx = destLayer.getContext("2d");

                    const srcX = xOffsets[q];
                    const srcY = yOffsets[q];
                    const srcW = sourceLayer.width - srcX;
                    const srcH = sourceLayer.height - srcY;
                    const dstW = destLayer.width - (srcX === 0 ? 0 : 2);
                    const dstH = destLayer.height - (srcY === 0 ? 0 : 2);

                    destCtx.drawImage(sourceLayer, srcX, srcY, srcW, srcH, 0, 0, dstW, dstH);

                    pyramidPixelData[i * 4 + q] = {
                        width: destLayer.width,
                        height: destLayer.height,
                        data: destCtx.getImageData(0, 0, destLayer.width, destLayer.height).data
                    };
                }
            }
            return pyramidPixelData;
        };

        const processPyramidForFeatures = (pyramidData, processingSettings) => {
            const { featurePattern, scalingFactor, nextLevelOffset, maxScaleIterations } = processingSettings;
            const detectedFeatureList = [];

            let currentScaleX = 1;
            let currentScaleY = 1;
            const xOffsets = [0, 1, 0, 1];
            const yOffsets = [0, 0, 1, 1];

            for (let i = 0; i < maxScaleIterations; i++) {
                featurePattern.stage_classifier.forEach(stage => {
                    stage.scaledFeatures = stage.originalFeatureData.map(origFeat => {
                        const newFeat = { ...origFeat, px: [], pz: [], nx: [], nz: [] };
                        const currentPyr0Width = pyramidData[i * 4].width;
                        const currentPyr1Width = pyramidData[i * 4 + nextLevelOffset * 4].width;
                        const currentPyr2Width = pyramidData[i * 4 + nextLevelOffset * 8].width;
                        const currentSteps = [currentPyr0Width * 4, currentPyr1Width * 4, currentPyr2Width * 4];

                        for (let q = 0; q < origFeat.size; q++) {
                            newFeat.px[q] = origFeat.px[q] * 4 + origFeat.py[q] * currentSteps[origFeat.pz[q]];
                            newFeat.pz[q] = origFeat.pz[q];
                            newFeat.nx[q] = origFeat.nx[q] * 4 + origFeat.ny[q] * currentSteps[origFeat.nz[q]];
                            newFeat.nz[q] = origFeat.nz[q];
                        }
                        return newFeat;
                    });
                });

                const currentPyr2 = pyramidData[i * 4 + nextLevelOffset * 8];
                const effectiveWidth = currentPyr2.width - Math.floor(featurePattern.width / 4);
                const effectiveHeight = currentPyr2.height - Math.floor(featurePattern.height / 4);

                const padding0 = pyramidData[i * 4].width * 16 - effectiveWidth * 16;
                const padding1 = pyramidData[i * 4 + nextLevelOffset * 4].width * 8 - effectiveWidth * 8;
                const padding2 = pyramidData[i * 4 + nextLevelOffset * 8].width * 4 - effectiveWidth * 4;

                for (let q = 0; q < 4; q++) {
                    const pixelSources = [
                        pyramidData[i * 4].data,
                        pyramidData[i * 4 + nextLevelOffset * 4].data,
                        pyramidData[i * 4 + nextLevelOffset * 8 + q].data
                    ];
                    let currentPixelOffsets = [
                        xOffsets[q] * 8 + yOffsets[q] * pyramidData[i * 4].width * 8,
                        xOffsets[q] * 4 + yOffsets[q] * pyramidData[i * 4 + nextLevelOffset * 4].width * 4,
                        0
                    ];

                    for (let y = 0; y < effectiveHeight; y++) {
                        for (let x = 0; x < effectiveWidth; x++) {
                            let totalConfidence = 0;
                            let detectionConfirmed = true;

                            for (const stageClassifier of featurePattern.stage_classifier) {
                                totalConfidence = 0;
                                const stageAlphas = stageClassifier.alpha;
                                const stageFeatures = stageClassifier.scaledFeatures;

                                for (let k = 0; k < stageClassifier.count; k++) {
                                    const currentFeature = stageFeatures[k];
                                    let pValue, pMin = pixelSources[currentFeature.pz[0]][currentPixelOffsets[currentFeature.pz[0]] + currentFeature.px[0]];
                                    let nValue, nMax = pixelSources[currentFeature.nz[0]][currentPixelOffsets[currentFeature.nz[0]] + currentFeature.nx[0]];

                                    if (pMin <= nMax) {
                                        totalConfidence += stageAlphas[k * 2];
                                    } else {
                                        let shortcutPossible = true;
                                        for (let f = 0; f < currentFeature.size; f++) {
                                            if (currentFeature.pz[f] >= 0) {
                                                pValue = pixelSources[currentFeature.pz[f]][currentPixelOffsets[currentFeature.pz[f]] + currentFeature.px[f]];
                                                if (pValue < pMin) {
                                                    if (pValue <= nMax) {
                                                        shortcutPossible = false;
                                                        break;
                                                    }
                                                    pMin = pValue;
                                                }
                                            }
                                            if (currentFeature.nz[f] >= 0) {
                                                nValue = pixelSources[currentFeature.nz[f]][currentPixelOffsets[currentFeature.nz[f]] + currentFeature.nx[f]];
                                                if (nValue > nMax) {
                                                    if (pMin <= nValue) {
                                                        shortcutPossible = false;
                                                        break;
                                                    }
                                                    nMax = nValue;
                                                }
                                            }
                                        }
                                        totalConfidence += (shortcutPossible) ? stageAlphas[k * 2 + 1] : stageAlphas[k * 2];
                                    }
                                }
                                if (totalConfidence < stageClassifier.threshold) {
                                    detectionConfirmed = false;
                                    break;
                                }
                            }

                            if (detectionConfirmed) {
                                detectedFeatureList.push({
                                    xCoord: (x * 4 + xOffsets[q] * 2) * currentScaleX,
                                    yCoord: (y * 4 + yOffsets[q] * 2) * currentScaleY,
                                    boxWidth: featurePattern.width * currentScaleX,
                                    boxHeight: featurePattern.height * currentScaleY,
                                    neighborCount: 1,
                                    detectionScore: totalConfidence
                                });
                            }

                            currentPixelOffsets[0] += 16;
                            currentPixelOffsets[1] += 8;
                            currentPixelOffsets[2] += 4;
                        }
                        currentPixelOffsets[0] += padding0;
                        currentPixelOffsets[1] += padding1;
                        currentPixelOffsets[2] += padding2;
                    }
                }
                currentScaleX *= scalingFactor;
                currentScaleY *= scalingFactor;
            }
            return detectedFeatureList;
        };

        const consolidateDetections = (rawDetections, processingSettings) => {
            const { minimumNeighbors, featurePattern } = processingSettings;

            featurePattern.stage_classifier.forEach(classifier => {
                classifier.feature = classifier.originalFeatureData;
            });

            if (!(minimumNeighbors > 0)) {
                return rawDetections;
            } else {
                const groupPredicate = (box1, box2) => {
                    const proximityThreshold = Math.floor(box1.boxWidth * 0.25 + 0.5);
                    return box2.xCoord <= box1.xCoord + proximityThreshold &&
                           box2.xCoord >= box1.xCoord - proximityThreshold &&
                           box2.yCoord <= box1.yCoord + proximityThreshold &&
                           box2.yCoord >= box1.yCoord - proximityThreshold &&
                           box2.boxWidth <= Math.floor(box1.boxWidth * 1.5 + 0.5) &&
                           Math.floor(box2.boxWidth * 1.5 + 0.5) >= box1.boxWidth;
                };

                const groupingResult = this.cluster(rawDetections, groupPredicate);
                const numCategories = groupingResult.numGroups;
                const groupAssignments = groupingResult.groupMappings;

                const groupedComponents = Array(numCategories).fill(null).map(() => ({
                    neighborCount: 0,
                    xCoord: 0,
                    yCoord: 0,
                    boxWidth: 0,
                    boxHeight: 0,
                    detectionScore: 0
                }));

                rawDetections.forEach((detection, index) => {
                    const assignedGroup = groupAssignments[index];
                    if (assignedGroup !== -1) {
                        const component = groupedComponents[assignedGroup];
                        component.neighborCount++;
                        component.xCoord += detection.xCoord;
                        component.yCoord += detection.yCoord;
                        component.boxWidth += detection.boxWidth;
                        component.boxHeight += detection.boxHeight;
                        component.detectionScore = Math.max(component.detectionScore, detection.detectionScore);
                    }
                });

                const averagedDetections = [];
                groupedComponents.forEach(component => {
                    if (component.neighborCount >= minimumNeighbors) {
                        const n = component.neighborCount;
                        averagedDetections.push({
                            xCoord: (component.xCoord * 2 + n) / (2 * n),
                            yCoord: (component.yCoord * 2 + n) / (2 * n),
                            boxWidth: (component.boxWidth * 2 + n) / (2 * n),
                            boxHeight: (component.boxHeight * 2 + n) / (2 * n),
                            neighborCount: component.neighborCount,
                            detectionScore: component.detectionScore
                        });
                    }
                });

                const finalFilteredDetections = [];
                averagedDetections.forEach(detection1 => {
                    let isUnique = true;
                    for (const detection2 of averagedDetections) {
                        if (detection1 === detection2) continue;

                        const proximityThreshold = Math.floor(detection2.boxWidth * 0.25 + 0.5);

                        if (detection1.xCoord >= detection2.xCoord - proximityThreshold &&
                            detection1.yCoord >= detection2.yCoord - proximityThreshold &&
                            detection1.xCoord + detection1.boxWidth <= detection2.xCoord + detection2.boxWidth + proximityThreshold &&
                            detection1.yCoord + detection1.boxHeight <= detection2.yCoord + detection2.boxHeight + proximityThreshold &&
                            (detection2.neighborCount > Math.max(3, detection1.neighborCount) || detection1.neighborCount < 3)) {
                            isUnique = false;
                            break;
                        }
                    }
                    if (isUnique) {
                        finalFilteredDetections.push(detection1);
                    }
                });
                return finalFilteredDetections;
            }
        };
        
        const pyramidData = generateImagePyramid(processingParameters);
        const rawDetections = processPyramidForFeatures(pyramidData, processingParameters);
        const finalResults = consolidateDetections(rawDetections, processingParameters);
        return finalResults;
    }
}

module.exports = exports = new VisionProcessor();