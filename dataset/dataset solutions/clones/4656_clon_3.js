/**
 * Helper function to safely parse a string into a positive integer.
 * Throws an error if the input is not a valid positive integer.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed positive integer.
 */
const parsePositiveInteger = (inputString) => {
    const parsedValue = parseInt(inputString, 10);

    if (isNaN(parsedValue) || !Number.isInteger(parsedValue) || parsedValue <= 0) {
        throw new Error(`Invalid or non-positive integer provided: '${inputString}'`);
    }
    return parsedValue;
};

/**
 * Processes raw input data to calculate the sum of the largest 'N' elements
 * from a sorted array containing '2N' numeric values.
 *
 * @param {string} rawInputString - The complete input string, typically from stdin.
 */
function calculateSumOfLargestElements(rawInputString) {
    // --- Type II: Renaming, Whitespace, Comments ---
    // Split the raw input string into individual lines, handling various newline types.
    const inputLines = rawInputString.trim().split(/\r?\n/);

    // --- Type III: Add guard clauses and validations ---
    if (inputLines.length < 2) {
        console.error("Input error: Expected at least two lines of data (N and the array of numbers).");
        return; // Exit function early
    }

    let countOfElementsToConsider;
    try {
        // Parse the first line to determine 'N', the number of largest elements to sum.
        countOfElementsToConsider = parsePositiveInteger(inputLines[0]);
    } catch (error) {
        console.error(`Input error on first line: ${error.message}`);
        return;
    }

    // Split the second line into an array of string representations of numbers.
    const elementsAsStringArray = inputLines[1].split(' ');

    // Calculate the total number of elements expected in the array (2 * N).
    const totalExpectedElements = 2 * countOfElementsToConsider;

    // --- Type III: Add validation for array length ---
    if (elementsAsStringArray.length !== totalExpectedElements) {
        console.error(`Input error: Expected ${totalExpectedElements} numbers in the array, but found ${elementsAsStringArray.length}.`);
        return;
    }

    // Convert string elements to numbers, applying the safe parsing helper.
    const numericDataSet = elementsAsStringArray.map(strVal => {
        try {
            return parsePositiveInteger(strVal); // Re-using parsePositiveInteger, assuming values are positive
        } catch (error) {
            // Handle error for individual array elements if needed, or let map throw
            console.error(`Input error in numeric data: ${error.message}`);
            throw error; // Re-throw to stop further processing if parsing fails
        }
    });

    // Sort the numeric data set in ascending order.
    // This rearrangement is crucial for easily identifying the largest elements.
    numericDataSet.sort((firstNum, secondNum) => firstNum - secondNum);

    // --- Type III: Remove redundant code and introduce intermediate variables ---
    // The original `if (N === 1)` block is redundant.
    // If N=1, the loop `for(let i = N; i <= ((2 * N) - 1); i++)` becomes `for(let i = 1; i <= 1; i++)`,
    // which correctly sums `numericDataSet[1]`, which is the largest element when N=1.
    // So, we can remove that conditional branch.

    let accumulatedSum = 0; // Initialize the variable to store the final sum.

    // Determine the starting and ending indices for the largest 'N' elements.
    // In a 2N-element sorted array (0-indexed), the largest N elements are from index N to 2N-1.
    const startIndexForSum = countOfElementsToConsider;
    const endIndexExclusive = totalExpectedElements; // Loop up to, but not including, this index.

    // Iterate through the selected portion of the sorted array and accumulate the sum.
    for (let currentElementIndex = startIndexForSum; currentElementIndex < endIndexExclusive; ++currentElementIndex) {
        accumulatedSum += numericDataSet[currentElementIndex];
    }

    // Output the final calculated sum to the console.
    console.log(`Calculated sum of largest elements: ${accumulatedSum}`);
}

// --- Type II/III: Modified input reading and execution block ---
// This block handles reading input from the standard input stream
// and orchestrates the execution of the main processing logic.
(function executeFromStdin() {
    try {
        // Dynamically import the 'fs' module for file system operations.
        const fileSystemModule = require('fs');
        const standardInputFilePath = '/dev/stdin'; // Standard path for input on Unix-like systems.
        const textEncoding = 'utf8'; // Specify the character encoding for input.

        // Read the entire content of the standard input file synchronously.
        const incomingData = fileSystemModule.readFileSync(standardInputFilePath, textEncoding);

        // Invoke the primary function to process the obtained data.
        calculateSumOfLargestElements(incomingData);

    } catch (readingError) {
        // Catch and report any errors that occur during file reading or initial processing.
        console.error("An operational error occurred during input acquisition or initial setup:");
        console.error(readingError.message);
        // Optionally, indicate a failure status to the operating system.
        // process.exit(1);
    }
})();