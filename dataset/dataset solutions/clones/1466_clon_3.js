// This function processes a sequence of game rounds to determine final scores for two players.
// It takes raw input data as a string, parses it, and then calculates points based on card comparisons.
function ProcessGameScores(inputString) {
    // Initialize variables to hold the total scores for Player One and Player Two.
    // Using 'let' for block-scoped variables, indicating they might be reassigned during the game.
    let playerOneTotalScore = 0;
    let playerTwoTotalScore = 0;

    // Split the raw input string into individual tokens.
    // The regular expression /\s+/ splits by one or more whitespace characters (space, tab, newline).
    // .filter(Boolean) removes any empty strings that might result from multiple consecutive delimiters,
    // ensuring only meaningful data segments are retained.
    const dataTokens = inputString.trim().split(/\s+/).filter(Boolean);

    // The first token in the input data stream represents the total number of rounds to be played.
    // Convert this token to a numerical value using the Number() constructor for explicit type conversion.
    // Use 'const' as this value should not change after its initial extraction.
    const numberOfRounds = Number(dataTokens.shift());

    // Basic input validation: Ensure the parsed 'numberOfRounds' is a valid, positive number.
    // Although the original problem implies valid input, adding such guard clauses is a characteristic
    // Type III modification that enhances robustness.
    if (isNaN(numberOfRounds) || numberOfRounds <= 0) {
        // Log an error message and terminate execution if the input for rounds is invalid.
        console.error("Error: Invalid number of rounds provided. Expected a positive integer.");
        return; // Exit the function to prevent further processing with bad data.
    }

    // Iterate through each game round, from the first round up to the total specified number of rounds.
    // The loop counter 'roundIterator' is block-scoped using 'let' and increments efficiently with '++roundIterator'.
    for (let roundIterator = 0; roundIterator < numberOfRounds; ++roundIterator) {
        // Critical check: Ensure there is enough data remaining in 'dataTokens' for the current round.
        // Each round requires two card values (one for each player).
        if (dataTokens.length < 2) {
            // If data is insufficient, log a warning and break out of the loop,
            // as further rounds cannot be processed correctly.
            console.warn(`Warning: Insufficient data for round ${roundIterator + 1}. Remaining rounds will be skipped.`);
            break;
        }

        // Extract the cards played by each player for the current round.
        // Cards are assumed to be numerical values for comparison in this game.
        // Using 'const' here signifies that these card values are fixed for the current round's evaluation.
        const cardPlayerOne = dataTokens.shift();
        const cardPlayerTwo = dataTokens.shift();

        // Introduce temporary variables to store points awarded in the current round.
        // This intermediate step clarifies the scoring logic before updating the overall totals.
        let currentRoundPointsP1 = 0;
        let currentRoundPointsP2 = 0;

        // Compare the cards played by Player One and Player Two to determine the round's outcome.
        // This explicit 'if-else if-else' structure replaces the original compact ternary operator,
        // enhancing readability and making the scoring conditions more obvious.
        if (cardPlayerOne === cardPlayerTwo) {
            // If both players play identical cards, the round is a draw.
            // Each player receives one point for participation.
            currentRoundPointsP1 = 1;
            currentRoundPointsP2 = 1;
        } else if (cardPlayerOne < cardPlayerTwo) {
            // If Player One's card is numerically smaller, Player Two wins the round.
            // Player Two is awarded three points.
            currentRoundPointsP2 = 3;
        } else { // This implies cardPlayerOne > cardPlayerTwo
            // In all other cases (i.e., Player One's card is greater), Player One wins the round.
            // Player One is awarded three points.
            currentRoundPointsP1 = 3;
        }

        // Accumulate the points earned in the current round to each player's respective total score.
        playerOneTotalScore += currentRoundPointsP1;
        playerTwoTotalScore += currentRoundPointsP2;
    }

    // After all rounds have been processed (or the loop has terminated early),
    // display the final calculated scores for both players.
    // A template literal is used for clean and modern string interpolation.
    console.log(`${playerOneTotalScore} ${playerTwoTotalScore}`);
}

// Entry point for executing the game score processing.
// This line simulates reading input from standard input, typical in competitive programming environments.
// It uses Node.js 'fs' module to synchronously read the file content from '/dev/stdin' as a UTF-8 string.
ProcessGameScores(require("fs").readFileSync("/dev/stdin", "utf8"));