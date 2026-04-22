const fileSystemModule = require('fs'); // Module for file system operations.

// --- Input Acquisition and Initial Processing ---
let rawInputData;
try {
    // Synchronously read all data from standard input as UTF-8 text.
    // This assumes the input is not excessively large to fit in memory.
    rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (dataReadError) {
    // Log an error and exit if input cannot be read.
    console.error("Error encountered while acquiring standard input:", dataReadError.message);
    process.exit(1); // Terminate the process with an error code.
}

// Clean and parse the input: remove leading/trailing whitespace, then split into individual lines.
const parsedInputLines = rawInputData.trim().split('\n');

// Early exit if no valid input lines are found after processing.
if (parsedInputLines.length === 0 || (parsedInputLines.length === 1 && parsedInputLines[0] === '')) {
    console.log("No relevant input provided for hand evaluation.");
    process.exit(0); // Exit successfully as there's nothing to process.
}

// --- Helper Functions for Hand Evaluation ---

/**
 * Verifies if a specified number of consecutive elements in an array are identical.
 * @param {Array<number>} numericSequence The array containing card values.
 * @param {number} startIndex The starting index for the comparison.
 * @param {number} countOfElements The total number of elements to check for equality.
 * @returns {boolean} True if all specified elements are the same, false otherwise.
 */
function verifyConsecutiveEquality(numericSequence, startIndex, countOfElements) {
    if (countOfElements <= 1) {
        return true; // A single element or fewer is always 'equal' to itself.
    }
    const referenceValue = numericSequence[startIndex];
    for (let currentOffset = 1; currentOffset < countOfElements; currentOffset++) {
        if (numericSequence[startIndex + currentOffset] !== referenceValue) {
            return false; // Found a non-matching value.
        }
    }
    return true; // All elements matched the reference value.
}

/**
 * Core function to evaluate card hands from a collection of input strings.
 * Each string is expected to represent a hand of cards, comma-separated.
 * @param {Array<string>} inputHandRepresentations An array where each string is a hand.
 */
function analyzePokerHands(inputHandRepresentations) {
    const REQUIRED_CARD_COUNT = 5; // Standard number of cards in a poker hand.

    // Process each input line (representing a single hand).
    for (const currentHandString of inputHandRepresentations) {
        let determinedHandCategory = "null"; // Default category before evaluation.

        const cleanedHandString = currentHandString.trim();
        if (!cleanedHandString) {
            // Skip processing for lines that are empty after trimming.
            console.log("Empty input line detected, skipping evaluation.");
            continue;
        }

        const cardStringComponents = cleanedHandString.split(',');

        // Input validation: ensure the correct number of card components.
        if (cardStringComponents.length !== REQUIRED_CARD_COUNT) {
            console.log(`Error: Hand "${currentHandString}" has an incorrect number of cards (${cardStringComponents.length} instead of ${REQUIRED_CARD_COUNT}).`);
            continue; // Move to the next hand.
        }

        // Convert string components to numbers, and sort them in descending order.
        // This simplifies pattern recognition for poker hands.
        const sortedNumericCards = cardStringComponents
            .map(component => Number(component.trim())) // Convert each string to a number.
            .sort((valA, valB) => valB - valA); // Sort from highest to lowest.

        // Input validation: check for any non-numeric card values.
        if (sortedNumericCards.some(isNaN)) {
            console.log(`Error: Hand "${currentHandString}" contains non-numeric card values.`);
            continue; // Move to the next hand.
        }

        // --- Hand Classification Logic Begins ---

        // Check for "Four of a Kind": four cards of the same rank.
        // This can be the first four or the last four cards in the sorted array.
        const isFourOfAKind = verifyConsecutiveEquality(sortedNumericCards, 0, 4) ||
                             verifyConsecutiveEquality(sortedNumericCards, 1, 4);

        if (isFourOfAKind) {
            determinedHandCategory = "four card";
        }
        // Check for "Full House": three cards of one rank and two cards of another rank.
        // This can be (three-of-a-kind, pair) or (pair, three-of-a-kind).
        else if ((verifyConsecutiveEquality(sortedNumericCards, 0, 3) && verifyConsecutiveEquality(sortedNumericCards, 3, 2)) ||
                   (verifyConsecutiveEquality(sortedNumericCards, 0, 2) && verifyConsecutiveEquality(sortedNumericCards, 2, 3))) {
            determinedHandCategory = "full house";
        }
        // Check for "Straight": five cards in sequential rank (e.g., 5,4,3,2,1).
        // This includes a special Ace-low straight (A,5,4,3,2 typically represented as 13,12,11,10,1 in this context).
        else {
            // Determine if the first four cards form a descending sequence.
            const areFirstFourSequential = sortedNumericCards[0] === sortedNumericCards[1] + 1 &&
                                           sortedNumericCards[1] === sortedNumericCards[2] + 1 &&
                                           sortedNumericCards[2] === sortedNumericCards[3] + 1;

            if (areFirstFourSequential) {
                // If the first four are sequential, check the fifth card.
                if (sortedNumericCards[3] === sortedNumericCards[4] + 1) {
                    // This is a standard straight (e.g., 5,4,3,2,1).
                    determinedHandCategory = "straight";
                } else if (sortedNumericCards[0] === 13 && sortedNumericCards[4] === 1) {
                    // This is the special Ace-low straight (A, K, Q, J, A_low), which is 13,12,11,10,1.
                    determinedHandCategory = "straight";
                }
            }
        }

        // Output the classification for the current hand.
        console.log(determinedHandCategory);
    }
}

// --- Execution Start Point ---
// Begin the analysis process using the parsed input lines.
analyzePokerHands(parsedInputLines);