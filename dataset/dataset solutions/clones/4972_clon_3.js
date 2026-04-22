"use strict";

/**
 * Utility function to synchronously read all content from standard input.
 * This is typically used in environments like competitive programming platforms.
 * @returns {string} The entire content read from stdin, decoded as UTF-8.
 * @throws {Error} If reading from /dev/stdin fails.
 */
const obtainRawSystemInput = () => {
    try {
        // Attempt to access the file system to read from the standard input stream.
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (ioError) {
        // Log the error and re-throw, as input is crucial for execution.
        console.error("Critical: Unable to read from standard input (/dev/stdin).", ioError.message);
        throw ioError;
    }
};

/**
 * Displays the name of the winning player to the console.
 * @param {string} winningPlayerDesignation - The single-character uppercase identifier of the victor (e.g., 'A', 'B', 'C').
 */
const displayGameVictor = (winningPlayerDesignation) => {
    // Print the determined winner's name.
    console.log(winningPlayerDesignation);
};

/**
 * Executes a simulation of a turn-based card game involving three players (A, B, C).
 * Each player has a sequence of 'cards' (represented by characters 'a', 'b', 'c').
 * A turn consists of the current player drawing their top card. This card then dictates
 * which player takes the next turn. The game concludes when a player attempts to draw
 * a card from an empty deck, at which point that player is declared the winner.
 *
 * @param {string} gameConfigurationData - A string containing three newline-separated lines.
 *                                         Each line specifies the initial card sequence for a player.
 *                                         Example: "bca\ncab\nabc"
 */
const conductCardGameSimulation = (gameConfigurationData) => {
    // Process the raw input: remove leading/trailing whitespace and split into individual lines.
    const inputSequences = gameConfigurationData.trim().split('\n');

    // Essential validation: Ensure the input provides data for exactly three players.
    const EXPECTED_PLAYER_COUNT = 3;
    if (inputSequences.length !== EXPECTED_PLAYER_COUNT) {
        console.error(`Error: Invalid input format. Expected ${EXPECTED_PLAYER_COUNT} lines of player sequences, but received ${inputSequences.length}.`);
        return; // Exit if input is malformed.
    }

    // Initialize player card decks using a Map for efficient lookup by player identifier.
    // Each player's sequence string is converted into an array of individual characters (cards).
    const playerCardDecks = new Map();
    playerCardDecks.set('a', inputSequences[0].split('')); // Player 'a' deck
    playerCardDecks.set('b', inputSequences[1].split('')); // Player 'b' deck
    playerCardDecks.set('c', inputSequences[2].split('')); // Player 'c' deck

    // Set the initial turn holder; the game always commences with player 'a'.
    let activePlayerKey = 'a';
    // Optional: A counter for the number of turns played, for potential debugging or advanced features.
    let simulationRoundCounter = 0;

    // The core game loop: continues indefinitely until a winner is determined and the function returns.
    // Using a 'for (;;)' loop is an idiomatic equivalent to 'while(true)'.
    for (;;) {
        simulationRoundCounter++; // Increment the round counter for each iteration.

        // Retrieve the card deck for the player whose turn it currently is.
        const currentPlayersDeck = playerCardDecks.get(activePlayerKey);

        // Check for game-ending condition: if the current player's deck is empty.
        // `undefined` check is a safeguard if `activePlayerKey` was somehow invalid.
        if (currentPlayersDeck === undefined || currentPlayersDeck.length === 0) {
            // Convert the lowercase player key ('a', 'b', 'c') to its uppercase equivalent ('A', 'B', 'C')
            // for the final announcement.
            const victorDesignation = activePlayerKey.toUpperCase();
            displayGameVictor(victorDesignation); // Announce the winner.
            return; // Terminate the game simulation.
        }

        // The current player draws the top card from their deck.
        // `shift()` removes the first element from the array and returns it.
        const drawnCardInstruction = currentPlayersDeck.shift();

        // Update the `activePlayerKey` based on the card that was just drawn.
        // This card indicates who plays next.
        // Include a guard clause to handle unexpected card values, though problem implies only 'a', 'b', 'c' are possible.
        if (drawnCardInstruction === 'a' || drawnCardInstruction === 'b' || drawnCardInstruction === 'c') {
            activePlayerKey = drawnCardInstruction;
        } else {
            // Log an error and terminate if an invalid card is drawn, indicating a corrupt game state.
            console.error(`Fatal Error: Player ${activePlayerKey.toUpperCase()} drew an invalid card '${drawnCardInstruction}'. Game terminated.`);
            return;
        }
    }
};

// Initiate the game simulation by first obtaining input from the system,
// then passing it to the main simulation function.
try {
    conductCardGameSimulation(obtainRawSystemInput());
} catch (executionError) {
    // Catch any top-level errors that might occur during the entire process,
    // ensuring a graceful exit or error reporting.
    console.error("An unforeseen error disrupted the game simulation:", executionError.message);
}