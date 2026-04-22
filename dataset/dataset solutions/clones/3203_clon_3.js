"use strict";

/**
 * Utility class for processing textual input streams, line by line and token by token.
 * It caches lines and manages internal pointers for sequential access.
 */
function TextStreamHandler(sourceContent, valueParser) {
    // The complete text content provided as input.
    this.fullTextContent = sourceContent;
    // An array of lines, pre-split from the source content.
    this.allInputLines = this.fullTextContent.split('\n');
    // Current index of the line being processed.
    this.currentLineIndex = 0;
    // Array of tokens from the current line. This is populated when a new line is accessed.
    this.tokensOnCurrentLine = [];
    // The function used to convert extracted string tokens into their desired data type (e.g., Number).
    this.dataTransformer = valueParser || Number;

    // Initialize the tokens for the first line if it exists.
    this._primeLineTokens();
}

/**
 * Internal helper to load and split tokens for the current line.
 * It advances the line index if the current line is exhausted.
 */
TextStreamHandler.prototype._primeLineTokens = function() {
    if (this.currentLineIndex >= this.allInputLines.length) {
        this.tokensOnCurrentLine = []; // No more lines
        return;
    }
    const lineContent = this.allInputLines[this.currentLineIndex];
    // Trim whitespace and split by space to get individual tokens.
    this.tokensOnCurrentLine = lineContent.trim().split(' ');
};

/**
 * Extracts and returns the next available token, parsing it with the configured dataTransformer.
 * Automatically advances to the next line when all tokens on the current line have been consumed.
 * @returns {any|undefined} The parsed token, or undefined if no more tokens are available.
 */
TextStreamHandler.prototype.retrieveNextItem = function() {
    // If the current line's tokens are exhausted, advance to the next line.
    if (this.tokensOnCurrentLine.length === 0) {
        this.currentLineIndex++;
        this._primeLineTokens(); // Load tokens for the new line
        if (this.tokensOnCurrentLine.length === 0 && this.currentLineIndex >= this.allInputLines.length) {
            return undefined; // No more tokens in the entire stream
        }
    }

    // Extract the next token using Array.prototype.shift()
    const rawToken = this.tokensOnCurrentLine.shift();
    return this.dataTransformer(rawToken);
};

/**
 * Reads the entire current line, parses all its tokens, and advances the line pointer.
 * This method bypasses the token-by-token processing for the current line.
 * @returns {Array<any>} An array of parsed tokens from the current line.
 */
TextStreamHandler.prototype.readCurrentLineAndParseAll = function() {
    if (this.currentLineIndex >= this.allInputLines.length) {
        return []; // No more lines to read
    }

    const currentLine = this.allInputLines[this.currentLineIndex];
    this.currentLineIndex++; // Advance line index immediately
    // Reset tokensOnCurrentLine as this method skips token-by-token processing for this line.
    this.tokensOnCurrentLine = [];

    // Split, trim, and map all tokens on this line.
    return currentLine.trim().split(' ').map(this.dataTransformer);
};


// Main execution block for processing the input data.
function executeProgramLogic(rawInputData) {
    // Guard clause: handle empty or invalid input gracefully.
    if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === '') {
        console.error("Error: Input data is empty or invalid.");
        return;
    }

    // Initialize a specialized input reader instance.
    const inputScanner = new TextStreamHandler(rawInputData);

    // Create an array to track frequencies. Indices 0-3 correspond to values 1-4.
    // Explicitly populate to avoid direct 'fill' if we want to add more complex initialization.
    const frequencyCounters = [0, 0, 0, 0]; // For numbers 1, 2, 3, 4

    const expectedPairCount = 3; // The problem specifies 3 pairs of numbers.
    let currentPairIndex = 0;

    // Loop a fixed number of times to read pairs of values.
    while (currentPairIndex < expectedPairCount) {
        const firstNumericValue = inputScanner.retrieveNextItem();
        const secondNumericValue = inputScanner.retrieveNextItem();

        // Basic validation for input values.
        if (typeof firstNumericValue !== 'number' || isNaN(firstNumericValue) ||
            typeof secondNumericValue !== 'number' || isNaN(secondNumericValue)) {
            console.error(`Warning: Invalid numeric input encountered at pair ${currentPairIndex + 1}. Skipping.`);
            currentPairIndex++; // Still count the iteration even if values are bad
            continue;
        }

        // Ensure values are within the expected range (1-4) for array indexing.
        if (firstNumericValue < 1 || firstNumericValue > 4 ||
            secondNumericValue < 1 || secondNumericValue > 4) {
            console.error(`Warning: Value out of expected range (1-4) for pair ${currentPairIndex + 1}. Skipping.`);
            currentPairIndex++;
            continue;
        }

        // Increment the frequency for the corresponding indices.
        // Subtract 1 because values are 1-indexed (1,2,3,4) but array is 0-indexed (0,1,2,3).
        frequencyCounters[firstNumericValue - 1]++;
        frequencyCounters[secondNumericValue - 1]++;

        currentPairIndex++; // Move to the next pair.
    }

    // Define the canonical sorted pattern for comparison.
    const TARGET_PATTERN_STRING = "1 1 2 2";

    // Create a copy to sort, preserving the original array if needed elsewhere.
    const sortedFrequencies = [...frequencyCounters].sort((valA, valB) => valA - valB);

    // Convert the sorted frequency array into a space-separated string.
    const currentResultPattern = sortedFrequencies.join(" ");

    // Compare the generated pattern with the target pattern.
    if (currentResultPattern === TARGET_PATTERN_STRING) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}


// Entry point for the application: reads from standard input and delegates processing.
try {
    const fileSystemModule = require("fs");
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    executeProgramLogic(standardInputContent);
} catch (error) {
    console.error("An error occurred during file reading or program execution:", error.message);
    // Potentially exit with a non-zero code for errors.
    process.exit(1);
}