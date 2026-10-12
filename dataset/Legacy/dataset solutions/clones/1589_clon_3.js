"use strict";

// Input processing utility
const InputProcessor = function() {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputTokens = rawInputData.split(/ |\n/);
    let currentTokenIndex = 0;

    this.getNextInteger = () => {
        return +inputTokens[currentTokenIndex++];
    };
    this.getNextString = () => {
        return inputTokens[currentTokenIndex++];
    };
    this.getNextBigInteger = () => {
        return BigInt(inputTokens[currentTokenIndex++]);
    };
    this.getNextIntegers = (count, shouldMapToNumber = true) => {
        const startIndex = currentTokenIndex;
        currentTokenIndex += count;
        return shouldMapToNumber ? inputTokens.slice(startIndex, currentTokenIndex).map(Number) : inputTokens.slice(startIndex, currentTokenIndex);
    };
    this.getNextMatrix = (rows, cols, shouldMapToNumber = true) => {
        const matrixResult = [];
        for (let r = 0; r < rows; r++) {
            const startIndex = currentTokenIndex;
            currentTokenIndex += cols;
            matrixResult.push(shouldMapToNumber ? inputTokens.slice(startIndex, currentTokenIndex).map(Number) : inputTokens.slice(startIndex, currentTokenIndex));
        }
        return matrixResult;
    };
};

// Helper for creating multi-dimensional arrays without eval
function createMultiDimensionalArray(initialFillValue, ...dimensions) {
    const recursiveCreate = (dims, currentDimensionIdx) => {
        if (currentDimensionIdx === dims.length - 1) {
            return Array(dims[currentDimensionIdx]).fill(initialFillValue);
        }
        return Array(dims[currentDimensionIdx]).fill(null).map(() => recursiveCreate(dims, currentDimensionIdx + 1));
    };
    return recursiveCreate(dimensions, 0);
}

