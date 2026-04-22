let incomingText = ""; // Buffer for accumulating raw input from stdin

// Activate the standard input stream to listen for data
process.stdin.resume();

// Configure the character encoding for incoming data chunks
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks
process.stdin.on('data', function (dataBlock) {
  // Append each received data block to the accumulator
  incomingText += dataBlock;
});

// Event listener for when the standard input stream ends (no more data)
process.stdin.on('end', function () {
  // Once all input is received, split the entire text by newline characters
  incomingText = incomingText.split('\n');

  // Parse the first line to get the total number of game rounds
  const totalGames = parseInt(incomingText[0], 10);

  // Initialize scores for the two participants
  let firstParticipantScore = 0; // Score for the "Taro" equivalent
  let secondParticipantScore = 0; // Score for the "Hanako" equivalent

  // Loop through each game round, starting from the second line of input
  for (let gameRoundIndex = 1; gameRoundIndex <= totalGames; gameRoundIndex++) {
    // Split the current round's data by space to get individual values (e.g., card values)
    const currentRoundValues = incomingText[gameRoundIndex].split(' ');

    // Compare the two values from the current round
    if (currentRoundValues[0] < currentRoundValues[1]) {
      // If the second value is greater, second participant gets 3 points
      secondParticipantScore += 3;
    } else if (currentRoundValues[0] === currentRoundValues[1]) {
      // If values are equal, both participants get 1 point
      firstParticipantScore += 1;
      secondParticipantScore += 1;
    } else {
      // If the first value is greater, first participant gets 3 points
      firstParticipantScore += 3;
    }
  }

  // Output the final scores of both participants to the console
  console.log(firstParticipantScore, secondParticipantScore);
});