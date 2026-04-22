// This module serves as the primary entry point for processing a specific numerical problem.
// It reads input parameters, performs a series of calculations, and outputs a final aggregated value.

/**
 * Executes the core logic to calculate a cumulative sum based on two input numerical parameters.
 * The calculation involves iterating through a range and determining a power-of-two factor for each step.
 *
 * @param {string} rawDataString - The raw string input, expected to contain two space-separated numbers.
 */
const processInputData = (rawDataString) => {
    // Step 1: Normalize and parse the input string into distinct numerical components.
    // Using a regular expression to split by any sequence of whitespace, making it robust.
    const tokenizedInput = rawDataString.trim().split(/\s+/);

    // Explicitly convert string tokens to numbers. `Number()` handles both integers and floats.
    const primaryUpperLimit = Number(tokenizedInput[0]); // Corresponds to original 'N'
    const comparisonThreshold = Number(tokenizedInput[1]); // Corresponds to original 'K'

    // Step 2: Initialize the accumulator for the final result.
    // Using `let` for a mutable variable and `0.0` to indicate a floating-point sum.
    let cumulativeResult = 0.0;

    /**
     * Internal helper function to compute the minimum exponent 'p' such that 'threshold' <= 'base' * (2^p).
     * This effectively replaces the nested loop from the original algorithm.
     *
     * @param {number} baseValue - The current base number (e.g., 'i' from the original loop).
     * @param {number} thresholdValue - The target value to exceed (e.g., 'K' from the original problem).
     * @returns {number} The smallest integer exponent 'p'.
     */
    const computeMinimumPowerExponent = (baseValue, thresholdValue) => {
        // If the threshold is already met or exceeded by the base, no power of 2 is needed (exponent is 0).
        if (thresholdValue <= baseValue) {
            return 0;
        }

        // Calculate the ratio required: how many times 'baseValue' needs to be multiplied by powers of 2.
        const requiredMultiplier = thresholdValue / baseValue;

        // Use Math.log2 to find the logarithm base 2 of the required multiplier.
        // Math.ceil ensures we get the smallest integer exponent that satisfies the condition.
        return Math.ceil(Math.log2(requiredMultiplier));
    };

    // Step 3: Iterate through the primary range and accumulate contributions.
    // Loop variable `idx` starts from 1 and goes up to `primaryUpperLimit` (inclusive).
    for (let currentPrimaryIndex = 1; currentPrimaryIndex <= primaryUpperLimit; ++currentPrimaryIndex) {
        // Calculate the base probability fragment for the current iteration.
        // This is 1 divided by the total number of primary iterations.
        const baseFragmentContribution = 1.0 / primaryUpperLimit;

        // Determine the specific power exponent required for the current `currentPrimaryIndex`.
        const necessaryExponent = computeMinimumPowerExponent(currentPrimaryIndex, comparisonThreshold);

        // Calculate the actual scaled contribution for this iteration using Math.pow.
        // This replaces the repeated division by 2 in the original inner loop.
        const scaledContribution = baseFragmentContribution / Math.pow(2, necessaryExponent);

        // Add the calculated contribution to the total sum.
        cumulativeResult += scaledContribution;
    }

    // Step 4: Output the final computed result to the standard console.
    console.log(cumulativeResult);
};

// Self-executing anonymous function to handle environment-specific input reading.
// This structure helps in encapsulating the execution logic.
(() => {
    // Attempt to read input from the standard input stream.
    try {
        const fileSystem = require("fs"); // Node.js built-in module for file system operations.
        const standardInputFile = "/dev/stdin"; // Common path for stdin on Unix-like systems.
        const inputBufferContent = fileSystem.readFileSync(standardInputFile); // Read the file as a buffer.
        const decodedInputString = inputBufferContent.toString("utf8"); // Convert buffer to a UTF-8 string.

        // Pass the processed input string to the main logic function.
        processInputData(decodedInputString);
    } catch (ioError) {
        // Log any errors that occur during file reading or initial processing.
        console.error("Error encountered while reading or processing input:", ioError.message);
        // Depending on requirements, more sophisticated error handling might be implemented here.
    }
})();