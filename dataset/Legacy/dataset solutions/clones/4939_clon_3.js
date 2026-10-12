"use strict";
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenArray = fileContent.split(/ |\n/), currentTokenIndex = 0;

function readNextInt() { return +tokenArray[currentTokenIndex++]; }
function readNextString() { return tokenArray[currentTokenIndex++]; }
function readNextBigInt() { return BigInt(tokenArray[currentTokenIndex++]); }

function readInts(count, useRawStrings) {
    if (useRawStrings) {
        return tokenArray.slice(currentTokenIndex, currentTokenIndex += count);
    } else {
        return tokenArray.slice(currentTokenIndex, currentTokenIndex += count).map(val => +val);
    }
}

function readMatrixData(rows, cols, useRawStrings) {
    var resultMatrix = [], rowIdx = 0;
    if (useRawStrings) {
        for (; rowIdx < rows; rowIdx++) {
            resultMatrix.push(tokenArray.slice(currentTokenIndex, currentTokenIndex += cols));
        }
    } else {
        for (; rowIdx < rows; rowIdx++) {
            resultMatrix.push(tokenArray.slice(currentTokenIndex, currentTokenIndex += cols).map(val => +val));
        }
    }
    return resultMatrix;
}

function initializeMultiDimArray(initialValue) {
    var args = arguments, len = args.length,
        arrayCreationString = "Array(args[" + --len + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--len) {
        arrayCreationString = "Array(args[" + len + "]).fill().map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Helper function for creating segment entries
function createSegmentEntry(value, typeIdentifier) {
    return [value, typeIdentifier]; // typeIdentifier 0 for horizontal, 1 for vertical
}

var finalResult = calculateMinimumCost();
if (finalResult !== undefined) console.log(String(finalResult));

function calculateMinimumCost() {
    var gridWidth = readNextInt();
    var gridHeight = readNextInt();
    var segmentCosts = [];

    // Populate segmentCosts with horizontal cut costs (type 0)
    for (var segmentIdx = 0; segmentIdx < gridWidth; segmentIdx++) {
        var horizontalCutValue = readNextInt();
        segmentCosts.push(createSegmentEntry(horizontalCutValue, 0));
    }

    // Populate segmentCosts with vertical cut costs (type 1)
    for (var segmentIdx = 0; segmentIdx < gridHeight; segmentIdx++) {
        var verticalCutValue = readNextInt();
        segmentCosts.push(createSegmentEntry(verticalCutValue, 1));
    }

    // Sort all segments by their cost in ascending order
    segmentCosts.sort((entryA, entryB) => entryA[0] - entryB[0]);

    var totalMinimumCost = 0n;
    var processedHorizontalCuts = 0;
    var processedVerticalCuts = 0;

    var totalSegmentsToProcess = gridHeight + gridWidth;
    for (var segmentIdx = 0; segmentIdx < totalSegmentsToProcess; segmentIdx++) {
        var currentSegment = segmentCosts[segmentIdx];
        var segmentValue = currentSegment[0];
        var segmentType = currentSegment[1]; // 0 for horizontal, 1 for vertical

        if (segmentType === 0) { // This is a horizontal cut
            // Cost of a horizontal cut depends on how many vertical segments are yet to be cut
            var remainingVerticalSegments = gridHeight - processedVerticalCuts + 1;
            totalMinimumCost += BigInt(remainingVerticalSegments) * BigInt(segmentValue);
            processedHorizontalCuts++;
        } else { // This is a vertical cut
            // Cost of a vertical cut depends on how many horizontal segments are yet to be cut
            var remainingHorizontalSegments = gridWidth - processedHorizontalCuts + 1;
            totalMinimumCost += BigInt(remainingHorizontalSegments) * BigInt(segmentValue);
            processedVerticalCuts++;
        }
    }
    return totalMinimumCost;
}
