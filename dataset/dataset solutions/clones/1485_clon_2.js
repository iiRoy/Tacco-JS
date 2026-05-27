"use strict";
// This section handles input reading from standard input.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenBuffer = rawData.split(/ |\n/), tokenIndex = 0x0;

// Function to read the next number from the input buffer.
function readNum() {
    return +tokenBuffer[tokenIndex++];
}

// Function to read the next string from the input buffer.
function readStr() {
    return tokenBuffer[tokenIndex++];
}

// Function to read the next BigInt from the input buffer.
function readBigInt() {
    return BigInt(tokenBuffer[tokenIndex++]);
}

// Function to read 'count' numbers, optionally mapping them.
function readNums(count, mapFn) {
    if (mapFn) {
        return tokenBuffer.slice(tokenIndex, tokenIndex += count);
    } else {
        return tokenBuffer.slice(tokenIndex, tokenIndex += count).map(val => +val);
    }
}

// Function to read 'count' numbers, parse them, and sort.
function readSortedNums(count, descending) {
    if (descending) {
        return tokenBuffer.slice(tokenIndex, tokenIndex += count).map(val => +val).sort((a, b) => b - a);
    } else {
        return tokenBuffer.slice(tokenIndex, tokenIndex += count).map(val => +val).sort((a, b) => a - b);
    }
}

// Function to read a matrix of 'height' rows and 'width' columns.
function readMatrix(height, width, asStrings) {
    var resultMatrix = [], rowCounter = 0x0;
    if (asStrings) {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += width).map(val => +val));
        }
    }
    return resultMatrix;
}

// Utility to create multi-dimensional arrays.
function createMultiDimArray(initialValue) {
    var args = arguments, argCount = args.length, evalString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        evalString = "Array(args[" + argCount + "]).fill().map(x=>" + evalString + ")";
    }
    return eval(evalString);
}

// Output buffering system.
var outputQueue = [];
function enqueueOutput(content) {
    outputQueue.push(content);
}

// Default value for segment tree nodes.
var defaultVal = 0x0;

// Segment Tree implementation.
function SegmentTreeDataStructure(initialSize) {
    var powerOfTwoSize = 0x2;
    initialSize--;
    while (initialSize) {
        initialSize >>= 0x1;
        powerOfTwoSize <<= 0x1;
    }
    this.treeArray = new Array(powerOfTwoSize - 0x1).fill(defaultVal);
    this.leafOffset = powerOfTwoSize >> 0x1;
}

SegmentTreeDataStructure.prototype = {
    // Queries the maximum value in the path from a leaf to the root.
    queryMax: function(targetIndex) {
        var currentTree = this.treeArray;
        targetIndex += this.leafOffset - 0x1;
        var maxResult = defaultVal;
        while (targetIndex >= 0x0) {
            if (currentTree[targetIndex] > maxResult) {
                maxResult = currentTree[targetIndex];
            }
            targetIndex = (targetIndex - 0x1) >> 0x1;
        }
        return maxResult;
    },

    // Updates a range [rangeStart, rangeEnd) with a new value.
    applyUpdate: function(rangeStart, rangeEnd, newValue) {
        if (rangeStart >= rangeEnd) {
            return;
        }
        var thisInstance = this;
        // Helper recursive function for range updates.
        recursiveUpdate(rangeStart, rangeEnd, 0x0, this.leafOffset, 0x0);

        function recursiveUpdate(currentRangeStart, currentRangeEnd, nodeRangeStart, nodeRangeEnd, nodeIndex) {
            // If the current node's range perfectly matches the update range.
            if (currentRangeStart === nodeRangeStart && currentRangeEnd === nodeRangeEnd) {
                thisInstance.treeArray[nodeIndex] = newValue;
                return;
            }
            var midPoint = (nodeRangeStart + nodeRangeEnd) >> 0x1;
            // Determine which child nodes to recurse into.
            if (midPoint < currentRangeEnd) {
                if (currentRangeStart < midPoint) {
                    recursiveUpdate(currentRangeStart, midPoint, nodeRangeStart, midPoint, nodeIndex + nodeIndex + 0x1);
                    recursiveUpdate(midPoint, currentRangeEnd, midPoint, nodeRangeEnd, (nodeIndex + 0x1) << 0x1);
                } else {
                    recursiveUpdate(midPoint, currentRangeEnd, midPoint, nodeRangeEnd, (nodeIndex + 0x1) << 0x1);
                }
            } else {
                recursiveUpdate(currentRangeStart, currentRangeEnd, nodeRangeStart, midPoint, nodeIndex + nodeIndex + 0x1);
            }
        }
    },
};

// Execute the main solution logic.
var finalResult = executeSolution();

// Output the main result if it's not undefined.
if (finalResult !== void 0) {
    console.log(String(finalResult));
}

// Output any buffered streams.
if (outputQueue.length > 0x0) {
    console.log(outputQueue.join("\n"));
}

// Main function containing the problem's logic.
function executeSolution() {
    // Read N and K from input.
    var [elementCount, rangeParam] = readNums(0x2);
    // Read the array 'a'.
    var inputArray = readNums(elementCount);

    // Initialize a segment tree with a size suitable for values up to 300000.
    var segmentTreeInstance = new SegmentTreeDataStructure(300001);

    // Process each element in the input array.
    for (var idx = 0x0; idx < elementCount; idx++) {
        // Calculate the effective range [L, R] for the current element.
        var lowerBound = Math.max(0x0, inputArray[idx] - rangeParam);
        var upperBound = Math.min(300000, inputArray[idx] + rangeParam);

        // Query the current maximum value at inputArray[idx] in the segment tree.
        var currentMaxVal = segmentTreeInstance.queryMax(inputArray[idx]);

        // Update the segment tree for the calculated range with (currentMaxVal + 1).
        // Note: The range is [lowerBound, upperBound + 1) as per segment tree convention.
        segmentTreeInstance.applyUpdate(lowerBound, upperBound + 0x1, currentMaxVal + 0x1);
    }

    // Find the overall maximum value in the segment tree across all possible indices.
    var overallMax = 0x0;
    for (var idx = 0x0; idx <= 300000; idx++) {
        overallMax = Math.max(overallMax, segmentTreeInstance.queryMax(idx));
    }

    // Return the final answer.
    return overallMax;
}
