/*
 * This module is responsible for processing numerical data streams, typically from standard input.
 * It reads sequences of five integers, applies a set of rules based on the presence
 * or absence of specific reference values (1, 2, 3) within each sequence, and
 * then outputs results according to predefined logical branches.
 *
 * The processing continues until a specific termination signal (0) is encountered
 * as the first element of a sequence, or if the input stream is exhausted.
 */

// Core Node.js module for file system operations.
const fileSystemModule = require('fs');

/**
 * Safely retrieves all content from a specified file path.
 * This function is synchronous and will block the event loop.
 * Error handling is included to prevent application crashes from file access issues.
 *
 * @param {string} sourcePath - The absolute or relative path to the input file.
 * @returns {string} The full content of the file, decoded as UTF-8.
 * @throws {Error} Propagates an error if file reading fails for any reason.
 */
function obtainRawData(sourcePath) {
    try {
        // Attempt to read the entire file synchronously.
        const contentBuffer = fileSystemModule.readFileSync(sourcePath, 'utf8');
        return contentBuffer;
    } catch (ioError) {
        // Log the specific error and then re-throw a generalized error.
        console.error(`CRITICAL: Failed to access or read input file at '${sourcePath}'. Error: ${ioError.message}`);
        throw new Error('Input data acquisition process failed.');
    }
}

// --- Configuration Constants ---
const STD_INPUT_FILE_PATH = '/dev/stdin';             // Standard input path for Unix-like systems.
const REFERENCE_VALUE_SET = Object.freeze([1, 2, 3]);  // The immutable set of values used for comparison.
const REQUIRED_SEQUENCE_SIZE = 5;                      // Each processing unit consists of five integers.
const END_OF_INPUT_MARKER = 0;                         // A specific integer that signals the program to terminate.

// --- Initialization ---
let fullInputContent;
try {
    fullInputContent = obtainRawData(STD_INPUT_FILE_PATH);
} catch (initError) {
    // If input data cannot be obtained, there's no point in continuing.
    console.error('Application cannot proceed without valid input data.');
    process.exit(1); // Exit with a non-zero code to indicate failure.
}

// Pre-process the raw input: trim whitespace, split into individual lines,
// and filter out any empty lines that might result from extra newlines in the input.
let processedInputLines = fullInputContent
    .trim()
    .split('\n')
    .filter(lineFragment => lineFragment.length > 0);

let currentProcessingIteration = 0; // Tracks the number of sequences processed or attempted.

