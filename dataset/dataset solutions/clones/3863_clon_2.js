// This module offers a specialized utility for parsing structured input content.
var InputProcessor = (function() {

    // A factory function that initializes and returns a new data stream handler.
    function createProcessor(textContent) {
        return new DataStream(textContent);
    }

    // The core class responsible for managing and extracting data from a provided text stream.
    function DataStream(sourceContent) {
        // Internal storage: an array where each element is a line from the input,
        // trimmed of whitespace and initially stored as a string.
        this.lineSegments = sourceContent.trim().split("\n");
        // A pointer indicating the index of the current line being processed.
        this.currentLineIndex = 0;
    }

    // Prototype method: Extracts a single element from the current line.
    // Elements are processed from right-to-left by reversing the line's order once.
    DataStream.prototype.getOneItem = function(keepOriginalType) {
        var currentLines = this.lineSegments,
            linePointer = this.currentLineIndex,
            resultValue; // Variable to hold the extracted data.

        // Lazily split and reverse the current line if it hasn't been processed yet.
        if (typeof currentLines[linePointer] === "string") {
            currentLines[linePointer] = currentLines[linePointer].split(" ").reverse();
        }

        // Retrieve the last element (which was originally the first due to reversal).
        resultValue = currentLines[linePointer].pop();

        // If the current line is now exhausted, advance the line pointer to the next line.
        if (!currentLines[linePointer].length) {
            this.currentLineIndex++;
        }

        // Return the extracted element. If 'keepOriginalType' is true, it's a string;
        // otherwise, it's converted to a number using the unary plus operator.
        return keepOriginalType ? resultValue : +resultValue;
    };

    // Prototype method: Reads all elements from the current line.
    DataStream.prototype.getLineItems = function(asString) {
        // Splits the current line by spaces and then increments the line pointer.
        var extractedElements = this.lineSegments[this.currentLineIndex++].split(" ");

        // Returns the elements. If 'asString' is true, they are strings;
        // otherwise, each element is mapped to its numeric representation.
        return asString ? extractedElements : extractedElements.map(element => +element);
    };

    // Prototype method: Reads a specified number of lines and parses them into a 2D array (matrix).
    DataStream.prototype.getMatrix = function(numLines, returnStrings) {
        // Extracts a segment of lines from the input, starting from the current pointer,
        // and then advances the pointer by 'numLines'. Each line is then split into elements.
        var matrixData = this.lineSegments
            .slice(this.currentLineIndex, this.currentLineIndex += numLines)
            .map(lineContent => lineContent.split(" "));

        // Returns the matrix. If 'returnStrings' is true, it's a matrix of strings;
        // otherwise, all nested elements are converted to numbers.
        return returnStrings ? matrixData : matrixData.map(row => row.map(cell => +cell));
    };

    // Prototype method: Reads a specified number of raw lines without further splitting.
    DataStream.prototype.getLines = function(numLines, stringOnly) {
        // Extracts a segment of lines from the input, starting from the current pointer,
        // and then advances the pointer by 'numLines'.
        var rawLineData = this.lineSegments.slice(this.currentLineIndex, this.currentLineIndex += numLines);

        // Returns the raw lines. If 'stringOnly' is true, they are strings;
        // otherwise, each line is attempted to be converted to a number.
        return stringOnly ? rawLineData : rawLineData.map(value => +value);
    };

    return createProcessor; // The factory function is exposed as the module's public interface.

})();

// Establish a reference to the Node.js file system module.
const fileSystemModule = require("fs");
// Initialize the input handler by reading all content from standard input (stdin) as UTF-8 text.
const inputHandler = InputProcessor(fileSystemModule.readFileSync("/dev/stdin", "utf8"));

// Execute the primary problem-solving routine and output its return value to the console.
console.log(calculateSubarrayPairs());

// Main function: Determines the count of subarrays within a given sequence whose elements sum to zero.
function calculateSubarrayPairs() {
    // Read the total count of elements expected in the upcoming numeric sequence.
    const arraySize = inputHandler.getOneItem();
    // Read the actual sequence of numbers from the input.
    const numericSequence = inputHandler.getLineItems();

    // A hash map to efficiently store and retrieve the frequencies of various prefix sums.
    // Keys represent prefix sums, and values represent how many times each sum has been encountered.
    const sumFrequencies = new Map();
    // Initialize the map: a prefix sum of 0 is considered to have occurred once,
    // which accounts for subarrays starting from the very beginning that sum to zero.
    sumFrequencies.set(0, 1);

    // Variable to accumulate the final count of qualifying subarrays.
    let totalPairs = 0;
    // Variable to track the running sum of elements as we traverse the sequence.
    let runningSum = 0;

    // Iterate through each element of the numeric sequence.
    for (let idx = 0; idx < arraySize; idx++) {
        runningSum += numericSequence[idx]; // Update the running sum with the current element.

        // Check if the current running sum has been observed before.
        if (sumFrequencies.has(runningSum)) {
            // If yes, increment its frequency count.
            sumFrequencies.set(runningSum, sumFrequencies.get(runningSum) + 1);
        } else {
            // If no, record this new sum with a frequency of 1.
            sumFrequencies.set(runningSum, 1);
        }
    }

    // After processing all elements, iterate through the recorded sum frequencies.
    // For each sum 'S' that appeared 'k' times, there are k * (k-1) / 2 ways
    // to choose two indices 'i' and 'j' (with i < j) such that the subarray
    // from 'i' to 'j-1' sums to zero. This is equivalent to finding two prefix sums
    // that are equal.
    sumFrequencies.forEach(countValue => {
        totalPairs += countValue * (countValue - 1) / 2;
    });

    // Return the final computed number of subarrays with a sum of zero.
    return totalPairs;
}