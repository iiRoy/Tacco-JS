// Core function to analyze input data and determine the optimal value based on two distinct calculation pathways.
function processInputData(rawInputString) {
    // Remove any leading/trailing whitespace and then split the string into individual numeric tokens.
    // This assumes the input consists of space-separated numerical values.
    const numericTokens = rawInputString.trim().split(" ");

    // Initial validation: Ensure we have the minimum required number of input components.
    // For our two calculation scenarios, we expect at least five numerical parameters.
    if (numericTokens.length < 5) {
        console.error("Execution Error: Insufficient input parameters detected. Expected at least five numeric values.");
        // Early exit if input is malformed, preventing further errors.
        return;
    }

    // Explicitly convert string tokens to numeric types for accurate arithmetic operations.
    // Using the Number() constructor ensures proper conversion, including handling of decimals if present.
    const commonDividend = Number(numericTokens[0]);    // The base quantity to be divided
    const divisorOne = Number(numericTokens[1]);       // Divisor for the first calculation path
    const multiplierOne = Number(numericTokens[2]);    // Multiplier for the first calculation path
    const divisorTwo = Number(numericTokens[3]);       // Divisor for the second calculation path
    const multiplierTwo = Number(numericTokens[4]);    // Multiplier for the second calculation path

    // Comprehensive validation for converted numbers: Check if any conversion resulted in NaN (Not-a-Number).
    if (isNaN(commonDividend) || isNaN(divisorOne) || isNaN(multiplierOne) ||
        isNaN(divisorTwo) || isNaN(multiplierTwo)) {
        console.error("Execution Error: One or more input values could not be parsed as valid numbers.");
        return;
    }

    // Critical validation: Prevent division by zero, which would lead to infinite or NaN results.
    if (divisorOne === 0 || divisorTwo === 0) {
        console.error("Execution Error: Division by zero encountered. Divisor values must be non-zero.");
        return;
    }

    // --- Calculate the outcome for the first scenario ---
    // Step 1: Perform the division for the first pathway.
    const provisionalResultA = commonDividend / divisorOne;
    // Step 2: Round up the division result to the next whole number using Math.ceil().
    const roundedUpUnitsA = Math.ceil(provisionalResultA);
    // Step 3: Compute the final cost or value for the first scenario.
    const computedValueScenarioA = roundedUpUnitsA * multiplierOne;

    // --- Calculate the outcome for the second scenario ---
    // Step 1: Perform the division for the second pathway.
    const provisionalResultB = commonDividend / divisorTwo;
    // Step 2: Round up the division result to the next whole number.
    const roundedUpUnitsB = Math.ceil(provisionalResultB);
    // Step 3: Compute the final cost or value for the second scenario.
    const computedValueScenarioB = roundedUpUnitsB * multiplierTwo;

    // Determine the absolute minimum value between the two calculated scenarios.
    // This identifies the most favorable outcome or lowest cost.
    const minimumFinalValue = Math.min(computedValueScenarioA, computedValueScenarioB);

    // Output the determined minimum value to the standard output stream.
    console.log(minimumFinalValue);
}

// Entry point for script execution in a Node.js environment.
// Reads the entire content from standard input, typically piped from a file or another process.
// The 'utf8' encoding ensures correct interpretation of text data.
const stdinContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the primary data processing function with the content obtained from standard input.
processInputData(stdinContent);