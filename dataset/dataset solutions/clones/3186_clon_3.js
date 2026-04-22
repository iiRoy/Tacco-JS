'use strict'; // Ensure strict mode for the entire script, promoting cleaner code.

/**
 * Helper function to parse a single line of input into an array of numbers.
 * It skips the initial token of the line (e.g., a count or identifier) and
 * converts subsequent tokens to numeric values, filtering out any invalid ones.
 *
 * @param {string} lineString - The raw string representation of a single line.
 * @returns {Array<number>} An array containing only valid numeric values from the line.
 */
function extractValidNumbersFromLine(lineString) {
    // Basic validation: ensure the input is a non-empty string.
    if (typeof lineString !== 'string' || lineString.trim() === '') {
        return []; // Return an empty array if input is invalid.
    }

    // Split the line by spaces, then filter out any empty strings that might
    // result from multiple spaces (e.g., "1  2 3" -> ["1", "", "2", "3"]).
    const stringComponents = lineString.trim().split(' ').filter(token => token !== '');

    // If there are no components, or only the first component (which we ignore),
    // then there are no numbers to extract.
    if (stringComponents.length <= 1) {
        return [];
    }

    // Skip the very first component (often a count or label) and attempt to
    // convert the remaining components to numbers. Using `Number()` is flexible
    // as it converts valid strings to numbers and invalid ones to `NaN`.
    const potentiallyNumericValues = stringComponents.slice(1).map(sVal => Number(sVal));

    // Filter out any `NaN` values that resulted from unsuccessful conversions,
    // ensuring that only actual numbers are included in the final array.
    return potentiallyNumericValues.filter(val => !isNaN(val));
}

/**
 * Core function to determine the count of elements that are common across
 * multiple lists of numbers provided in a multi-line string format.
 * The first line of the input string is considered metadata and is ignored.
 * For all subsequent data lines, the first element of each line is also ignored.
 *
 * @param {string} rawInputTextData - The complete input as a single string,
 *                                    typically read from standard input.
 * @returns {number} The total count of unique numbers that appear in ALL
 *                   processed lists. Returns 0 if no common elements are found
 *                   or if the input is invalid/empty.
 */
function calculateIntersectionElementCount(rawInputTextData) {
    // Initial validation: check if the input data is a valid non-empty string.
    if (typeof rawInputTextData !== 'string' || rawInputTextData.trim() === '') {
        // console.warn("Input data is either empty or not a string. Returning 0.");
        return 0;
    }

    // Break down the multi-line input string into an array of individual lines.
    const allLinesFromInput = rawInputTextData.split('\n');

    // The problem typically specifies that the first line contains metadata
    // (like the number of lists) and should be skipped for actual data processing.
    const relevantDataLines = allLinesFromInput.slice(1);

    // If, after removing the first line, no data lines remain, no intersection can be computed.
    if (relevantDataLines.length === 0) {
        return 0;
    }

    // Process each relevant data line using our helper function to get arrays of numbers.
    const collectionOfNumberArrays = relevantDataLines.map(lineStr => extractValidNumbersFromLine(lineStr));

    // Filter out any arrays that ended up being empty after parsing (e.g., lines with only the first token).
    const nonTrivialNumberCollections = collectionOfNumberArrays.filter(collection => collection.length > 0);

    // If, after parsing and filtering, no valid non-empty collections exist, return 0.
    if (nonTrivialNumberCollections.length === 0) {
        return 0;
    }

    // Initialize the set of currently common items with the elements from the very first
    // non-empty collection. Using a Set provides efficient O(1) average-time lookups.
    let currentSharedItemsSet = new Set(nonTrivialNumberCollections[0]);

    // Iterate through the rest of the number collections, starting from the second one.
    for (let listIndex = 1; listIndex < nonTrivialNumberCollections.length; listIndex++) {
        const nextNumberCollection = nonTrivialNumberCollections[listIndex];

        // Optimization: If the set of common items becomes empty at any point,
        // it means there are no elements common to all preceding lists,
        // thus no further common elements can be found. Break early.
        if (currentSharedItemsSet.size === 0) {
            break;
        }

        // Convert the current `nextNumberCollection` into a Set for efficient membership testing.
        const nextCollectionLookupSet = new Set(nextNumberCollection);
        // Create a temporary set to store elements that are common between `currentSharedItemsSet`
        // and the `nextCollectionLookupSet`.
        const nextIterationSharedSet = new Set();

        // Iterate over each item that is currently considered common.
        for (const candidateElement of currentSharedItemsSet) {
            // Check if this candidate element also exists in the `nextCollectionLookupSet`.
            if (nextCollectionLookupSet.has(candidateElement)) {
                // If it does, add it to our temporary set for the next iteration.
                nextIterationSharedSet.add(candidateElement);
            }
        }
        // Update the main shared items set for the subsequent iterations.
        currentSharedItemsSet = nextIterationSharedSet;
    }

    // The final result is the total number of unique elements remaining in the
    // `currentSharedItemsSet`, representing the count of items common to all lists.
    return currentSharedItemsSet.size;
}

// --- Main Script Execution Block ---
// This section handles reading input from the file system and
// then outputs the computed result.
try {
    // Load the Node.js built-in file system module.
    const fileSystemModule = require('fs');

    // Define the standard input file path, common in Unix-like environments.
    const standardInputFilePath = '/dev/stdin';

    // Read the entire content of the standard input file synchronously.
    // Specifying 'utf8' encoding ensures the content is returned as a string.
    const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

    // Invoke the primary function to perform the calculation with the raw input data.
    const finalIntersectionCount = calculateIntersectionElementCount(rawInputContent);

    // Print the computed count to standard output.
    console.log(finalIntersectionCount);

} catch (fileIOError) {
    // Catch and report any errors that occur during file reading or processing.
    // In a production application, more robust error handling (e.g., logging to a file,
    // sending alerts) would be implemented. For competitive programming, a console
    // error message is typically sufficient.
    console.error(`An unexpected file I/O or processing error occurred: ${fileIOError.message}`);
    // Exit the process with a non-zero status code to indicate that an error occurred.
    process.exit(1);
}