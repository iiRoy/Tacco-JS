const fsModule = require('fs');

// Constants defining the structure of a standard deck of cards.
const SUIT_COUNT = 4;
const CARDS_PER_SUIT_COUNT = 13;
const FULL_DECK_SIZE = SUIT_COUNT * CARDS_PER_SUIT_COUNT;

// Define the mapping from internal numerical suit representation to display symbol.
// This array also implicitly defines the order of suits (e.g., S=0, H=1, C=2, D=3).
const suitDisplaySymbols = ['S', 'H', 'C', 'D'];

// Create an object to quickly map suit symbols back to their base index in a linear 52-card array.
// For example, 'S' starts at index 0, 'H' at 13, 'C' at 26, 'D' at 39.
const suitSymbolToDeckOffset = {
    'S': 0,
    'H': CARDS_PER_SUIT_COUNT,
    'C': CARDS_PER_SUIT_COUNT * 2,
    'D': CARDS_PER_SUIT_COUNT * 3
};

/**
 * Calculates the linear 0-indexed position of a card within a 52-card deck array.
 * @param {string} suitCharacter - The single-character symbol for the card's suit (e.g., 'S', 'H', 'C', 'D').
 * @param {number} rankValue - The numerical rank of the card (1 for Ace, up to 13 for King).
 * @returns {number} The 0-indexed position in the deck (0-51) or -1 if the input is invalid.
 */
function calculateCardIndex(suitCharacter, rankValue) {
    // Input validation for suit.
    if (!suitSymbolToDeckOffset.hasOwnProperty(suitCharacter)) {
        // console.error(`Error: Invalid suit character "${suitCharacter}" provided.`);
        return -1;
    }
    // Input validation for rank.
    if (rankValue < 1 || rankValue > CARDS_PER_SUIT_COUNT) {
        // console.error(`Error: Invalid rank value "${rankValue}" provided. Must be between 1 and ${CARDS_PER_SUIT_COUNT}.`);
        return -1;
    }

    // Calculate the linear index: base offset for the suit + (rank - 1).
    return suitSymbolToDeckOffset[suitCharacter] + (rankValue - 1);
}

// --- Main Program Execution ---

try {
    // Read all input from standard input as a UTF-8 string.
    const rawInputBuffer = fsModule.readFileSync(0);
    const fullInputString = rawInputBuffer.toString('utf8');

    // Split the input string into individual lines and filter out any empty lines.
    const allInputLines = fullInputString.split('\n').filter(line => line.trim() !== '');

    // The first line of input specifies how many card entries follow.
    const headerLine = allInputLines.shift(); // Remove and get the first line.
    const numberOfCardsToProcess = Number(headerLine);

    // Perform basic validation on the expected number of cards.
    if (isNaN(numberOfCardsToProcess) || numberOfCardsToProcess < 0 || numberOfCardsToProcess > FULL_DECK_SIZE) {
        // In a robust application, this would throw an error or exit.
        // For this context, we'll log a warning and try to proceed with available lines.
        // console.warn(`Warning: Invalid number of cards specified in header: "${headerLine}". Processing available entries.`);
        // Adjust numberOfCardsToProcess to actual available lines to prevent errors.
        numberOfCardsToProcess = Math.min(numberOfCardsToProcess, allInputLines.length);
    }

    // Initialize the deck status tracker. Each element represents a card.
    // 'true' means the card is present, 'false' means it has been drawn.
    const deckCurrentStatus = new Array(FULL_DECK_SIZE).fill(true);

    // Process each line representing a card to be removed from the deck.
    for (let i = 0; i < numberOfCardsToProcess; i++) {
        const cardEntryLine = allInputLines[i];
        if (!cardEntryLine) {
            // console.warn(`Skipping empty or missing card entry at index ${i}.`);
            continue;
        }

        const cardParts = cardEntryLine.split(' ');

        // Ensure the card entry is in the expected "Suit Rank" format.
        if (cardParts.length !== 2) {
            // console.warn(`Skipping malformed card entry: "${cardEntryLine}". Expected "Suit Rank".`);
            continue;
        }

        const suitPart = cardParts[0];
        const rankPart = Number(cardParts[1]);

        // Calculate the corresponding index in the deck array.
        const calculatedDeckIndex = calculateCardIndex(suitPart, rankPart);

        // If the calculated index is valid, mark the card as absent from the deck.
        if (calculatedDeckIndex !== -1 && calculatedDeckIndex < FULL_DECK_SIZE) {
            deckCurrentStatus[calculatedDeckIndex] = false;
        } else {
            // This 'else' block catches cases where calculateCardIndex returned -1.
            // console.warn(`Could not invalidate card "${cardEntryLine}" due to invalid components.`);
        }
    }

    // --- Output Remaining Cards ---

    // Iterate through the entire deck status to find which cards are still present.
    // We'll reconstruct the suit and rank from the linear index.
    for (let cardLinearIndex = 0; cardLinearIndex < FULL_DECK_SIZE; cardLinearIndex++) {
        if (deckCurrentStatus[cardLinearIndex]) {
            // If the card at this index is present (true).
            
            // Determine the suit index (0-3) from the linear index.
            const currentSuitIndex = Math.floor(cardLinearIndex / CARDS_PER_SUIT_COUNT);
            // Determine the rank (1-13) from the remainder.
            const currentRankValue = (cardLinearIndex % CARDS_PER_SUIT_COUNT) + 1;

            // Retrieve the display symbol for the suit.
            const displaySuit = suitDisplaySymbols[currentSuitIndex];

            // Print the card's suit and rank to standard output.
            console.log(displaySuit, currentRankValue);
        }
    }

} catch (error) {
    // Catch any potential errors during file reading or processing.
    // console.error("An error occurred during execution:", error.message);
    // process.exit(1); // Exit with an error code.
}