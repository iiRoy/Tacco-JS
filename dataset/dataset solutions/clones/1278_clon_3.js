// This module is responsible for identifying missing cards from a standard 52-card deck
// based on a list of cards provided via standard input. It processes the input,
// generates all possible card combinations, and then outputs any cards that were
// not found in the initial input list.

// Utilize the Node.js file system module to read data from the standard input stream.
const fileSystemInterface = require('fs');

// Define fundamental constants representing the structure of a standard playing card deck.
const STANDARD_SUIT_SYMBOLS = ['S', 'H', 'C', 'D']; // Array of suit identifiers.
const LOWEST_CARD_RANK = 1;                          // The minimum numerical rank (Ace).
const HIGHEST_CARD_RANK = 13;                        // The maximum numerical rank (King).

/**
 * Executes the core logic of the program: reading card data,
 * processing it, and displaying any missing cards.
 */
function initiateCardVerificationProcess() {
    let receivedDataSource;
    try {
        // Attempt to synchronously read the entire content from /dev/stdin as a UTF-8 string.
        receivedDataSource = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');
    } catch (inputReadError) {
        // In case of an error during file system operation (e.g., /dev/stdin not found or permission issues),
        // log the error and terminate execution gracefully.
        console.error("Failed to acquire input from /dev/stdin:", inputReadError.message);
        return; // Halt further processing.
    }

    // Implement a preliminary check to ensure that meaningful data was actually received.
    // If the input is empty or contains only whitespace, there's nothing to process.
    if (!receivedDataSource || receivedDataSource.trim().length === 0) {
        // For this specific problem, if no input is provided, the expected behavior is typically to
        // not print anything, as there are no "provided" cards to compare against.
        return; // Exit if no valid input content is present.
    }

    // Split the raw input string into an array of lines. Each line is expected to represent a card.
    let parsedInputLines = receivedDataSource.split('\n');

    // It's common for the first line of such input to specify the count of cards.
    // We parse this value, although it's not directly used in the subsequent logic for identifying missing cards.
    // This step primarily serves to consume the count line, aligning with typical input formats.
    const declaredCardCount = parseInt(parsedInputLines.shift(), 10);

    // Create a Set data structure from the remaining input lines.
    // Sets offer highly efficient (average O(1) time complexity) lookup operations,
    // which is ideal for checking card existence.
    // Each line is trimmed to remove leading/trailing whitespace and filtered to discard empty strings.
    const existingCardRegistry = new Set(
        parsedInputLines
            .map(individualLine => individualLine.trim()) // Clean up each line.
            .filter(cleanLine => cleanLine.length > 0)    // Remove any lines that are now empty.
    );

    // Initialize an array to store the identifiers of cards that are determined to be missing.
    const discoveredMissingCards = [];

    // Begin the exhaustive generation and checking of all 52 standard playing cards.
    // Iterate through each of the four standard suit symbols.
    for (const currentSuitSymbol of STANDARD_SUIT_SYMBOLS) {
        // For the current suit, iterate through all possible card ranks from Ace (1) to King (13).
        for (let currentRankValue = LOWEST_CARD_RANK; currentRankValue <= HIGHEST_CARD_RANK; currentRankValue++) {
            // Construct the standardized string representation for the current card (e.g., "S 1", "H 13").
            const constructedCardIdentifier = `${currentSuitSymbol} ${currentRankValue}`;

            // Check if this meticulously constructed card identifier is present in our set of existing cards.
            if (!existingCardRegistry.has(constructedCardIdentifier)) {
                // If the card is NOT found in the `existingCardRegistry`, it implies it's missing.
                // Add its identifier to our collection of missing cards.
                discoveredMissingCards.push(constructedCardIdentifier);
            }
        }
    }

    // After the exhaustive search, if the `discoveredMissingCards` array contains any entries,
    // it means there were cards not present in the input.
    if (discoveredMissingCards.length > 0) {
        // Join all the missing card identifiers with newline characters
        // and print the entire list to the standard output.
        console.log(discoveredMissingCards.join('\n'));
    }
    // If `discoveredMissingCards` is empty, no output is produced,
    // which is consistent with the original program's behavior.
}

// Invoke the main function to start the card verification process.
initiateCardVerificationProcess();