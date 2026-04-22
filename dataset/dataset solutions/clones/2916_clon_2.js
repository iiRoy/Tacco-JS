var INPUT_READER = (function() {
    // This function acts as the public API to create a new input processor instance.
    function createInputProcessor(sourceData) {
        return new InputTextProcessor(sourceData);
    }

    // The core class for processing input text line by line.
    function InputTextProcessor(rawData) {
        // Store the processed lines of text, trimmed and split by newline.
        this._textLines = rawData.trim().split("\n");
        // Keep track of the current line being processed.
        this._currentLinePosition = 0;
    }

    // Method to extract a single value from the current line.
    InputTextProcessor.prototype.getNextElement = function(returnAsString) {
        var currentLines = this._textLines;
        var linePointer = this._currentLinePosition;
        var extractedElement;

        // If the current line hasn't been processed into an array of elements yet, do it now.
        // It's reversed to allow efficient popping from the end.
        if (typeof currentLines[linePointer] === "string") {
            currentLines[linePointer] = currentLines[linePointer].split(" ").reverse();
        }

        // Pop the last element from the current line's array.
        extractedElement = currentLines[linePointer].pop();

        // If the current line is now empty, advance to the next line.
        if (!currentLines[linePointer].length) {
            this._currentLinePosition++;
        }

        // Return the element either as a string or converted to a number.
        return returnAsString ? extractedElement : +extractedElement;
    };

    // Method to read an entire line and return its elements.
    InputTextProcessor.prototype.getLineAsNumbers = function(outputAsText) {
        // Get the current line, incrementing the pointer, and split it by spaces.
        var lineSegments = this._textLines[this._currentLinePosition++].split(" ");
        // Return segments as strings or map them to numbers.
        return outputAsText ? lineSegments : lineSegments.map(item => +item);
    };

    // Method to read a matrix (multiple lines) of values.
    InputTextProcessor.prototype.readMatrixOfNumbers = function(numberOfRows, outputAsStrings) {
        // Extract a slice of lines, incrementing the pointer by numberOfRows.
        // Each line is then split into an array of strings.
        var matrixData = this._textLines.slice(this._currentLinePosition, this._currentLinePosition += numberOfRows).map(rowString => rowString.split(" "));
        // Return the matrix as strings or convert all elements to numbers.
        return outputAsStrings ? matrixData : matrixData.map(row => row.map(val => +val));
    };

    // Method to read a block of raw lines.
    InputTextProcessor.prototype.readRawLinesAsNumbers = function(lineCount, keepAsStrings) {
        // Get a slice of raw lines without splitting individual elements.
        var rawLineData = this._textLines.slice(this._currentLinePosition, this._currentLinePosition += lineCount);
        // Return raw lines as strings or convert each line to a number (if it represents one).
        return keepAsStrings ? rawLineData : rawLineData.map(value => +value);
    };

    // The IIFE returns the public creator function.
    return createInputProcessor;
})();

// Initialize the data processor by reading input from stdin.
var dataProcessor = INPUT_READER(require("node:fs").readFileSync("/dev/stdin", "utf8"));

// Utility function to create a multi-dimensional array initialized with a value.
function createMultidimensionalArray(initialValue) {
    var dimensionArguments = arguments;
    var currentDimensionIndex = dimensionArguments.length;
    // Build the array creation string from innermost to outermost dimension.
    var arrayCreationString = "Array(dimensionArguments[" + --currentDimensionIndex + "]).fill(0).map(item => { return " + initialValue + "; })";
    while (--currentDimensionIndex) {
        arrayCreationString = "Array(dimensionArguments[" + currentDimensionIndex + "]).fill(0).map(element => " + arrayCreationString + ")";
    }
    // Evaluate the constructed string to create the array.
    return eval(arrayCreationString);
}

// Output the result of the main calculation.
console.log(calculateMaxSum());

// Main function to perform the problem's logic.
function calculateMaxSum() {
    // Read the total number of elements (n) and the limit on operations (k).
    var totalElements = dataProcessor.getNextElement();
    var operationsLimit = dataProcessor.getNextElement();
    // Read the array of numbers for processing.
    var inputNumbersCollection = dataProcessor.getLineAsNumbers();

    // Variable to store the maximum sum found.
    var maximumPossibleSum = 0;

    // Outer loop: Iterate through possible total operations (i), from 0 up to k or n-1.
    for (var currentOpCount = 0; currentOpCount <= operationsLimit && currentOpCount < totalElements; currentOpCount++) {
        // Inner loop: Iterate through the number of elements taken from the left side (l).
        for (var leftElementsCount = 0; leftElementsCount <= currentOpCount; leftElementsCount++) {
            // Buffer to store negative numbers encountered in the current window.
            var negativeValuesBuffer = [];
            // Current sum for the window being evaluated.
            var currentWindowSum = 0;

            // Loop to take elements from the left side.
            for (var leftIndexIterator = 0; leftIndexIterator < leftElementsCount; leftIndexIterator++) {
                // If a negative number is found, add it to the buffer.
                if (inputNumbersCollection[leftIndexIterator] < 0) {
                    negativeValuesBuffer.push(inputNumbersCollection[leftIndexIterator]);
                }
                // Add the element to the current window sum.
                currentWindowSum += inputNumbersCollection[leftIndexIterator];
            }

            // Loop to take elements from the right side.
            // The number of elements from the right is (currentOpCount - leftElementsCount).
            for (var rightIndexIterator = 0; rightIndexIterator < currentOpCount - leftElementsCount; rightIndexIterator++) {
                // Determine the actual index from the right end of the array.
                var actualRightIndex = totalElements - 1 - rightIndexIterator;
                // If a negative number is found, add it to the buffer.
                if (inputNumbersCollection[actualRightIndex] < 0) {
                    negativeValuesBuffer.push(inputNumbersCollection[actualRightIndex]);
                }
                // Add the element to the current window sum.
                currentWindowSum += inputNumbersCollection[actualRightIndex];
            }

            // Sort the collected negative numbers in ascending order.
            negativeValuesBuffer.sort((valA, valB) => valA - valB);

            // Remove negative numbers from the sum if there are remaining operations (k-i).
            // This effectively "undoes" the addition of the smallest negative numbers.
            for (var removedNegativeCount = 0; removedNegativeCount < operationsLimit - currentOpCount && removedNegativeCount < negativeValuesBuffer.length; removedNegativeCount++) {
                currentWindowSum -= negativeValuesBuffer[removedNegativeCount];
            }

            // Update the maximum possible sum if the current window sum is greater.
            if (currentWindowSum > maximumPossibleSum) {
                maximumPossibleSum = currentWindowSum;
            }
        }
    }

    // Return the final maximum sum found.
    return maximumPossibleSum;
}