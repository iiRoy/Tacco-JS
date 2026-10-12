"use strict";
var rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenizedInput = rawInputData.split(/ |\n/), currentTokenIndex = 0;

function readNextInt() { return +tokenizedInput[currentTokenIndex++]; }
function readNextString() { return tokenizedInput[currentTokenIndex++]; }
function readNextBigInt() { return BigInt(tokenizedInput[currentTokenIndex++]); }

function readSequence(count, mapToNumber) {
    const sequence = tokenizedInput.slice(currentTokenIndex, currentTokenIndex + count);
    currentTokenIndex += count;
    return mapToNumber ? sequence.map(val => +val) : sequence;
}

function readMatrix(height, width, mapToNumber) {
    const matrixRows = [];
    for (let i = 0; i < height; i++) {
        const row = tokenizedInput.slice(currentTokenIndex, currentTokenIndex + width);
        currentTokenIndex += width;
        matrixRows.push(mapToNumber ? row.map(val => +val) : row);
    }
    return matrixRows;
}

function createMultiDimArray(initialValue) {
    const args = Array.from(arguments);
    const dimensions = args.slice(1);
    const numDimensions = dimensions.length;

    if (numDimensions === 0) {
        return initialValue;
    }

    function createArrayRecursive(dimIndex) {
        const currentDimSize = dimensions[dimIndex];
        const arr = new Array(currentDimSize);
        if (dimIndex === numDimensions - 1) {
            for (let i = 0; i < currentDimSize; i++) {
                arr[i] = initialValue;
            }
        } else {
            for (let i = 0; i < currentDimSize; i++) {
                arr[i] = createArrayRecursive(dimIndex + 1);
            }
        }
        return arr;
    }

    return createArrayRecursive(0);
}


var programOutput = main();
if (programOutput !== undefined) console.log(String(programOutput));

