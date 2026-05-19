'use strict';

/**
 * Processes game input data to compute a final score based on specific rules.
 * @param {string} rawInputString - The complete string content read from standard input.
 */
function ProcessGameData(rawInputString) {
  // Normalize the input by removing leading/trailing whitespace and splitting into lines.
  const processedLines = rawInputString.trim().split('\n');

  // Parse the first line to extract game configuration parameters.
  const gameParameters = processedLines[0].split(' ').map(paramStr => parseInt(paramStr, 10));
  const totalTurns = gameParameters[0];   // Represents 'N' from the original problem: total number of game rounds.
  const skipInterval = gameParameters[1]; // Represents 'K' from the original problem: the interval for checking previous moves.

  // Parse the second line to get the point values for winning with each move type.
  const pointValues = processedLines[1].split(' ').map(scoreStr => parseInt(scoreStr, 10));
  const rockScore = pointValues[0];     // Represents 'R' from the original problem: points awarded for winning with Rock.
  const scissorsScore = pointValues[1]; // Represents 'S' from the original problem: points awarded for winning with Scissors.
  const paperScore = pointValues[2];    // Represents 'P' from the original problem: points awarded for winning with Paper.

  // The third line contains the sequence of moves the player makes throughout the game.
  const playerSequence = processedLines[2];

  // Initialize an array to store the points earned in each individual turn.
  let turnScores = [];

  // Iterate through each turn of the game to calculate points.
  for (let turnCounter = 0; turnCounter < totalTurns; ++turnCounter) {
    const currentChoice = playerSequence[turnCounter]; // The player's move for the current turn.

    // Check for the "skip" condition: if the same move was made 'skipInterval' turns ago
    // AND that previous move resulted in points (i.e., was not already skipped itself).
    if (turnCounter >= skipInterval && playerSequence[turnCounter - skipInterval] === currentChoice && turnScores[turnCounter - skipInterval] > 0) {
      turnScores.push(0); // If the condition is met, no points are awarded for this turn.
      continue;           // Skip to the next turn.
    }

    // Award points based on the current move, assuming a win against the losing counter-move.
    // 'r' (rock) beats 's' (scissors), so points for 'p' (paper) are awarded.
    if (currentChoice === 'r') {
      turnScores.push(paperScore);
    }
    // 's' (scissors) beats 'p' (paper), so points for 'r' (rock) are awarded.
    else if (currentChoice === 's') {
      turnScores.push(rockScore);
    }
    // 'p' (paper) beats 'r' (rock), so points for 's' (scissors) are awarded.
    else if (currentChoice === 'p') {
      turnScores.push(scissorsScore);
    }
  }

  // Sum all the points accumulated in the 'turnScores' array to get the final total score.
  const finalTotalScore = turnScores.reduce((accumulatedPoints, currentPoint) => accumulatedPoints + currentPoint);

  // Output the calculated total score to the console.
  console.log(finalTotalScore);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
ProcessGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
