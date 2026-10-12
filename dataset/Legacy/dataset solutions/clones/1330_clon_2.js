'use strict'; // Enable strict mode for better error handling and cleaner code.

(function(inputDataStream) {
  // Read the entire input stream, convert it to a string, and then split it into an array of lines.
  var inputLinesArray = inputDataStream.toString().split('\n');

  // This immediately-invoked function expression (IIFE) processes the game data.
  var finalGameScores = (function(matchRecords) {
    // The core logic uses the reduce method to aggregate scores from individual matches.
    return matchRecords
      .reduce(function(currentScores, singleMatchString) {
        // Each match string contains two scores separated by a space.
        var playerScores = singleMatchString.split(' ');

        // Evaluate the outcome of the match and update the scores accordingly.
        switch (true) {
          // If the first player's score is greater, they win.
          case playerScores[0] > playerScores[1]:
            currentScores[0] += 3; // Player 1 gets 3 points.
            return currentScores;
          // If the second player's score is greater, they win.
          case playerScores[0] < playerScores[1]:
            currentScores[1] += 3; // Player 2 gets 3 points.
            return currentScores;
          // If scores are equal, it's a draw.
          default:
            currentScores[0] += 1; // Both players get 1 point.
            currentScores[1] += 1;
            return currentScores;
        }
      }, [0, 0]) // Initialize the score array for two players, starting with zero points each.
      .join(' '); // Convert the final score array back into a space-separated string.

  }(
    // Before processing, extract the actual match data.
    // The first line of input indicates the total number of matches, which is removed from the array.
    inputLinesArray.slice(0, inputLinesArray.shift())
  ));

  // Display the computed final scores to the standard output.
  console.log(finalGameScores);

}(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read the input content from the standard input file path.
