"use strict";

/**
 * Processes raw input data to perform a specific sequence analysis.
 * This function identifies blocks of alternating binary values (0s and 1s)
 * and calculates a cumulative length based on a 'maxFlipsAllowed' parameter.
 *
 * @param {string} rawDataInput - The raw string input, typically from stdin.
 */
function processSequence(rawDataInput) {
    // Input Parsing and Configuration Extraction
    // Splits the raw input into individual lines, discarding any empty lines.
    const sourceLines = rawDataInput.split('\n').filter(line => line.trim() !== '');

    // Validate minimum input lines for parameters and sequence.
    if (sourceLines.length < 2) {
        console.error("Input error: Not enough data lines provided. Expected at least 2.");
        return; // Exit if input is malformed.
    }

    // Extract sequence length (N) and maximum flips allowed (K) from the first line.
    const paramLineSegment = sourceLines.shift();
    const numericParams = paramLineSegment.split(/\s+/).map(str => parseInt(str, 10));

    // Validate parsed numeric parameters.
    if (numericParams.length < 2 || isNaN(numericParams[0]) || isNaN(numericParams[1])) {
        console.error("Input error: Invalid or missing N/K parameters in the first line.");
        return;
    }

    const sequenceLength = numericParams[0]; // Represents 'N' from original
    const maxFlipsAllowed = numericParams[1]; // Represents 'K' from original

    // Extract the binary sequence (S) from the second line.
    const sequenceString = sourceLines.shift();
    const binarySequence = sequenceString.split('').map(char => parseInt(char, 10));

    // Optional warning if the actual sequence length doesn't match the declared 'N'.
    if (binarySequence.length !== sequenceLength) {
        console.warn(`Data discrepancy: Declared sequence length (N=${sequenceLength}) differs from actual sequence length (${binarySequence.length}). Proceeding with actual length.`);
        // Adjust sequenceLength to actual for robustness, as the original code's loop depends on actual S.length
        // For strict clone, keep sequenceLength as N. But for robustness and type III, adjusting makes sense.
        // Let's stick to using actual binarySequence.length for iteration to prevent out-of-bounds.
    }

    // Run-Length Encoding (RLE) / Block Grouping Phase
    // This part groups consecutive identical binary values into blocks.
    let blockCollection = []; // Stores objects like { typeVal: 0/1, startIndex: int, blockSpan: int }
    let currentProcessingIndex = 0;
    let activeBlockIdentifier = binarySequence.length > 0 ? binarySequence[0] : null;

    // Handle case of an empty input sequence.
    if (activeBlockIdentifier === null) {
        console.log(0); // If no sequence, the result is 0.
        return;
    }

    // Iterate through the sequence to identify and store blocks.
    const actualSequenceLen = binarySequence.length;
    while (currentProcessingIndex < actualSequenceLen) {
        let blockStartingPosition = currentProcessingIndex;
        let blockEndingPosition = currentProcessingIndex;

        // Determine the extent of the current contiguous block.
        while (blockEndingPosition < actualSequenceLen && binarySequence[blockEndingPosition] === activeBlockIdentifier) {
            blockEndingPosition++;
        }

        const currentBlockExtent = blockEndingPosition - blockStartingPosition;
        if (currentBlockExtent > 0) { // Only add blocks that actually have a length.
            blockCollection.push({
                typeVal: activeBlockIdentifier,
                startIndex: blockStartingPosition,
                blockSpan: currentBlockExtent
            });
        }

        currentProcessingIndex = blockEndingPosition;
        activeBlockIdentifier = 1 - activeBlockIdentifier; // Toggle block type (0 becomes 1, 1 becomes 0).
    }

    // Initial Adjustment for Block Collection Consistency
    // If the sequence starts with a '0' block, prepend a dummy '1' block of zero length.
    // This ensures that the first relevant block is always treated as a '1' for calculation consistency.
    if (blockCollection.length > 0 && blockCollection[0].typeVal === 0) {
        blockCollection.unshift({ typeVal: 1, startIndex: 0, blockSpan: 0 });
    }

    // Calculate the initial cumulative length.
    // The original logic sums the lengths of the first (2 * K + 1) blocks.
    let totalAccumulatedLength = 0;
    const numberOfBlocksToSum = maxFlipsAllowed * 2 + 1;

    // Ensure the loop does not exceed the bounds of the block collection.
    const effectiveLoopLimit = Math.min(numberOfBlocksToSum, blockCollection.length);

    for (let blockIterator = 0; blockIterator < effectiveLoopLimit; blockIterator++) {
        totalAccumulatedLength += blockCollection[blockIterator].blockSpan;
    }

    console.log(totalAccumulatedLength);
}

// Environment-specific execution handling (Node.js vs. Browser).
if (typeof window === "undefined") {
    // This block executes in a Node.js-like environment.
    const fileSystemModule = require("fs");
    const standardInputFilePath = "/dev/stdin";
    const characterEncoding = "utf8";
    const rawFileContent = fileSystemModule.readFileSync(standardInputFilePath, characterEncoding);
    processSequence(rawFileContent);
} else {
    // This block is for browser or other environments where 'window' is defined.
    // In a typical competitive programming setup, this branch might not be used.
    // For local testing in a browser, 'rawDataInput' would need to be provided differently.
    console.warn("Detected a browser-like environment. Input handling might require manual adjustment for testing.");
    // Example: processSequence("5 1\n00110");
}