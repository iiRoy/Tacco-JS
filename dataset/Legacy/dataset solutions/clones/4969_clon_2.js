'use strict'

const processInput = (rawData) => {
    // Split the raw input string by newline characters, then split each line into an array of characters.
    let parsedGameData = rawData.split('\n').map(lineStr => lineStr.split(''));

    // Assign the character arrays to variables representing player decks.
    const deckA = parsedGameData[0];
    const deckB = parsedGameData[1];
    const deckC = parsedGameData[2];

    // Initialize the current player identifier and the current deck being processed.
    let activePlayer = 'a';
    let currentCardPile = [];

    // Begin the game simulation loop.
    while (true) {
        // Determine which player's deck is currently active based on the 'activePlayer' identifier.
        if (activePlayer === 'a') {
            currentCardPile = deckA;
        } else if (activePlayer === 'b') {
            currentCardPile = deckB;
        } else { // If activePlayer is 'c'
            currentCardPile = deckC;
        }

        // Check if the current player's deck is empty.
        if (currentCardPile.length === 0) {
            // If the deck is empty, the current player wins. Print their identifier in uppercase.
            console.log(activePlayer.toUpperCase());
            break; // Exit the loop as the game has ended.
        }

        // If the deck is not empty, draw the next card from the deck.
        // The drawn card becomes the identifier for the next active player.
        activePlayer = currentCardPile.shift();
    }
};

// Read the input from standard input using Node.js 'fs' module and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
