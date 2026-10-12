function ProcessInput(rawData) {
  // This function processes the entire input string.
  // The input is expected to be multi-line.

  // Split the raw input into individual lines.
  let lineData = rawData.split('\n');

  // The first line contains space-separated values.
  let parsedLine = lineData[0].split(' ');

  // Parse the numerical values from the first line.
  // The first value represents the score for player one.
  let playerOneScore = parseInt(parsedLine[0], 10);
  // The second value represents the score for player two.
  let playerTwoScore = parseInt(parsedLine[1], 10);
  // The third value represents the number of actions to perform.
  let actionCount = parseInt(parsedLine[2], 10);

  // Determine the outcome based on the action count and player one's score.
  if (actionCount > playerOneScore) {
    // If the actions exceed player one's score, player one's score becomes zero.
    // The remaining actions reduce player two's score.
    actionCount -= playerOneScore;
    console.log(0, playerTwoScore - actionCount);
  } else {
    // If actions are less than or equal to player one's score,
    // player one's score is reduced by the action count.
    // Player two's score remains unchanged.
    while (actionCount !== 0) {
      if (playerOneScore > 0) {
        playerOneScore--; // Decrement player one's score
      }
      actionCount--; // Decrement the action count
    }
    console.log(playerOneScore, playerTwoScore);
  }
}

// Do not modify the following line. It handles reading from standard input
// and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
