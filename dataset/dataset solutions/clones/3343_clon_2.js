var INPUT_PARSER = (function() {
    // Factory function to create an input reader instance.
    function createParser(sourceString) {
        return new InputReader(sourceString);
    }

    // Constructor for the InputReader object.
    function InputReader(sourceString) {
        // Store lines of input, trimmed and split by newline.
        this._lines = sourceString.trim().split("\n");
        // Current line index being processed.
        this._currentLineIndex = 0;
    }

    // Prototype method to read a single value from the current line.
    // If 'asString' is true, returns as string; otherwise, as number.
    InputReader.prototype.readNumberFromLine = function(asString) {
        var linesData = this._lines;
        var lineIdx = this._currentLineIndex;
        var extractedVal;

        // If the current line hasn't been processed into individual tokens yet, do so.
        if (typeof linesData[lineIdx] === "string") {
            linesData[lineIdx] = linesData[lineIdx].split(" ").reverse();
        }

        // Pop the last element (which is the first due to reverse).
        extractedVal = linesData[lineIdx].pop();

        // If the current line is exhausted, advance to the next line.
        if (!linesData[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return the value, converting to number if 'asString' is false.
        return asString ? extractedVal : +extractedVal;
    };

    // Prototype method to read the entire current line as an array of values.
    // Advances the line index.
    InputReader.prototype.readLineAsNumbers = function(asString) {
        var lineTokens = this._lines[this._currentLineIndex++].split(" ");
        // Return as strings or map to numbers.
        return asString ? lineTokens : lineTokens.map(val => +val);
    };

    // Prototype method to read 'count' lines as a matrix (array of arrays).
    // Advances the line index by 'count'.
    InputReader.prototype.readMatrixAsNumbers = function(count, asString) {
        var matrixRows = this._lines.slice(this._currentLineIndex, this._currentLineIndex += count).map(row => row.split(" "));
        // Return as strings or map all elements to numbers.
        return asString ? matrixRows : matrixRows.map(row => row.map(element => +element));
    };

    // Prototype method to read 'count' lines as a simple array of numbers.
    // Advances the line index by 'count'.
    InputReader.prototype.readLinesAsNumbers = function(count, asString) {
        var dataRows = this._lines.slice(this._currentLineIndex, this._currentLineIndex += count);
        // Return as strings or map to numbers.
        return asString ? dataRows : dataRows.map(val => +val);
    };

    return createParser;
})();

// Initialize the input parser with data from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays initialized with a value.
function createMultiDimArray(initialValue) {
    var dimensions = arguments;
    var dimCount = dimensions.length;
    var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(initialValue)";

    // Construct the string for nested Array.fill().map() calls.
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x => " + arrayCreationString + ")";
    }
    // Evaluate the constructed string to create the array.
    return eval(arrayCreationString);
}

// Output the result of the main execution function.
console.log(executeSolution());

// Main function to orchestrate the solution.
function executeSolution() {
    var numElements = inputData.readNumberFromLine(); // Read N
    var inputArray = inputData.readLineAsNumbers();   // Read the array A
    return calculateMinimumCost(numElements, inputArray);
}

// Function to calculate the minimum cost using dynamic programming.
function calculateMinimumCost(elementCount, valuesArray) {
    // Initialize a 2D array 'segmentCost' to store costs of segments.
    // segmentCost[length-1][start_index]
    var segmentCost = createMultiDimArray(0, elementCount, elementCount);

    // Base case: segments of length 1 (cost[0][i]) are just the values themselves.
    for (var idx1 = 0; idx1 < elementCount; idx1++) {
        segmentCost[0][idx1] = valuesArray[idx1];
    }

    // Calculate costs for segments of increasing length.
    // idx1 represents (length - 1)
    // idx2 represents start_index
    for (var idx1 = 1; idx1 < elementCount; idx1++) {
        for (var idx2 = 0; idx2 < elementCount - idx1; idx2++) {
            // Cost of segment [idx2, idx2 + idx1] is cost of [idx2, idx2 + idx1 - 1] + value at [idx2 + idx1]
            segmentCost[idx1][idx2] = segmentCost[idx1 - 1][idx2] + segmentCost[0][idx1 + idx2];
        }
    }

    // Initialize DP table 'minCostDP' with a large value (infinity).
    // minCostDP[length-1][start_index] stores the minimum cost to combine a segment.
    var minCostDP = createMultiDimArray(1e15, elementCount, elementCount);

    // Base case for DP: combining segments of length 1 has 0 cost (already combined).
    minCostDP[0] = createMultiDimArray(0, elementCount);

    // Fill the DP table using a bottom-up approach.
    // idx1: current segment length - 1 (from 1 to n-1)
    // idx2: starting index of the segment
    // idx3: split point within the segment
    for (var idx1 = 1; idx1 < elementCount; idx1++) {
        for (var idx2 = 0; idx2 < elementCount - idx1; idx2++) {
            for (var idx3 = 1; idx3 <= idx1; idx3++) {
                // Calculate cost for splitting the current segment [idx2, idx2+idx1]
                // into two sub-segments:
                // 1. [idx2, idx2 + idx3 - 1] (length idx3)
                // 2. [idx2 + idx3, idx2 + idx1] (length idx1 - idx3 + 1)
                // The cost is the sum of min costs of sub-segments plus the cost of combining them (segmentCost[idx1][idx2]).
                var currentCalcCost = minCostDP[idx3 - 1][idx2] + minCostDP[idx1 - idx3][idx2 + idx3] + segmentCost[idx1][idx2];

                // Update minCostDP if a smaller cost is found.
                if (currentCalcCost < minCostDP[idx1][idx2]) {
                    minCostDP[idx1][idx2] = currentCalcCost;
                }
            }
        }
    }

    // The final result is the minimum cost to combine the entire array (segment of length n, starting at 0).
    return minCostDP[elementCount - 1][0];
}
