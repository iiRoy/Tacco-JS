"use strict";

// Helper class for processing input streams, similar to a custom scanner.
// It reads tokens and lines from a string, parsing them into numbers.
function DataStreamProcessor(sourceString, valueParser) {
    // Validate input source string.
    if (typeof sourceString !== 'string' || sourceString.length === 0) {
        throw new Error("Input source string cannot be empty or non-string.");
    }

    // Split the input string into lines, trimming whitespace and filtering out empty lines.
    this.rawInputLines = sourceString.split('\n')
                                 .map(line => line.trim())
                                 .filter(line => line.length > 0);

    this.currentLineIndex = 0;       // Tracks the index of the line being processed.
    this.currentTokenIndex = 0;      // Tracks the index of the token within the current line.
    this.valueTransformer = valueParser || Number; // Function to convert string tokens to desired type (default to Number).

    // Cache the tokens of the current line for efficient sequential reading.
    this.activeLineSegments = [];
    if (this.rawInputLines.length > 0) {
        this.activeLineSegments = this.rawInputLines[this.currentLineIndex]
                                      .split(/\s+/) // Split by one or more whitespace characters.
                                      .filter(Boolean); // Remove any empty strings resulting from split.
    }
}

// Reads and returns the next single value (token) from the input stream.
DataStreamProcessor.prototype.readNextValue = function() {
    // Check if all lines have been processed.
    if (this.currentLineIndex >= this.rawInputLines.length) {
        return undefined; // End of input stream.
    }

    // If all tokens on the current line have been consumed, move to the next line.
    if (this.currentTokenIndex >= this.activeLineSegments.length) {
        this.currentLineIndex++;
        this.currentTokenIndex = 0; // Reset token index for the new line.

        // Check again if we've moved past the last line.
        if (this.currentLineIndex >= this.rawInputLines.length) {
            return undefined; // End of input stream.
        }

        // Populate activeLineSegments with tokens from the new line.
        this.activeLineSegments = this.rawInputLines[this.currentLineIndex]
                                      .split(/\s+/)
                                      .filter(Boolean);

        // Handle cases where a line might be empty after trimming and filtering.
        // Recursively call to skip to the next non-empty line or return undefined.
        if (this.activeLineSegments.length === 0) {
            return this.readNextValue();
        }
    }

    // Retrieve the current token string and advance the token index.
    const tokenString = this.activeLineSegments[this.currentTokenIndex];
    this.currentTokenIndex++;

    // Transform the token string using the specified parser function.
    const processedValue = this.valueTransformer(tokenString);

    // Optional: Add more robust error handling for parsing failures if needed.
    // if (isNaN(processedValue)) { console.warn(`Could not parse "${tokenString}" as a number.`); }

    return processedValue;
};

// Reads all values (tokens) from the current line, parses them, and advances to the next line.
DataStreamProcessor.prototype.readAllLineValues = function() {
    // Check if there are no more lines to process.
    if (this.currentLineIndex >= this.rawInputLines.length) {
        return []; // Return an empty array indicating no more lines.
    }

    // Get the tokens for the current line. Note: this method re-splits the line
    // to ensure it captures the full line regardless of previous single-token reads.
    const tokensOnLine = this.rawInputLines[this.currentLineIndex]
                               .split(/\s+/)
                               .filter(Boolean);

    this.currentLineIndex++;       // Advance to the next line.
    this.currentTokenIndex = 0;    // Reset token index as the entire line has been consumed.

    // Transform all tokens on this line using the valueTransformer.
    return tokensOnLine.map(this.valueTransformer);
};

// Exports the DataStreamProcessor class for use in other modules.
module.exports = DataStreamProcessor;

