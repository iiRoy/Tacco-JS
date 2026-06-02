"use strict";

function ProcessInput(rawData) {
  // Split the entire input string into individual lines
  const dataRows = rawData.split("\n");

  // Extract the first line, convert it to a number, and store it as the item count
  let itemCount = dataRows.shift() - 0;

  // Initialize an array to hold player score objects
  const playerScores = new Array(itemCount);

  // Iterate through each data row to populate the playerScores array
  for (let idx = 0; idx < itemCount; idx++) {
    // Split the current row by space to get individual scores
    const scorePair = dataRows[idx].split(" ");

    // Create an object for the current player, converting string scores to numbers
    playerScores[idx] = {
      playerOneScore: scorePair[0] - 0, // Score for player 1
      playerTwoScore: scorePair[1] - 0, // Score for player 2
    };

    // Calculate and store the difference between player 2's and player 1's scores
    playerScores[idx].scoreDifference = playerScores[idx].playerTwoScore - playerScores[idx].playerOneScore;
  }

  // Sort the playerScores array based on the score difference in descending order
  playerScores.sort(function (firstItem, secondItem) {
    return secondItem.scoreDifference - firstItem.scoreDifference;
  });

  // This line was previously commented out and is not part of the active logic.
  // playerScores.sort(function(firstItem, secondItem) { return secondItem.playerOneScore - firstItem.playerOneScore; });

  // Initialize a variable to accumulate the total score
  let totalScore = 0;

  // Iterate through the sorted playerScores array
  for (let idx = 0; idx < itemCount; idx++) {
    // If the index is even, add player 1's score to the total
    if (idx % 2 === 0) {
      totalScore += playerScores[idx].playerOneScore;
      playerScores[idx].playerOneScore = 0; // Reset player 1's score for this entry
    } else {
      // If the index is odd, subtract player 2's score from the total
      totalScore -= playerScores[idx].playerTwoScore;
      playerScores[idx].playerTwoScore = 0; // Reset player 2's score for this entry
    }
  }

  // Output the final calculated total score to the console
  console.log(totalScore);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
