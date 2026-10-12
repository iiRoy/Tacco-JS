var DATA_PARSER = (function () {
    // Factory function to create a new InputParser instance.
    function createParser(inputString) {
        return new InputParser(inputString);
    }

    // Constructor for the InputParser class.
    function InputParser(inputString) {
        // Store lines of input, trimmed and split by newline.
        this._sourceLines = inputString.trim().split("\n");
        // Current line index being processed.
        this._currentLineIndex = 0;
    }

    // Prototype methods for InputParser.
    InputParser.prototype = {
        // Reads a single number or string from the current line.
        // If 'returnAsString' is true, returns the value as a string; otherwise, as a number.
        readNumberOrString: function (returnAsString) {
            var lineData = this._sourceLines,
                lineIdx = this._currentLineIndex,
                parsedValue;

            // If the current line hasn't been split into tokens yet, do so and reverse for easy popping.
            if (typeof lineData[lineIdx] === "string") {
                lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
            }

            // Pop the last token from the current line.
            parsedValue = lineData[lineIdx].pop();

            // If the current line is exhausted, advance to the next line.
            if (!lineData[lineIdx].length) {
                this._currentLineIndex++;
            }

            // Return the value, converting to number if 'returnAsString' is false.
            return returnAsString ? parsedValue : +parsedValue;
        },

        // Reads an entire line, splitting it into tokens.
        // If 'returnStrings' is true, returns an array of strings; otherwise, an array of numbers.
        readLine: function (returnStrings) {
            var tokens = this._sourceLines[this._currentLineIndex++].split(" ");
            return returnStrings ? tokens : tokens.map(val => +val);
        },

        // Reads 'numRows' lines and parses them into a matrix.
        // If 'returnStringMatrix' is true, returns a matrix of strings; otherwise, a matrix of numbers.
        readMatrix: function (numRows, returnStringMatrix) {
            var resultMatrix = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                .map(line => line.split(" "));
            return returnStringMatrix ? resultMatrix : resultMatrix.map(row => row.map(val => +val));
        },

        // Reads 'count' lines and parses each into a single number or string.
        // If 'returnRawStrings' is true, returns an array of strings; otherwise, an array of numbers.
        readNumbers: function (count, returnRawStrings) {
            var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
            return returnRawStrings ? rawLines : rawLines.map(val => +val);
        }
    };

    return createParser;
})();

