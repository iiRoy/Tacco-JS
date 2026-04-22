'use strict'; // Enforce strict parsing and error handling for robust code execution.

/**
 * Determines the median (middle element) of a given numerical array based on a specific definition.
 * For an array of length N, the median is defined as the element at index floor(N/2)
 * after the array has been sorted in ascending order.
 *
 * @param {number[]} numericalSeries - An array of numbers for which to find the central value.
 * @returns {number | undefined} The computed central value, or `undefined` if the input series is empty or invalid.
 */
const findCentralValue = (numericalSeries) => {
    // Implement a preliminary validation check for the input array.
    // This guards against unexpected data types or empty arrays.
    if (!Array.isArray(numericalSeries) || numericalSeries.length === 0) {
        // In this problem context, arrays passed to this function should not typically be empty.
        // However, this check enhances the function's robustness.
        console.warn("Warning: Attempted to find central value for an empty or non-array series.");
        return undefined; // Indicate that a valid median could not be determined.
    }

    // Create a shallow copy of the array and sort it in ascending numerical order.
    // Using `slice()` prevents modification of the original `numericalSeries` array.
    // The comparison function `(valA, valB) => valA - valB` ensures correct numeric sorting.
    const orderedSequence = numericalSeries.slice().sort((valA, valB) => valA - valB);

    // Calculate the index of the middle element.
    // `Math.floor` correctly handles both even and odd length arrays,
    // consistently choosing the lower-indexed of the two central elements for even lengths.
    const midIndex = Math.floor(orderedSequence.length / 2);

    // Retrieve and return the element located at the calculated middle index.
    return orderedSequence[midIndex];
};

/**
 * Orchestrates the entire solution process:
 * 1. Parses the raw input string to extract N and the array of numbers.
 * 2. Generates all possible contiguous subarrays from the main array.
 * 3. Computes the median for each of these subarrays.
 * 4. Collects all computed subarray medians into a new array.
 * 5. Finally, calculates and outputs the median of this collection of medians.
 *
 * @param {string} sourceData - The raw input string, typically from standard input or a test case.
 */
const orchestrateSolution = (sourceData) => {
    // Define string constants for delimiters to improve readability and maintainability.
    const lineSeparatorChar = '\n';
    const elementSeparatorChar = ' ';
    const decimalRadixValue = 10; // Standard radix for `parseInt`.

    // Split the entire input string into an array of individual lines.
    const textSegments = sourceData.split(lineSeparatorChar);

    // Initial validation: Ensure there are at least two lines of input (N and the array).
    if (textSegments.length < 2) {
        console.error("Error: Input data is malformed or insufficient. Expected at least two lines.");
        return; // Terminate execution if input structure is incorrect.
    }

    // Process the first line to extract the total count of items (N).
    const firstLineComponents = textSegments[0].split(elementSeparatorChar);
    // Validate that the first line actually contained components.
    if (firstLineComponents.length === 0) {
        console.error("Error: The first line specifying the number of items is empty.");
        return;
    }
    const totalItems = parseInt(firstLineComponents[0], decimalRadixValue);

    // Validate the parsed `totalItems`. It must be a positive integer.
    if (isNaN(totalItems) || totalItems <= 0) {
        console.error(`Error: Invalid number of items specified: '${firstLineComponents[0]}'. Must be a positive integer.`);
        return;
    }

    // Process the second line to extract the main array of numbers.
    // Map each string element to an integer and filter out any non-numeric results (e.g., empty strings).
    const inputValuesArray = textSegments[1].split(elementSeparatorChar)
                                           .map(valStr => parseInt(valStr, decimalRadixValue))
                                           .filter(num => !isNaN(num)); // Ensures only valid numbers are kept.

    // Cross-validation: Check if the number of parsed elements matches the declared `totalItems`.
    if (inputValuesArray.length !== totalItems) {
        console.warn(`Warning: Mismatch in element count. Declared N=${totalItems}, but found ${inputValuesArray.length} actual elements. Proceeding with available elements.`);
        // Depending on requirements, this could be an error that halts execution.
    }

    // Initialize an array to store the medians of all generated subarrays.
    const collectedMidpoints = [];

    // Outer loop: Iterates through all possible ending indices for subarrays.
    // `rightBoundaryIndex` goes from 0 up to `totalItems - 1`.
    for (let rightBoundaryIndex = 0; rightBoundaryIndex < totalItems; ++rightBoundaryIndex) {
        // Inner loop: Iterates through all possible starting indices for subarrays,
        // ensuring `leftBoundaryIndex` is always less than or equal to `rightBoundaryIndex`.
        for (let leftBoundaryIndex = 0; leftBoundaryIndex <= rightBoundaryIndex; ++leftBoundaryIndex) {
            // Calculate the exclusive end index for the `slice` method.
            const sliceExclusiveEnd = rightBoundaryIndex + 1;

            // Extract the current contiguous subarray using `slice`.
            const segmentOfNumbers = inputValuesArray.slice(leftBoundaryIndex, sliceExclusiveEnd);

            // Compute the median of the extracted subarray using our helper function.
            const computedMidpoint = findCentralValue(segmentOfNumbers);

            // Only add the computed median to our collection if it's a valid number.
            // `findCentralValue` returns `undefined` for empty arrays, which should not happen here
            // but this adds an extra layer of safety.
            if (computedMidpoint !== undefined) {
                collectedMidpoints.push(computedMidpoint);
            } else {
                console.warn(`Note: Encountered an empty or invalid segment from indices [${leftBoundaryIndex}, ${rightBoundaryIndex}]. Skipping.`);
            }
        }
    }

    // After processing all subarrays, calculate the median of the collected medians.
    const finalOverallMedian = findCentralValue(collectedMidpoints);

    // Output the final result clearly to the console.
    console.log(`The final computed median of all subarray medians is: ${finalOverallMedian}`);
};

