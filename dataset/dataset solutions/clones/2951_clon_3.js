"use strict"; // Enforce strict parsing and error handling for cleaner code

/**
 * Calculates a specific probability based on two input parameters N and K.
 * This function processes a string input, extracts numerical values,
 * and performs a series of probabilistic calculations.
 *
 * @param {string} inputPayload - The raw input string, typically from stdin.
 *                                Expected format: "N K\n..."
 */
const processNumericalData = (inputPayload) => {
    // --- Input Parsing and Validation (Type III addition: more robust parsing) ---

    // Ensure input is treated as a string and split into lines, filtering empty ones.
    const rawInputLines = String(inputPayload).split('\n').filter(line => line.trim().length > 0);

    // Basic validation: ensure at least one line is present
    if (rawInputLines.length === 0) {
        console.error("Error: No input data provided for processing.");
        return; // Exit if no meaningful input
    }

    // Split the first line into numerical parameters.
    // Using map(Number) is a concise way to convert string parts to numbers.
    const numericalParameters = rawInputLines[0].split(' ').map(Number);

    // Destructure parameters for clarity and rename for better understanding.
    const totalElementsConsidered = numericalParameters[0]; // Corresponds to original N
    const targetThresholdValue = numericalParameters[1];    // Corresponds to original K

    // --- Further Input Validation (Type III addition: guard clauses) ---
    if (isNaN(totalElementsConsidered) || isNaN(targetThresholdValue) ||
        totalElementsConsidered <= 0 || targetThresholdValue < 0) {
        console.error("Error: Invalid or non-positive numerical parameters detected. Please provide positive integers.");
        return; // Exit if parameters are invalid
    }

    // --- Core Calculation Variables (Type II renaming, Type III intermediate variables) ---
    let cumulativeProbabilitySum = 0.0; // Renamed from 'answer', initialized as float
    const baseProbabilityPerIteration = 1.0 / totalElementsConsidered; // Pre-calculated for efficiency

    // --- Helper Function (Type III addition: extract logic into a new function) ---
    /**
     * Determines the minimum exponent 'p' such that 'value * (2^p)' exceeds 'limit'.
     * This is equivalent to finding the smallest 'p' where '2^p > limit / value'.
     *
     * @param {number} initialValue - The starting value for the doubling process.
     * @param {number} upperLimit - The threshold that the doubled value must exceed.
     * @returns {number} The required exponent 'p'.
     */
    const findMinimumDoublingExponent = (initialValue, upperLimit) => {
        let currentPower = 0;
        let currentValueDoubled = initialValue;

        // Using a while loop is an alternative to the for loop and often clearer
        // for "find the first X" scenarios.
        // The loop continues as long as the current value has not yet exceeded the limit.
        while (currentValueDoubled < upperLimit) { // Note: changed from <= to < to match original logic's > K
            currentValueDoubled *= 2; // Equivalent to multiplying by 2 for each power increment
            currentPower++;
            // Safety break for extremely large loops, though not expected for typical constraints.
            // This prevents infinite loops if initialValue is 0 or if upperLimit is unreachable.
            if (currentPower > 60) { // 2^60 is already a very large number, practically infinite for this problem
                console.warn("Warning: Doubling exponent calculation exceeding typical bounds. Check input values.");
                break;
            }
        }
        return currentPower;
    };

    // --- Main Iteration Loop (Type II renaming, Type III structural change: loop style) ---
    // Iterate through each element from 1 up to totalElementsConsidered (inclusive).
    for (let currentIterationValue = 1; currentIterationValue <= totalElementsConsidered; ++currentIterationValue) {
        // --- Conditional Logic (Type II renaming, Type III slight rephrasing) ---
        // If the current value is already at or above the target threshold,
        // it contributes its base probability directly. This scenario means no doublings are needed.
        if (currentIterationValue >= targetThresholdValue) {
            cumulativeProbabilitySum += baseProbabilityPerIteration;
        } else {
            // If the current value is below the threshold, we need to find
            // how many doublings are required to exceed the threshold.

            // Use the extracted helper function to compute the necessary exponent.
            const requiredDoublingSteps = findMinimumDoublingExponent(currentIterationValue, targetThresholdValue);

            // Calculate the probability factor for this specific element.
            // This factor is (1/2) raised to the power of the required doubling steps,
            // representing the probability of achieving the threshold through doublings.
            const inversePowerFactor = (0.5) ** requiredDoublingSteps; // Using ** operator for clarity

            // Add this element's weighted probability to the total sum.
            // Each element initially has a base probability (1/N), which is then
            // multiplied by its specific inverse power factor if doublings are needed.
            cumulativeProbabilitySum += baseProbabilityPerIteration * inversePowerFactor;
        }
    }

    // --- Output Result (Type III modification: formatting for precision) ---
    // Output the final calculated probability, formatted to a specific precision.
    // Using toFixed(10) ensures consistent decimal representation for probabilities.
    console.log(cumulativeProbabilitySum.toFixed(10));
};

// --- Execution Entry Point (Type III modification: direct function call, no `main` wrapper) ---
// This pattern directly calls the processing function with the standard input.
// The original 'main' function wrapper has been removed, making 'processNumericalData'
// the primary entry point for the script's logic.
processNumericalData(require('fs').readFileSync('/dev/stdin', 'utf8'));

// End of file.