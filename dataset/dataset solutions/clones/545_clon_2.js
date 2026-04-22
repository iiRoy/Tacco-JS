// This module handles input parsing and game score calculation.
// It reads data from a standard input stream to determine game outcomes.

let rawContentBuffer = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// The input content is first cleaned of leading/trailing whitespace.
// Then, it's divided into an array of individual lines for sequential processing.
let processedLinesArray = (rawContentBuffer.trim()).split("\n");


// This main loop continues to process game scenarios until a specific termination condition is met.
for (;;) {

    // Extract the number of rounds for the current game from the head of the processed lines.
    // The extracted string value is explicitly converted to a numeric type.
    let currentGameRounds = Number(processedLinesArray.shift());

    // A value of zero for 'currentGameRounds' signals the end of all game data.
    if (currentGameRounds === 0) {
        break; // Exit the infinite processing loop.
    }

    // Initialize scoring variables for the two participants for the current game session.
    let firstPlayerPoints = 0;
    let secondPlayerPoints = 0;


    // Iterate through each individual round within the current game.
    for (let roundCounter = 0; roundCounter < currentGameRounds; roundCounter++) {

        // Retrieve the scores for the current round from the input lines.
        // The line is split by space, and each segment is converted into a number.
        let roundScoresData = (processedLinesArray.shift()).split(" ").map(Number);

        // Compare the scores of the two players for this specific round.
        if (roundScoresData[0] > roundScoresData[1]) {
            // If player 1 scored higher, both players' round scores contribute to player 1's total.
            firstPlayerPoints += roundScoresData[0] + roundScoresData[1];
        } else if (roundScoresData[0] < roundScoresData[1]) {
            // If player 2 scored higher, both players' round scores contribute to player 2's total.
            secondPlayerPoints += roundScoresData[0] + roundScoresData[1];
        } else {
            // In case of a draw, each player receives their own score for the round.
            firstPlayerPoints += roundScoresData[0];
            secondPlayerPoints += roundScoresData[1];
        }
    }

    // After all rounds for a game are processed, display the final accumulated scores.
    console.log(`${firstPlayerPoints} ${secondPlayerPoints}`);
}