// This module is designed to analyze a sequence of numbers to determine the total number of times
// each even number within the sequence can be successively divided by two until it becomes odd.

/**
 * Processes a raw string input containing numerical data.
 * The input is expected to have two lines:
 * - The first line specifies the intended count of numbers in the sequence.
 * - The second line contains space-separated integers representing the sequence.
 *
 * @param {string} rawInputPayload The raw string content read from an input source.
 *                                  E.g., "3\n2 4 8"
 */
const processNumericSequence = (rawInputPayload) => {
    // --- Input Validation and Parsing ---

    // Ensure the payload is a valid non-empty string before proceeding.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        console.error("Execution Aborted: The provided input payload is empty or not a string.");
        return; // Exit if input is invalid.
    }

    // Split the entire input into individual lines for structured parsing.
    const inputContentLines = rawInputPayload.split('\n');

    // Attempt to extract the intended number of elements from the first line.
    // A guard clause ensures this value is a positive integer.
    const intendedElementCount = Number(inputContentLines[0]);
    if (isNaN(intendedElementCount) || !Number.isInteger(intendedElementCount) || intendedElementCount <= 0) {
        console.error(`Execution Aborted: Invalid or non-positive element count detected: '${inputContentLines[0]}'.`);
        return;
    }

    // Parse the second line to obtain the array of numeric values.
    // It filters out any non-numeric results from the parsing process to maintain data integrity.
    const valueCollection = inputContentLines[1]
        .split(' ')
        .map(segment => Number(segment)) // Convert each string segment to a number.
        .filter(num => !isNaN(num));    // Keep only valid numbers.

    // A warning is issued if the actual number of parsed elements does not match the declared count.
    // The process continues with the available valid data.
    if (valueCollection.length !== intendedElementCount) {
        console.warn(`Warning: Declared element count was ${intendedElementCount}, but ${valueCollection.length} valid numbers were parsed. Processing with available data.`);
    }

    // --- Core Logic: Halving Operations Calculation ---

    let accumulatedHalvings = 0; // Initialize a counter to track all division operations.

    // Iterate through each element in the collection using a traditional for loop
    // because we might conceptually update array elements (though not strictly necessary for the output).
    for (let currentElementIndex = 0; currentElementIndex < valueCollection.length; ++currentElementIndex) {
        // Create a temporary variable for the current number to perform operations on.
        // This avoids direct modification of the array element until its final state.
        let currentProcessedValue = valueCollection[currentElementIndex];

        // Repeatedly divide the current number by 2 as long as it remains an even number.
        // Each successful division increments the global counter.
        while (currentProcessedValue % 2 === 0) {
            currentProcessedValue /= 2; // Perform integer division.
            accumulatedHalvings++;      // Increment the total count of halving operations.
        }

        // Optionally, update the array element with its final, odd value.
        // This step is not strictly required for the problem's output but demonstrates state modification.
        valueCollection[currentElementIndex] = currentProcessedValue;
    }

    // --- Output Result ---

    // Display the final tally of all division operations performed across the entire sequence.
    console.log(accumulatedHalvings);
};

// --- Program Execution Entry Point ---

// This self-executing anonymous function handles reading input from standard I/O
// and invokes the primary processing function with the obtained data.
(function executeProgramFromStdin() {
    try {
        // Dynamically load the 'fs' module for file system operations.
        const fileSystemModule = require("fs");

        // Read the entire content of standard input, decode it as UTF-8, and remove leading/trailing whitespace.
        const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8").trim();

        // Pass the prepared input content to the main processing function.
        processNumericSequence(standardInputContent);
    } catch (executionError) {
        // Catch and log any errors that occur during input reading or program execution.
        console.error("An error occurred during program execution:", executionError.message);
    }
})();