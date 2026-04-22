"use strict"; // Enforce stricter parsing and error handling for better code quality

/**
 * Utility function to safely convert a string value into a non-negative integer.
 * This helper includes validation to ensure the input is a valid numeric representation.
 *
 * @param {string} valueString - The string that needs to be parsed into a number.
 * @param {string} identifierDescription - A human-readable name for the value, used in error messages.
 * @returns {number} The successfully parsed non-negative integer.
 * @throws {Error} If the provided string cannot be converted to a valid non-negative integer.
 */
function extractAndValidateInteger(valueString, identifierDescription) {
    const numericValue = Number(valueString);
    // Check if the conversion resulted in NaN, or if it's not an integer, or if it's negative.
    if (isNaN(numericValue) || !Number.isInteger(numericValue) || numericValue < 0) {
        throw new Error(`Input data error: '${identifierDescription}' must be a non-negative integer. Received: '${valueString}'`);
    }
    return numericValue;
}

/**
 * This function determines the total count of unique ways to form a specific target amount
 * using a combination of 500-yen, 100-yen, and 50-yen coins. It considers the maximum
 * allowed quantity for each coin type. The function processes raw string input.
 *
 * @param {string} incomingTextData - A multi-line string where each line provides a specific parameter:
 *                                  - Line 1: Maximum available 500-yen coins.
 *                                  - Line 2: Maximum available 100-yen coins.
 *                                  - Line 3: Maximum available 50-yen coins.
 *                                  - Line 4: The exact target sum of yen to achieve.
 */
function CountCoinPermutations(incomingTextData) {
    // Declare monetary values as constants for improved readability and maintainability.
    const YEN_VALUE_OF_500_COIN = 500;
    const YEN_VALUE_OF_100_COIN = 100;
    const YEN_VALUE_OF_50_COIN = 50;

    // --- Initial Input Data Verification ---
    // Ensure the input is present and of the correct type before proceeding.
    if (typeof incomingTextData !== 'string' || incomingTextData.length === 0) {
        console.error("Processing halted: No input string provided or input is empty.");
        return; // Terminate execution due to invalid input.
    }

    // Split the raw input string into individual lines and remove any leading/trailing whitespace.
    const individualInputLines = incomingTextData.trim().split('\n');

    // A crucial validation: check if the number of input lines matches the expected count.
    if (individualInputLines.length !== 4) {
        console.error(`Processing halted: Expected 4 distinct input lines, but found ${individualInputLines.length}.`);
        return; // Terminate execution.
    }

    let maxAllowed500s, maxAllowed100s, maxAllowed50s, desiredTotalAmount;

    try {
        // Parse and validate each line using the helper function.
        maxAllowed500s = extractAndValidateInteger(individualInputLines[0], "Maximum 500-yen coins");
        maxAllowed100s = extractAndValidateInteger(individualInputLines[1], "Maximum 100-yen coins");
        maxAllowed50s = extractAndValidateInteger(individualInputLines[2], "Maximum 50-yen coins");
        desiredTotalAmount = extractAndValidateInteger(individualInputLines[3], "Target total yen amount");
    } catch (parsingException) {
        // Capture and report any errors encountered during the numeric parsing stage.
        console.error(`Data parsing failure: ${parsingException.message}`);
        return; // Terminate if input values are malformed.
    }

    // Initialize the accumulator for successful combinations.
    let successfulCombinationCount = 0;

    // --- Core Logic: Brute-force iteration through all possible coin counts ---

    // Loop through all possible numbers of 500-yen coins, from zero up to the maximum allowed.
    // Note the post-increment operator for stylistic variation.
    for (let countOf500Yen = 0; countOf500Yen <= maxAllowed500s; countOf500Yen++) {

        // Nested loop for 100-yen coins. The loop condition is expressed differently here.
        for (let countOf100Yen = 0; countOf100Yen < maxAllowed100s + 1; ++countOf100Yen) {

            // Innermost loop for 50-yen coins. The increment is explicitly written as an addition.
            for (let countOf50Yen = 0; countOf50Yen <= maxAllowed50s; countOf50Yen = countOf50Yen + 1) {

                // Calculate the monetary value contributed by the 500-yen and 100-yen coins first.
                // This serves as an intermediate calculation step.
                const currentSumFromHigherDenominations =
                    (countOf500Yen * YEN_VALUE_OF_500_COIN) +
                    (countOf100Yen * YEN_VALUE_OF_100_COIN);

                // Now, add the value from the 50-yen coins to get the total for this specific combination.
                const totalValueForThisCombination =
                    currentSumFromHigherDenominations +
                    (countOf50Yen * YEN_VALUE_OF_50_COIN);

                // Compare the calculated total with the user's desired target amount.
                if (totalValueForThisCombination === desiredTotalAmount) {
                    // If a match is found, increment our counter.
                    successfulCombinationCount++;
                }
            }
        }
    }

    // Display the final tally of combinations that meet the target amount.
    console.log(successfulCombinationCount);
}

// --- Script Execution Bootstrap ---
// This block is responsible for reading the program's input from the standard input stream
// and then initiating the coin combination counting process.
try {
    const fileSystemModule = require("fs"); // Dynamically import Node.js's file system module.
    const standardInputFilePath = "/dev/stdin"; // Define the standard input file path for Unix-like systems.

    // Read all content from the standard input file synchronously, decoding it as UTF-8 text.
    const rawInputBuffer = fileSystemModule.readFileSync(standardInputFilePath, "utf8");

    // Invoke the main function to process the raw input and compute the result.
    CountCoinPermutations(rawInputBuffer);

} catch (runtimeError) {
    // Catch and report any exceptions that occur during file I/O or the initial script setup.
    console.error(`An unexpected runtime error occurred: ${runtimeError.message}`);
    // A non-zero exit code (e.g., process.exit(1)) could be added here to signal failure to the OS.
}