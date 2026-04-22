// This script is designed to process a sequence of numerical data provided via standard input.
// It operates by reading pairs of integers from each line, computing their sum, and buffering these sums.
// Upon accumulating a specific number of sums, it identifies the highest sum within that batch
// and outputs a corresponding alphabetical identifier along with the maximum score.
// The script is designed to terminate its execution if the very first relevant input line
// encountered is a predefined termination sequence, preventing further processing.

(function executeInputProcessor() {
    'use strict'; // Enforces stricter parsing and error handling for cleaner code.

    // --- Core Configuration Parameters ---
    const INPUT_FILE_SOURCE = '/dev/stdin';       // Specifies the path for standard input on POSIX systems.
    const BATCH_CAPACITY = 5;                     // Defines how many sums are collected before batch processing occurs.
    const EXIT_SIGNAL = "0 0";                    // The specific string that triggers early termination if it's the first data line.
    const IDENTIFIER_SET = "ABCDE";               // A string used to map the index of the highest score to a character label.

    // --- Module Dependency Check ---
    let nodeFileSystemModule;
    try {
        nodeFileSystemModule = require('fs'); // Attempt to load Node.js's file system module.
    } catch (moduleLoadError) {
        // If 'fs' module is unavailable (e.g., in a browser environment), log an error and exit.
        console.error("CRITICAL ERROR: 'fs' module is necessary for reading input. Please run this script in a Node.js environment.");
        process.exit(1); // Terminate with a non-zero exit code to indicate failure.
    }

    // --- Internal Data Storage ---
    let pendingSumsCollection = []; // An array to temporarily hold sums before a batch is processed.
    let currentLineNumber = 0;      // Tracks the number of input lines processed so far, for debugging/logging.

    /**
     * Analyzes a given collection of numerical scores to find the maximum value
     * and outputs a formatted string including its associated identifier.
     * @param {Array<number>} scoreSegment - An array containing the numerical scores for the current batch.
     */
    function processAndOutputBatchResult(scoreSegment) {
        // A safety check: if the segment is empty, there's nothing to process.
        if (scoreSegment.length === 0) {
            console.warn("WARNING: Called processAndOutputBatchResult with an empty score segment.");
            return;
        }

        // Efficiently find the maximum score within the array using the spread operator.
        const maximumScoreInBatch = Math.max(...scoreSegment);

        // Determine the zero-based index of the maximum score to find its corresponding label.
        const winningScorePosition = scoreSegment.indexOf(maximumScoreInBatch);

        // Retrieve the character label from the predefined set based on the winning position.
        // Includes a defensive check to ensure the index is valid for the identifier set.
        let assignedIdentifier = 'X'; // Default identifier in case of an invalid index.
        if (winningScorePosition >= 0 && winningScorePosition < IDENTIFIER_SET.length) {
            assignedIdentifier = IDENTIFIER_SET.charAt(winningScorePosition);
        } else {
            console.error(`ERROR: Invalid winning position (${winningScorePosition}) detected for score ${maximumScoreInBatch}.`);
        }

        // Display the result for the processed batch.
        console.log(`${assignedIdentifier} ${maximumScoreInBatch}`);
    }

    // --- Main Script Execution Block ---
    try {
        // Read the entire content of the specified input file synchronously.
        const entireInputContent = nodeFileSystemModule.readFileSync(INPUT_FILE_SOURCE, 'utf8');

        // Pre-process the input: remove leading/trailing whitespace, then split into individual lines.
        // Filter out any lines that are entirely empty after trimming.
        const parsedInputLines = entireInputContent
                                 .trim()
                                 .split('\n')
                                 .filter(lineText => lineText.length > 0);

        // Iterate through each line obtained from the input.
        for (const currentInputLine of parsedInputLines) {
            currentLineNumber++; // Increment the line counter for tracking.

            // Primary termination condition: if the buffer is empty and the line matches the exit signal.
            // This prevents "0 0" from terminating processing if it appears in the middle of a data set.
            if (pendingSumsCollection.length === 0 && currentInputLine === EXIT_SIGNAL) {
                // console.log(`INFO: Termination signal "${EXIT_SIGNAL}" encountered on line ${currentLineNumber}. Halting processing.`);
                break; // Exit the loop and conclude execution.
            }

            // Split the current line into expected numerical components.
            const lineParts = currentInputLine.split(' ');

            // Input validation: Ensure exactly two components are present on the line.
            if (lineParts.length !== 2) {
                console.warn(`WARNING: Skipping malformed input line ${currentLineNumber} (expected 2 numbers): "${currentInputLine}"`);
                continue; // Skip to the next line of input.
            }

            // Parse the string components into integers using base 10.
            const firstNumericComponent = parseInt(lineParts[0], 10);
            const secondNumericComponent = parseInt(lineParts[1], 10);

            // Input validation: Check if both parsed components are valid numbers.
            if (isNaN(firstNumericComponent) || isNaN(secondNumericComponent)) {
                console.warn(`WARNING: Skipping line ${currentLineNumber} due to non-numeric values: "${currentInputLine}"`);
                continue; // Skip to the next line.
            }

            // Calculate the sum of the two valid numbers.
            const calculatedSum = firstNumericComponent + secondNumericComponent;

            // Add the newly calculated sum to the pending collection.
            pendingSumsCollection.push(calculatedSum);

            // Check if the collection has reached its predefined batch capacity.
            if (pendingSumsCollection.length === BATCH_CAPACITY) {
                processAndOutputBatchResult(pendingSumsCollection); // Process the full batch.
                pendingSumsCollection = []; // Reset the collection for the next batch.
            }
        }

        // Note: Any remaining sums in `pendingSumsCollection` after the loop (if its length is
        // less than BATCH_CAPACITY) are intentionally not processed, mirroring the original logic.
        // If partial batches needed processing, additional logic would be required here.

    } catch (runtimeError) {
        // Catch and report any unexpected errors that occur during the main processing flow.
        console.error(`FATAL ERROR during script execution: ${runtimeError.message}`);
        process.exit(1); // Exit with an error code.
    }

})(); // Immediately Invoked Function Expression (IIFE) to encapsulate the script.