// This module defines a function to perform a specific numerical calculation based on provided input.

/**
 * Calculates a product based on two numeric inputs, N and K, where the result is K * (K-1)^(N-1).
 * It expects a string containing two space-separated integers.
 *
 * @param {string} rawInputString - The input string, typically from standard input, e.g., "5 3".
 */
function ComputeSequenceProduct(rawInputString) {
    // Step 1: Prepare the input string for parsing.
    // Remove leading/trailing whitespace and split the string by spaces to get individual components.
    let components = rawInputString.trim().split(" ");

    // Step 2: Input validation for the number of components.
    // Ensure that exactly two numeric values are provided.
    if (components.length < 2) {
        console.error("Operation Error: Insufficient parameters. Expected two numbers, received fewer.");
        return; // Terminate execution if input is malformed.
    }

    // Step 3: Parse the string components into numerical values.
    // The first component is the iteration count (N).
    const iterationCount = Number(components[0]);
    // The second component is the initial multiplier (K).
    const initialMultiplier = Number(components[1]);

    // Step 4: Validate the parsed numeric values.
    // Check if both parsed values are valid numbers.
    if (isNaN(iterationCount) || isNaN(initialMultiplier)) {
        console.error("Operation Error: Invalid numeric input. Please provide valid integers.");
        return;
    }

    // Step 5: Apply problem-specific constraints (assuming N, K are positive integers).
    if (iterationCount < 1 || initialMultiplier < 1) {
        console.error("Operation Error: Input values must be positive integers (N >= 1, K >= 1).");
        return;
    }

    // Step 6: Initialize the result accumulator.
    // The calculation starts with the initial multiplier (K).
    let accumulatedResult = initialMultiplier;

    // Step 7: Pre-calculate the repeating factor (K - 1).
    // This factor will be applied (N - 1) times.
    const repeatingFactor = initialMultiplier - 1;

    // Step 8: Handle the edge case where N (iterationCount) is 1.
    // If N is 1, the loop below would not execute, and the result is simply K.
    // This explicit check ensures clarity and avoids unnecessary loop setup for this case.
    if (iterationCount === 1) {
        console.log(accumulatedResult);
        return;
    }

    // Step 9: Perform the iterative multiplication.
    // The loop runs (N - 1) times, multiplying the accumulated result by (K - 1) in each step.
    let currentIteration = 0;
    while (currentIteration < iterationCount - 1) {
        // Update the accumulated result by multiplying it with the repeating factor.
        accumulatedResult = accumulatedResult * repeatingFactor;
        // Move to the next iteration.
        currentIteration++;
    }

    // Step 10: Output the final calculated product.
    console.log(accumulatedResult);
}

// Entry point of the script:
// Read input from the standard input stream and pass it to the calculation function.
try {
    const fileSystemModule = require("fs");
    const stdInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    ComputeSequenceProduct(stdInputContent);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or function execution.
    console.error("Runtime Error: An issue occurred during script execution.", executionError.message);
}