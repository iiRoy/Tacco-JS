(function(rawData) {
    // This script processes game scores from input data.
    // It expects lines of card values for two players.

    // Split the entire input string by newline characters to get an array of individual lines.
    var linesArray = rawData.split('\n');

    // The first line typically indicates the number of rounds, but in this specific logic,
    // it's read and converted to a number but not actually used for loop control.
    // We still perform the shift operation to maintain the original data processing flow.
    var numEntries = Number(linesArray.shift());

    // Initialize a counter variable for the game rounds.
    var counter = 0;

    // Initialize scores for the two players.
    // 'playerOneScore' corresponds to 't' in the original, 'playerTwoScore' to 'h'.
    var playerOneScore = 0;
    var playerTwoScore = 0;

    // The game consists of exactly three rounds.
    // The loop iterates three times, processing one round per iteration.
    while (counter++ < 3) {
        // Retrieve the next line from the array, which contains card values for the current round.
        // Then, split this line by space to separate the two players' card values.
        var currentLineParts = linesArray.shift().split(' ');

        // Extract the card value for player one (first element).
        var playerOneCard = currentLineParts[0];
        // Extract the card value for player two (second element).
        var playerTwoCard = currentLineParts[1];

        // Compare the card values to determine the winner of the current round.
        if (playerOneCard > playerTwoCard) {
            // If player one's card is higher, player one gets 3 points.
            playerOneScore += 3;
        } else if (playerOneCard < playerTwoCard) {
            // If player two's card is higher, player two gets 3 points.
            playerTwoScore += 3;
        } else {
            // If the cards are equal, it's a draw, and both players get 1 point.
            playerOneScore++;
            playerTwoScore++;
        }
    }

    // After all rounds are processed, print the final scores of player one and player two.
    // The output format is two space-separated integers.
    console.log('%s %s', playerOneScore, playerTwoScore);

// This immediately invoked function expression (IIFE) reads input from standard input.
// It uses Node.js 'fs' module to synchronously read the entire content of '/dev/stdin' as UTF-8.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
