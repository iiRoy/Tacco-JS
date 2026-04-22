'use strict'; // Enforce strict parsing and execution rules for cleaner code

/**
 * @class DataSource
 * @description A robust utility for parsing multi-line string input,
 *              providing methods to retrieve specific data types line by line
 *              while maintaining an internal cursor.
 */
function DataSource(fullInputString) {
    // Initial parsing of the raw input string into an array of individual lines.
    // It intelligently handles the common case where a trailing newline character
    // might result in an unwanted empty string at the end of the array.
    let lineSegments = fullInputString.split('\n');
    if (lineSegments.length > 0 && lineSegments[lineSegments.length - 1] === '') {
        lineSegments.pop(); // Remove the superfluous empty line if present.
    }
    this.lineSegments = lineSegments; // Stores all parsed line content.
    this.currentLineCursor = 0;       // Pointer to the next line awaiting processing.
}

/**
 * @method readSingleInteger
 * @description Retrieves the content of the current line, converts it into a single integer,
 *              and then advances the internal line cursor to the next line.
 * @returns {number} The numerical value parsed from the current line.
 */
DataSource.prototype.readSingleInteger = function() {
    // The unary plus operator (`+`) is a concise way to convert a string to a number.
    return +this.lineSegments[this.currentLineCursor++];
};

/**
 * @method readIntegerArray
 * @description Reads the current line, expecting space-separated values. It splits the line
 *              by spaces and transforms each resulting substring into an integer.
 *              The internal line cursor is subsequently advanced.
 * @returns {number[]} An array containing integer values extracted from the current line.
 */
DataSource.prototype.readIntegerArray = function() {
    // Fetches the current line, divides it into parts based on spaces, and then
    // applies numeric conversion to each part.
    return this.lineSegments[this.currentLineCursor++].split(' ').map(valStr => +valStr);
};

/**
 * @method readRemainingIntegers
 * @description Processes all lines from the current cursor position until the end of the input.
 *              Each of these lines is converted into a single integer. The cursor is
 *              then moved to the very end of the input.
 * @returns {number[]} An array where each element is an integer from a separate remaining line.
 */
DataSource.prototype.readRemainingIntegers = function() {
    const startIdx = this.currentLineCursor; // Marks the initial position for slicing.
    this.currentLineCursor = this.lineSegments.length; // Fast-forwards the cursor to the end.
    // Extracts the relevant lines and converts each into a numeric type.
    return this.lineSegments.slice(startIdx).map(valStr => +valStr);
};

/**
 * @method readRemainingStrings
 * @description Collects all lines from the current cursor position to the end of the input,
 *              preserving their original string format. The cursor is then positioned
 *              at the end of the input.
 * @returns {string[]} An array of strings, each representing a distinct remaining line.
 */
DataSource.prototype.readRemainingStrings = function() {
    const beginIdx = this.currentLineCursor; // Records the starting point for the slice operation.
    this.currentLineCursor = this.lineSegments.length; // Advances the cursor to the final line.
    // Returns a segment of the line array containing all lines from the starting point.
    return this.lineSegments.slice(beginIdx);
};

/**
 * @method readSpecificNumberOfStrings
 * @description Extracts a precise number of lines from the current cursor position,
 *              keeping them as strings. The cursor is advanced by the specified count.
 * @param {number} numberOfLinesToRead The exact quantity of lines to retrieve.
 * @returns {string[]} An array of strings, encompassing the requested number of lines.
 */
DataSource.prototype.readSpecificNumberOfStrings = function(numberOfLinesToRead) {
    const initialLinePointer = this.currentLineCursor; // Saves the current cursor state.
    this.currentLineCursor += numberOfLinesToRead;     // Moves the cursor forward by `n`.
    // Creates a new array containing only the specified number of lines.
    return this.lineSegments.slice(initialLinePointer, initialLinePointer + numberOfLinesToRead);
};


// Instantiates the data handler, responsible for fetching and parsing input.
// This typically reads from standard input, common in competitive programming environments.
const dataHandler = new DataSource(require("fs").readFileSync("/dev/stdin", "utf8"));

// An immediately invoked function expression (IIFE) to encapsulate the main program logic,
// preventing global variable pollution and ensuring a clear execution flow.
(() => {
    // Step 1: Read the total count of numerical elements from the very first line of input.
    const totalCount = dataHandler.readSingleInteger();

    // Step 2: Read the array of numerical entries from the subsequent line of input.
    const numericalEntries = dataHandler.readIntegerArray();

    // Step 3: Compute the sum of all numerical entries in the array.
    // Utilizes the `reduce` method for a functional and concise summation.
    const totalSum = numericalEntries.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Step 4: Calculate the average (mean) value of the numerical entries.
    // Includes a protective check against division by zero, although problem constraints
    // often guarantee `totalCount` will be at least 1.
    const averageValue = totalCount > 0 ? totalSum / totalCount : 0;

    // --- Core logic to pinpoint the element closest to the calculated average ---

    // Initialize the index of the element currently identified as the closest.
    // We start by assuming the first element (at index 0) is the closest.
    let closestElementIndex = 0;

    // Initialize the minimum absolute difference found so far.
    // This is the absolute difference between the initial candidate (first element) and the average.
    let minAbsoluteDifference = Math.abs(numericalEntries[0] - averageValue);

    // Step 5: Iterate through the array, beginning from the second element (index 1),
    // to search for an element that is closer to the average.
    for (let idx = 1; idx < totalCount; ++idx) {
        // Calculate the absolute difference between the current element and the average.
        const currentDifference = Math.abs(numericalEntries[idx] - averageValue);

        // Compare the `currentDifference` with the `minAbsoluteDifference` recorded so far.
        // If the current element is strictly closer to the average, update our findings.
        // (Note: If differences are equal, the original problem implies retaining the smaller index,
        // which this condition naturally handles by not updating.)
        if (currentDifference < minAbsoluteDifference) {
            minAbsoluteDifference = currentDifference; // Update the minimum difference.
            closestElementIndex = idx;                 // Update the index of the closest element.
        }
    }

    // Step 6: Output the final zero-based index of the element that is closest to the average.
    console.log(closestElementIndex);
})();