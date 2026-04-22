// This module is designed to calculate a specific element within a modified Fibonacci sequence.
// The sequence is defined with its initial terms as F(0)=1 and F(1)=1.
// It leverages memoization to optimize performance for larger input values.

(function executeProgramLogic() {

    // --- System Configuration and Setup ---

    // Define constants for input source and encoding to enhance readability and maintainability.
    const SOURCE_INPUT_PATH = '/dev/stdin';
    const TEXT_ENCODING = 'utf8';

    // Obtain the Node.js 'fs' (file system) module for reading input.
    const fileSystemUtility = require('fs');

    // --- Input Processing ---

    // Attempt to read the raw input data from the specified standard input path.
    // If an error occurs during file reading, it will propagate.
    const bufferData = fileSystemUtility.readFileSync(SOURCE_INPUT_PATH, TEXT_ENCODING);

    // Convert the buffer data to a string, remove any leading/trailing whitespace,
    // and then parse it as an integer with a base of 10.
    const requestedSequenceIndex = parseInt(bufferData.toString().trim(), 10);

    // --- Input Validation ---

    // Implement a guard clause to validate the parsed input.
    // Ensure the input is a valid non-negative integer.
    if (isNaN(requestedSequenceIndex) || requestedSequenceIndex < 0) {
        console.error("Critical Error: The provided input is invalid. Please supply a non-negative integer for the Fibonacci index.");
        // Terminate the process with an error code to indicate failure.
        process.exit(1);
    }

    // --- Memoization Storage Initialization ---

    // Initialize an array to serve as our memoization table.
    // It's sized to accommodate all Fibonacci terms up to the requested index (inclusive).
    // All entries are initially set to `undefined` to distinguish from valid 0 values (though not applicable here).
    const memoizedResultsStore = new Array(requestedSequenceIndex + 1).fill(undefined);

    // Explicitly set the base cases for our specific Fibonacci sequence definition.
    // F(0) = 1
    memoizedResultsStore[0] = 1;
    // F(1) = 1
    memoizedResultsStore[1] = 1;

    // --- Fibonacci Calculation Function ---

    /**
     * Computes the Fibonacci term at a given position using recursion with memoization.
     * This function implements the sequence where F(0)=1, F(1)=1, and F(n) = F(n-1) + F(n-2) for n > 1.
     * @param {number} currentPosition - The index of the Fibonacci term to compute.
     * @returns {number} The Fibonacci term at the specified position.
     */
    const determineFibonacciTerm = (currentPosition) => {
        // First, check if the result for this position has already been computed and stored.
        // If it exists (is not undefined), return the stored value immediately to avoid redundant calculations.
        if (memoizedResultsStore[currentPosition] !== undefined) {
            return memoizedResultsStore[currentPosition];
        }

        // Although base cases are pre-filled, explicitly handling them here adds robustness
        // and clarity, especially if the `memoizedResultsStore` wasn't perfectly initialized
        // or if `currentPosition` is 0 or 1 for some reason during recursion.
        if (currentPosition === 0) {
            return 1; // F(0) is defined as 1
        }
        if (currentPosition === 1) {
            return 1; // F(1) is defined as 1
        }

        // If the term is not in the store and not a base case,
        // recursively compute the two preceding terms.
        // Use intermediate variables for clarity in the recursive step.
        const previousTermValue = determineFibonacciTerm(currentPosition - 1);
        const secondPreviousTermValue = determineFibonacciTerm(currentPosition - 2);

        // Calculate the current term by summing the two previous terms.
        const calculatedCurrentTerm = previousTermValue + secondPreviousTermValue;

        // Store the newly computed term in our memoization table before returning it.
        // This ensures it will be available for future lookups.
        memoizedResultsStore[currentPosition] = calculatedCurrentTerm;

        return calculatedCurrentTerm;
    };

    // --- Execution and Output ---

    // Invoke the Fibonacci calculation function with the validated input index.
    const finalComputedResult = determineFibonacciTerm(requestedSequenceIndex);

    // Display the final computed result to the standard output,
    // providing a descriptive message for better user understanding.
    console.log(`The computed Fibonacci term for index ${requestedSequenceIndex} is: ${finalComputedResult}`);

})();