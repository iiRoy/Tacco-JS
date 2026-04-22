/*
 * This module provides a robust utility function designed to analyze
 * a string containing three space-separated numerical values.
 * It then categorizes the relationship between these numbers based on their equality.
 *
 * The categorization follows these rules:
 * - Category 1: All three input numbers are strictly identical.
 * - Category 2: Exactly two of the input numbers are strictly identical.
 * - Category 3: None of the input numbers are strictly identical (all are distinct).
 *
 * The module also includes enhanced input parsing, validation, and error handling
 * for command-line execution, making it more resilient to malformed inputs.
 */

/**
 * Processes a raw input string containing numerical data, performs validation,
 * and outputs an equality category.
 *
 * @param {string} rawDataString - The raw string input, expected to contain
 *                                 three space-separated numbers (e.g., "10 20 10").
 * @returns {number} The equality category (1, 2, or 3) or -1 if an error occurred
 *                   during parsing or validation.
 */
const analyzeNumericalRelationships = (rawDataString) => {
    // Step 1: Normalize and tokenize the input string.
    // Trim leading/trailing whitespace and split by one or more whitespace characters.
    const potentialTokens = rawDataString.trim().split(/\s+/);

    // Step 2: Input Validation - Check for the correct number of tokens.
    if (potentialTokens.length !== 3) {
        console.error("Processing Error: Expected exactly three numerical values in the input string. Found:", potentialTokens.length, "tokens.");
        // Return an error indicator or throw an exception.
        return -1;
    }

    // Step 3: Convert string tokens to actual numerical components.
    // Use parseInt with radix 10 for explicit base conversion.
    // Filter out any results that are not valid numbers (NaN) after parsing.
    const numericalComponents = potentialTokens
        .map(strValue => parseInt(strValue, 10))
        .filter(parsedNum => !isNaN(parsedNum));

    // Step 4: Input Validation - Ensure all tokens were successfully converted to numbers.
    if (numericalComponents.length !== 3) {
        console.error("Processing Error: Failed to parse three valid numbers from the input.");
        console.error("Original tokens:", potentialTokens);
        console.error("Successfully parsed components:", numericalComponents);
        return -1;
    }

    // Step 5: Destructure the numerical array for clearer, more descriptive variable names.
    const [valueA, valueB, valueC] = numericalComponents;

    /**
     * Internal helper function to categorize the equality pattern of three given numbers.
     * This function encapsulates the core logic.
     *
     * @param {number} num1 - The first number.
     * @param {number} num2 - The second number.
     * @param {number} num3 - The third number.
     * @returns {number} The equality category (1, 2, or 3).
     */
    const categorizeNumericEquality = (num1, num2, num3) => {
        // Pre-compute boolean flags for pairwise equality checks.
        // This improves readability and separates concerns.
        const areFirstAndSecondEqual = (num1 === num2);
        const areFirstAndThirdEqual = (num1 === num3);
        const areSecondAndThirdEqual = (num2 === num3);

        // Determine the count of unique equal pairs.
        // - If all three are equal (e.g., 5, 5, 5), then A=B, A=C, B=C are all true, resulting in 3.
        // - If only two are equal (e.g., 5, 5, 7), then only A=B is true, resulting in 1.
        // - If none are equal (e.g., 1, 2, 3), then none are true, resulting in 0.
        let distinctEqualPairCount = 0;
        if (areFirstAndSecondEqual) {
            distinctEqualPairCount++;
        }
        if (areFirstAndThirdEqual) {
            distinctEqualPairCount++;
        }
        if (areSecondAndThirdEqual) {
            distinctEqualPairCount++;
        }

        // Use a switch statement for decision making,
        // offering an alternative control flow to nested if-else structures.
        switch (distinctEqualPairCount) {
            case 3:
                // Implies num1 = num2 = num3.
                return 1; // All three numbers are equal.
            case 1:
                // Implies exactly one pair is equal (e.g., A=B, but A!=C and B!=C).
                return 2; // Exactly two numbers are equal.
            case 0:
                // Implies no pairs are equal.
                return 3; // All three numbers are distinct.
            default:
                // This case should theoretically not be reached with valid logic,
                // but acts as a safeguard.
                console.warn("Algorithm Warning: An unexpected equality count was derived. Defaulting to 'all distinct'.");
                return 3;
        }
    };

    // Step 6: Execute the core logic using the parsed numerical values.
    const finalCategory = categorizeNumericEquality(valueA, valueB, valueC);

    // Step 7: Output the result in a more descriptive format.
    console.log(`Analysis of numbers [${valueA}, ${valueB}, ${valueC}]:`);
    console.log(`  -> Equality Category: ${finalCategory}`);

    // Step 8: Return the computed category.
    return finalCategory;
};

// This block handles the execution when the script is run directly from the command line.
// It uses Node.js 'fs' module to read input from /dev/stdin or a specified file path.
if (typeof require !== 'undefined' && require.main === module) {
    // Explicitly import 'node:fs' for modern Node.js environments.
    const fileSystemOperations = require('node:fs');
    // Determine input source: use the first command-line argument as a file path,
    // or default to /dev/stdin for standard input.
    const sourceFilePath = process.argv[2] || '/dev/stdin';

    try {
        // Read the entire file content as a UTF-8 string.
        const fileContentData = fileSystemOperations.readFileSync(sourceFilePath, { encoding: 'utf8' });
        // Pass the read content to our main analysis function.
        analyzeNumericalRelationships(fileContentData);
    } catch (ioError) {
        // Catch and report any errors during file reading.
        console.error(`Runtime Error: Unable to read input from '${sourceFilePath}'. Details: ${ioError.message}`);
        // Exit the process with a non-zero status code to indicate failure.
        process.exit(1);
    }
}