// --- Main Challenge Solver Function ---
// This function encapsulates the core logic to solve the dynamic programming problem.
function solveChallenge(inputDataString) {
    // Instantiate the custom input parser.
    const inputParser = new DataStreamProcessor(inputDataString);

    // Read the total number of elements for the sequence from the first line.
    const totalSequenceLength = inputParser.readNextValue();

    // Perform validation on the read sequence length.
    if (typeof totalSequenceLength !== 'number' || !Number.isInteger(totalSequenceLength) || totalSequenceLength <= 0) {
        console.error("Error: Invalid sequence length provided. Must be a positive integer.");
        return; // Terminate execution due to invalid input.
    }

    // Initialize an array to hold the numeric data sequence.
    const numberSequence = new Array(totalSequenceLength);
    for (let dataIdx = 0; dataIdx < totalSequenceLength; dataIdx++) {
        const currentNumber = inputParser.readNextValue();
        // Validate each number as it's read.
        if (typeof currentNumber !== 'number' || isNaN(currentNumber)) {
            console.error(`Error: Invalid numeric value encountered at index ${dataIdx}. Expected a number.`);
            return; // Terminate execution.
        }
        numberSequence[dataIdx] = currentNumber;
    }

    // Initialize the dynamic programming table (memoizationTable).
    // It will have `totalSequenceLength + 1` rows and 5 columns.
    // Each cell is initialized to Infinity to correctly handle minimum calculations,
    // except for the base case.
    const memoizationTable = [];
    for (let rowIndex = 0; rowIndex <= totalSequenceLength; rowIndex++) {
        memoizationTable.push(new Array(5).fill(Number.MAX_SAFE_INTEGER)); // Using MAX_SAFE_INTEGER as Infinity
    }

    // Base case: For an empty prefix (before processing any elements),
    // the cost to be in any state is 0.
    memoizationTable[0][0] = 0;
    memoizationTable[0][1] = 0;
    memoizationTable[0][2] = 0;
    memoizationTable[0][3] = 0;
    memoizationTable[0][4] = 0;

    // Iterate through the input sequence to fill the DP table.
    // `elementCounter` corresponds to the row index in `memoizationTable`.
    for (let elementCounter = 1; elementCounter <= totalSequenceLength; elementCounter++) {
        // Get the current number from the 0-indexed `numberSequence`.
        const currentNumericalValue = numberSequence[elementCounter - 1];

        // Determine the cost based on the parity of the current number.
        // `costForEven` is 2 if the number is 0, otherwise its parity (0 for even, 1 for odd).
        const costForEven = (currentNumericalValue === 0) ? 2 : (currentNumericalValue % 2);
        // `costForOdd` is 1 if the number is even, 0 if odd. This is equivalent to (value + 1) % 2.
        const costForOdd = (currentNumericalValue % 2 === 0) ? 1 : 0;

        // Retrieve costs from the previous row (elementCounter - 1) for clarity.
        const previousCosts = memoizationTable[elementCounter - 1];
        const prevCostState0 = previousCosts[0];
        const prevCostState1 = previousCosts[1];
        const prevCostState2 = previousCosts[2];
        const prevCostState3 = previousCosts[3];
        const prevCostState4 = previousCosts[4];

        // Calculate the minimum costs for the current row (elementCounter) for each state.
        // These calculations represent transitions from previous states.

        // State 0: Always adds the current number's value.
        memoizationTable[elementCounter][0] = prevCostState0 + currentNumericalValue;

        // State 1: Minimum of previous state 0 or 1, plus `costForEven`.
        memoizationTable[elementCounter][1] = Math.min(prevCostState0, prevCostState1) + costForEven;

        // State 2: Minimum of previous state 0, 1, or 2, plus `costForOdd`.
        memoizationTable[elementCounter][2] = Math.min(prevCostState0, prevCostState1, prevCostState2) + costForOdd;

        // State 3: Minimum of previous state 2 or 3, plus `costForEven`.
        memoizationTable[elementCounter][3] = Math.min(prevCostState2, prevCostState3) + costForEven;

        // State 4: Minimum of all previous states (0 through 4), plus the current number's value.
        memoizationTable[elementCounter][4] = Math.min(prevCostState0, prevCostState1, prevCostState2, prevCostState3, prevCostState4) + currentNumericalValue;
    }

    // After iterating through all elements, the final minimum cost is the smallest value
    // in the last row of the `memoizationTable`.
    const overallMinimumCost = Math.min(...memoizationTable[totalSequenceLength]);

    // Output the computed result to the console.
    console.log(overallMinimumCost);
}

// --- Program Entry Point ---
// Reads input from standard input and passes it to the solver function.
// This is a common pattern in competitive programming environments.
try {
    const fileSystem = require("fs");
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    solveChallenge(standardInputContent);
} catch (error) {
    console.error("An error occurred during input reading or processing:", error.message);
    // Optionally, provide more detailed error information or exit with a specific code.
    process.exit(1);
}