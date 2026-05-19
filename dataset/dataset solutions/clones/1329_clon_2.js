var rawData = ""; // Variable to accumulate all input data from stdin.

// Resume the standard input stream to start receiving data.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf-8');

// Attach an event listener for the 'data' event on the standard input.
// This function is called whenever a chunk of data is received.
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk; // Append the received data chunk to our rawData string.
});

// Attach an event listener for the 'end' event on the standard input.
// This function executes once all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of strings, using newline as the delimiter.
  rawData = rawData.split("\n");

  // Parse the first line of input to determine the total number of game rounds.
  var numRounds = parseInt(rawData[0], 10);

  // Initialize score variables for the two players.
  var playerOneScore = 0; // Score for the first player (Taro in original context).
  var playerTwoScore = 0; // Score for the second player (Hanako in original context).

  // Iterate through each round of the game, starting from the second line of input.
  // The loop runs 'numRounds' times.
  for (var roundIndex = 1; roundIndex <= numRounds; roundIndex++) {
    // For the current round, split the line into two card values based on space.
    var roundCards = rawData[roundIndex].split(" ");

    // Compare the card values to determine the winner of the current round.
    if (roundCards[0] < roundCards[1]) {
      // If the second player's card is greater, they get 3 points.
      playerTwoScore += 3;
    } else if (roundCards[0] == roundCards[1]) {
      // If the cards are equal, both players receive 1 point.
      playerOneScore += 1;
      playerTwoScore += 1;
    } else {
      // If the first player's card is greater, they get 3 points.
      playerOneScore += 3;
    }
  }

  // Output the final scores of player one and player two to the console, separated by a space.
  console.log(playerOneScore, playerTwoScore);
});
