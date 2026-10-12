var INPUT_PARSER = (function() {
    // Factory function to create a new InputReader instance
    function createParser(sourceString) {
        return new InputReader(sourceString);
    }

    // Constructor for the InputReader class
    function InputReader(sourceString) {
        // Store the input string as an array of trimmed lines
        this._sourceLines = sourceString.trim().split("\n");
        // Initialize the current line index
        this._currentLineIndex = 0;
    }

    // Method to read a single number or string token from the current line
    InputReader.prototype.readNumber = function(returnAsString) {
        var lines = this._sourceLines;
        var lineIdx = this._currentLineIndex;
        var resultToken;

        // If the current line hasn't been split into tokens yet, do it and reverse for pop() efficiency
        if (typeof lines[lineIdx] === "string") {
            lines[lineIdx] = lines[lineIdx].split(" ").reverse();
        }

        // Pop the last token from the current line's array
        resultToken = lines[lineIdx].pop();

        // If the current line is now empty, advance to the next line
        if (!lines[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return as string if requested, otherwise convert to number
        return returnAsString ? resultToken : +resultToken;
    };

    // Method to read a full line of space-separated numbers or strings
    InputReader.prototype.readNumbersLine = function(returnAsStrings) {
        var lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
        // Return as strings if requested, otherwise map to numbers
        return returnAsStrings ? lineTokens : lineTokens.map(item => +item);
    };

    // Method to read a matrix (multiple lines, each split by space)
    InputReader.prototype.readMatrix = function(numRows, returnAsStrings) {
        var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                         .map(line => line.split(" "));
        // Return as strings if requested, otherwise map all elements to numbers
        return returnAsStrings ? matrixRows : matrixRows.map(row => row.map(element => +element));
    };

    // Method to read multiple raw lines (each line as a single string or number)
    InputReader.prototype.readRawLines = function(numLines, returnAsStrings) {
        var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // Return as strings if requested, otherwise map to numbers
        return returnAsStrings ? rawLines : rawLines.map(line => +line);
    };

    return createParser;
})();

// Initialize the input parser with data from standard input
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Implements a binary search to find the lower bound of a value in a sorted array.
// Returns the index of the first element not less than 'targetValue'.
function findLowerBound(dataArray, startIndex, endIndex, targetValue) {
    // 'midIndex' will store the middle index during binary search
    for (var midIndex; 1 < endIndex - startIndex;) {
        // Calculate the middle index using Math.floor
        midIndex = Math.floor((startIndex + endIndex) / 2);
        // If the element at midIndex is less than the target, search in the right half
        if (dataArray[midIndex] < targetValue) {
            startIndex = midIndex;
        } else { // Otherwise, search in the left half (including midIndex)
            endIndex = midIndex;
        }
    }
    // After the loop, startIndex and endIndex are adjacent.
    // Check if the element at startIndex is less than targetValue.
    // If it is, the lower bound is endIndex; otherwise, it's startIndex.
    return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

// Output the result of the main processing function
console.log(processData());

// Main function to solve the problem
function processData() {
    // Read the number of elements
    var countElements = inputData.readNumber();
    // Read array A
    var arrayA = inputData.readNumbersLine();
    // Read array B
    var arrayB = inputData.readNumbersLine();

    // Initialize the final accumulated result
    var finalResult = 0;

    // Iterate through bit positions from 28 down to 0
    for (var bitPosition = 28; bitPosition >= 0; bitPosition--) {
        // Calculate bit-related constants for the current iteration
        var currentBitValue = 1 << bitPosition; // Equivalent to 2^bitPosition
        var doubleBitValue = currentBitValue * 2; // 2 * 2^bitPosition
        var tripleBitValue = currentBitValue * 3; // 3 * 2^bitPosition
        var bitMask = currentBitValue - 1; // Mask for bits lower than currentBitValue
        var xorSumCount = countElements * countElements; // Initialize a counter for XOR sums

        // Sort arrayB for efficient lower_bound searches
        arrayB.sort((val1, val2) => val1 - val2);

        // Iterate through each element in arrayA
        for (var elementIndex = 0; elementIndex < countElements; elementIndex++) {
            // Find bounds for elements in arrayB that satisfy certain conditions
            // boundTwo: lower bound for (2*currentBitValue - arrayA[j])
            var boundTwo = findLowerBound(arrayB, 0, countElements, doubleBitValue - arrayA[elementIndex]);
            // boundOne: lower bound for (currentBitValue - arrayA[j])
            var boundOne = findLowerBound(arrayB, 0, boundTwo, currentBitValue - arrayA[elementIndex]);
            // boundThree: lower bound for (3*currentBitValue - arrayA[j])
            var boundThree = findLowerBound(arrayB, boundTwo, countElements, tripleBitValue - arrayA[elementIndex]);

            // Adjust xorSumCount based on the bounds found
            // This logic is specific to the problem's XOR sum calculation
            xorSumCount += -boundThree + boundTwo - boundOne;
        }

        // If the total count of XOR sums is odd, add the current bit value to the final result
        if (xorSumCount % 2) {
            finalResult += currentBitValue;
        }

        // Apply the bitmask to all elements in arrayB
        arrayB = arrayB.map(val => val & bitMask);

        // If bitPosition is less than 18, filter arrayB for unique elements (effectively removing duplicates)
        if (bitPosition < 18) {
            arrayB = filterUnique(arrayB);
        }

        // Apply the bitmask to all elements in arrayA
        arrayA = arrayA.map(val => val & bitMask);
    }

    // Return the final calculated result
    return finalResult;

    // Helper function to filter an array, keeping only unique elements.
    // It uses an object as a hash set to track seen elements.
    function filterUnique(inputArray) {
        var seenElements = {}; // Object to store seen elements
        for (var idx = 0; idx < inputArray.length; idx++) {
            var currentElement = inputArray[idx];
            // If element is already seen, delete it (effectively toggling its presence)
            if (seenElements[currentElement]) {
                delete seenElements[currentElement];
            } else { // If not seen, mark it as seen
                seenElements[currentElement] = 1;
            }
        }
        // Return an array of unique elements (keys of the seenElements object), converted back to numbers
        return Object.keys(seenElements).map(val => +val);
    }
}