// --- Main Processing Loop ---
// The loop continues indefinitely until an explicit break condition is met.
while (true) {
    currentProcessingIteration++; // Increment the iteration counter for context.

    // Attempt to extract the first element of the next potential sequence.
    // `shift()` removes and returns the first element from the array.
    const firstElementFragment = processedInputLines.shift();

    // Guard clause 1: Check for end of input stream.
    if (firstElementFragment === undefined) {
        // console.log(`INFO: Input stream exhausted after ${currentProcessingIteration - 1} successful cycles.`);
        break; // No more data to process, terminate the loop.
    }

    // Convert the string fragment to an integer, specifying base 10 for robustness.
    const parsedFirstElement = parseInt(firstElementFragment, 10);

    // Guard clause 2: Validate the parsed number.
    if (isNaN(parsedFirstElement)) {
        console.warn(`WARNING: Invalid number format encountered: '${firstElementFragment}'. Skipping this potential sequence.`);
        continue; // Skip to the next iteration if the first element is not a valid number.
    }

    // Guard clause 3: Check for the termination signal.
    if (parsedFirstElement === END_OF_INPUT_MARKER) {
        // console.log(`INFO: Termination signal (${END_OF_INPUT_MARKER}) received. Exiting loop.`);
        break; // Termination signal detected, exit the processing loop.
    }

    // --- Sequence Assembly ---
    // If we've passed the initial checks, we expect a full sequence of five numbers.
    // The first number is already `parsedFirstElement`. We need 4 more.
    const activeSequenceCollection = [parsedFirstElement];

    // Guard clause 4: Ensure there are enough remaining lines for a complete sequence.
    if (processedInputLines.length < REQUIRED_SEQUENCE_SIZE - 1) {
        console.error(`ERROR: Insufficient data for a complete sequence starting with ${parsedFirstElement} in cycle ${currentProcessingIteration}. Remaining data: ${processedInputLines.length} lines. Terminating.`);
        break; // Cannot form a full sequence, abort further processing.
    }

    // Collect the remaining elements for the current sequence.
    for (let k = 0; k < REQUIRED_SEQUENCE_SIZE - 1; k++) {
        const nextElementFragment = processedInputLines.shift();
        const nextParsedElement = parseInt(nextElementFragment, 10);

        // Guard clause 5: Validate subsequent parsed numbers.
        if (isNaN(nextParsedElement)) {
            console.warn(`WARNING: Invalid number format for element ${k + 2} in sequence ${currentProcessingIteration}: '${nextElementFragment}'. This sequence is incomplete and will be skipped.`);
            // Clear out any remaining elements for this malformed sequence to prevent partial processing.
            // This is a Type III addition for robust error handling.
            while (activeSequenceCollection.length < REQUIRED_SEQUENCE_SIZE) {
                // Fill with a placeholder or just break if we want to discard the whole sequence.
                // For this clone, we'll just break and let the length check below handle it.
                break;
            }
            break; // Break from inner loop, sequence is malformed.
        }
        activeSequenceCollection.push(nextParsedElement);
    }

    // Post-collection check: Ensure the sequence is indeed complete.
    if (activeSequenceCollection.length !== REQUIRED_SEQUENCE_SIZE) {
        // console.log(`INFO: Skipping incomplete sequence in cycle ${currentProcessingIteration}.`);
        continue; // Skip this cycle if the sequence couldn't be fully assembled.
    }

    // --- Core Logic: Identify Missing Reference Values ---
    // Use a Set for efficient `has()` checks to determine which reference values are present.
    const valuesFoundInSequence = new Set(activeSequenceCollection);

    // Filter the universal reference set to find values NOT present in the current sequence.
    const absentReferenceValues = REFERENCE_VALUE_SET.filter(
        refValue => !valuesFoundInSequence.has(refValue)
    );

    const countOfAbsentValues = absentReferenceValues.length;

    // --- Output Strategy Mapping (Type III Refactoring) ---
    // This object maps the single missing reference value to its corresponding output logic function.
    const specificOutputRulebook = {
        // Rule for when '1' is the sole missing value.
        // Original: if(rps[0]==1)console.log((v==2)?2:1);
        1: (inputValue) => (inputValue === 2 ? 2 : 1),
        // Rule for when '2' is the sole missing value.
        // Original: if(rps[0]==2)console.log((v==1)?2:1);
        2: (inputValue) => (inputValue === 1 ? 2 : 1),
        // Rule for when '3' is the sole missing value.
        // Original: if(rps[0]==3)console.log((v==1)?1:2);
        3: (inputValue) => (inputValue === 1 ? 1 : 2),
    };

    /**
     * A simple utility function to print a value to standard output, followed by a newline.
     * @param {*} valueToEmit - The data to be printed.
     */
    const printToConsole = (valueToEmit) => console.log(valueToEmit);

    // --- Conditional Output Generation ---
    // Branch based on the number of missing reference values.
    if (countOfAbsentValues === 2 || countOfAbsentValues === 0) {
        // If two or zero reference values are missing, print '3' for each element in the sequence.
        // Using a modern Array.from for fixed iterations.
        Array.from({ length: REQUIRED_SEQUENCE_SIZE }).forEach(() => printToConsole(3));
    } else if (countOfAbsentValues === 1) {
        // If exactly one reference value is missing.
        const theUniqueMissingValue = absentReferenceValues[0];
        const currentOutputFunction = specificOutputRulebook[theUniqueMissingValue];

        // Guard clause 6: Ensure a rule exists for the identified missing value.
        // This should always be true if REFERENCE_VALUE_SET is [1,2,3] and missingCount is 1.
        if (!currentOutputFunction) {
            console.error(`LOGIC_ERROR: No defined output rule for missing value '${theUniqueMissingValue}' in cycle ${currentProcessingIteration}.`);
            // Fallback: print a generic error indicator for each sequence element.
            activeSequenceCollection.forEach(() => printToConsole(-99));
            continue; // Skip to the next cycle.
        }

        // Apply the determined output function to each element of the current sequence.
        activeSequenceCollection.forEach(sequenceElement => {
            printToConsole(currentOutputFunction(sequenceElement));
        });
    } else {
        // Guard clause 7: Catch any unexpected counts of missing values.
        // This case should theoretically not be reached if REFERENCE_VALUE_SET has only 3 elements.
        console.error(`UNEXPECTED_STATE: Unhandled count of missing values (${countOfAbsentValues}) in cycle ${currentProcessingIteration}. Skipping sequence.`);
        // As a robust fallback, output an error placeholder for each element.
        activeSequenceCollection.forEach(() => printToConsole(-1));
    }
}

// Script has completed its execution after processing all valid input sequences or encountering a termination signal.
// console.log("INFO: Script execution finalized.");