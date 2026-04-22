// This module is designed to process game data for a simple card comparison scenario.
// It determines the winner between two players, conventionally named Alice and Bob,
// or declares a draw, based on the numerical ranks of their dealt cards.

/**
 * Executes the core logic for a card game, evaluating two card ranks
 * to determine the outcome (winner or draw).
 *
 * @param {string} rawGameInputString - A single string containing two numeric card ranks,
 *                                      separated by a space character.
 *                                      Example: "7 13" (meaning 7 and King)
 */
function ProcessCardGameResult(rawGameInputString) {
    // --- Type III: New constant for input parsing ---
    // Defines the character used to delimit the card ranks within the input string.
    const CARD_RANK_DELIMITER = " ";

    // --- Type III: Robust Input Validation (Guard Clause) ---
    // Checks if the provided input is a valid non-empty string.
    if (typeof rawGameInputString !== 'string' || rawGameInputString.trim().length === 0) {
        console.error("Input Processing Error: The provided game data string was empty or invalid.");
        return; // Halts execution if the input is unusable.
    }

    // --- Type II: Renamed identifier 'ab' -> 'cardRankTokens' ---
    // Splits the input string into an array of string tokens, each representing a card rank.
    // .trim() ensures no leading/trailing whitespace interferes with splitting.
    const cardRankTokens = rawGameInputString.trim().split(CARD_RANK_DELIMITER);

    // --- Type III: Validation for expected number of card ranks ---
    // Ensures exactly two card ranks were provided in the input.
    if (cardRankTokens.length !== 2) {
        console.error("Input Format Mismatch: Expected two card ranks, but found " + cardRankTokens.length + ".");
        return;
    }

    // --- Type II: Renamed identifiers 'a' -> 'playerOneCardRank', 'b' -> 'playerTwoCardRank' ---
    // --- Type III: Changed parseFloat to parseInt and added radix for clarity/safety ---
    // Converts the string tokens into integer numbers representing the card ranks.
    const playerOneCardRank = parseInt(cardRankTokens[0], 10);
    const playerTwoCardRank = parseInt(cardRankTokens[1], 10);

    // --- Type III: Validation for successful numeric parsing ---
    // Checks if both parsed values are legitimate numbers.
    if (isNaN(playerOneCardRank) || isNaN(playerTwoCardRank)) {
        console.error("Data Conversion Error: One or both card rank tokens could not be parsed into valid numbers.");
        return;
    }

    // --- Type II: Renamed identifier 'list' -> 'definedCardRankOrder' ---
    // --- Type III: Declared with Object.freeze for immutability and robustness ---
    // This array establishes the specific hierarchy of card ranks for this game,
    // where Ace (represented by 1) is considered the highest value.
    const definedCardRankOrder = Object.freeze([
        2, 3, 4, 5, 6, 7, 8, 9, 10, // Standard pip cards
        11, // Jack (J)
        12, // Queen (Q)
        13, // King (K)
        1   // Ace (A) - placed last to represent highest rank by index
    ]);

    // --- Type III: Helper function for retrieving card position ---
    /**
     * Determines the zero-based index (position) of a given card rank within the
     * predefined `definedCardRankOrder`. A higher index signifies a stronger card.
     *
     * @param {number} cardNumericalValue - The integer value of the card (e.g., 2, 11, 1).
     * @returns {number} The index of the card, or -1 if the card value is not recognized.
     */
    const lookupCardRankPosition = (cardNumericalValue) => {
        // --- Type III: Validation within helper function ---
        if (!definedCardRankOrder.includes(cardNumericalValue)) {
            console.error(`Rule Violation: Card value '${cardNumericalValue}' is not part of the acceptable game ranks.`);
            return -1; // Indicates an unrecognized or invalid card.
        }
        return definedCardRankOrder.indexOf(cardNumericalValue);
    };

    // --- Type II: Renamed identifiers 'aI' -> 'playerOneRankPosition', 'bI' -> 'playerTwoRankPosition' ---
    // Retrieves the rank positions for both players' cards.
    const playerOneRankPosition = lookupCardRankPosition(playerOneCardRank);
    const playerTwoRankPosition = lookupCardRankPosition(playerTwoCardRank);

    // --- Type III: Guard against invalid card ranks identified by helper ---
    // If either card was not found in the defined ranks, an error was already logged.
    if (playerOneRankPosition === -1 || playerTwoRankPosition === -1) {
        return; // Exit due to invalid card data.
    }

    // --- Type III: Intermediate variable for storing the game outcome ---
    let finalGameOutcomeMessage = "Result Pending"; // Initializing outcome message.

    // --- Type III: Rewritten conditional logic for outcome determination ---
    // Compares the rank positions to decide the winner.
    // A higher index in `definedCardRankOrder` means a stronger card.
    if (playerOneRankPosition < playerTwoRankPosition) {
        // If Player One's card has a lower index, it means Player Two's card is stronger.
        finalGameOutcomeMessage = "Bob"; // Player Two wins.
    } else if (playerTwoRankPosition < playerOneRankPosition) {
        // If Player Two's card has a lower index, Player One's card is stronger.
        finalGameOutcomeMessage = "Alice"; // Player One wins.
    } else {
        // If both cards have the same rank position, it's a draw.
        finalGameOutcomeMessage = "Draw";
    }

    // --- Type III: Consolidated output statement ---
    // Prints the final determined outcome of the card game.
    console.log(finalGameOutcomeMessage);
}

// --- Type III: Enhanced Main Execution Block with robust error handling ---
// This section handles reading input from standard input and invoking the game logic.
try {
    // Requires the Node.js 'fs' (file system) module to read input.
    // Reads all content from '/dev/stdin', specifying UTF-8 encoding for text data.
    // 'flag: "r"' explicitly states that the file should be opened for reading.
    const receivedGameData = require("fs").readFileSync("/dev/stdin", { encoding: "utf8", flag: "r" });

    // Calls the primary function to process the game data read from input.
    ProcessCardGameResult(receivedGameData);

} catch (fileSystemError) {
    // --- Type III: Detailed error logging and process termination ---
    // Catches any errors that occur during the file reading operation (e.g., file not found, permissions).
    console.error("Critical System Error: Failed to read input from /dev/stdin.", fileSystemError.message);
    // Exits the Node.js process with a non-zero status code to indicate an error.
    process.exit(1);
}