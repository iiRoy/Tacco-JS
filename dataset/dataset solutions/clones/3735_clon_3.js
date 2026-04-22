'use strict'; // Ensures strict mode for better code quality and error handling

/**
 * Utility function to safely parse a string into an integer.
 * Handles potential whitespace around the number.
 * @param {string} stringValue - The string to parse.
 * @returns {number} The parsed integer, or NaN if parsing fails.
 */
const convertToNumber = (stringValue) => {
    // Type III: Adding a helper function for common operations like parsing.
    // This abstracts the parsing logic and can be extended with more robust validation if needed.
    return parseInt(stringValue.trim(), 10);
};

/**
 * Processes input data to calculate a specific derived value based on two initial parameters.
 * This function simulates a common competitive programming problem structure.
 * @param {string} rawInputContent - The entire raw input string, typically from stdin.
 */
function calculateDerivedMetric(rawInputContent) {
    // Type II: Renamed function from 'Main' to 'calculateDerivedMetric'
    // Type II: Renamed parameter from 'input' to 'rawInputContent'
    // Type II: Rewritten comments to be more descriptive.

    // Splits the incoming raw data into individual lines for further processing.
    const inputLines = rawInputContent.split('\n');

    // Extracts the first line, which is expected to contain the primary parameters,
    // and splits it by space to get individual string tokens.
    const firstParameterLine = inputLines[0].split(' ');

    // Type II: Renamed 'N' to 'totalEntitiesCount' for better clarity.
    // Type III: Utilizing the 'convertToNumber' helper function for parsing.
    const totalEntitiesCount = convertToNumber(firstParameterLine[0]);

    // Type II: Renamed 'K' to 'groupingCapacity' for better clarity.
    // Type III: Utilizing the 'convertToNumber' helper function for parsing.
    const groupingCapacity = convertToNumber(firstParameterLine[1]);

    // --- Type III: Extensive Deletion and Addition ---
    // The original code included several unused variables and a loop that did not
    // contribute to the final output calculation. Specifically, these were:
    //   - `let A = input[1].split(' ')` (An array 'A' parsed from the second line)
    //   - `let ret = 0` (An unused result accumulator)
    //   - `let minPos = -1` (An unused minimum position tracker)
    //   - `for (let i = 0; i < N; i += 1) { ... }` (An unused loop to find min in 'A')
    // All of the above dead code has been completely removed as part of Type III modifications.

    // Type III: Added a guard clause for input validation.
    // The mathematical formula used in this problem inherently assumes that
    // 'groupingCapacity' (K) is greater than 1. If K <= 1, the denominator (K-1)
    // would be zero or negative, leading to an invalid or undefined result.
    if (groupingCapacity <= 1) {
        console.error("Input Error: Grouping capacity must be a positive integer greater than 1.");
        // Type III: Implementing an early exit strategy for invalid input scenarios.
        return;
    }

    // Type III: Breaking down the core calculation into intermediate, more descriptive steps.
    // The original calculation was: Math.floor((N - 1 + K - 2) / (K - 1))

    // Calculate the first component of the adjusted numerator.
    const effectiveNumeratorPart1 = totalEntitiesCount - 1; // Corresponds to (N - 1) from original

    // Calculate the second component of the adjusted numerator.
    const effectiveNumeratorPart2 = groupingCapacity - 2;   // Corresponds to (K - 2) from original

    // Combine both parts to form the complete numerator for the division.
    const combinedNumerator = effectiveNumeratorPart1 + effectiveNumeratorPart2; // Resulting in (N - 1 + K - 2)

    // Calculate the divisor (denominator) for the operation.
    const divisorValue = groupingCapacity - 1; // Corresponds to (K - 1) from original

    // Perform the division using the derived numerator and denominator.
    const intermediateDivisionResult = combinedNumerator / divisorValue;

    // Type III: Store the final result after applying the floor operation in a dedicated variable.
    const finalCalculatedResult = Math.floor(intermediateDivisionResult);

    // Type II: Output the final calculated value to the console.
    console.log(finalCalculatedResult);
}

// Type II: Reformat the way input is read and the main function is called.
// This block reads the standard input file, a common practice in competitive programming.
try {
    // Dynamically require the 'fs' (file system) module.
    const fileSystemModule = require("fs");
    // Define the standard input path, typically /dev/stdin on Linux/macOS.
    const standardInputPath = "/dev/stdin";
    // Specify the encoding format for reading the file content.
    const encodingFormat = "utf8";

    // Reads the entire content of the specified standard input file synchronously.
    const stdInputData = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

    // Invokes the primary processing function with the obtained standard input data.
    calculateDerivedMetric(stdInputData);
} catch (error) {
    // Type III: Added basic error handling for potential issues during file reading,
    // providing a more robust execution environment.
    console.error("An error occurred while attempting to read standard input:", error.message);
}