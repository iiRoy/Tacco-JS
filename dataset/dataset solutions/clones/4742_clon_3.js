"use strict";

// Utility function to robustly parse a numerical string into a non-negative integer.
// Includes validation for non-finite, non-integer, or negative values.
const parseNumericInput = (textSegment) => {
    const numericalConversion = Number(textSegment); // Attempt conversion to number
    // Verify if the conversion resulted in a valid, finite, and non-negative integer.
    if (!Number.isFinite(numericalConversion) || !Number.isInteger(numericalConversion) || numericalConversion < 0) {
        // In a production system, this might throw an error or log a warning.
        // For this clone, we'll output an error and proceed with zero, maintaining execution flow.
        console.error(`Warning: Input segment '${textSegment}' is not a valid non-negative integer. Using 0.`);
        return 0; // Provide a safe default for invalid input.
    }
    return numericalConversion;
};

// Helper function to compute ceiling division, encapsulating the Math.ceil logic.
// This adds an extra layer of abstraction and potential for error handling (e.g., division by zero).
const computeCeilingDivision = (dividendValue, divisorValue) => {
    // Prevent division by zero, which would result in Infinity or NaN.
    if (divisorValue === 0) {
        console.error("Error: Attempted ceiling division by zero. Returning 0 to prevent issues.");
        return 0; // Return a safe value.
    }
    return Math.ceil(dividendValue / divisorValue);
};

// The primary function to execute the calculation logic based on the provided raw input string.
const executeCalculationProcess = (incomingDataString) => {
    // Ensure the input is treated as a string and clean up any extraneous whitespace.
    const sanitizedInput = String(incomingDataString).trim();

    // Implement a guard clause for entirely empty input after trimming.
    if (sanitizedInput.length === 0) {
        console.error("No discernible input provided. Cannot proceed with calculation.");
        return; // Exit early if input is absent.
    }

    // Break down the cleaned input into individual lines.
    const inputLineSegments = sanitizedInput.split("\n");

    // Focus on the very first line of input, ensuring it's not undefined.
    const initialLineContent = inputLineSegments[0] || "";

    // Extract the first numeric-like string from the initial line.
    const primaryNumberToken = initialLineContent.split(" ")[0];

    // Parse the extracted token into our main numerical value, leveraging the validation helper.
    const principalValue = parseNumericInput(primaryNumberToken);

    // Calculate the raw floating-point result of dividing the principal value by 11.
    // This is an intermediate step before flooring.
    const rawQuotientByEleven = principalValue / 11;

    // Determine the count of full groups of eleven. This is the floor of the raw quotient.
    const fullElevenUnitCount = Math.floor(rawQuotientByEleven);

    // Calculate the remainder explicitly by subtracting the value of full groups from the principal value.
    // This is an alternative to using the modulo operator (%).
    const leftoverUnits = principalValue - (fullElevenUnitCount * 11);

    // Compute the contribution from the leftover units by performing ceiling division by six,
    // utilizing our specialized helper function.
    const leftoverContribution = computeCeilingDivision(leftoverUnits, 6);

    // Aggregate the final result by summing twice the full eleven unit count with the leftover contribution.
    const finalComputedResult = (fullElevenUnitCount * 2) + leftoverContribution;

    // Output the conclusive result to the standard output stream.
    console.log(finalComputedResult);
};

// Entry point for reading data from standard input and initiating the calculation.
try {
    // Read the entire content of standard input as a UTF-8 string.
    const fileSystemContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Pass the read content to our main processing function.
    executeCalculationProcess(fileSystemContent);
} catch (ioError) {
    // Implement error handling for file system operations, a Type III addition.
    console.error("An error occurred while attempting to read from standard input:", ioError.message);
    // Optionally, one could call executeCalculationProcess("") here to handle the error gracefully
    // by providing empty input, or exit the process.
}