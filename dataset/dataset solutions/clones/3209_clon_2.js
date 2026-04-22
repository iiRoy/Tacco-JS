"use strict"; // Activate strict mode for clearer code semantics

// This utility class is designed to handle sequential input parsing from a string.
// It allows reading tokens one by one or an entire line at once, with optional type conversion.
function TokenReader(sourceText, conversionFunction) {
    // Internal buffer to hold lines of the input string.
    this.lineBuffer = sourceText.split("\n");
    // Index tracking the current token within the active line.
    this.currentTokenIdx = 0;
    // Index tracking the current line being processed.
    this.currentLineIdx = 0;
    // The function responsible for converting extracted tokens (defaults to Number).
    this.tokenConverter = conversionFunction || Number;
}

// Prototype method to fetch the next individual token from the input stream.
TokenReader.prototype.readSingleValue = function() {
    // Retrieve the line currently under examination.
    var activeLine = this.lineBuffer[this.currentLineIdx];
    // If no more lines are available, signify end of input.
    if (!activeLine) return;

    // Remove leading/trailing whitespace and segment the line into parts based on spaces.
    var lineFragments = activeLine.trim().split(" ");
    // Extract the specific fragment corresponding to the current token index.
    var currentFragment = lineFragments[this.currentTokenIdx];
    // Advance the token pointer for the next read operation.
    this.currentTokenIdx++;

    // Check if all fragments on the current line have been consumed.
    if (lineFragments.length === this.currentTokenIdx) {
        // Reset token index and move to the subsequent line.
        this.currentTokenIdx = 0;
        this.currentLineIdx++;
    }
    // Apply the configured converter function to the fragment and return the result.
    return this.tokenConverter(currentFragment);
};

// Prototype method to retrieve all tokens from the current line as a converted array.
TokenReader.prototype.getAllLineTokens = function() {
    // Obtain the line that is presently active.
    var activeLine = this.lineBuffer[this.currentLineIdx];
    // If the line is empty or undefined, indicate no more data.
    if (!activeLine) return;

    // Reset the token index and increment the line index to prepare for the next line's read.
    this.currentTokenIdx = 0;
    this.currentLineIdx++;
    // Split the line by spaces, convert each part, and return the resulting array.
    return activeLine.split(" ").map(this.tokenConverter);
};

// Expose the TokenReader class for external module usage.
module.exports = TokenReader;

// Primary function to orchestrate the data processing and calculation.
function performCalculation(rawData) {
    // Instantiate a new TokenReader to process the provided raw input string.
    const dataProcessor = new TokenReader(rawData);

    // Read the initial value which defines the overall length of the data sequence.
    const sequenceLength = dataProcessor.readSingleValue();

    // Initialize an array to store the numeric elements of the sequence.
    const numberSequence = [];
    // Loop to populate the number sequence array by reading individual values.
    for (let currentIteration = 0; currentIteration < sequenceLength; currentIteration++) {
        numberSequence.push(dataProcessor.readSingleValue());
    }

    // Set up a 2D array (dynamic programming table) with dimensions (length + 1) x 5.
    const memoTable = Array(sequenceLength + 1).fill().map(() => Array(5).fill());
    // Define the initial state (base case) for the memoization table at index 0.
    memoTable[0] = [0, 0, 0, 0, 0];

    // Iterate from the first element up to the sequence length to fill the table.
    for (let currentIteration = 1; currentIteration <= sequenceLength; currentIteration++) {
        // Get the current numeric element from the sequence (adjusting for 0-based indexing).
        let currentElement = numberSequence[currentIteration - 1];
        // Determine a 'parity' value for operations that depend on even numbers.
        // Special case: if the element is 0, use 2; otherwise, use its modulo 2 result.
        let evenParity = numberSequence[currentIteration - 1] === 0 ? 2 : currentElement % 2;
        // Determine an 'opposite parity' value for operations depending on odd numbers.
        let oddParity = (currentElement + 1) % 2;

        // Populate the current row of the memoization table using values from the previous row
        // and the calculated parity values for the current element.
        memoTable[currentIteration][0] = memoTable[currentIteration - 1][0] + currentElement;
        memoTable[currentIteration][1] = Math.min(memoTable[currentIteration - 1][0], memoTable[currentIteration - 1][1]) + evenParity;
        memoTable[currentIteration][2] = Math.min(memoTable[currentIteration - 1][0], memoTable[currentIteration - 1][1], memoTable[currentIteration - 1][2]) + oddParity;
        memoTable[currentIteration][3] = Math.min(memoTable[currentIteration - 1][2], memoTable[currentIteration - 1][3]) + evenParity;
        memoTable[currentIteration][4] = Math.min(memoTable[currentIteration - 1][0], memoTable[currentIteration - 1][1], memoTable[currentIteration - 1][2], memoTable[currentIteration - 1][3], memoTable[currentIteration - 1][4]) + currentElement;
    }

    // Print the smallest value found in the final row of the memoization table to standard output.
    console.log(Math.min(...memoTable[sequenceLength]));
}

// Read the entire content of standard input synchronously and pass it to the main processing function.
performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));