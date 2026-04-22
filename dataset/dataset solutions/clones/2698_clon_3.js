'use strict'; // Ensure strict parsing and execution of JavaScript.

/**
 * Acts as the primary entry point for processing external data.
 * This function handles reading raw input, parsing it into a structured format,
 * and then initiating the core logic evaluation.
 *
 * @param {string} sourceContent - The entire raw string content received from the input source.
 */
function processInputData(sourceContent) {
    // Standardize newline characters and remove any leading/trailing whitespace,
    // then split the content into individual text segments (lines).
    // Filter out any segments that are empty after splitting.
    const textSegments = sourceContent.trim().split(/\r?\n/).filter(Boolean);

    // The first line often contains metadata, such as the total count of elements expected.
    // While parsed here, this specific value is not directly utilized by the subsequent logic
    // in this particular problem context, making it a candidate for removal or alternative use.
    // const specifiedElementCount = Number(textSegments[0]);

    // The actual data sequence is expected on the second line.
    // This line is split by spaces, and each resulting segment is converted into an integer.
    // A basic check for NaN is included for robustness, defaulting to 0 for invalid numbers.
    const numericSequence = textSegments[1].split(' ').map(segment => {
        const parsedValue = parseInt(segment, 10);
        // In a production environment, non-numeric input might trigger an error or specific handling.
        // For competitive programming, valid integer input is typically guaranteed.
        return isNaN(parsedValue) ? 0 : parsedValue;
    });

    // Invoke the central algorithm to evaluate the properties of the numeric sequence,
    // and then output the boolean result ('YES' or 'NO') to the console.
    console.log(evaluateSequenceSortability(numericSequence));
}

/**
 * Determines whether a given array of numbers is "almost sorted", meaning it deviates
 * from a perfectly sorted state by a very small number of positional mismatches.
 * Specifically, it checks if the sequence can be made fully sorted by changing at most two elements.
 *
 * @param {number[]} inputCollection - The array of integer numbers to be analyzed.
 * @returns {string} Returns 'YES' if the sequence requires 0, 1, or 2 changes to be sorted, otherwise 'NO'.
 */
function evaluateSequenceSortability(inputCollection) {
    // Define the maximum allowed number of positional deviations for the sequence
    // to still be considered "almost sorted". A value of 2 means 0, 1, or 2 mismatches are acceptable.
    const maximumPermittedDeviationCount = 2;

    // Implement guard clauses for trivial input cases.
    // An array that is not an array, is empty, or contains only one element is inherently "sorted".
    if (!Array.isArray(inputCollection) || inputCollection.length <= 1) {
        return 'YES'; // No deviations possible or necessary for these cases.
    }

    // Create a deep copy of the original input array to preserve its initial state.
    // This ensures that the original `inputCollection` remains unmodified throughout the function.
    const initialArrangement = Array.from(inputCollection);

    // Create a separate, sorted version of the input array for comparison.
    // It's crucial to sort a copy, not the original, and use a numeric comparison function.
    const idealArrangement = Array.from(inputCollection).sort((valA, valB) => valA - valB);

    let deviationCounter = 0; // Initialize a counter for tracking positional differences.
    let currentElementIndex = 0; // Initialize an index for iterating through the arrays.

    // Iterate through both the initial and ideal arrangements element by element.
    // The loop continues as long as we haven't reached the end of the array
    // AND the number of deviations found so far does not exceed the maximum allowed plus one.
    // This `+1` ensures that if `deviationCounter` reaches 3, the loop terminates immediately.
    for (currentElementIndex = 0; currentElementIndex < initialArrangement.length; ++currentElementIndex) {
        // Compare elements at the same index in both arrays.
        // If they differ, it signifies a deviation from the sorted state.
        if (initialArrangement[currentElementIndex] !== idealArrangement[currentElementIndex]) {
            deviationCounter++; // Increment the deviation counter.
        }

        // Early exit optimization: If the number of deviations already exceeds
        // the permissible limit, there's no need to continue checking the rest of the array.
        if (deviationCounter > maximumPermittedDeviationCount) {
            break; // Terminate the loop.
        }
    }

    // Based on the final count of deviations, return 'YES' or 'NO'.
    // If the `deviationCounter` is less than or equal to `maximumPermittedDeviationCount`,
    // the array is considered "almost sorted".
    return (deviationCounter <= maximumPermittedDeviationCount) ? 'YES' : 'NO';
}

// Execute the main processing function by reading input from standard input.
// `0` is the file descriptor for standard input in Node.js environments.
// `node:fs` is a modern way to import the file system module.
processInputData(require('node:fs').readFileSync(0, 'utf8'));