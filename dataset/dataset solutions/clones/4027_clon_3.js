"use strict";

/**
 * Facilitates the calculation of the score disparity between two players
 * participating in a card-picking game. The game rules dictate that players
 * alternately select the highest available card from a sorted collection.
 *
 * @param {string} rawInputData The complete raw string input for the game.
 *   It is expected to be multi-line.
 *   - The first line (index 0) typically contains metadata (e.g., number of cards)
 *     which is often ignored in this specific problem context.
 *   - The second line (index 1) must contain space-separated integer values,
 *     each representing the face value of a card.
 * @returns {number} A numerical value representing the final difference
 *   between the first player's accumulated score and the second player's
 *   accumulated score. A positive value means Player 1 scored higher.
 */
const calculateCardGameDifference = function(rawInputData) {
    // Define string constants to enhance readability and maintainability
    const LINE_SEPARATOR = "\n";
    const ELEMENT_SEPARATOR = " ";
    const MINIMUM_EXPECTED_LINES = 2; // For header and card data

    // --- Input Validation and Pre-processing ---

    // Guard clause for handling empty or non-string input gracefully
    if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        console.error("Error: Input data is empty or not a string. Cannot proceed.");
        return 0; // Return a default difference or throw an error
    }

    // Split the entire input content into individual lines
    const allInputLines = rawInputData.split(LINE_SEPARATOR);

    // Verify that the input contains at least the expected number of lines
    if (allInputLines.length < MINIMUM_EXPECTED_LINES) {
        console.error(`Error: Insufficient input lines. Expected at least ${MINIMUM_EXPECTED_LINES}, received ${allInputLines.length}.`);
        return 0;
    }

    // Extract the specific line that contains the card values
    const cardValuesStringLine = allInputLines[1];

    // Helper function to robustly parse and sort the card values
    const parseAndOrderCards = (cardString) => {
        // If the card string itself is empty after trimming, return an empty array
        if (cardString.trim().length === 0) {
            return [];
        }

        return cardString
            .split(ELEMENT_SEPARATOR) // Split by space to get individual card value strings
            .map(valueToken => {
                const numericValue = Number(valueToken); // Convert string to number
                // Validate if the conversion resulted in a valid number
                if (isNaN(numericValue)) {
                    console.warn(`Warning: Non-numeric card value "${valueToken}" encountered. This value will be skipped.`);
                    return null; // Mark invalid entries for removal
                }
                // Optional: Ensure card values are non-negative, if problem context implies
                if (numericValue < 0) {
                    console.warn(`Warning: Negative card value ${numericValue} found. This value will be skipped.`);
                    return null;
                }
                return numericValue;
            })
            .filter(val => val !== null) // Remove any nulls (invalid/skipped values)
            .sort((valA, valB) => valB - valA); // Sort in descending order (highest card first)
    };

    // Process the card line to get a sorted array of numeric card values
    let numericallySortedCardValues = parseAndOrderCards(cardValuesStringLine);

    // --- Score Calculation ---

    let firstPlayerAccumulatedScore = 0;  // Corresponds to Alice in original problem
    let secondPlayerAccumulatedScore = 0; // Corresponds to Bob in original problem

    // Iterate through the sorted cards to assign them to players
    // This loop replaces the original filter().reduce() chain for efficiency and clarity.
    for (let currentCardIndex = 0; currentCardIndex < numericallySortedCardValues.length; currentCardIndex++) {
        const cardToPick = numericallySortedCardValues[currentCardIndex];

        // Players pick alternately: Player 1 takes cards at even indices, Player 2 at odd indices.
        if (currentCardIndex % 2 === 0) {
            firstPlayerAccumulatedScore += cardToPick;
        } else {
            secondPlayerAccumulatedScore += cardToPick;
        }
    }

    // Compute the final difference between the players' scores
    const finalScoreDelta = firstPlayerAccumulatedScore - secondPlayerAccumulatedScore;

    // Return the calculated difference
    return finalScoreDelta;
};

// --- Execution Block for Standard Input/Output ---

// Use a try-catch block to handle potential file system errors gracefully.
try {
    // Read the entire content from standard input (e.g., from a pipe or file)
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the main calculation function with the obtained input
    const gameResultOutput = calculateCardGameDifference(standardInputContent);

    // Output the result to standard output.
    // Using process.stdout.write allows for explicit control over the newline character,
    // which can be important in competitive programming environments.
    process.stdout.write(String(gameResultOutput) + '\n');
} catch (executionError) {
    // Log any errors that occur during file reading or processing
    console.error("An unhandled error occurred during program execution:", executionError.message);
    // Exit with a non-zero status code to indicate failure
    process.exit(1);
}