// This function processes game data received as a string
function ProcessInput(rawData) {
    // Split the raw input string into an array of tokens, using any whitespace or newline as a delimiter.
    // The `trim()` method removes leading/trailing whitespace from the input string.
    let tokenList = rawData.trim().split(/[\s\n]+/);

    // Initialize scores for two players.
    // `playerOneScore` will hold the score for the first player.
    let playerOneScore = 0;
    // `playerTwoScore` will hold the score for the second player.
    let playerTwoScore = 0;

    // The first token in the list represents the total number of rounds to be played.
    // `parseInt()` converts this string token into an integer. The `10` specifies base-10 conversion.
    const numRounds = parseInt(tokenList.shift(), 10);

    // Loop through each round of the game.
    // The loop continues as long as the `roundIndex` is less than the `numRounds`.
    for (let roundIndex = 0; roundIndex < numRounds; roundIndex++) {
        // In each round, two cards are drawn from the `tokenList`.
        // `cardOne` is the card for the first player.
        const cardOne = tokenList.shift();
        // `cardTwo` is the card for the second player.
        const cardTwo = tokenList.shift();

        // Compare the two cards to determine the outcome of the round.
        // Using strict equality `===` for string comparison.
        if (cardOne === cardTwo) {
            // If the cards are identical, both players receive one point.
            playerOneScore++; // Increment score for player one.
            playerTwoScore++; // Increment score for player two.
        } else {
            // If the cards are different, determine which player has the higher card.
            // A ternary operator is used for concise conditional scoring.
            // If `cardOne` is lexicographically less than `cardTwo`, player two gets 3 points.
            // Otherwise (if `cardOne` is greater than `cardTwo`), player one gets 3 points.
            (cardOne < cardTwo) ? (playerTwoScore += 3) : (playerOneScore += 3);
        }
    }

    // After all rounds are played, print the final scores of both players.
    // The scores are concatenated with a space in between.
    console.log(playerOneScore + " " + playerTwoScore);
}

// This line reads the input from standard input.
// `require("fs")` imports the Node.js file system module.
// `readFileSync("/dev/stdin", "utf8")` reads the entire content of the standard input file
// as a UTF-8 encoded string.
// The read content is then passed to the `ProcessInput` function for processing.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