// Initialize the input reader with data from stdin.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays.
function initializeMultiDimArray(initialValue) {
    var args = arguments,
        argLength = args.length,
        arrayCreationString = "Array(args[" + --argLength + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        arrayCreationString = "Array(args[" + argLength + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Performs a binary search to find the lower bound index in a sorted array.
function findLowerBoundIndex(dataArray, startIndex, endIndex, targetValue) {
    for (var midIndex; 1 < endIndex - startIndex;) {
        midIndex = Math.floor((startIndex + endIndex) / 2);
        if (dataArray[midIndex] < targetValue) {
            startIndex = midIndex;
        } else {
            endIndex = midIndex;
        }
    }
    return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

// Segment Tree implementation for range minimum queries and range updates.
function SegmentTree(treeSize) {
    var tempSize = treeSize - 1,
        powerOfTwoSize = 2;
    // Calculate the smallest power of 2 greater than or equal to treeSize.
    while (tempSize) {
        tempSize >>= 1;
        powerOfTwoSize <<= 1;
    }
    // Initialize the segment array with a large value (representing infinity).
    this.segmentArray = Array(powerOfTwoSize - 1).fill(2000000000);
    // Store the offset to the first leaf node.
    this.leafOffset = powerOfTwoSize >> 1;
}

// Prototype methods for SegmentTree.
SegmentTree.prototype = {
    // Queries the minimum value for a specific index.
    queryMin: function (queryIndex) {
        // Adjust index to point to the corresponding leaf node.
        queryIndex += this.leafOffset - 1;
        var currentMin = 2000000000;
        // Traverse up the tree from the leaf to the root.
        while (queryIndex >= 0) {
            if (this.segmentArray[queryIndex] < currentMin) {
                currentMin = this.segmentArray[queryIndex];
            }
            queryIndex = (queryIndex - 1) >> 1; // Move to parent node.
        }
        // If no value was found (still infinity), return -1.
        if (currentMin === 2000000000) {
            currentMin = -1;
        }
        return currentMin;
    },

    // Updates a range [rangeStart, rangeEnd) with a new value.
    updateRange: function (rangeStart, rangeEnd, newValue) {
        var treeValues = this.segmentArray;
        // Start the recursive update from the root (index 0).
        recursiveUpdate(rangeStart, rangeEnd, 0, this.leafOffset, 0);

        // Inner recursive function for updating the segment tree.
        function recursiveUpdate(currentRangeStart, currentRangeEnd, nodeRangeStart, nodeRangeEnd, nodeIndex) {
            // If the current node's range exactly matches the update range, update its value.
            if (currentRangeStart === nodeRangeStart && currentRangeEnd === nodeRangeEnd) {
                treeValues[nodeIndex] = newValue;
                return;
            }

            var midPoint = (nodeRangeStart + nodeRangeEnd) >> 1;

            // Determine which child nodes to recurse into.
            if (midPoint < currentRangeEnd) { // Update range extends into the right child's domain.
                if (currentRangeStart < midPoint) { // Update range also covers part of the left child's domain.
                    recursiveUpdate(currentRangeStart, midPoint, nodeRangeStart, midPoint, nodeIndex * 2 + 1);
                    recursiveUpdate(midPoint, currentRangeEnd, midPoint, nodeRangeEnd, nodeIndex * 2 + 2);
                } else { // Update range is entirely within the right child's domain.
                    recursiveUpdate(currentRangeStart, currentRangeEnd, midPoint, nodeRangeEnd, nodeIndex * 2 + 2);
                }
            } else { // Update range is entirely within the left child's domain.
                recursiveUpdate(currentRangeStart, currentRangeEnd, nodeRangeStart, midPoint, nodeIndex * 2 + 1);
            }
        }
    },
};

// Execute the main processing logic and print the result.
console.log(processData());

// Main function to process the input and solve the problem.
function processData() {
    var numItems = inputReader.readNumberOrString();
    var numQueries = inputReader.readNumberOrString();
    var itemData = inputReader.readMatrix(numItems);
    var queryValues = inputReader.readNumbers(numQueries);

    var segmentTreeInstance = new SegmentTree(numQueries);

    // Sort item data in descending order based on the third element (index 2).
    itemData.sort((itemA, itemB) => itemB[2] - itemA[2]);

    // Process each item.
    for (var idx = 0; idx < numItems; idx++) {
        // Skip if the item's effective start position is less than the first query value.
        if (itemData[idx][1] - itemData[idx][2] - 1 < queryValues[0]) {
            continue;
        }

        // Find the lower bound for the start of the range.
        var rangeLeft = findLowerBoundIndex(queryValues, 0, numQueries, itemData[idx][0] - itemData[idx][2]);
        // Find the lower bound for the end of the range, starting search from rangeLeft.
        var rangeRight = findLowerBoundIndex(queryValues, rangeLeft, numQueries, itemData[idx][1] - itemData[idx][2]);

        // Update the segment tree for the determined range with the item's third value.
        segmentTreeInstance.updateRange(rangeLeft, rangeRight, itemData[idx][2]);
    }

    var resultArray = Array(numQueries);
    // Query the segment tree for each query index.
    for (var idx = 0; idx < numQueries; idx++) {
        resultArray[idx] = segmentTreeInstance.queryMin(idx);
    }

    // Join the results with newlines and return.
    return resultArray.join("\n");
}
