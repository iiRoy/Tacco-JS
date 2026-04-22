const generateStandardDeck = function() {
    // This function constructs a complete set of playing cards.
    // It generates 52 unique card representations based on standard suits and ranks.
    const collectedCards = []; // Array to store the generated card strings.
    const cardSuits = ['S', 'H', 'C', 'D']; // Standard playing card suits: Spades, Hearts, Clubs, Diamonds.
    const cardRanks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // Ranks from Ace (1) to King (13).

    // Helper function to format a card string consistently.
    // This encapsulates the card string generation logic.
    const formatCardString = (suitChar, rankNum) => {
        return `${suitChar} ${rankNum.toString()}`;
    };

    // Iterate through each suit available.
    for (let suitIdx = 0; suitIdx < cardSuits.length; suitIdx++) {
        const currentSuit = cardSuits[suitIdx]; // Get the current suit character.

        // For each suit, iterate through all possible ranks.
        for (let rankIdx = 0; rankIdx < cardRanks.length; rankIdx++) {
            const currentRank = cardRanks[rankIdx]; // Get the current rank number.

            // Generate the card string using the helper and add it to our collection.
            const cardRepresentation = formatCardString(currentSuit, currentRank);
            collectedCards.push(cardRepresentation);
        }
    }
    return collectedCards; // Return the fully populated deck of cards.
};

const acquireInputData = function() {
    // This function is responsible for reading and parsing input data from standard input.
    // It expects newline-separated card strings.
    try {
        const fileSystemModule = require('fs'); // Dynamically import the file system module.
        const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Read all content as UTF-8 string.

        // Validate if the input content is empty or just whitespace.
        // If so, log a warning and return an empty array to prevent processing issues.
        if (!rawInputContent.trim()) {
            console.warn("Warning: Standard input stream was empty. No consumed cards provided.");
            return [];
        }

        // Split the raw content by newline characters to get an array of input lines (cards).
        return rawInputContent.split('\n');
    } catch (error) {
        // Catch any errors during file reading (e.g., file not found, permission issues).
        console.error("Error encountered while reading input data:", error.message);
        // Return an empty array in case of error to ensure program continues gracefully.
        return [];
    }
};

const displayResult = function(itemToDisplay) {
    // This utility function outputs a given item to the console.
    // It also returns the item, allowing for method chaining if desired.
    console.info(`-> Displaying: ${itemToDisplay}`); // Using console.info for a different log level and added prefix.
    return itemToDisplay; // Return the item for potential further processing.
};


// --- Main Program Execution Flow ---

// Step 1: Retrieve the list of cards that are considered "consumed" or "taken".
// This data is typically provided by the user or another process via standard input.
const consumedCardsList = acquireInputData();

// Step 2: Generate a comprehensive collection of all possible standard playing cards.
// This forms our complete reference deck.
const fullDeckCollection = generateStandardDeck();

// Initialize a counter to keep track of how many available cards are found and displayed.
let availableCardCount = 0;

// Step 3: Filter the full deck to identify cards that are *not* present in the consumed list.
// These are the "available" cards that need to be output.
const cardsToPrint = fullDeckCollection.filter(singleCard => {
    // Use the `includes` method for a clear and concise check if the card is in the consumed list.
    // We are interested in cards that are NOT consumed.
    const isCardConsumed = consumedCardsList.includes(singleCard);
    return !isCardConsumed; // Return true for cards that are NOT consumed.
});

// Step 4: Process and display each of the identified available cards.
// An intermediate mapping step is included here, even if it's an identity transformation,
// to demonstrate an additional processing stage.
cardsToPrint
    .map(cardString => {
        // This map could perform further transformations on the card string if needed,
        // e.g., adding a special marker for available cards, or reformatting.
        // For this example, it simply passes the string through.
        return cardString;
    })
    .forEach(cardToOutput => {
        // Call the display function for each available card.
        displayResult(cardToOutput);
        availableCardCount++; // Increment the counter for each card displayed.
    });

// Final summary output: Provide feedback on the operation.
if (availableCardCount === 0) {
    console.log("Operation complete: No available cards were found based on the provided input.");
} else {
    console.log(`Operation complete: Successfully listed ${availableCardCount} unique available cards.`);
}