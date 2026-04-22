// This program reads card data from standard input, identifies which cards are present,
// and then outputs a list of all cards that are missing from a complete 52-card deck.

// Import the Node.js file system module for input operations.
const fileSystemModule = require('fs');

// Read the entire content from standard input (file descriptor 0) as a UTF-8 string.
// Then, divide the string into an array of individual text rows using the newline character as a delimiter.
let rawInputLines = fileSystemModule.readFileSync(0, 'utf8').split('\n');

// The first entry in the input array specifies the total number of card data entries to process.
// Parse this number and use it to extract the relevant data lines from the 'rawInputLines' array.
// The 'parsedCardData' array will now contain only the actual card information, excluding the count.
rawInputLines = rawInputLines.slice(1, parseInt(rawInputLines[0], 10) + 1);

// Define a constant array to map numerical suit indices (0-3) to their corresponding single-character symbols.
const symbolForSuit = ['S', 'H', 'C', 'D'];

// Define a constant object that maps each suit character to its starting linear index
// within a conceptual 52-card array (where each suit occupies 13 consecutive indices).
const suitBaseIndices = {
    'S': 0x0,  // Spades start at index 0
    'H': 0xD,  // Hearts start at index 13 (0x0D in hex)
    'C': 0x1A, // Clubs start at index 26 (0x1A in hex)
    'D': 0x27  // Diamonds start at index 39 (0x27 in hex)
};

// Initialize an array of boolean flags to represent the availability status of all 52 cards.
// A 'true' value indicates the card is initially considered present (or available).
const cardPresenceFlags = [];

// Populate the 'cardPresenceFlags' array, setting all 52 card slots to 'true' by default.
for (let cardSlotIndex = 0; cardSlotIndex < 0x34; cardSlotIndex++) { // 0x34 is 52 in decimal
    cardPresenceFlags.push(true); // Mark this specific card slot as available
}

// Iterate through each entry in the 'rawInputLines' array, which contains the specified cards.
// For each entry, mark the corresponding card as unavailable in our tracking array.
rawInputLines.forEach(function(cardDescription) {
    // Split the current card description string (e.g., "S 10") into its suit and rank components.
    const cardElements = cardDescription.split(' ');

    // Calculate the unique linear index for this card within the 52-card representation.
    // This is done by adding the suit's base index to the 0-indexed rank (rank - 1).
    // Then, set the flag at this calculated index to 'false', indicating the card is present and thus not missing.
    cardPresenceFlags[suitBaseIndices[cardElements[0]] + parseInt(cardElements[1], 10) - 0x1] = false;
});

// After processing all input cards, iterate through all possible cards in a standard deck
// to identify and display those that were not marked as present (i.e., are missing).
// The outer loop iterates through the four different suits.
for (let currentSuitPosition = 0; currentSuitPosition < 4; currentSuitPosition++) {
    // The inner loop iterates through the thirteen ranks within the current suit.
    for (let currentRankPosition = 0; currentRankPosition < 13; currentRankPosition++) {
        // Compute the linear index for the card corresponding to the current suit and rank.
        const linearDeckIndex = (currentSuitPosition * 13) + currentRankPosition;

        // If the flag for this specific card index is still 'true', it means the card was not
        // listed in the input and is therefore considered a missing card.
        if (cardPresenceFlags[linearDeckIndex]) {
            // Output the character symbol for the suit and the 1-indexed rank of the missing card.
            console.log(symbolForSuit[currentSuitPosition], currentRankPosition + 1);
        }
    }
}