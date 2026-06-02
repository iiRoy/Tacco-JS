'use strict';
(function(inputDataSource) {
  var allInputLines = inputDataSource.toString().split('\n');

  // Helper function to process each game round and update scores
  function tallyRoundScores(currentTotalScores, roundDataString) {
    var individualRoundScores = roundDataString.split(' ');
    var playerOneRoundScore = individualRoundScores[0]; // Stays as string for comparison
    var playerTwoRoundScore = individualRoundScores[1]; // Stays as string for comparison

    // Using if/else if/else instead of switch(true)
    if (playerOneRoundScore > playerTwoRoundScore) {
      currentTotalScores[0] += 3;
    } else if (playerOneRoundScore < playerTwoRoundScore) {
      currentTotalScores[1] += 3;
    } else { // Scores are equal (tie)
      currentTotalScores[0] += 1;
      currentTotalScores[1] += 1;
    }
    return currentTotalScores;
  }

  // Determine the number of game rounds to process from the first line
  var numberOfGameRounds = parseInt(allInputLines.shift(), 10);

  // Extract only the relevant game round data
  var gameRoundEntries = allInputLines.slice(0, numberOfGameRounds);

  // Initialize the score accumulator for both players
  var initialScoreAccumulator = [0, 0];

  // Calculate the final scores by reducing the game round entries
  var finalCalculatedScores = gameRoundEntries.reduce(tallyRoundScores, initialScoreAccumulator);

  // Format the final scores into a space-separated string
  var formattedScoreOutput = finalCalculatedScores.join(' ');

  // Output the final result
  console.log(formattedScoreOutput);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
