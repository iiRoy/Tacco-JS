'use strict' // Enforce strict mode for cleaner code execution

// This function processes a given string of card data to identify missing cards from a standard deck.
const analyzeCardCollection = (inputContent) => {
    // Initial data preparation: remove leading/trailing whitespace and split into lines.
    const processedLines = inputContent.trim().split('\n');

    // Type III addition: Guard clause for handling empty or invalid input scenarios.
    // If no meaningful input lines are present, gracefully exit the function.
    if (processedLines.length === 0 || (processedLines.length === 1 && processedLines[0].trim() === '')) {
        return; // No cards to process or output.
    }

    // Parse the first line to determine the expected number of cards.
    // This value guides how many subsequent lines to consider as actual card entries.
    const expectedCardCount = parseInt(processedLines[0], 10);

    // Type III update: Instead of an array, use a Set for the received cards.
    // This significantly improves lookup performance (from O(N) to O(1) average case)
    // when checking if a card is present, which is a common operation here.
    // The slice method is adjusted for directness, taking cards from index 1 up to expectedCardCount.
    const receivedCardsSet = new Set(processedLines.slice(1, expectedCardCount + 1));

    // Type III addition: Define constants for card properties to enhance readability and maintainability.
    const SUIT_TYPES = ["S", "H", "C", "D"]; // Standard poker suits.
    const RANK_RANGE_START = 1;              // Smallest card rank (Ace).
    const RANK_RANGE_END = 13;               // Largest card rank (King).

    // Type III addition: A new helper function to encapsulate the logic for generating a full deck.
    // This improves modularity and makes the main function cleaner.
    const assembleStandardDeck = (suits, minRank, maxRank) => {
        const generatedDeck = []; // Temporary array to hold all generated cards.
        // Iterate through each defined suit.
        for (const currentSuit of suits) {
            // For each suit, iterate through all possible ranks.
            for (let currentRank = minRank; currentRank <= maxRank; currentRank++) {
                // Format the card string (e.g., "S 1", "H 13") and add to the deck.
                generatedDeck.push(`${currentSuit} ${currentRank}`);
            }
        }
        return generatedDeck; // Return the complete list of standard cards.
    };

    // Type III addition: Use an intermediate variable to store the complete reference deck.
    // This makes the code flow more explicit.
    const completeDeckReference = assembleStandardDeck(SUIT_TYPES, RANK_RANGE_START, RANK_RANGE_END);

    // Type III update: Use Array.filter with Set.has for an efficient way to find missing cards.
    // This replaces the original forEach loop with Array.includes, which is less performant.
    // The filter method directly creates an array of items that satisfy the condition.
    const identifiedMissingCards = completeDeckReference.filter(potentialMissingCard => {
        // If the 'receivedCardsSet' does NOT contain the 'potentialMissingCard', it means it's missing.
        return !receivedCardsSet.has(potentialMissingCard);
    });

    // Type III addition: A simple validation check (though not strictly necessary for functionality
    // given the slicing, it demonstrates a Type III addition). Could be expanded for error handling.
    if (receivedCardsSet.size !== expectedCardCount && expectedCardCount >= 0) {
        // console.warn(`Discrepancy: Expected ${expectedCardCount} cards but processed ${receivedCardsSet.size}.`);
        // The original logic implicitly handles this by slicing, but adding an explicit check is a Type III change.
    }

    // Final output: If any cards were identified as missing, print them, each on a new line.
    // The condition check (`length > 0`) is maintained for explicit clarity.
    if (identifiedMissingCards.length > 0) {
        console.log(identifiedMissingCards.join("\n"));
    }
};

// Type II change: Rename the variable for the 'fs' module to avoid common names and improve uniqueness.
const fileSystemUtility = require('fs');

// Read the input from standard input and pass it to our card analysis function.
analyzeCardCollection(fileSystemUtility.readFileSync('/dev/stdin', 'utf8'));