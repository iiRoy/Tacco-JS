function processInputData(inputRows) {
  // Initialize scores for the two players
  let playerOneScore = 0;
  let playerTwoScore = 0;

  // Index for navigating through the input lines
  let rowIndex = 0;
  // Parse the total number of game rounds from the first line
  const totalRounds = parseInt(inputRows[rowIndex++], 10);

  // Loop through each game round
  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    // Split the current line into card values for the round
    const roundCards = inputRows[rowIndex++].split(/\s+/);

    // Compare the card values to determine round winner
    if (roundCards[0] === roundCards[1]) {
      // If cards are equal, both players get 1 point
      playerOneScore += 1;
      playerTwoScore += 1;
    } else if (roundCards[0] > roundCards[1]) {
      // If player one's card is higher, player one gets 3 points
      playerOneScore += 3;
    } else if (roundCards[0] < roundCards[1]) {
      // If player two's card is higher, player two gets 3 points
      playerTwoScore += 3;
    }
  }
  // Output the final scores for both players
  console.log(playerOneScore, playerTwoScore);
}

// Array to store incoming data chunks from standard input
const dataParts = [];

// Event listener for 'data' event on standard input
process.stdin.on('data', function(dataSegment) {
  // Append each received data segment to the array
  dataParts.push(dataSegment);
});

// Event listener for 'end' event on standard input
process.stdin.on('end', function() {
  // Join all data segments, then split by newline to get individual input rows
  const inputRows = dataParts.join('').split('\n');
  // Call the main processing function with the prepared input rows
  processInputData(inputRows);
});
