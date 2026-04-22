let fileContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
const tokenCache = fileContent.split(/ |\n/);
let tokenIndex = 0;

// Utility functions for input parsing
const readInteger = () => {
    let value = tokenCache[tokenIndex++];
    // Add a check for non-numeric input, although competitive programming usually guarantees valid input.
    if (isNaN(value)) {
        throw new Error(`Expected number, got '${value}' at index ${tokenIndex - 1}`);
    }
    return Number(value);
};

const readStringToken = () => tokenCache[tokenIndex++];

const readBigInteger = () => {
    let value = tokenCache[tokenIndex++];
    // Add a check for non-numeric input for BigInt
    if (!/^-?\d+$/.test(value)) {
        throw new Error(`Expected big integer, got '${value}' at index ${tokenIndex - 1}`);
    }
    return BigInt(value);
};

const readIntegersArray = (count, mapToNumber = true) => {
    let start = tokenIndex;
    tokenIndex += count;
    let sliced = tokenCache.slice(start, tokenIndex);
    return mapToNumber ? sliced.map(Number) : sliced;
};

// This function is not used in the main logic, but cloned for completeness.
const readSortedIntegers = (count, descending = false) => {
    const numbers = readIntegersArray(count);
    return descending ? numbers.sort((a, b) => b - a) : numbers.sort((a, b) => a - b);
};

// This function is not used in the main logic, but cloned for completeness.
const readMatrixData = (height, width, asStrings = false) => {
    const matrixRows = [];
    for (let rowIdx = 0; rowIdx < height; ++rowIdx) {
        const rowSlice = tokenCache.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        matrixRows.push(asStrings ? rowSlice : rowSlice.map(Number));
    }
    return matrixRows;
};

// This function is not used in the main logic, but cloned for completeness.
// It uses eval, which is generally discouraged, but present in the original.
const generateMultiDimensionalArray = (initialValue) => {
    const args = arguments;
    const argCount = args.length;
    let currentDim = argCount - 1;
    let arrayCreationString = `Array(args[${currentDim}]).fill().map(() => { return ${initialValue}; })`;
    while (--currentDim > 0) {
        arrayCreationString = `Array(args[${currentDim}]).fill().map(() => ${arrayCreationString})`;
    }
    return eval(arrayCreationString);
};

const outputBuffer = [];
const appendToOutput = (message) => {
    outputBuffer.push(message);
};

// --- Segment Tree Implementation ---
const DEFAULT_SEGMENT_VALUE = 0; // Default value for segment tree nodes

class MaxSegmentTree {
    #treeNodes;
    #leafOffset; // Offset to the first leaf node

    constructor(initialSize) {
        if (initialSize <= 0) {
            throw new Error("Segment tree size must be positive.");
        }
        let effectiveSize = 1;
        // Calculate the smallest power of 2 greater than or equal to initialSize
        while (effectiveSize < initialSize) {
            effectiveSize <<= 1; // equivalent to effectiveSize * 2
        }
        this.#treeNodes = new Array(2 * effectiveSize - 1).fill(DEFAULT_SEGMENT_VALUE);
        this.#leafOffset = effectiveSize;
    }

    // Retrieves the maximum value in the range [0, targetIndex]
    queryMaximum(targetIndex) {
        let currentNodeIdx = targetIndex + this.#leafOffset - 1;
        let runningMax = DEFAULT_SEGMENT_VALUE;

        // Traverse up from the leaf node to the root
        while (currentNodeIdx >= 0) {
            if (this.#treeNodes[currentNodeIdx] > runningMax) {
                runningMax = this.#treeNodes[currentNodeIdx];
            }
            // Move to the parent node.
            // (currentNodeIdx - 1) / 2 for 0-indexed parent, floor operation implicit with >>1
            currentNodeIdx = (currentNodeIdx - 1) >> 1;
        }
        return runningMax;
    }

