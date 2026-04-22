/**
 * This module addresses a specific optimization challenge where two sequences of numerical data
 * are processed to determine a minimum count of required operations to balance a cumulative deficit.
 * It's structured to handle input from a standard input stream and output the computed result.
 */

/**
 * Executes the primary logic for the problem, parsing input and performing calculations.
 * @param {string} rawInputString - The full input data provided as a single string.
 */
function evaluateScenario(rawInputString) {
    // Stage 1: Initial parsing and validation of the input data.
    // Splitting the raw input into individual lines for structured processing.
    const inputLines = rawInputString.trim().split('\n');

    // Basic validation to ensure sufficient lines are present in the input.
    if (inputLines.length < 3) {
        console.log("-1"); // Indicates an invalid or incomplete input payload.
        return;
    }

    // Parsing the total number of entities from the first line.
    const totalEntities = parseInt(inputLines[0], 10);
    // Additional validation for the parsed entity count.
    if (isNaN(totalEntities) || totalEntities < 1) {
        console.log("-1"); // Invalid entity count.
        return;
    }

    // Converting the string representations of numerical sequences into actual number arrays.
    // Using `map(Number)` for concise and efficient conversion.
    const primaryValues = inputLines[1].split(' ').map(Number);
    const secondaryValues = inputLines[2].split(' ').map(Number);

    // Essential validation: ensuring the lengths of the data sequences match the declared entity count.
    if (primaryValues.length !== totalEntities || secondaryValues.length !== totalEntities) {
        console.log("-1"); // Data length mismatch indicates corrupted or malformed input.
        return;
    }

    // Stage 2: First pass through the data to categorize differences and sum up initial deficits.
    const surplusContributions = []; // Stores positive differences that can offset deficits.
    let accumulatedDeficit = 0;     // Accumulates negative differences, representing a balance to be covered.
    let initialOperationCount = 0;  // Counts items that directly contribute to the deficit or are neutral.

    // Iterating through each entity pair to calculate differences.
    for (let currentIdx = 0; currentIdx < totalEntities; ++currentIdx) {
        const valueDifference = primaryValues[currentIdx] - secondaryValues[currentIdx];

        // If the difference is positive, it's a surplus that can be used later.
        if (valueDifference > 0) {
            surplusContributions.push(valueDifference);
        } else {
            // If the difference is non-positive (zero or negative), it contributes to the deficit.
            // These items also count towards the initial operations.
            accumulatedDeficit += valueDifference;
            initialOperationCount++;
        }
    }

    // Stage 3: Early exit condition if no deficit needs to be covered.
    // If 'accumulatedDeficit' is zero or positive, it means all items either contributed
    // a surplus or balanced out, requiring no further "coverage" operations.
    if (accumulatedDeficit >= 0) {
        console.log(initialOperationCount); // Only the initial operations are relevant.
        return; // Terminate execution as the problem is resolved.
    }

    // The total positive amount needed from surpluses to cover the negative balance.
    const requiredCoverageAmount = -accumulatedDeficit;

    // Sorting the surplus contributions in descending order. This strategy ensures
    // that the largest surpluses are used first, minimizing the number of additional operations.
    surplusContributions.sort((valA, valB) => valB - valA);

    // Stage 4: Iterating through sorted surpluses to cover the deficit.
    let currentCoverageTotal = 0;       // Tracks the sum of surpluses used so far.
    let additionalOperationsNeeded = 0; // Counts how many surpluses were consumed.
    let coverageAchieved = false;       // Flag to indicate if the deficit was successfully covered.

    // Loop through each available surplus contribution.
    for (let j = 0; j < surplusContributions.length; ++j) {
        currentCoverageTotal += surplusContributions[j];
        additionalOperationsNeeded++;

        // If the accumulated surplus meets or exceeds the required deficit, we've found a solution.
        if (currentCoverageTotal >= requiredCoverageAmount) {
            coverageAchieved = true;
            break; // No need to process further surpluses.
        }
    }

    // Stage 5: Final determination and output of the result.
    let finalResult;
    if (coverageAchieved) {
        // If coverage was successful, the total operations are initial + additional.
        finalResult = initialOperationCount + additionalOperationsNeeded;
    } else {
        // If the deficit could not be fully covered by available surpluses.
        finalResult = -1;
    }

    // Display the final computed outcome to the standard output stream.
    console.log(finalResult);
}

// Entry point for the application, designed for a Node.js environment.
// This immediately-invoked function expression (IIFE) handles reading input
// from `/dev/stdin` and passing it to the main processing function.
(function initializeApplication() {
    try {
        // Attempt to read the entire standard input as a UTF-8 string.
        const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
        evaluateScenario(systemInput); // Execute the core logic with the obtained input.
    } catch (error) {
        // Provides basic error handling for issues like file reading failures.
        console.error("An error occurred during application initialization or input processing:", error.message);
        console.log("-1"); // Output -1 to indicate an unrecoverable error.
    }
})();