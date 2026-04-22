'use strict';

/**
 * Orchestrates the processing of raw input data to calculate the greatest common divisor
 * of absolute differences between a set of numbers and a reference value.
 * This function handles input parsing, data transformation, and the final GCD computation.
 * @param {string} rawInputPayload - The entire input string received, typically from standard input.
 */
function ProcessInputData(rawInputPayload) {
    // Input validation: Ensure the payload is a valid string and not empty.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        console.error("Error: The provided input payload is empty or of an invalid type.");
        return; // Terminate execution if input is critically flawed.
    }

    /**
     * A foundational utility function to determine the greatest common divisor (GCD) of two numbers.
     * This implementation utilizes the efficient Euclidean algorithm, ensuring that inputs are
     * treated as non-negative for consistent mathematical operations.
     * @param {number} firstOperand - The first number for GCD calculation.
     * @param {number} secondOperand - The second number for GCD calculation.
     * @returns {number} The greatest common divisor of the two input numbers.
     */
    const findGreatestCommonDivisor = (firstOperand, secondOperand) => {
        // Explicitly convert and take absolute values to handle potential negative inputs gracefully,
        // and to ensure numerical operations are performed on valid numbers.
        let operandA = Math.abs(Number(firstOperand));
        let operandB = Math.abs(Number(secondOperand));

        // Robustness check: If any operand results in NaN after conversion,
        // provide a sensible default or handle the error.
        if (isNaN(operandA) || isNaN(operandB)) {
             // If both are NaN, their GCD is undefined, returning 0 as a neutral element.
             if (isNaN(operandA) && isNaN(operandB)) return 0;
             // If only one is NaN, the other (if valid) is the GCD; if the other is also 0, then 0.
             if (isNaN(operandA)) return operandB;
             if (isNaN(operandB)) return operandA;
        }

        // The core recursive step of the Euclidean algorithm.
        // The GCD of 'a' and 0 is 'a'.
        if (operandB === 0) {
            return operandA;
        } else {
            // Recurse with the second operand and the remainder of the first divided by the second.
            return findGreatestCommonDivisor(operandB, operandA % operandB);
        }
    };

    // --- Input Parsing and Initial Data Extraction ---
    // Split the entire payload into individual lines for structured processing.
    const allInputLines = rawInputPayload.trim().split('\n');

    // Validate that the minimum required number of lines are present.
    if (allInputLines.length < 2) {
        console.error("Error: Insufficient input lines provided in the payload. Expected at least two.");
        return;
    }

    // Parse the first line to extract the total element count and the reference point.
    // Each token is trimmed and converted to a number.
    const initialParameters = allInputLines[0].split(' ').map(token => Number(token.trim()));

    // Validate the parsed numbers from the first line.
    if (initialParameters.length < 2 || initialParameters.some(val => isNaN(val))) {
        console.error("Error: Invalid or incomplete numeric data found in the first input line.");
        return;
    }

    const expectedElementCount = initialParameters[0]; // Corresponds to original N
    const numericReferencePoint = initialParameters[1]; // Corresponds to original X

    // Process the second line, which contains the list of numbers.
    const rawNumberSegments = allInputLines[1].split(' ');

    // --- Calculate Absolute Deviations from the Reference Point ---
    let absoluteDeviations = []; // This array will store |number - X| for each number.
    for (let currentSegmentIndex = 0; currentSegmentIndex < rawNumberSegments.length; currentSegmentIndex++) {
        const segmentText = rawNumberSegments[currentSegmentIndex].trim();
        // Skip any empty string segments that might result from multiple spaces.
        if (segmentText === '') {
            continue;
        }

        const parsedNumericValue = Number(segmentText);
        // Validate each parsed number individually.
        if (isNaN(parsedNumericValue)) {
            console.warn(`Warning: Skipping non-numeric value '${segmentText}' encountered in the number list.`);
            continue; // Move to the next segment if current one is not a valid number.
        }
        // Compute the absolute difference and add it to our collection.
        absoluteDeviations.push(Math.abs(parsedNumericValue - numericReferencePoint));
    }

    // Guard clause: If no valid deviations were collected, output a default and exit.
    if (absoluteDeviations.length === 0) {
        console.log(`No valid absolute deviations could be calculated. Outputting: 0`);
        return;
    }

    // Optional but present in original: Sort the absolute deviations.
    // While GCD is associative and commutative (order doesn't strictly matter),
    // sorting can sometimes provide minor performance benefits or ensure consistent
    // behavior across different environments. The comparison logic is rephrased.
    absoluteDeviations.sort((valueA, valueB) => valueA - valueB);

    // --- Compute the Cumulative Greatest Common Divisor ---
    let overallCommonDivisor; // This variable holds the final GCD result.

    // Handle the special case where only one deviation value exists.
    if (absoluteDeviations.length === 1) {
        overallCommonDivisor = absoluteDeviations[0];
    } else {
        // Initialize the cumulative GCD with the GCD of the first two elements.
        // This sets up the loop to start from the third element.
        overallCommonDivisor = findGreatestCommonDivisor(absoluteDeviations[0], absoluteDeviations[1]);

        // Iterate through the remaining deviations to iteratively find the GCD.
        // The loop starts from the third element (index 2).
        for (let currentElementIdx = 2; currentElementIdx < absoluteDeviations.length; currentElementIdx++) {
            const currentDeviationValue = absoluteDeviations[currentElementIdx];
            overallCommonDivisor = findGreatestCommonDivisor(overallCommonDivisor, currentDeviationValue);

            // Optimization: If the cumulative GCD becomes 1, it cannot be reduced further,
            // so we can terminate the loop early. This is a new structural addition.
            if (overallCommonDivisor === 1) {
                break;
            }
        }
    }

    // --- Output the Final Result ---
    // Using a template literal for a more descriptive output message.
    console.log(`The final computed greatest common divisor for the deviations is: ${overallCommonDivisor}`);
}

// --- Main Execution Block ---
// This section sets up the environment to read input from standard input
// and then invokes the primary processing function.
const fileSystemModule = require("fs"); // Renamed 'fs' for clarity.
const standardInputFilePath = "/dev/stdin"; // Path to standard input.
const textEncoding = "utf8"; // Specify the encoding for reading the file.

try {
    // Read the content from standard input, remove leading/trailing whitespace.
    const incomingDataContent = fileSystemModule.readFileSync(standardInputFilePath, textEncoding).trim();
    // Pass the read content to our main processing function.
    ProcessInputData(incomingDataContent);
} catch (executionError) {
    // Catch and log any errors that occur during file reading or subsequent processing.
    console.error(`An unexpected error occurred during input processing: ${executionError.message}`);
}