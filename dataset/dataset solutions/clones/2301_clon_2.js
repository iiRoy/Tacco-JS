"use strict";

// Import the Node.js file system module for reading input
const fs = require("fs");

// Define a mapping from an opponent's move to the winning move against it
// 'r' (rock) loses to 'P' (paper)
// 's' (scissors) loses to 'R' (rock)
// 'p' (paper) loses to 'S' (scissors)
const victoriousGestures = {
  r: "P",
  s: "R",
  p: "S"
};

// Read all input from standard input, decode as UTF-8, and split into lines
const inputRows = fs.readFileSync("/dev/stdin", { encoding: "utf8" }).split("\n");

// Parse the first line for N and K values
const initialRow = inputRows[0].split(" ");
// Parse the second line for R, S, P scores
const subsequentRow = inputRows[1].split(" ");

// Extract and parse the numerical parameters
const numRounds = parseInt(initialRow[0]); // N: Total number of rounds (not directly used in this solution's logic)
const groupSize = parseInt(initialRow[1]); // K: The stride/grouping factor for calculating scores

const rockScore = parseInt(subsequentRow[0]); // R: Points for winning with Rock
const scissorsScore = parseInt(subsequentRow[1]); // S: Points for winning with Scissors
const paperScore = parseInt(subsequentRow[2]); // P: Points for winning with Paper

// The third line contains the sequence of opponent's moves
const gameSequence = inputRows[2];

// Create an object to easily look up points by winning move type
const scoreValues = { R: rockScore, S: scissorsScore, P: paperScore };

let finalScore = 0; // Initialize the total accumulated score

// The problem requires calculating scores by splitting the game sequence into K subsequences.
// Each subsequence starts at a different offset (0 to K-1) and steps by K.
for (let idx = 0; idx < groupSize; ++idx) {
  // Add the score from each subsequence calculation to the final total
  finalScore += calculateSubScore(idx, groupSize);
}

// Print the final calculated score to standard output
console.log(finalScore);

/**
 * Calculates the score for a specific subsequence of the game.
 * This function processes moves at `startOffset`, `startOffset + stepSize`,
 * `startOffset + 2*stepSize`, and so on.
 *
 * @param {number} startOffset - The initial index to start processing from.
 * @param {number} stepSize - The increment for moving to the next index in the subsequence.
 * @returns {number} The total points accumulated for this specific subsequence.
 */
function calculateSubScore(startOffset, stepSize) {
  let cumulativePoints = 0; // Score for the current subsequence
  let lastWinningMove = null; // Stores the type of the last winning move ('R', 'S', or 'P')
  let consecutiveCount = 0; // Counts how many times the 'lastWinningMove' has occurred consecutively

  // Iterate through the game sequence based on the provided offset and step size
  for (let timeIndex = startOffset; timeIndex < gameSequence.length; timeIndex += stepSize) {
    // Determine the winning move against the opponent's move at the current timeIndex
    const currentWinningMove = victoriousGestures[gameSequence[timeIndex]];

    // Check if the current winning move is different from the one previously played
    if (currentWinningMove !== lastWinningMove) {
      // If there was a previous winning move (i.e., not the very first move in the subsequence)
      // and it was part of a consecutive streak, calculate and add its score.
      // Score is added for every other consecutive win (Math.floor((count + 1) / 2)).
      if (lastWinningMove) {
        cumulativePoints += scoreValues[lastWinningMove] * Math.floor((consecutiveCount + 1) / 2);
      }
      // Reset the consecutive count as a new winning move type has started
      consecutiveCount = 0;
    }
    // Update the last winning move to the current one
    lastWinningMove = currentWinningMove;
    // Increment the count for consecutive occurrences of this winning move
    consecutiveCount++;
  }

  // After the loop finishes, there might be a pending streak of consecutive moves
  // that needs its score added. This handles the last streak in the subsequence.
  if (lastWinningMove) {
    cumulativePoints += scoreValues[lastWinningMove] * Math.floor((consecutiveCount + 1) / 2);
  }

  return cumulativePoints; // Return the total score for this subsequence
}
