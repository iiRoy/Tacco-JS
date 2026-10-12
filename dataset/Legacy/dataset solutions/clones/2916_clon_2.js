var INPUT_PARSER = (function () {
    // This function serves as a factory to create new instances of the data stream processor.
    function createParser(inputString) {
        return new DataStream(inputString);
    }

    // The DataStream constructor initializes the input source.
    function DataStream(inputString) {
        // The raw input string is trimmed of leading/trailing whitespace and split into individual lines.
        this._sourceLines = inputString.trim().split("\n");
        // A pointer to the current line being processed is initialized to the first line.
        this._currentLineIndex = 0;
    }

    // This method extracts a single value from the current line.
    // If 'asString' is true, the value is returned as a string; otherwise, it's converted to a number.
    DataStream.prototype.readSingleValue = function (asString) {
        var currentLineData = this._sourceLines,
            lineIdx = this._currentLineIndex,
            resultValue;

        // If the current line has not yet been parsed into an array of tokens, do so.
        // The tokens are reversed to allow efficient extraction using `pop()`.
        if (typeof currentLineData[lineIdx] === "string") {
            currentLineData[lineIdx] = currentLineData[lineIdx].split(" ").reverse();
        }

        // Retrieve the last token from the current line's array.
        resultValue = currentLineData[lineIdx].pop();

        // If the current line is now exhausted, advance the line pointer.
        if (!currentLineData[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return the extracted value, applying numeric conversion if 'asString' is not set.
        return asString ? resultValue : +resultValue;
    };

    // This method reads an entire line, splitting it into an array of values.
    // If 'asString' is true, an array of strings is returned; otherwise, an array of numbers.
    DataStream.prototype.readLineOfValues = function (asString) {
        // Fetch the current line, split it by spaces, and then increment the line index.
        var currentLineValues = this._sourceLines[this._currentLineIndex++].split(" ");
        // Map the values to numbers if 'asString' is false, otherwise return as strings.
        return asString ? currentLineValues : currentLineValues.map(item => +item);
    };

    // This method reads a block of 'numLines' lines, treating each as a row in a matrix.
    // Each row is split into values. The 'asString' flag determines value type.
    DataStream.prototype.readMatrix = function (numLines, asString) {
        // Extract a slice of lines, then process each line into an array of values.
        var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines).map(item => item.split(" "));
        // Convert all elements to numbers if 'asString' is false.
        return asString ? matrixRows : matrixRows.map(row => row.map(item => +item));
    };

    // This method reads a specified number of raw lines without further splitting.
    // If 'asString' is true, an array of strings is returned; otherwise, an array of numbers.
    DataStream.prototype.readRawLines = function (numLines, asString) {
        // Obtain a segment of lines from the source.
        var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // Convert lines to numbers if 'asString' is false.
        return asString ? rawLines : rawLines.map(item => +item);
    };

    // The factory function is returned, making it the public interface of the IIFE.
    return createParser;
})();

// Instantiate the input reader by consuming data from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// This utility function dynamically constructs multi-dimensional arrays.
// It is not utilized in the primary logic of this script.
function createMultiDimArray(initialValue) {
    var argsList = arguments,
        argCount = argsList.length,
        arrayCreationString = "Array(argsList[" + --argCount + "]).fill(0).map(_ => {return " + initialValue + ";})";
    // Build the array creation string for higher dimensions.
    while (--argCount) {
        arrayCreationString = "Array(argsList[" + argCount + "]).fill(0).map(_ => " + arrayCreationString + ")";
    }
    // Execute the dynamically generated string to create the array.
    return eval(arrayCreationString);
}

// Execute the main calculation function and print its result to the console.
console.log(calculateMaxSum());

// The core function that computes the maximum possible sum.
function calculateMaxSum() {
    // Read the total number of elements (N) and the maximum allowed operations (K).
    var totalElements = inputReader.readSingleValue();
    var maxOperations = inputReader.readSingleValue();
    // Read the array of integer values.
    var valueArray = inputReader.readLineOfValues();

    // Initialize the variable to store the highest sum found.
    var maximumSum = 0;

    // Outer loop: Iterates through all possible counts of elements taken from the ends,
    // up to 'maxOperations' or 'totalElements', whichever is smaller.
    for (var currentOperationCount = 0; currentOperationCount <= maxOperations && currentOperationCount < totalElements; currentOperationCount++) {
        // Inner loop: Determines how many of the 'currentOperationCount' elements are taken from the left side.
        for (var leftElementsCount = 0; leftElementsCount <= currentOperationCount; leftElementsCount++) {
            // A temporary array to hold any negative values encountered.
            var negativeValues = [];
            // The sum for the current combination of elements.
            var currentSum = 0;

            // Process elements taken from the left end of the array.
            for (var leftIndex = 0; leftIndex < leftElementsCount; leftIndex++) {
                // If an element is negative, add it to our list of negative values.
                if (valueArray[leftIndex] < 0) {
                    negativeValues.push(valueArray[leftIndex]);
                }
                // Accumulate the value into the current sum.
                currentSum += valueArray[leftIndex];
            }

            // Process elements taken from the right end of the array.
            // The number of elements from the right is (currentOperationCount - leftElementsCount).
            for (var rightIndex = 0; rightIndex < currentOperationCount - leftElementsCount; rightIndex++) {
                // Check for negative values from the right side.
                if (valueArray[totalElements - 1 - rightIndex] < 0) {
                    negativeValues.push(valueArray[totalElements - 1 - rightIndex]);
                }
                // Add the value to the current sum.
                currentSum += valueArray[totalElements - 1 - rightIndex];
            }

            // Sort the collected negative values in ascending order to easily remove the smallest ones.
            negativeValues.sort((valA, valB) => valA - valB);

            // Remove the smallest negative values if there are remaining operations (k - i).
            // This effectively increases the sum by turning a negative into a positive contribution.
            for (var negativeRemovalIndex = 0; negativeRemovalIndex < maxOperations - currentOperationCount && negativeRemovalIndex < negativeValues.length; negativeRemovalIndex++) {
                currentSum -= negativeValues[negativeRemovalIndex];
            }

            // Update the overall maximum sum if the current combination yields a higher sum.
            if (currentSum > maximumSum) {
                maximumSum = currentSum;
            }
        }
    }
    // Return the final maximum sum found across all combinations.
    return maximumSum;
}
