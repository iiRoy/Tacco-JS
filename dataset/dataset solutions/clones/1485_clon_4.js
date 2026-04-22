"use strict";
var dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenArray = dataStream.split(/ |\n/);
var tokenIndex = 0;

function fetchNumericValue() { return +tokenArray[tokenIndex++]; }
function fetchStringValue() { return tokenArray[tokenIndex++]; }
function fetchBigIntValue() { return BigInt(tokenArray[tokenIndex++]); }
function fetchNumericArray(count) { return tokenArray.slice(tokenIndex, tokenIndex += count).map(v => +v); }
function fetchStringArray(count) { return tokenArray.slice(tokenIndex, tokenIndex += count); }
function fetchSortedNumericArray(count, descending) { return tokenArray.slice(tokenIndex, tokenIndex += count).map(v => +v).sort((a, b) => descending ? b - a : a - b); }
function fetchMatrix(height, width, asStrings) {
    var matrixRows = [], i = 0;
    if (asStrings) {
        for (; i < height; i++) matrixRows.push(tokenArray.slice(tokenIndex, tokenIndex += width));
    } else {
        for (; i < height; i++) matrixRows.push(tokenArray.slice(tokenIndex, tokenIndex += width).map(v => +v));
    }
    return matrixRows;
}
function generateMultiDimArray(initialValue) {
    var args = arguments, length = args.length, evalString = "Array(args[" + --length + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--length) evalString = "Array(args[" + length + "]).fill().map(x=>" + evalString + ")";
    return eval(evalString);
}

var recordedOutputs = [];
function recordOutput(content) { recordedOutputs.push(content); }

var baseValue = 0;

function IntervalManager(upperBound) {
    var powerOfTwoSize = 1;
    while (powerOfTwoSize < upperBound) {
        powerOfTwoSize <<= 1;
    }
    this.treeRangeSize = powerOfTwoSize;
    this.dataStorage = new Array(2 * powerOfTwoSize).fill(baseValue);
    this.pendingUpdates = new Array(2 * powerOfTwoSize).fill(null);
}

IntervalManager.prototype = {
    propagateLazy: function(nodeIndex, nodeStart, nodeEnd) {
        if (this.pendingUpdates[nodeIndex] !== null) {
            // Apply lazy value to current node's stored value
            this.dataStorage[nodeIndex] = Math.max(this.dataStorage[nodeIndex], this.pendingUpdates[nodeIndex]);

            // If not a leaf node, push lazy tag to children
            if (nodeEnd - nodeStart > 1) {
                this.pendingUpdates[nodeIndex * 2] = Math.max(
                    this.pendingUpdates[nodeIndex * 2] === null ? baseValue : this.pendingUpdates[nodeIndex * 2],
                    this.pendingUpdates[nodeIndex]
                );
                this.pendingUpdates[nodeIndex * 2 + 1] = Math.max(
                    this.pendingUpdates[nodeIndex * 2 + 1] === null ? baseValue : this.pendingUpdates[nodeIndex * 2 + 1],
                    this.pendingUpdates[nodeIndex]
                );
            }
            // Clear current node's lazy tag
            this.pendingUpdates[nodeIndex] = null;
        }
    },

    assignMaximumToRange: function(queryStart, queryEnd, newValue, nodeIndex = 1, nodeStart = 0, nodeEnd = this.treeRangeSize) {
        this.propagateLazy(nodeIndex, nodeStart, nodeEnd);

        // If current node's range is completely outside the query range
        if (nodeStart >= queryEnd || nodeEnd <= queryStart) {
            return;
        }

        // If current node's range is completely inside the query range
        if (nodeStart >= queryStart && nodeEnd <= queryEnd) {
            this.dataStorage[nodeIndex] = Math.max(this.dataStorage[nodeIndex], newValue);
            // Mark children for lazy propagation if not a leaf
            if (nodeEnd - nodeStart > 1) {
                this.pendingUpdates[nodeIndex * 2] = Math.max(
                    this.pendingUpdates[nodeIndex * 2] === null ? baseValue : this.pendingUpdates[nodeIndex * 2],
                    newValue
                );
                this.pendingUpdates[nodeIndex * 2 + 1] = Math.max(
                    this.pendingUpdates[nodeIndex * 2 + 1] === null ? baseValue : this.pendingUpdates[nodeIndex * 2 + 1],
                    newValue
                );
            }
            return;
        }

        // If current node's range partially overlaps, recurse
        var mid = Math.floor((nodeStart + nodeEnd) / 2);
        this.assignMaximumToRange(queryStart, queryEnd, newValue, nodeIndex * 2, nodeStart, mid);
        this.assignMaximumToRange(queryStart, queryEnd, newValue, nodeIndex * 2 + 1, mid, nodeEnd);
        
        // For point query, the value is derived from the leaf. No need to aggregate max from children for parent node here.
        // This is important for range MAX update, point query.
    },

    retrieveSpecificValue: function(queryPoint, nodeIndex = 1, nodeStart = 0, nodeEnd = this.treeRangeSize) {
        this.propagateLazy(nodeIndex, nodeStart, nodeEnd);

        // If we've reached a leaf node covering the query point
        if (nodeEnd - nodeStart === 1) {
            return this.dataStorage[nodeIndex];
        }

        // Recurse to find the leaf
        var mid = Math.floor((nodeStart + nodeEnd) / 2);
        if (queryPoint < mid) {
            return this.retrieveSpecificValue(queryPoint, nodeIndex * 2, nodeStart, mid);
        } else {
            return this.retrieveSpecificValue(queryPoint, nodeIndex * 2 + 1, mid, nodeEnd);
        }
    }
};

function executeCoreLogic() {
    var [countItems, maxDiff] = fetchNumericArray(2);
    var itemValues = fetchNumericArray(countItems);

    const MAX_POSSIBLE_VALUE_PLUS_ONE = 300001;
    var intervalHandler = new IntervalManager(MAX_POSSIBLE_VALUE_PLUS_ONE);

    for (var i = 0; i < countItems; i++) {
        var currentVal = itemValues[i];
        var lowerBound = Math.max(0, currentVal - maxDiff);
        var upperBound = Math.min(MAX_POSSIBLE_VALUE_PLUS_ONE - 1, currentVal + maxDiff);

        var previousMaxChainLen = intervalHandler.retrieveSpecificValue(currentVal);
        intervalHandler.assignMaximumToRange(lowerBound, upperBound + 1, previousMaxChainLen + 1);
    }

    var overallMaxResult = 0;
    for (var j = 0; j < MAX_POSSIBLE_VALUE_PLUS_ONE; j++) {
        overallMaxResult = Math.max(overallMaxResult, intervalHandler.retrieveSpecificValue(j));
    }
    return overallMaxResult;
}

var finalResult = executeCoreLogic();
if (finalResult !== undefined) console.log(String(finalResult));
if (recordedOutputs.length) console.log(recordedOutputs.join("\n"));