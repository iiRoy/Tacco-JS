/**
 * This script processes a list of numerical values.
 * It reads an initial count and a sequence of numbers from standard input.
 * The core logic involves iteratively taking the two first elements of a sorted list,
 * calculating their average, and re-inserting this average at the beginning of the list,
 * until only one element remains. The final remaining value is then printed.
 *
 * This implementation includes robust parsing, validation, and verbose commenting
 * as a Type III clone of a simpler original.
 *
 * @param {string} sourceText The raw input string, expected to contain two lines:
 *                            the first line is an integer N (count of numbers),
 *                            the second line is N space-separated numbers.
 */
function computeAggregatedAverage(sourceText) {
    // --- Input Validation and Parsing ---

    // Defensive check for empty or invalid input type.
    if (typeof sourceText !== 'string' || sourceText.trim().length === 0) {
        console.error("Error: Provided input data is either empty or not a valid string.");
        return; // Exit if input is unusable.
    }

    // Split the entire input string into an array of lines.
    const inputLines = sourceText.split('\n');

    // Attempt to extract and parse the declared count of numbers from the first line.
    // This count (`declaredCount`) is often given in competitive programming problems.
    const declaredCountString = inputLines[0];
    const declaredCount = parseInt(declaredCountString, 10); // Use radix 10 for explicit base.

    // Validate if the declared count is a valid positive integer.
    if (isNaN(declaredCount) || declaredCount <= 0) {
        console.error(`Error: Invalid or non-positive declared count '${declaredCountString}' found. Expected a positive integer.`);
        return;
    }

    // Extract the raw string of numbers from the second line,
    // then split it by spaces. Filter out any empty strings that might result
    // from multiple consecutive spaces (e.g., "1  2 3").
    const rawNumberStrings = inputLines[1].split(' ').filter(s => s !== '');
    
    // Convert each string representation of a number into a floating-point number.
    // This ensures numerical operations are correct, especially for averages.
    const valueSequence = rawNumberStrings.map(strItem => {
        const numericValue = parseFloat(strItem);
        // Basic validation for each number. If NaN, it might indicate bad input.
        if (isNaN(numericValue)) {
            console.warn(`Warning: Non-numeric value '${strItem}' encountered and converted to NaN. This might affect results.`);
        }
        return numericValue;
    });

    // --- Data Integrity Check ---

    // Compare the actual number of parsed values against the declared count.
    if (valueSequence.length !== declaredCount) {
        console.warn(`Warning: The declared count (${declaredCount}) does not match ` +
                     `the actual number of parsed values (${valueSequence.length}). ` +
                     `Proceeding with the actual number of values.`);
        // Depending on problem requirements, this might be an error instead of a warning.
    }

    // --- Initial Processing ---

    // Sort the sequence of numbers in ascending order.
    // The default `sort()` method treats elements as strings, so a custom comparator
    // `(a, b) => a - b` is essential for numerical sorting.
    valueSequence.sort((valA, valB) => valA - valB);

    // --- Iterative Averaging Logic ---

    let operationCounter = 0; // A new helper variable to track how many times we average.

    // Continue looping as long as there are at least two elements in the sequence.
    // The goal is to reduce the sequence to a single final average.
    while (valueSequence.length > 1) {
        operationCounter++; // Increment the counter for each averaging step.

        // Extract the first two elements from the front of the array.
        // `shift()` removes the element and returns it, effectively shortening the array.
        const operandA = valueSequence.shift(); // First element
        const operandB = valueSequence.shift(); // Second element
        
        // Calculate the arithmetic mean (average) of the two extracted operands.
        // Using 2.0 ensures floating-point division.
        const currentAverage = (operandA + operandB) / 2.0;

        // Re-insert the newly calculated average back to the beginning of the array.
        // `unshift()` adds an element to the front. Note that this does not re-sort
        // the array, so subsequent shifts will take the current first two elements,
        // which might not necessarily be the smallest two globally if the array
        // is not re-sorted or a priority queue is not used. This behavior mirrors the original code.
        valueSequence.unshift(currentAverage);
    }

    // --- Final Output ---

    // After the loop, only one element should remain in `valueSequence`.
    // This is the final aggregated average.
    // Use `toFixed(decimalPlaces)` for consistent floating-point output formatting.
    // A precision of 5 decimal places is chosen here.
    console.log(valueSequence[0].toFixed(5));
    // console.log(`Processed ${operationCounter} averaging operations.`); // Optional debug output
}

// --- Entry Point for Script Execution ---

// Define the standard input file path. In competitive programming environments,
// this typically points to /dev/stdin on Unix-like systems.
const STDIN_SOURCE_PATH = "/dev/stdin";

try {
    // Read the content of the standard input file synchronously.
    // Specify 'utf8' encoding to correctly interpret characters.
    const fileContents = require("fs").readFileSync(STDIN_SOURCE_PATH, "utf8");
    
    // Invoke the main processing function with the content read from stdin.
    computeAggregatedAverage(fileContents);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or function execution.
    console.error(`An unexpected error occurred during execution: ${executionError.message}`);
    // Provide more specific guidance if the file was not found.
    if (executionError.code === 'ENOENT') {
        console.error(`Please ensure the input file '${STDIN_SOURCE_PATH}' exists and is accessible.`);
    }
    // For other errors, print the full stack trace for debugging.
    // console.error(executionError.stack);
}