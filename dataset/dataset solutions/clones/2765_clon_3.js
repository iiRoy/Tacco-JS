// This module contains a specialized routine for determining the minimal product
// of two remainders when numbers within a given range are divided by a fixed modulus.
// It incorporates advanced input validation, an optimized algorithmic approach,
// and adheres to robust coding practices.

const determineMinimalModuloProduct = (inputDataset) => {
    // Define the constant modulus value used in calculations.
    // This value is central to the problem's mathematical operations.
    const DIVISOR_CONSTANT = 2019;

    // --- Type III: Enhanced input parsing and validation ---
    // Validate the primary input array to ensure it's not null or empty.
    if (!inputDataset || inputDataset.length === 0 || typeof inputDataset[0] !== 'string') {
        // In a production environment, an error would be thrown or logged.
        // For competitive programming, this might be implicitly handled by problem constraints.
        // Here, we'll return a designated error indicator and not log anything to stdout.
        return -1; // Signifies an input format error.
    }

    // Extract and split the first line of input using a flexible whitespace separator.
    // The .filter(Boolean) handles cases with multiple spaces between numbers.
    const parsedInputComponents = inputDataset[0].split(/\s+/).filter(Boolean);

    // Verify that exactly two numerical components were provided.
    if (parsedInputComponents.length !== 2) {
        return -1; // Signifies an incorrect number of input components.
    }

    // Convert string components to integers, specifying radix for safety.
    const lowerBound = parseInt(parsedInputComponents[0], 10);
    const upperBound = parseInt(parsedInputComponents[1], 10);

    // Validate if the parsed components are indeed numbers.
    if (isNaN(lowerBound) || isNaN(upperBound)) {
        return -1; // Signifies that input values are not valid numbers.
    }

    // Ensure the lower bound does not exceed the upper bound.
    if (lowerBound > upperBound) {
        return -1; // Signifies an invalid range (start > end).
    }
    // --- End Type III: Input validation ---

    // --- Type III: Optimized remainder search algorithm ---
    // Initialize variables to track the two smallest remainders encountered.
    // Start with values guaranteed to be larger than any possible remainder (0 to DIVISOR_CONSTANT-1).
    let firstSmallestRemainder = DIVISOR_CONSTANT + 1;
    let secondSmallestRemainder = DIVISOR_CONSTANT + 1;

    // Iterate through each number within the specified range.
    for (let currentIterationValue = lowerBound; currentIterationValue <= upperBound; currentIterationValue++) {
        // Calculate the modulo for the current number.
        const currentModuloResult = currentIterationValue % DIVISOR_CONSTANT;

        // --- Type III: Early termination condition for zero remainder ---
        // If a remainder of zero is found, the absolute minimum product
        // will always be zero, regardless of other remainders.
        // This allows for an immediate and efficient exit.
        if (currentModuloResult === 0) {
            console.log(0); // Output 0 directly as it's the minimum possible product.
            return 0; // Terminate execution and return the result.
        }

        // Update the stored smallest remainders.
        // If current result is smaller than the first smallest...
        if (currentModuloResult < firstSmallestRemainder) {
            secondSmallestRemainder = firstSmallestRemainder; // Shift the previous first smallest to second.
            firstSmallestRemainder = currentModuloResult;     // Assign new first smallest.
        }
        // Else if current result is smaller than the second smallest (handles cases where current is a duplicate of firstSmallest or just between first and second)...
        else if (currentModuloResult < secondSmallestRemainder) {
            secondSmallestRemainder = currentModuloResult; // Assign new second smallest.
        }
    }
    // --- End Type III: Optimized remainder search algorithm ---

    // --- Type III: Final computation and output with an intermediate variable ---
    // Compute the product of the two smallest remainders identified.
    const finalCalculatedProduct = firstSmallestRemainder * secondSmallestRemainder;

    // Display the final computed product.
    console.log(finalCalculatedProduct);

    // Return the result for potential external use or testing.
    return finalCalculatedProduct;
};

// --- Type III: Encapsulated input reading and execution flow ---
// Define a utility function to safely read and process standard input.
const obtainStandardInputData = () => {
    try {
        // Access the Node.js file system module.
        const fileSystem = require('fs');
        // Read raw content from standard input, ensuring UTF-8 encoding.
        const rawContent = fileSystem.readFileSync('/dev/stdin', 'UTF-8');
        // Trim any leading/trailing whitespace and split the content into an array of lines.
        return rawContent.trim().split('\n');
    } catch (readError) {
        // In case of an I/O error during input reading, return an empty array.
        // This prevents the main processing function from being called with invalid data.
        return [];
    }
};

// Execute the main logic using the data obtained from standard input.
const systemInputLines = obtainStandardInputData();
// Only proceed with calculation if valid input lines were successfully read.
// The `determineMinimalModuloProduct` function handles further validation internally.
if (systemInputLines.length > 0) {
    determineMinimalModuloProduct(systemInputLines);
}
// If `systemInputLines` is empty (due to an error or no input),
// `determineMinimalModuloProduct` will not be called, and no output will be produced,
// adhering to common competitive programming output conventions for errors.