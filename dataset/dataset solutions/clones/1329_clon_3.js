let receivedDataBuffer = ""; // Accumulates incoming data segments.

// Configure the standard input stream.
process.stdin.resume(); // Ensures the input stream is active.
process.stdin.setEncoding('utf-8'); // Sets character encoding for consistency.

// Event listener for data chunks received from stdin.
process.stdin.on('data', function(dataSegment) {
  receivedDataBuffer = receivedDataBuffer + dataSegment; // Appends each received data chunk.
});

// Helper function to evaluate a single game round and assign points.
function determineRoundScores(firstPlayerCardValue, secondPlayerCardValue) {
  const POINTS_FOR_VICTORY = 3; // Points awarded for winning a round.
  const POINTS_FOR_DRAW = 1;    // Points awarded to each player in case of a tie.

  let firstPlayerRoundScore = 0;
  let secondPlayerRoundScore = 0;

  // Cards are compared lexicographically as strings.
  if (firstPlayerCardValue < secondPlayerCardValue) {
    secondPlayerRoundScore = POINTS_FOR_VICTORY;
  } else if (firstPlayerCardValue === secondPlayerCardValue) {
    firstPlayerRoundScore = POINTS_FOR_DRAW;
    secondPlayerRoundScore = POINTS_FOR_DRAW;
  } else { // firstPlayerCardValue > secondPlayerCardValue
    firstPlayerRoundScore = POINTS_FOR_VICTORY;
  }
  return { playerOne: firstPlayerRoundScore, playerTwo: secondPlayerRoundScore };
}

// Event listener for the end of the input stream.
process.stdin.on('end', function() {
  const LINE_SEPARATOR = "\n"; // Delimiter for splitting input into individual lines.
  let allInputLines = receivedDataBuffer.split(LINE_SEPARATOR);

  // Basic validation: ensure there's at least one line for the round count.
  if (allInputLines.length === 0 || allInputLines[0].trim() === '') {
    console.error("Error: No input received or round count is missing.");
    return; // Exit if input is invalid.
  }

  // Parse the total number of game rounds from the first line.
  const totalGameRounds = Number(allInputLines[0]);

  // Validate the parsed round count.
  if (isNaN(totalGameRounds) || totalGameRounds < 0) {
    console.error(`Error: Invalid round count specified: ${allInputLines[0]}`);
    return;
  }

  // Initialize player scores using an object for better organization.
  let playerScores = {
    firstParticipant: 0, // Represents Taro's score.
    secondParticipant: 0 // Represents Hanako's score.
  };

  const CARD_VALUE_DELIMITER = " "; // Separator for card values on each line.

  // Iterate through each game round, starting from the second line (index 1).
  for (let currentRoundIdx = 1; currentRoundIdx <= totalGameRounds; ++currentRoundIdx) {
    const currentRoundLine = allInputLines[currentRoundIdx];

    // Guard against missing lines if the input is malformed.
    if (!currentRoundLine) {
      console.warn(`Warning: Missing data for round ${currentRoundIdx}. Skipping.`);
      continue;
    }

    let roundCardValues = currentRoundLine.split(CARD_VALUE_DELIMITER);

    // Validate that exactly two card values were provided for the round.
    if (roundCardValues.length !== 2) {
      console.warn(`Warning: Malformed input for round ${currentRoundIdx}. Expected 2 card values, got ${roundCardValues.length}. Skipping.`);
      continue;
    }

    const playerOneCurrentCard = roundCardValues[0];
    const playerTwoCurrentCard = roundCardValues[1];

    // Utilize the helper function to calculate points for the current round.
    const roundResults = determineRoundScores(playerOneCurrentCard, playerTwoCurrentCard);

    playerScores.firstParticipant = playerScores.firstParticipant + roundResults.playerOne;
    playerScores.secondParticipant = playerScores.secondParticipant + roundResults.playerTwo;
  }

  // Output the final accumulated scores for both participants.
  console.info(playerScores.firstParticipant, playerScores.secondParticipant);
});