// This JavaScript module implements a turn-based sequence game.
// Players ('a', 'b', 'c') take turns based on characters drawn from their respective sequences.
// The game proceeds by shifting a character from the current player's sequence;
// this character then designates the next active player.
// The game concludes when a player's sequence becomes empty, and that player is declared the winner.

/**
 * Orchestrates the full game simulation from raw input to final outcome display.
 * This function processes player turn sequences and determines the winning player.
 *
 * @param {string} rawGameInput - The complete string input, expected to contain
 *                                 three lines, each representing a player's sequence
 *                                 of turn designations (e.g., "abc\ndef\nghi").
 */
function processGameTurnSequence(rawGameInput) {
    // A constant array holding all recognized player identifiers.
    const VALID_PLAYER_KEYS = ['a', 'b', 'c'];
    // The identifier of the player who initiates the game.
    const STARTING_PLAYER_ID = 'a';

    // Pre-process the raw input: trim whitespace and split into an array of lines.
    // This makes the input parsing more resilient to varied formatting.
    const inputLineSegments = rawGameInput.trim().split('\n');

    // --- Robustness: Check if the provided input has enough lines for all players. ---
    if (inputLineSegments.length < VALID_PLAYER_KEYS.length) {
        console.warn(`Warning: Input provided fewer lines (${inputLineSegments.length}) than expected players (${VALID_PLAYER_KEYS.length}).
                     Missing player sequences will be initialized as empty.`);
    }

    // Initialize a mapping structure to store each player's dynamic sequence of turns.
    // Each sequence string from the input is converted into a mutable character array.
    const playerSequencesMap = {};
    VALID_PLAYER_KEYS.forEach((playerDesignator, idx) => {
        // Safely retrieve the sequence string for the current player.
        // If an input line is missing, an empty string is used to prevent errors.
        const currentSequenceString = inputLineSegments[idx] || '';
        // Convert the string to an array of individual characters.
        playerSequencesMap[playerDesignator] = Array.from(currentSequenceString);
    });

    // --- Game State Initialization ---
    let currentActivePlayerIdentifier = STARTING_PLAYER_ID; // Tracks whose turn it currently is.
    let designatedNextPlayerChar = '';                    // Stores the character indicating the next player.
    let declaredWinnerIdentifier = '';                    // Stores the final winner's ID.

    // --- Core Game Loop ---
    // This loop runs indefinitely until an explicit 'break' statement is encountered,
    // signifying the end of the game. This loop structure mirrors the original `while(1)`.
    for (;;) {
        // Retrieve the character sequence for the player whose turn it is.
        const currentPlayersTurnQueue = playerSequencesMap[currentActivePlayerIdentifier];

        // --- Game Termination Condition: Check if the current player has any moves left. ---
        if (currentPlayersTurnQueue === undefined) {
             // This can happen if an invalid player ID is encountered and assigned to currentActivePlayerIdentifier.
             console.error(`Error: Encountered an invalid player identifier '${currentActivePlayerIdentifier}'. Game cannot proceed.`);
             declaredWinnerIdentifier = "UNKNOWN"; // Indicate an abnormal termination.
             break;
        }

        if (currentPlayersTurnQueue.length === 0) {
            // If the queue is empty, the current player has no more moves and wins.
            declaredWinnerIdentifier = currentActivePlayerIdentifier.toUpperCase();
            break; // Terminate the game loop.
        }

        // --- Process Turn: Extract the next player designator from the current player's queue. ---
        // The `shift()` method removes and returns the first element, modifying the array in place.
        designatedNextPlayerChar = currentPlayersTurnQueue.shift();

        // --- Robustness: Validate the character designating the next player (Type III addition). ---
        // This check ensures that the game only transitions to valid, predefined players.
        if (!VALID_PLAYER_KEYS.includes(designatedNextPlayerChar)) {
            console.warn(`Gameplay Warning: Player '${currentActivePlayerIdentifier}' designated an invalid next player '${designatedNextPlayerChar}'.
                         This might lead to an error if '${designatedNextPlayerChar}' is not a valid key.`);
            // In a strict implementation, this might throw an error or force a game end.
            // For this clone, we proceed, allowing a potential lookup error in the next iteration
            // if an invalid player ID is truly encountered, similar to how the original might behave
            // with unexpected input (e.g., if input contained characters other than 'a', 'b', 'c').
        }

        // --- Transition to Next Turn: Update the active player. ---
        currentActivePlayerIdentifier = designatedNextPlayerChar;
    }

    // Output the final result of the game.
    console.log(declaredWinnerIdentifier);
}

// --- Entry Point for Execution ---
// This self-executing anonymous function handles reading input from standard input
// and initiating the game simulation. It's a common pattern in competitive programming.
(function performStandardInputGameExecution() {
    // Use a helper variable for the 'fs' module for cleaner code.
    const fileSystemHandler = require("fs");
    // Define the standard input path for typical competitive programming environments.
    const standardInputFile = "/dev/stdin";
    // Specify the character encoding for reading the input file.
    const inputEncoding = "utf8";

    try {
        // Read the entire content of the standard input file.
        const rawInputData = fileSystemHandler.readFileSync(standardInputFile, inputEncoding);
        // Pass the read data to the main game logic function.
        processGameTurnSequence(rawInputData);
    } catch (inputReadError) {
        // --- Error Handling (Type III addition): Gracefully manage input reading failures. ---
        console.error("Critical Error: Unable to read game input from stdin.", inputReadError.message);
        // In a production scenario, you might exit the process or provide fallback data.
        // For this cloning exercise, we'll just log the error and the application will terminate without game output.
    }
})();