// A boolean flag to control whether development test cases are run or production input is processed.
const runDevelopmentTests = false; // Set to `true` to activate hardcoded test scenarios.

// Conditional block based on the `runDevelopmentTests` flag.
if (runDevelopmentTests) {
    // --- Development Mode: Execute Predefined Test Cases ---
    console.log("\n--- Initiating Development Test Suite ---\n");

    console.log("Test Case 1: Standard input with N=3, elements [10, 30, 20]");
    orchestrateSolution('3\n10 30 20');
    console.log("\n---------------------------------------------------\n");

    console.log("Test Case 2: Single element input with N=1, element [10]");
    orchestrateSolution('1\n10');
    console.log("\n---------------------------------------------------\n");

    console.log("Test Case 3: Larger input with N=10, various elements [5, 9, 5, 9, 8, 9, 3, 5, 4, 3]");
    orchestrateSolution('10\n5 9 5 9 8 9 3 5 4 3');
    console.log("\n---------------------------------------------------\n");

    console.log("Test Case 4: Edge case - Empty input string");
    orchestrateSolution('');
    console.log("\n---------------------------------------------------\n");

    console.log("Test Case 5: Edge case - Malformed N (non-numeric)");
    orchestrateSolution('abc\n1 2 3');
    console.log("\n---------------------------------------------------\n");

    console.log("Test Case 6: Edge case - Fewer elements provided than declared N");
    orchestrateSolution('5\n1 2 3');
    console.log("\n--- Development Test Suite Concluded ---\n");

} else {
    // --- Production Mode: Read Input from Standard Input ---
    try {
        // Dynamically load the 'fs' module for file system operations.
        const fileSystem = require('fs');
        const standardInputFilePath = '/dev/stdin';
        const fileEncoding = 'utf8';

        // Synchronously read the entire content from the standard input stream.
        // This is common practice in competitive programming environments.
        const productionInputData = fileSystem.readFileSync(standardInputFilePath, fileEncoding);
        orchestrateSolution(productionInputData); // Process the production data.
    } catch (ioError) {
        // Catch and report any errors that occur during file system operations (e.g., file not found).
        console.error("Critical Error: Failed to read input from standard input (/dev/stdin).");
        console.error("Details:", ioError.message);
        console.error("Please ensure your input is correctly piped or redirected to /dev/stdin.");
        // Optionally, exit the process with an error code.
        process.exit(1);
    }
}