"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * Processes a raw string input to find a specific sum based on divisibility by 10.
 *
 * This function aims to calculate the largest possible sum of a subset of numbers
 * from the input such that this sum is not a multiple of 10.
 *
 * @param {string} rawInputData The raw input string, expected to contain numbers separated by newlines.
 *                              The first line is typically a count, but it's ignored after initial processing.
 */
function processNumericalData(rawInputData) {
    // Input validation: Ensure rawInputData is a string and contains actual content.
    if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        // In case of invalid or empty input, return the "no solution" indicator.
        console.log(0);
        return;
    }

    // Step 1: Parse the raw input string into an array of numbers.
    // First, split the string by newline characters to get individual lines.
    const inputLines = rawInputData.split('\n');

    // Filter out any empty lines and then convert valid numeric strings to actual numbers.
    // We use `Number()` for conversion and `isNaN()` to filter out non-numeric results.
    let numericElements = inputLines
        .filter(lineStr => lineStr.trim() !== '') // Remove empty lines which could result from extra newlines
        .map(lineStr => Number(lineStr.trim()))   // Convert each trimmed string to a number
        .filter(numVal => !isNaN(numVal));        // Remove any entries that failed conversion to a valid number

    // If after parsing and filtering, no valid numbers remain, output 0 and exit.
    if (numericElements.length === 0) {
        console.log(0);
        return;
    }

    // The first element of the input is typically 'N', the count of subsequent numbers.
    // We can discard it as we'll use the actual array length for iteration.
    // This removes a potentially redundant variable (`n` in the original).
    numericElements.shift();

    // After removing the first element, check again if the list is empty.
    if (numericElements.length === 0) {
        console.log(0);
        return;
    }

    // Step 2: Sort the array of numbers in ascending order.
    // This is crucial for the subsequent logic where we might remove an element.
    // Removing the smallest possible value that satisfies the condition ensures the largest possible resulting sum.
    const sortedNumericValues = numericElements.sort((valA, valB) => valA - valB);

    // Step 3: Calculate the total sum of all sorted numbers.
    // Using `reduce` is a standard, safe, and efficient way to sum array elements in JavaScript,
    // as opposed to `eval` which has security implications and can be slower.
    let currentAggregateSum = sortedNumericValues.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

    // Step 4: Check if the initial total sum is already not divisible by 10.
    // If it's not, then this sum is the largest possible sum meeting the criteria.
    const initialRemainder = currentAggregateSum % 10;
    if (initialRemainder !== 0) {
        console.log(currentAggregateSum); // Output the total sum directly.
        return; // The task is complete.
    }

    // Step 5: If the total sum IS divisible by 10, we must try to remove one number
    // to make the remaining sum not divisible by 10.
    // Iterate through the sorted numbers, starting with the smallest.
    let isSolutionFound = false; // A flag to track if we find a valid sum.

    for (let elementIndex = 0; elementIndex < sortedNumericValues.length; ++elementIndex) {
        const itemToRemove = sortedNumericValues[elementIndex];

        // Defensive check: Ensure the item is a valid number before proceeding.
        if (typeof itemToRemove !== 'number' || isNaN(itemToRemove)) {
            continue; // Skip invalid entries.
        }

        // Calculate the sum if this 'itemToRemove' is excluded.
        const candidateSum = currentAggregateSum - itemToRemove;
        const candidateRemainder = candidateSum % 10;

        // If removing this specific number results in a sum not divisible by 10,
        // we've found our answer. Since we iterate from smallest to largest,
        // this `candidateSum` will be the largest possible sum after removing
        // a single element that satisfies the condition.
        if (candidateRemainder !== 0) {
            // Output the indicator '1' and the calculated sum, as per problem format.
            console.log(1, candidateSum);
            isSolutionFound = true;
            break; // Exit the loop as the optimal solution (largest sum) has been found.
        }
    }

    // Step 6: If the loop completes without finding any single number whose removal
    // makes the sum not divisible by 10, then no such sum can be formed by removing one element.
    if (!isSolutionFound) {
        console.log(0); // Output 0, indicating no solution found under the given constraints.
    }
}

// Main execution block: Handles reading input from standard input and calling the processor.
const standardInputFile = "/dev/stdin"; // Standard path for input in competitive programming environments.
const fileSystemUtility = require("fs"); // Explicitly import the Node.js file system module.

// Basic check for the availability of the file system module and its read method.
if (typeof fileSystemUtility.readFileSync !== 'function') {
    console.error("Critical Error: 'fs' module or 'readFileSync' method is not available.");
    process.exit(1); // Exit with an error code if essential modules are missing.
}

try {
    // Read the entire content of the standard input file as a UTF-8 string.
    const inputContentFromFile = fileSystemUtility.readFileSync(standardInputFile, "utf8");
    // Pass the retrieved content to the primary data processing function.
    processNumericalData(inputContentFromFile);
} catch (readingError) {
    // Catch any errors during file reading or initial processing.
    console.error("An error occurred during input reading or initial data processing:", readingError.message);
    // As per the problem's pattern for "no solution" or errors, output 0.
    console.log(0);
}