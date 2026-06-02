'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the input data to identify missing playing cards.
 * @param {string} rawData - The raw input string from stdin.
 */
const processInput = (rawData) => {
    // Trim leading/trailing whitespace and split into individual lines.
    const processedLines = rawData.trim().split("\n");

    // Parse the first line to get the number of cards provided.
    const cardCount = parseInt(processedLines[0], 10);

    // Extract the actual card entries from the input, based on the count.
    const presentCards = processedLines.slice(1, cardCount + 1);

    // Initialize arrays to hold all possible cards and the ones found to be missing.
    const allPossibleCards = [];
    const missingCards = [];

    // Define the four standard suits for playing cards.
    const cardSuits = ["S", "H", "C", "D"];

    // Iterate through each suit to generate all 13 cards for that suit.
    cardSuits.forEach(cardSuit => {
        // Create an array of 13 elements to represent card ranks 1 through 13.
        [...Array(13)].forEach((_, idx) => {
            // Construct the card string (e.g., "S 1", "H 13") and add it to the full list.
            allPossibleCards.push(cardSuit + ` ${idx + 1}`);
        });
    });

    // Compare the list of all possible cards against the cards that are present.
    allPossibleCards.forEach(potentialCard => {
        // If a potential card is not found in the present cards, it's a missing card.
        if (!presentCards.includes(potentialCard)) {
            missingCards.push(potentialCard);
        }
    });

    // If there are any missing cards, print them to the console, each on a new line.
    if (missingCards.length > 0) {
        console.log(missingCards.join("\n"));
    }
};

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
