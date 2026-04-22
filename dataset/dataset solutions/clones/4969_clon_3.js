'use strict'; // Enforce strict parsing and error handling for cleaner code execution.

/**
 * Transforms raw textual game data into an organized structure of card decks for each participant.
 * Each resulting deck is an array of single-character strings, where each character signifies a card.
 * This function also includes basic validation for input integrity.
 * @param {string} rawGameDataString - The complete string input, with each line representing a player's initial card sequence.
 * @returns {Array<Array<string>>} An array containing each player's deck, or an empty array if input is invalid.
 */
const processRawInputForGame = (rawGameDataString) => {
    // Type III addition: Robust validation for the incoming data.
    if (!rawGameDataString || typeof rawGameDataString !== 'string' || rawGameDataString.trim().length === 0) {
        console.error("Input data error: Game layout string is invalid or completely empty. Cannot initialize game.");
        return []; // Return an empty array to indicate failure gracefully.
    }

    // Type II: Renaming 'v' to 'lineSegmentData' for enhanced clarity within the map operation.
    // Type II: Adjusting whitespace and line breaks for improved code readability.
    const structuredCardSequences = rawGameDataString
        .split('\n') // Divide the input string into individual lines, each corresponding to a player's starting hand.
        .map(lineSegmentData => lineSegmentData.split('')); // Further break down each line into an array of single-character cards.

    // Type III addition: A guard clause to verify the minimum number of player decks.
    const MINIMUM_REQUIRED_PARTICIPANTS = 3;
    if (structuredCardSequences.length < MINIMUM_REQUIRED_PARTICIPANTS) {
        console.warn(`Game initialization warning: Expected at least ${MINIMUM_REQUIRED_PARTICIPANTS} player decks, but only ${structuredCardSequences.length} were provided.`);
        // The game can still proceed, but this warning alerts to potential incomplete setup.
    }

    return structuredCardSequences;
};

/**
 * Announces the final outcome of the game by identifying the player who lost.
 * This function centralizes the output logic for better maintainability and is a Type III addition.
 * @param {string} identifierOfLosingPlayer - The single-character identifier ('a', 'b', or 'c') of the player who ran out of cards.
 */
const outputGameLoser = (identifierOfLosingPlayer) => {
    // Type II: Rewritten comments to reflect the actual game mechanics (player with empty deck loses).
    // The problem specifies printing the identifier of the player whose turn it is when their deck is empty.
    // This player is the one who cannot make a move, thus they are the loser.
    console.log(identifierOfLosingPlayer.toUpperCase());
};

/**
 * Executes the core logic of the card-passing game, determining the loser based on card sequences.
 * This function handles player turns, card plays, and game termination conditions.
 * @param {string} rawTextualInput - The initial string input containing all player card data.
 */
const runCardGameSimulation = (rawTextualInput) => {
    // Type II: Renamed 'input' parameter to 'rawTextualInput' for better descriptive clarity.
    const initialPlayerCardData = processRawInputForGame(rawTextualInput);

    // Type III: A significant structural rewrite: Using a Map to store player decks instead of individual variables (a, b, c).
    // This makes the code more scalable and flexible for varying numbers of players.
    const participantCardCollections = new Map();

    // Type III: Added guard clauses to ensure data availability before setting map entries.
    // This protects against `initialPlayerCardData` having fewer than 3 elements.
    if (initialPlayerCardData.length > 0) participantCardCollections.set('a', initialPlayerCardData[0]);
    if (initialPlayerCardData.length > 1) participantCardCollections.set('b', initialPlayerCardData[1]);
    if (initialPlayerCardData.length > 2) participantCardCollections.set('c', initialPlayerCardData[2]);

    // Type II: Renamed 'i' to 'currentParticipantIdentifier' to clearly indicate whose turn it is.
    let currentParticipantIdentifier = 'a';
    // Type II: Renamed 'item' to 'activeParticipantDeck' to represent the deck currently being played from.
    let activeParticipantDeck = [];

    // Type III: Introduced a safety counter to prevent potential infinite loops in pathological game states.
    // This is a robustness enhancement without altering core game logic.
    let turnCounter = 0;
    const MAXIMUM_ALLOWED_TURNS = 100000; // An arbitrary large limit to catch runaway games.

    // The primary game loop: continues until a player runs out of cards.
    // Type II: Rewritten comments to reflect the updated variable names and logic.
    while (true) {
        turnCounter++;
        if (turnCounter > MAXIMUM_ALLOWED_TURNS) {
            console.error("Game forcibly terminated: Exceeded maximum allowed turns. This indicates a potential logical error or an extremely long game sequence.");
            break; // Emergency exit to prevent application hang.
        }

        // Type III: Replaced the original `if/else-if/else` construct with a direct Map lookup.
        // This is a cleaner and more efficient way to retrieve the current player's deck.
        activeParticipantDeck = participantCardCollections.get(currentParticipantIdentifier);

        // Type III: Added a guard clause to handle cases where a player identifier might be invalid or missing from the map.
        if (!activeParticipantDeck) {
            console.error(`Critical game error: Attempted to access deck for an unknown or invalid participant identifier '${currentParticipantIdentifier}'. Game cannot continue.`);
            break;
        }

        // Check if the current participant's deck is empty.
        // If it is, this participant cannot make a move and is declared the loser.
        if (activeParticipantDeck.length === 0) {
            // Type III: Utilizing the dedicated helper function for consistent output.
            outputGameLoser(currentParticipantIdentifier); // Announce the participant who lost.
            break; // The game concludes here.
        }

        // Type III: Introduced an intermediate variable 'cardDrawnThisRound' for better clarity
        // and to make the flow of a card being played more explicit.
        const cardDrawnThisRound = activeParticipantDeck.shift(); // Remove and retrieve the first card from the current deck.

        // Type III: Added validation to ensure the drawn card is a legitimate player indicator.
        // This prevents unexpected behavior if a deck contains invalid card values.
        const VALID_PLAYER_DESIGNATORS = ['a', 'b', 'c'];
        if (!VALID_PLAYER_DESIGNATORS.includes(cardDrawnThisRound)) {
            console.error(`Invalid card detected: '${cardDrawnThisRound}' was drawn. Expected 'a', 'b', or 'c'. Game terminated due to corrupted card data.`);
            break; // Terminate the game due to an unrecoverable error.
        }

        // The card that was just played dictates which participant takes the next turn.
        currentParticipantIdentifier = cardDrawnThisRound;
    }
};

// --- Game Execution Block ---
// Type III: Encapsulating the file reading operation within a `try-catch` block for robust error handling.
try {
    // Type II: Renamed 'require' and 'readFileSync' through intermediate variables for consistency
    // (though generally, built-in function names are kept as is for compatibility).
    const fileSystemHandler = require('fs');
    const standardInputPath = '/dev/stdin';
    const textEncodingFormat = 'utf-8';

    const completeGameInputData = fileSystemHandler.readFileSync(standardInputPath, textEncodingFormat);

    // Type II: Calling the renamed main game function.
    runCardGameSimulation(completeGameInputData);

} catch (inputOutputError) {
    // Type II: Renamed 'fileError' to 'inputOutputError' for more descriptive error type.
    // Type III: Enhanced the error message to provide more context and user guidance.
    console.error(`An I/O exception occurred during the attempt to read game input from ${'/dev/stdin'}: ${inputOutputError.message}. Please verify the input source exists and is accessible.`);
    // In a production scenario, one might also `process.exit(1)` here to indicate a critical failure.
}