    // Updates the range [lowerBound, upperBoundExclusive) with a new value
    rangeUpdate(lowerBound, upperBoundExclusive, newValue) {
        if (lowerBound >= upperBoundExclusive) {
            // Invalid range or empty range, nothing to update.
            return;
        }

        // Helper recursive function for range updates
        const recursiveUpdate = (currentL, currentR, treeNodeStart, treeNodeEnd, treeNodeIdx) => {
            // Check for full overlap: if the current segment fully covers the update range
            if (currentL === treeNodeStart && currentR === treeNodeEnd) {
                this.#treeNodes[treeNodeIdx] = newValue;
                return;
            }

            // Calculate the midpoint of the current tree node's segment
            const midPoint = (treeNodeStart + treeNodeEnd) >> 1;

            // Determine which children to recurse into
            if (midPoint < currentR) { // Update range extends into or beyond the right child's segment
                if (currentL < midPoint) { // Update range also extends into the left child's segment
                    recursiveUpdate(currentL, midPoint, treeNodeStart, midPoint, 2 * treeNodeIdx + 1); // Left child
                    recursiveUpdate(midPoint, currentR, midPoint, treeNodeEnd, 2 * treeNodeIdx + 2); // Right child
                } else { // Update range is entirely within the right child's segment
                    recursiveUpdate(currentL, currentR, midPoint, treeNodeEnd, 2 * treeNodeIdx + 2); // Right child
                }
            } else { // Update range is entirely within the left child's segment
                recursiveUpdate(currentL, currentR, treeNodeStart, midPoint, 2 * treeNodeIdx + 1); // Left child
            }
        };

        // Initiate the recursive update from the root
        recursiveUpdate(lowerBound, upperBoundExclusive, 0, this.#leafOffset, 0);
    }
}

// --- Main Program Execution ---
const executeSolution = () => {
    // Define constants for array bounds
    const MAX_POSSIBLE_VALUE = 300000;
    const SEGMENT_TREE_CAPACITY = MAX_POSSIBLE_VALUE + 1; // Max value + 1 for 0-indexed values up to MAX_POSSIBLE_VALUE

    // Read problem parameters
    const problemParameters = readIntegersArray(2);
    const elementCount = problemParameters[0];
    const rangeModifier = problemParameters[1];

    if (elementCount <= 0 || rangeModifier < 0) {
        // Basic input validation
        return 0; // Or throw an error, depending on problem constraints
    }

    // Read the array of input values
    const inputValues = readIntegersArray(elementCount);

    // Initialize the segment tree
    const segmentStructure = new MaxSegmentTree(SEGMENT_TREE_CAPACITY);

    // Process each input value
    for (let idx = 0; idx < elementCount; ++idx) {
        const currentValue = inputValues[idx];

        // Calculate the effective range for the update
        const effectiveLeftBound = Math.max(0, currentValue - rangeModifier);
        const effectiveRightBound = Math.min(MAX_POSSIBLE_VALUE, currentValue + rangeModifier);

        // Query the current maximum ending at currentValue
        const previousMax = segmentStructure.queryMaximum(currentValue);

        // Update the segment tree for the calculated range
        // The range is [effectiveLeftBound, effectiveRightBound + 1)
        segmentStructure.rangeUpdate(effectiveLeftBound, effectiveRightBound + 1, previousMax + 1);
    }

    // Find the overall maximum value in the segment tree
    let overallMaximum = 0;
    let checkIdx = 0;
    while (checkIdx <= MAX_POSSIBLE_VALUE) {
        const valueAtIndex = segmentStructure.queryMaximum(checkIdx);
        if (valueAtIndex > overallMaximum) {
            overallMaximum = valueAtIndex;
        }
        checkIdx++;
    }

    return overallMaximum;
};

const finalResult = executeSolution();

// Output the results
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

if (outputBuffer.length > 0) {
    console.log(outputBuffer.join("\n"));
}