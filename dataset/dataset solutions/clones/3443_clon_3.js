'use strict';

// A utility class designed to process raw input data received from a stream or file.
// This class manages lines of text and provides methods to parse them into various data types.
function InputDataProcessor(rawInputContent) {
    // Splits the entire input content into an array of individual lines.
    // Each element in 'contentLines' represents one line from the input.
    let contentLines = rawInputContent.split('\n');

    // Checks if the last line of the input is empty (e.g., due to a trailing newline character).
    // If it is, that empty line is removed to prevent processing empty data.
    if (contentLines.length > 0 && contentLines[contentLines.length - 1].trim() === '') {
        contentLines.pop();
    }

    // Stores the cleaned and processed lines for subsequent reading operations.
    this.processedLines = contentLines;
    // Initializes a pointer to keep track of the current line being read.
    // This ensures sequential processing of input lines.
    this.currentReadPosition = 0;
}

// Prototype method to read the next line, split it by spaces, and convert each segment into an integer.
// This is useful for lines containing multiple space-separated numerical values.
InputDataProcessor.prototype.readIntegerArrayFromLine = function() {
    // Retrieves the line at the current reading position and then increments the position.
    const lineContent = this.processedLines[this.currentReadPosition++];
    // Splits the obtained line by spaces and maps each resulting string segment to its integer representation.
    // `parseInt(segment, 10)` ensures parsing in base 10.
    return lineContent.split(' ').map(segment => parseInt(segment, 10));
};

// Prototype method to read all remaining lines from the current position until the end of the input.
// Each of these remaining lines is parsed as a single integer value.
InputDataProcessor.prototype.readAllRemainingIntegers = function() {
    // Stores the starting position before reading all remaining lines.
    const startingPosition = this.currentReadPosition;
    // Advances the current reading position to the very end of the processed lines.
    this.currentReadPosition = this.processedLines.length;
    // Extracts the slice of lines from the starting position to the end, and converts each to an integer.
    return this.processedLines.slice(startingPosition).map(line => parseInt(line, 10));
};

// Prototype method to read all remaining lines as raw strings, without any further parsing.
InputDataProcessor.prototype.readAllRemainingStrings = function() {
    // Captures the initial position before consuming the rest of the lines.
    const initialPosition = this.currentReadPosition;
    // Moves the read pointer to the end, marking all subsequent lines as read.
    this.currentReadPosition = this.processedLines.length;
    // Returns a new array containing all lines from the initial position to the end.
    return this.processedLines.slice(initialPosition);
};

// Prototype method to read a specific number of lines as strings, starting from the current position.
InputDataProcessor.prototype.getNLinesOfText = function(numLinesToRead) {
    // Records the index where the reading operation begins.
    const initialIndex = this.currentReadPosition;
    // Increments the reading position by the number of lines requested.
    this.currentReadPosition += numLinesToRead;
    // Returns a subset of the processed lines, covering the requested range.
    return this.processedLines.slice(initialIndex, initialIndex + numLinesToRead);
};

// Initializes an instance of the InputDataProcessor by reading the entire content
// of standard input ("/dev/stdin") as a UTF-8 encoded string.
const inputReader = new InputDataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// The primary function encapsulating the problem-solving logic.
// This structure replaces the original immediately-invoked function expression (IIFE).
function solveProblem() {
    // Reads the first line of input, expected to contain two integers:
    // the size of the array (arraySize) and the minimum required count (requiredMinimumCount).
    const dimensionsAndConstraint = inputReader.readIntegerArrayFromLine();
    const arraySize = dimensionsAndConstraint[0];
    const requiredMinimumCount = dimensionsAndConstraint[1];

    // Reads the second line of input, which contains the array of numeric elements.
    const numericElements = inputReader.readIntegerArrayFromLine();

    // --- Type III Addition: Input validation guard clause ---
    // Checks for invalid input conditions such as non-positive sizes or a mismatch
    // between the declared array size and the actual number of elements read.
    // If input is invalid, prints 0 and exits, as 0 is a plausible result for empty/invalid cases.
    if (arraySize <= 0 || requiredMinimumCount <= 0 || numericElements.length !== arraySize) {
        console.log(0);
        return;
    }
    // --- End Type III Addition ---

    // An array to store all possible contiguous subarray sums.
    // This will hold sums of all `numericElements[outerIndex...innerIndex]` combinations.
    const allPossibleSubarraySums = [];

    // Computes all subarray sums. This involves nested loops.
    // The outer loop determines the starting element of a subarray.
    for (let outerIndex = 0; outerIndex < arraySize; outerIndex++) {
        let currentRunningSum = 0; // Resets the sum for each new starting element.
        // The inner loop extends the subarray from the current 'outerIndex' to 'innerIndex'.
        for (let innerIndex = outerIndex; innerIndex < arraySize; innerIndex++) {
            const elementToAdd = numericElements[innerIndex]; // Type III: Intermediate variable for clarity.
            currentRunningSum += elementToAdd; // Adds the next element to the current subarray sum.
            allPossibleSubarraySums.push(currentRunningSum); // Stores the computed sum.
        }
    }

    // Sorts the list of all subarray sums in descending order.
    // This order helps in the subsequent bitwise processing, though not strictly required for correctness.
    allPossibleSubarraySums.sort((valA, valB) => valB - valA);

    // --- Type III Addition: Early exit guard clause ---
    // If the total number of computed subarray sums is less than the required minimum,
    // it's impossible to satisfy the condition, so output 0 and terminate.
    if (allPossibleSubarraySums.length < requiredMinimumCount) {
        console.log(0);
        return;
    }
    // --- End Type III Addition ---

    // This variable will accumulate the bits of the final maximum XOR value.
    let finalXORMaximum = 0;

    // Iterates from a high bit position (e.g., 60 for numbers up to 2^61-1) down to 0.
    // This greedy approach tries to set the most significant bits first.
    // Changed max bit position from 41 to 60 for broader applicability.
    for (let bitPositionIterator = 60; bitPositionIterator >= 0; bitPositionIterator--) {
        // Calculates the numerical value of the current bit (e.g., 2^60, 2^59, ..., 2^0).
        // Uses a bit shift operator (1 << d) which is equivalent to Math.pow(2, d) but often more idiomatic for bitwise operations.
        const currentBitValue = 1 << bitPositionIterator; // Type III: Using bit shift.

        // Constructs a potential new result by adding the current bit's value to the `finalXORMaximum`.
        // This candidate represents what the result would be if the current bit were set.
        const candidateResultWithBit = finalXORMaximum + currentBitValue; // Type III: Intermediate variable.

        // Counts how many of the `allPossibleSubarraySums` satisfy a specific bitwise condition.
        // The condition `(currentSum & candidateResultWithBit) === candidateResultWithBit` checks if
        // every bit set in `candidateResultWithBit` is also set in `currentSum`.
        let countOfValidSums = 0;
        // Type III: Replaced `filter().length` with a manual `for...of` loop for counting.
        for (const currentSum of allPossibleSubarraySums) {
            if ((currentSum & candidateResultWithBit) === candidateResultWithBit) {
                countOfValidSums++;
            }
        }

        // If the number of sums satisfying the condition is at least the `requiredMinimumCount`,
        // it means we can successfully set this bit in our `finalXORMaximum` without violating
        // the condition for `requiredMinimumCount` sums.
        if (countOfValidSums >= requiredMinimumCount) {
            finalXORMaximum = candidateResultWithBit; // Updates the result to include this bit.
        }
    }

    // Prints the calculated maximum XOR value to standard output.
    console.log(finalXORMaximum);
}

// Executes the main problem-solving function to start the computation.
solveProblem();