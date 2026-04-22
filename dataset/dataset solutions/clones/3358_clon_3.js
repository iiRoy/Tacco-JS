"use strict";

// This module contains a utility function for parsing numeric data from strings.
/**
 * @namespace InputParsingUtilities
 * @description Provides helper functions for processing raw input data.
 */
const InputParsingUtilities = {
    /**
     * Converts a space-separated string of numbers into an array of integers.
     * Includes basic validation and error handling for robust input processing.
     * @param {string} rawTextString - The input string, e.g., "100 50 25".
     * @returns {Array<number>} An array of parsed integer values. Returns an empty array or defaults on error.
     */
    extractNumericValues: (rawTextString) => {
        if (typeof rawTextString !== 'string' || rawTextString.trim().length === 0) {
            console.error("InputParsingUtilities: Received invalid or empty string for parsing.");
            return [];
        }

        const stringComponents = rawTextString.trim().split(/\s+/); // Split by one or more spaces
        const numericArray = [];

        // Iterate through components and attempt to parse each as an integer.
        for (let i = 0; i < stringComponents.length; i++) {
            const currentComponent = stringComponents[i];
            const parsedNumber = parseInt(currentComponent, 10);

            // Validate if the parsed result is a finite number.
            if (!isNaN(parsedNumber) && isFinite(parsedNumber)) {
                numericArray.push(parsedNumber);
            } else {
                console.warn(`InputParsingUtilities: Skipping non-numeric component "${currentComponent}".`);
            }
        }

        // For this specific problem, we expect exactly three numbers.
        // This is an additional check for input integrity.
        if (numericArray.length < 3) {
            console.error(`InputParsingUtilities: Expected at least 3 numeric values, but found ${numericArray.length}. Defaulting missing values to 0.`);
            // Pad with zeros if fewer than 3 values are found, to prevent errors in subsequent logic.
            while (numericArray.length < 3) {
                numericArray.push(0);
            }
        }

        return numericArray;
    }
};

// This function encapsulates the core problem-solving logic.
/**
 * @function calculateProblemResult
 * @description Solves a specific problem involving three resource quantities (X, Y, Z)
 *              by applying a series of pairing and accumulation rules.
 * @param {number} quantityX - The initial count of resource X.
 * @param {number} quantityY - The initial count of resource Y.
 * @param {number} quantityZ - The initial count of resource Z.
 * @returns {number} The final calculated score or outcome.
 */
const calculateProblemResult = (quantityX, quantityY, quantityZ) => {
    let finalScore = 0; // The cumulative result starts at zero.

    // Use working copies of quantities to avoid modifying the original inputs
    // and to track remaining resources throughout the calculation phases.
    let remainingY = quantityY;
    let remainingZ = quantityZ;
    let availableX = quantityX; // X is used in a later phase.

    // Phase 1: Prioritize interactions between Y and Z.
    // This phase models a scenario where Y and Z are combined or utilized together.
    if (remainingY >= remainingZ) {
        // Case A: Resource Y is abundant or equal to Z.
        // All of Z is utilized, and Y is also fully consumed, contributing their sum to the score.
        finalScore += remainingZ + remainingY;
        remainingZ = 0; // Z is fully consumed.
        // remainingY is conceptually consumed as its value was added to finalScore;
        // no need to explicitly set to 0 as it's not used further.
    } else {
        // Case B: Resource Z is more abundant than Y.
        // All of Y is utilized, pairing with an equal amount of Z.
        // Each such pair contributes 1, so Y pairs contribute 2*Y to the score.
        finalScore += remainingY * 2;
        remainingZ -= remainingY; // Z is reduced by the amount paired with Y.
        remainingY = 0; // Y is fully consumed.
    }

    // Phase 2: Process any remaining Z with available X.
    // If there's still Z left, it can be paired with X.
    if (remainingZ > 0) {
        // Determine the maximum number of Z units that can be paired with X.
        // This is limited by the lesser of the two remaining quantities.
        const unitsPairedWithX = Math.min(remainingZ, availableX);
        remainingZ -= unitsPairedWithX; // Reduce Z by the number of units paired.
        finalScore += unitsPairedWithX; // Each pair contributes 1 to the score.
        // availableX is also reduced by unitsPairedWithX, but its value is not needed further.
    }

    // Phase 3: Account for any solitary remaining Z.
    // After all pairing opportunities, if a single unit of Z still remains, it adds 1 to the score.
    // This handles the edge case where Z might be left over without a suitable partner.
    if (remainingZ > 0) {
        finalScore += 1;
    }

    return finalScore; // Return the final computed score.
};

// The primary execution function for the program.
/**
 * @function executeMainProcess
 * @description Orchestrates the program's flow: reading input, parsing,
 *              performing calculations, and displaying the final outcome.
 * @param {string} programInputString - The raw string input, typically from standard input.
 */
const executeMainProcess = (programInputString) => {
    // Utilize the input parsing utility to extract numeric values.
    const parsedNumbers = InputParsingUtilities.extractNumericValues(programInputString);

    // Destructure the expected three values. Use default values (0) if parsing failed
    // or if fewer than three numbers were provided, as handled by the utility.
    const resourceA = parsedNumbers[0];
    const resourceB = parsedNumbers[1];
    const resourceC = parsedNumbers[2];

    // Invoke the core calculation logic with the prepared resource quantities.
    const finalCalculatedValue = calculateProblemResult(resourceA, resourceB, resourceC);

    // Output the final result to the standard output.
    console.log(finalCalculatedValue);
};

// Entry point for execution in a Node.js environment, common in competitive programming setups.
// Reads the entire content of standard input (stdin) as a UTF-8 string
// and passes it to the main processing function.
executeMainProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));