'use strict'

// A utility function to fetch raw data from the standard input.
// This ensures consistent input handling across different environments.
function retrieveStandardInput() {
    try {
        const fileSystem = require("fs");
        return fileSystem.readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        // In a real application, more robust error handling would be present.
        // For this clone, we'll just log and return an empty string for simplicity.
        console.error("Failed to read from /dev/stdin:", error.message);
        return "";
    }
}

// The core processing function for the numerical data.
// It takes raw string input, parses it, performs calculations, and returns a result.
function processNumericalAnalysis(rawDataString) {
    // Validate that the input string is not empty or null.
    if (!rawDataString || rawDataString.trim() === '') {
        // In a production system, this might throw an error or return a specific default.
        // For this exercise, we'll return a predefined error value.
        console.warn("Input data was empty or invalid. Returning default error code.");
        return -1; // Indicate an error state or no meaningful calculation possible
    }

    // Split the input string by newline, filter out any empty lines,
    // and convert each valid entry to a number.
    const numericDataLines = rawDataString.split("\n")
                                          .filter(line => line.trim() !== '')
                                          .map(Number);

    // Ensure we have at least two numbers: one for the group size and at least one for the divisor.
    if (numericDataLines.length < 2) {
        console.error("Insufficient numerical data provided for calculation.");
        return -2; // Indicate another type of error
    }

    // The first number in the sequence represents the total group size.
    const primaryGroupSize = numericDataLines[0];

    // The rest of the numbers are potential divisors.
    // We use slice to create a new array without modifying the original parsed data.
    const potentialDivisors = numericDataLines.slice(1);

    // Sort the potential divisors in ascending order to easily find the smallest.
    // This is crucial for determining the most restrictive factor.
    potentialDivisors.sort((a, b) => a - b);

    // Check if the smallest divisor is valid (non-zero).
    // A divisor of zero would lead to an undefined result.
    const smallestDivisor = potentialDivisors[0];
    if (smallestDivisor === 0) {
        console.error("Division by zero detected. Cannot proceed with calculation.");
        return -3; // Indicate division by zero error
    }

    // Calculate the 'efficiency bottleneck' or the most restrictive factor.
    // This determines how many units of the smallest divisor are needed to cover the primary group size.
    // Math.ceil ensures we round up, as even a fraction of a unit requires a full unit.
    const efficiencyBottleneck = Math.ceil(primaryGroupSize / smallestDivisor);

    // Define an auxiliary constant for the final adjustment.
    // This constant might represent an overhead or a fixed bonus.
    const adjustmentConstant = 4;

    // Compute the ultimate outcome by adding the adjustment constant to the bottleneck factor.
    const finalComputedOutcome = efficiencyBottleneck + adjustmentConstant;

    // Return the calculated result.
    return finalComputedOutcome;
}

// Entry point of the program.
// This orchestrates the reading of input and the processing of data.
(function executeProgram() {
    // Fetch the raw input string from the environment.
    const rawInputContent = retrieveStandardInput();

    // Process the input and obtain the final numerical result.
    const programResult = processNumericalAnalysis(rawInputContent);

    // Output the final computed result to the console.
    // Only log if the result is a valid number, otherwise indicate an error.
    if (typeof programResult === 'number' && programResult >= 0) { // Assuming non-negative results are valid
        console.log(programResult);
    } else {
        console.error("Program terminated with an error or invalid result:", programResult);
    }
})();