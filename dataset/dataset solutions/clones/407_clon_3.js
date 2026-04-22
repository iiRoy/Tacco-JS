// This module is responsible for computing a specialized numerical sequence and
// processing a series of input values against this sequence to produce specific outputs.
// It simulates a "Tribonacci-like" recurrence relation.

// --- Module Dependencies ---
// The 'fs' module is used for file system operations, specifically reading input.
const fileSystemInterface = require('fs');

// --- Configuration Constants ---
// Defines the standard input file path for reading data.
const standardInputFilePath = '/dev/stdin';
// A fixed divisor used in the final calculation step. This could represent
// a scaling factor or a daily average over a period, for example.
const fixedOutputDivisor = 3650;
// The maximum index up to which the custom sequence will be pre-computed.
// This limits the range of valid input values.
const maximumSequenceIndex = 31; // Original code iterates up to i=31, so dp[31] is calculated.
// The initial seed values that start the custom numerical sequence.
// These correspond to the first few elements of the sequence (e.g., sequence[0], sequence[1], sequence[2]).
const initialSequenceSeeds = [1, 2, 4];

// --- Core Helper Functions ---

/**
 * Safely reads content from a specified file path, preprocesses it, and returns an array of lines.
 * This function handles file system errors and basic input parsing.
 * @param {string} sourcePath - The full path to the file to be read.
 * @returns {string[]} An array where each element is a non-empty, trimmed line from the input file.
 *                     Returns an empty array if the file cannot be read or contains no valid lines.
 */
const acquireAndPrepareDataLines = (sourcePath) => {
    let rawContentBuffer;
    try {
        // Attempt to synchronously read the entire file content as UTF-8.
        rawContentBuffer = fileSystemInterface.readFileSync(sourcePath, 'utf8');
    } catch (readError) {
        // Log an error if file reading fails (e.g., file not found, permissions).
        console.error(`ERROR: Could not read input from '${sourcePath}'. Details: ${readError.message}`);
        // Return an empty array to indicate failure to acquire data.
        return [];
    }

    // Process the raw content:
    // 1. Trim leading/trailing whitespace from the entire content block.
    // 2. Split the content into an array of lines based on newline characters.
    // 3. Filter out any lines that are empty after the split and initial trimming.
    const cleanDataLines = rawContentBuffer
        .trim()
        .split('\n')
        .filter(lineText => lineText.length > 0); // Ensures only meaningful lines are kept.

    return cleanDataLines;
};

/**
 * Computes a single value in the custom sequence based on its three preceding values.
 * This implements the recurrence relation: sequence[k] = sequence[k-1] + sequence[k-2] + sequence[k-3].
 * @param {number[]} currentSequence - The array containing the sequence values computed so far.
 * @param {number} targetIndex - The index for which to calculate the new value.
 * @returns {number} The calculated value for the `targetIndex`.
 */
const deriveNextSequenceElement = (currentSequence, targetIndex) => {
    // Access the three previous elements to sum them up.
    // Assumes `targetIndex` is at least 3 for valid array access.
    const prev1 = currentSequence[targetIndex - 1];
    const prev2 = currentSequence[targetIndex - 2];
    const prev3 = currentSequence[targetIndex - 3];
    return prev1 + prev2 + prev3;
};

// --- Main Application Logic (Immediately Invoked Function Expression) ---
(function executeProcessingWorkflow() {
    // --- Step 1: Pre-calculate the custom numerical sequence ---
    // Initialize the sequence array with the base values.
    // Using `let` as elements will be added.
    let precomputedSequence = [...initialSequenceSeeds];

    // Loop to populate the sequence up to the defined maximum index.
    // The loop starts from the index immediately following the initial seeds.
    for (let currentIterationIndex = initialSequenceSeeds.length; currentIterationIndex <= maximumSequenceIndex; ++currentIterationIndex) {
        // Calculate the next element using the helper function and append it.
        precomputedSequence.push(deriveNextSequenceElement(precomputedSequence, currentIterationIndex));
    }

    // --- Step 2: Acquire and prepare the input data for processing ---
    const incomingDataRecords = acquireAndPrepareDataLines(standardInputFilePath);

    // If no data was successfully loaded, log an error and terminate.
    if (incomingDataRecords.length === 0) {
        console.error("CRITICAL: No input data records found or loaded. Terminating processing.");
        return; // Exit the IIFE.
    }

    // --- Step 3: Process each input record iteratively ---
    let recordCounter = 0; // A simple counter for tracking processed records.
    // Loop continues as long as there are records to process in the queue.
    while (incomingDataRecords.length > 0) {
        recordCounter++;
        // Extract the next raw string record from the beginning of the array.
        const currentRawRecord = incomingDataRecords.shift();

        // Attempt to convert the string record into an integer.
        const parsedNumericInput = parseInt(currentRawRecord, 10);

        // --- Input Validation and Flow Control ---
        if (isNaN(parsedNumericInput)) {
            // Warn if the input is not a valid number and skip to the next record.
            console.warn(`WARNING [Record ${recordCounter}]: Non-numeric input detected ('${currentRawRecord}'). Skipping this record.`);
            continue;
        }

        if (parsedNumericInput === 0) {
            // A zero input is a specific termination condition for the processing loop.
            // This is a guard clause to stop further processing.
            break;
        }

        // Validate if the input number refers to a valid index within our precomputed sequence.
        // The original logic uses dp[n-1], so `n` must be at least 1 and `n-1` must be within bounds.
        if (parsedNumericInput < 1 || parsedNumericInput > precomputedSequence.length) {
            console.error(`ERROR [Record ${recordCounter}]: Input value ${parsedNumericInput} is out of the valid sequence index range [1, ${precomputedSequence.length}]. Skipping.`);
            continue;
        }

        // --- Step 4: Perform the final calculation based on the input ---
        // Retrieve the corresponding sequence value. Note the `parsedNumericInput - 1`
        // as the input `n` maps to `sequence[n-1]`.
        const selectedSequenceValue = precomputedSequence[parsedNumericInput - 1];

        // Apply the division operation using the predefined constant.
        const intermediateCalculatedRatio = selectedSequenceValue / fixedOutputDivisor;

        // Apply the ceiling function to the result, rounding up to the nearest integer.
        const finalComputedResult = Math.ceil(intermediateCalculatedRatio);

        // --- Step 5: Output the final result ---
        console.log(finalComputedResult);
    }

    // Optional: Log a message upon completion of all processing or early termination.
    // if (recordCounter > 0 && incomingDataRecords.length === 0) {
    //     console.log("INFO: All available input records have been processed.");
    // } else if (recordCounter > 0) {
    //     console.log("INFO: Processing terminated as per input logic (e.g., zero input detected).");
    // }
})(); // End of the main execution block.