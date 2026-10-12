'use strict';

const processGameSimulation = (rawGameInput) => {
    // Step 1: Deconstruct the raw input string into individual lines
    const gameInputLines = rawGameInput.split('\n');

    // Step 2: Parse each line into an array of characters representing player decks
    const playerADeckCards = gameInputLines[0].split('');
    const playerBDeckCards = gameInputLines[1].split('');
    const playerCDeckCards = gameInputLines[2].split('');

    // Step 3: Consolidate player decks into a single, easily accessible structure
    const allPlayerDecks = {
        'a': playerADeckCards,
        'b': playerBDeckCards,
        'c': playerCDeckCards
    };

    let currentPlayerTurnIdentifier = 'a'; // The game always starts with player 'a'
    let gameOutcome = null; // Variable to store the final winner's identifier

    // Helper function to encapsulate the logic for a single player's turn
    const resolveSingleTurn = (activePlayerId, decksCollection) => {
        const currentPlayersDeck = decksCollection[activePlayerId];

        // Check if the current player's deck is empty. If so, the game concludes.
        if (currentPlayersDeck.length === 0) {
            // The player whose turn it is and whose deck is empty is declared the winner.
            // This matches the original logic of printing `i.toUpperCase()` when `item.length === 0`.
            return { finalWinner: activePlayerId.toUpperCase() };
        }

        // If the deck is not empty, draw the top card (shift)
        // This card determines the identifier of the next player to take a turn.
        const nextPlayerToAct = currentPlayersDeck.shift();
        return { nextPlayerIdentifier: nextPlayerToAct };
    };

    // Main game loop: Continues until a winner is determined
    while (gameOutcome === null) {
        const turnResolution = resolveSingleTurn(currentPlayerTurnIdentifier, allPlayerDecks);

        if (turnResolution.finalWinner) {
            // If a winner is found in this turn, store it and exit the loop
            gameOutcome = turnResolution.finalWinner;
        } else {
            // Otherwise, update the current player to the next player determined by the drawn card
            currentPlayerTurnIdentifier = turnResolution.nextPlayerIdentifier;
        }
    }

    // Output the identifier of the winning player
    console.log(gameOutcome);
};

// Read input from standard input and initiate the game simulation
processGameSimulation(require('fs').readFileSync('/dev/stdin', 'utf-8'));
