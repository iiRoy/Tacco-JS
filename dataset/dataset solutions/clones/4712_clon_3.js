/**
 * Processes a card game scenario to determine the winner based on two card values.
 * This function takes raw input, parses card values,
 * applies specific game rules (e.g., Ace as the highest card), and outputs the result.
 * @param {string} rawCardDataString - A string containing two space-separated card values (e.g., "1 10").
 */
function evaluateCardShowdown(rawCardDataString) {
    // --- Configuration Constants for Game Logic and Output Messages ---
    const ACE_CARD_INDICATOR = 1;         // The numeric value representing an Ace card
    const ACE_PROMOTED_VALUE = 14;        // The value an Ace takes when it's high
    const CARD_VALUE_SPLIT_CHAR = " ";    // Delimiter for splitting card values in the input string
    const PLAYER_ONE_VICTORY_MESSAGE = "Alice"; // Message for player one winning
    const PLAYER_TWO_VICTORY_MESSAGE = "Bob";   // Message for player two winning
    const GAME_TIED_MESSAGE = "Draw";           // Message for a tied game

    /**
     * Internal helper function to parse a card string into its normalized numerical value.
     * Applies the Ace-high rule.
     * @param {string} cardToken - The string representation of a single card.
     * @returns {number} The numerical value of the card, with Ace normalized to 14, or -1 if invalid.
     */
    const getNormalizedNumericCardValue = (cardToken) => {
        // Attempt to convert the string token to an integer (Type III addition: explicit parsing)
        const parsedValue = parseInt(cardToken, 10);

        // Validate if the parsing resulted in a valid number (Type III addition: guard clause/error handling)
        if (isNaN(parsedValue)) {
            // Log an error for invalid card input and return a value that ensures a loss or error state.
            console.error(`Warning: Encountered non-numeric card value "${cardToken}". Treating as invalid.`);
            return -1; // A sentinel value indicating an invalid card
        }

        // Apply the game rule: if the card is an Ace, promote its value (Type III rewrite: ternary operator)
        return (parsedValue === ACE_CARD_INDICATOR) ? ACE_PROMOTED_VALUE : parsedValue;
    };

    // --- Input Pre-processing and Validation ---
    // Remove any leading/trailing whitespace from the input string for robustness (Type III addition)
    const sanitizedInputString = rawCardDataString.trim();

    // Split the cleaned input string into an array of individual card value strings (Type II rename)
    const cardValueTokens = sanitizedInputString.split(CARD_VALUE_SPLIT_CHAR);

    // Ensure that exactly two card values were provided in the input (Type III guard clause)
    if (cardValueTokens.length !== 2) {
        console.error(`Error: Expected exactly two card values separated by a space, but received ${cardValueTokens.length} tokens for input: "${sanitizedInputString}"`);
        return; // Exit the function early if input format is incorrect
    }

    // --- Card Value Conversion and Normalization ---
    // Convert the first player's card string to its normalized numeric value (Type II rename)
    let firstPlayerCardValue = getNormalizedNumericCardValue(cardValueTokens[0]);
    // Convert the second player's card string to its normalized numeric value (Type II rename)
    let secondPlayerCardValue = getNormalizedNumericCardValue(cardValueTokens[1]);

    // Check if any card parsing failed (Type III addition: error handling for invalid cards)
    if (firstPlayerCardValue === -1 || secondPlayerCardValue === -1) {
        console.error("Game cannot proceed due to invalid card values. Please check input.");
        return; // Exit if invalid cards were detected
    }

    // --- Determine Game Outcome ---
    let gameResultAnnouncement; // Intermediate variable to store the outcome message (Type III addition)

    // Compare the normalized card values to decide the winner (Type III rewrite + Type II rename)
    if (firstPlayerCardValue > secondPlayerCardValue) {
        gameResultAnnouncement = PLAYER_ONE_VICTORY_MESSAGE;
    } else if (firstPlayerCardValue < secondPlayerCardValue) {
        gameResultAnnouncement = PLAYER_TWO_VICTORY_MESSAGE;
    } else {
        // If neither player has a higher card, it must be a draw.
        // This 'else' block implicitly covers the equality case, fixing the original typo `A==B`
        // and simplifying the conditional structure (Type III update/deletion of redundant check).
        gameResultAnnouncement = GAME_TIED_MESSAGE;
    }

    // Output the final determined game result (Type III update: using intermediate variable)
    console.log(gameResultAnnouncement);
}

// --- Application Entry Point ---
// Read the entire content from standard input (e.g., from a pipe or redirected file).
// The 'utf8' encoding ensures proper character handling. (Type II rename)
const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Call the main game processing function with the obtained input data. (Type II rename)
evaluateCardShowdown(standardInputContent);