// Main program execution
function executeProblemSolver() {
    const inputHandler = new InputProcessor();

    const numElements = inputHandler.getNextInteger();
    const dynamicProgrammingTable = createMultiDimensionalArray(-1, numElements + 1, numElements + 1);
    let adjustmentFactor = 0;

    let initialPair = inputHandler.getNextIntegers(2);

    // Initialize base cases for DP table
    const zeroValue = 0;
    const firstPairElement = initialPair[0];
    const secondPairElement = initialPair[1];

    dynamicProgrammingTable[zeroValue][zeroValue] = zeroValue;
    dynamicProgrammingTable[zeroValue][firstPairElement] = zeroValue;
    dynamicProgrammingTable[zeroValue][secondPairElement] = zeroValue;
    dynamicProgrammingTable[firstPairElement][secondPairElement] = zeroValue;

    // Queue for deferred DP table updates
    const updateQueue = [];

    // Helper functions for updating the DP table via the queue
    function enqueueUpdateIfValueIsGreater(targetCoordA, targetCoordB, sourceCoordC, sourceCoordD) {
        const sourceEntryValue = dynamicProgrammingTable[sourceCoordC][sourceCoordD];
        if (dynamicProgrammingTable[targetCoordA][targetCoordB] < sourceEntryValue) {
            updateQueue.push(sourceEntryValue, targetCoordB, targetCoordA);
        }
    }

    function enqueueUpdateIfValueIsGreaterPlusOne(targetCoordA, targetCoordB, sourceCoordC, sourceCoordD) {
        const sourceEntryValuePlusOne = dynamicProgrammingTable[sourceCoordC][sourceCoordD] + 1;
        if (dynamicProgrammingTable[targetCoordA][targetCoordB] < sourceEntryValuePlusOne) {
            updateQueue.push(sourceEntryValuePlusOne, targetCoordB, targetCoordA);
        }
    }

    // Sub-routines for processing different configurations
    function processConfigurationStep1(currentVal) {
        enqueueUpdateIfValueIsGreaterPlusOne(0, 0, currentVal, currentVal);
        for (let loopIndex = 0; loopIndex < currentVal; loopIndex++) {
            enqueueUpdateIfValueIsGreater(loopIndex, currentVal, 0, loopIndex);
        }
        for (let loopIndex = currentVal; loopIndex <= numElements; loopIndex++) {
            enqueueUpdateIfValueIsGreater(currentVal, loopIndex, 0, loopIndex);
        }
    }

    function processConfigurationStep2(valA, valB) {
        enqueueUpdateIfValueIsGreater(valA, valB, 0, 0);
        enqueueUpdateIfValueIsGreaterPlusOne(0, valB, valA, valA);

        if (valA < valB) {
            enqueueUpdateIfValueIsGreaterPlusOne(0, valA, valB, valB);
        } else { // valA === valB
            const commonLimit = valA;
            for (let loopIndex = 0; loopIndex < commonLimit; loopIndex++) {
                enqueueUpdateIfValueIsGreaterPlusOne(0, loopIndex, loopIndex, commonLimit);
            }
            for (let loopIndex = commonLimit; loopIndex <= numElements; loopIndex++) {
                enqueueUpdateIfValueIsGreaterPlusOne(0, loopIndex, commonLimit, loopIndex);
            }
        }
    }

    function processConfigurationStep3(valA, valB, valC) {
        enqueueUpdateIfValueIsGreaterPlusOne(valB, valC, valA, valA);

        if (valA < valB) {
            enqueueUpdateIfValueIsGreaterPlusOne(valA, valC, valB, valB);
            if (valB < valC) {
                enqueueUpdateIfValueIsGreaterPlusOne(valA, valB, valC, valC);
            } else { // valB === valC
                const upperBoundary = valC;
                for (let loopIndex = 0; loopIndex < valA; loopIndex++) {
                    enqueueUpdateIfValueIsGreaterPlusOne(loopIndex, valA, loopIndex, upperBoundary);
                }
                for (let loopIndex = valA; loopIndex < upperBoundary; loopIndex++) {
                    enqueueUpdateIfValueIsGreaterPlusOne(valA, loopIndex, loopIndex, upperBoundary);
                }
                for (let loopIndex = upperBoundary; loopIndex <= numElements; loopIndex++) {
                    enqueueUpdateIfValueIsGreaterPlusOne(valA, loopIndex, upperBoundary, loopIndex);
                }
            }
        } else { // valA === valB
            enqueueUpdateIfValueIsGreaterPlusOne(valA, valA, valC, valC);
            const sharedValue = valA;
            for (let loopIndex = 0; loopIndex < sharedValue; loopIndex++) {
                enqueueUpdateIfValueIsGreaterPlusOne(loopIndex, valC, loopIndex, sharedValue);
            }
            for (let loopIndex = sharedValue; loopIndex < valC; loopIndex++) {
                enqueueUpdateIfValueIsGreaterPlusOne(loopIndex, valC, sharedValue, loopIndex);
            }
            for (let loopIndex = valC; loopIndex <= numElements; loopIndex++) {
                enqueueUpdateIfValueIsGreaterPlusOne(valC, loopIndex, sharedValue, loopIndex);
            }
        }
    }

    // Main processing logic for each triple
    function processTriple(coord1, coord2, coord3) {
        if (coord1 === coord3) {
            adjustmentFactor++;
            return;
        }

        // Step 1 configurations
        processConfigurationStep1(coord1);
        if (coord1 < coord2) processConfigurationStep1(coord2);
        if (coord2 < coord3) processConfigurationStep1(coord3);

        // Step 2 configurations
        processConfigurationStep2(coord1, coord2);
        if (coord2 < coord3) processConfigurationStep2(coord1, coord3);
        if (coord1 < coord2) processConfigurationStep2(coord2, coord3);

        // Step 3 configurations
        processConfigurationStep3(coord1, coord2, coord3);

        // Apply all queued updates to the DP table
        while (updateQueue.length) {
            const valueToSet = updateQueue.pop();
            const targetY = updateQueue.pop();
            const targetX = updateQueue.pop();
            if (dynamicProgrammingTable[targetX][targetY] < valueToSet) {
                dynamicProgrammingTable[targetX][targetY] = valueToSet;
            }
        }
    }

    // Loop through N-1 iterations
    for (let iterationCount = 1; iterationCount < numElements; iterationCount++) {
        let currentTriple = inputHandler.getNextIntegers(3).sort((a, b) => a - b);
        processTriple(...currentTriple);
    }

    const finalInputElement = inputHandler.getNextInteger();
    const resultCandidate1 = dynamicProgrammingTable[0][0];
    const resultCandidate2 = dynamicProgrammingTable[finalInputElement][finalInputElement] + 1;

    return Math.max(resultCandidate1, resultCandidate2) + adjustmentFactor;
}

// Execute the program and print the result
const finalOutput = executeProblemSolver();
if (finalOutput !== undefined) {
    console.log(String(finalOutput));
}
