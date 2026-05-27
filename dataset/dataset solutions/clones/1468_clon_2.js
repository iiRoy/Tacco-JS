var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var dataRows = rawData.split('\n'); // Split the input into an array of lines

var playerOneScore = 0; // Initialize score for the first player
var playerTwoScore = 0; // Initialize score for the second player

// Get the number of rounds from the first line and convert to a number
var roundCount = +dataRows.shift();

// Loop through each game round
for (var currentRound = 0; currentRound < roundCount; currentRound++) {
  // Get the hands played in the current round
  var roundPlays = dataRows.shift().split(' ');

  // Extract individual player hands
  var playerOnePlay = roundPlays[0];
  var playerTwoPlay = roundPlays[1];

  // Compare the hands to determine points
  if (playerOnePlay > playerTwoPlay) {
    // Player one wins the round
    playerOneScore += 3;
  } else if (playerOnePlay < playerTwoPlay) {
    // Player two wins the round
    playerTwoScore += 3;
  } else {
    // It's a tie, both players get a point
    playerOneScore++;
    playerTwoScore++;
  }
}

// Output the final scores for both players, separated by a space
console.log(playerOneScore + ' ' + playerTwoScore);