function main() {
    const maxDepthLimit = 10;
    var nodeCount = readNextInt();
    var nodeValues = readMatrix(nodeCount, 2, true);
    var queryCount = readNextInt();

    var queryRequirements = createMultiDimArray([0], nodeCount);

    const propagateMaxLimitUp = (startNodeIdx, limitValue) => {
        let currentIdx = startNodeIdx;
        while (currentIdx > 0) {
            currentIdx = (currentIdx - 1) >> 1;
            if (queryRequirements[currentIdx][0] >= limitValue) {
                break;
            }
            queryRequirements[currentIdx][0] = limitValue;
        }
    };

    for (let i = 0; i < queryCount; i++) {
        let currentNodeIdx = readNextInt() - 1;
        let currentLimit = readNextInt();

        queryRequirements[currentNodeIdx].push(i, currentLimit);

        if (queryRequirements[currentNodeIdx][0] < currentLimit) {
            queryRequirements[currentNodeIdx][0] = currentLimit;
        }

        propagateMaxLimitUp(currentNodeIdx, currentLimit);
    }

    let rootValue = nodeValues[0][0];
    let rootWeight = nodeValues[0][1];
    let maxRequiredLimitForRoot = queryRequirements[0][0] + 1;

    let dynamicProgTable = new Array(maxDepthLimit);

    dynamicProgTable[0] = new Array(maxRequiredLimitForRoot).fill(0);
    for (let i = rootWeight; i < maxRequiredLimitForRoot; i++) {
        dynamicProgTable[0][i] = rootValue;
    }

    var resultArray = createMultiDimArray(0, queryCount);

    const processNodeQueries = (nodeIdx, depthLevel) => {
        const nodeQueryData = queryRequirements[nodeIdx];
        for (let i = 1; i < nodeQueryData.length; i += 2) {
            const queryId = nodeQueryData[i];
            const queryLimit = nodeQueryData[i + 1];
            resultArray[queryId] = dynamicProgTable[depthLevel][queryLimit];
        }
    };

    processNodeQueries(0, 0);

    let processingQueue = [];
    if (nodeCount > 2) {
        processingQueue.push(1, -1, 2, 1);
    } else if (nodeCount === 2) {
        processingQueue.push(1, -1);
    }

    const applyKnapsackUpdate = (dpArray, itemValue, itemWeight, currentMaxLimit) => {
        for (let limit = currentMaxLimit - 1; limit >= itemWeight; limit--) {
            const potentialNewValue = dpArray[limit - itemWeight] + itemValue;
            if (dpArray[limit] < potentialNewValue) {
                dpArray[limit] = potentialNewValue;
            }
        }
    };

    while (processingQueue.length > 0) {
        let currentDepthModifier = processingQueue.pop();
        let currentNodeIdx = processingQueue.pop();

        let maxRequiredLimitForNode = queryRequirements[currentNodeIdx][0] + 1;

        if (maxRequiredLimitForNode === 1) {
            continue;
        }

        let nodeVal = nodeValues[currentNodeIdx][0];
        let nodeWeight = nodeValues[currentNodeIdx][1];

        let actualDepthLevel;
        if (currentDepthModifier < 0) {
            actualDepthLevel = -currentDepthModifier;
            dynamicProgTable[actualDepthLevel] = dynamicProgTable[actualDepthLevel - 1];
        } else {
            actualDepthLevel = currentDepthModifier;
            dynamicProgTable[actualDepthLevel] = dynamicProgTable[actualDepthLevel - 1].slice(0, maxRequiredLimitForNode);
        }

        applyKnapsackUpdate(dynamicProgTable[actualDepthLevel], nodeVal, nodeWeight, maxRequiredLimitForNode);

        processNodeQueries(currentNodeIdx, actualDepthLevel);

        let leftChildIdx = currentNodeIdx * 2 + 1;
        let rightChildIdx = currentNodeIdx * 2 + 2;

        const hasLeftChild = nodeCount > leftChildIdx;
        const hasRightChild = nodeCount > rightChildIdx;

        if (actualDepthLevel === maxDepthLimit - 1) {
            let tempCombinations = [];
            let subQueue = [];

            if (hasLeftChild) {
                subQueue.push(leftChildIdx, 0);
                if (hasRightChild) {
                    subQueue.push(rightChildIdx, -1);
                }
            } else if (hasRightChild) {
                 subQueue.push(rightChildIdx, -1);
            }

            while (subQueue.length > 0) {
                let tempCombinationsMarker = subQueue.pop();
                let currentSubNodeIdx = subQueue.pop();

                if (tempCombinationsMarker >= 0) {
                    tempCombinations.length = tempCombinationsMarker;
                }
                const initialTempCombinationsLength = tempCombinations.length;

                let subNodeMaxLimit = queryRequirements[currentSubNodeIdx][0] + 1;
                if (subNodeMaxLimit === 1) {
                    let nextLeftChild = currentSubNodeIdx * 2 + 1;
                    let nextRightChild = currentSubNodeIdx * 2 + 2;
                    if (nodeCount > nextLeftChild) {
                        subQueue.push(nextLeftChild, tempCombinations.length);
                        if (nodeCount > nextRightChild) {
                            subQueue.push(nextRightChild, -1);
                        }
                    } else if (nodeCount > nextRightChild) {
                        subQueue.push(nextRightChild, -1);
                    }
                    continue;
                }

                let subNodeVal = nodeValues[currentSubNodeIdx][0];
                let subNodeWeight = nodeValues[currentSubNodeIdx][1];

                if (subNodeWeight < subNodeMaxLimit) {
                    tempCombinations.push(subNodeVal, subNodeWeight);
                }

                for (let i = 0; i < initialTempCombinationsLength; i += 2) {
                    const existingCombVal = tempCombinations[i];
                    const existingCombWeight = tempCombinations[i + 1];
                    if (existingCombWeight + subNodeWeight < subNodeMaxLimit) {
                        tempCombinations.push(existingCombVal + subNodeVal, existingCombWeight + subNodeWeight);
                    }
                }

                for (let i = 1; i < queryRequirements[currentSubNodeIdx].length; i += 2) {
                    const queryId = queryRequirements[currentSubNodeIdx][i];
                    const queryLimit = queryRequirements[currentSubNodeIdx][i + 1];

                    for (let k = 0; k < tempCombinations.length; k += 2) {
                        const currentCombVal = tempCombinations[k];
                        const currentCombWeight = tempCombinations[k + 1];

                        if (queryLimit < currentCombWeight) {
                            continue;
                        }

                        const remainingLimit = queryLimit - currentCombWeight;
                        const potentialAnswer = dynamicProgTable[actualDepthLevel][remainingLimit] + currentCombVal;

                        if (resultArray[queryId] < potentialAnswer) {
                            resultArray[queryId] = potentialAnswer;
                        }
                    }
                }

                let nextLeftChild = currentSubNodeIdx * 2 + 1;
                let nextRightChild = currentSubNodeIdx * 2 + 2;

                if (nodeCount > nextLeftChild) {
                    subQueue.push(nextLeftChild, tempCombinations.length);
                    if (nodeCount > nextRightChild) {
                        subQueue.push(nextRightChild, -1);
                    }
                } else if (nodeCount > nextRightChild) {
                    subQueue.push(nextRightChild, -1);
                }
            }
        } else {
            const nextDepthLevel = actualDepthLevel + 1;
            if (hasLeftChild) {
                processingQueue.push(leftChildIdx, -nextDepthLevel);
                if (hasRightChild) {
                    processingQueue.push(rightChildIdx, nextDepthLevel);
                }
            } else if (hasRightChild) {
                processingQueue.push(rightChildIdx, nextDepthLevel);
            }
        }
    }

    return resultArray.join("\n");
}
