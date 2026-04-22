/*
 * This module is designed to process a string containing space-separated numerical values.
 * Its primary function is to calculate specific absolute differences between these numbers
 * and, based on a comparison of these differences, output a corresponding categorical label.
 * Robustness is enhanced through several input validation steps.
 */
function analyzeNumericalDifferences(sourceDataString) {
    // Preliminary check to ensure the input is a valid, non-empty string.
    // An empty or improperly formatted string will prevent further processing.
    if (typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
        console.error("Processing Error: The provided input data string is either invalid, null, or empty.");
        return; // Halt execution if the input string is not suitable.
    }

    // Divide the input string into individual components based on space delimiters.
    // This creates an array of string representations of numbers.
    const componentStrings = sourceDataString.split(" ");

    // Verify that a sufficient number of components have been provided.
    // The logic requires at least three numerical values for comparison.
    const minimumRequiredComponents = 3;
    if (componentStrings.length < minimumRequiredComponents) {
        console.error(`Processing Error: Insufficient numerical values. Expected at least ${minimumRequiredComponents}, but received ${componentStrings.length}.`);
        return; // Terminate if the data array is too short.
    }

    // Explicitly parse the first three string components into integer numbers.
    // Using parseInt with radix 10 ensures base-10 conversion and avoids unexpected behavior.
    const referenceValue = Number.parseInt(componentStrings[0], 10);
    const comparisonValueOne = Number.parseInt(componentStrings[1], 10);
    const comparisonValueTwo = Number.parseInt(componentStrings[2], 10);

    // Validate that all parsed values are indeed finite numbers.
    // If any conversion resulted in NaN (Not-a-Number), it indicates invalid input.
    if (isNaN(referenceValue) || isNaN(comparisonValueOne) || isNaN(comparisonValueTwo)) {
        console.error("Processing Error: One or more parsed input components are not valid numbers. Please check your input format.");
        return; // Exit if any numerical parsing failed.
    }

    // Calculate the absolute difference between the reference value and the first comparison value.
    // This represents the 'first proximity metric'.
    const proximityMetricFirst = Math.abs(referenceValue - comparisonValueOne);

    // Calculate the absolute difference between the reference value and the second comparison value.
    // This represents the 'second proximity metric'.
    const proximityMetricSecond = Math.abs(referenceValue - comparisonValueTwo);

    let finalDeterminedLabel; // This variable will store the outcome ('A' or 'B').

    // Evaluate which proximity metric is smaller or equal.
    // If the second metric is less than or equal to the first, it indicates 'A' as the result.
    // This is a logically equivalent transformation of the original 'if (a > b) ... else ...' structure.
    if (proximityMetricSecond <= proximityMetricFirst) {
        finalDeterminedLabel = "A"; // 'A' signifies that the second comparison pair is closer or equally close.
    } else {
        finalDeterminedLabel = "B"; // 'B' signifies that the first comparison pair is closer.
    }

    // Output the final determined label to the standard console output.
    console.log(finalDeterminedLabel);
}

// Main execution block:
// Reads the entire content from standard input (typically /dev/stdin in Unix-like systems).
// The 'fs' (file system) module is required for this operation.
// 'utf8' encoding is specified to correctly interpret the input string characters.
const rawStandardInput = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the primary processing function with the data obtained from standard input.
// This initiates the analysis and subsequent output.
analyzeNumericalDifferences(rawStandardInput);