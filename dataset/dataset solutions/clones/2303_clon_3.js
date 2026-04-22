'use strict'

function computeGameOutcome(rawDataPayload) {
  // Basic validation for the input data structure
  if (!rawDataPayload || typeof rawDataPayload !== 'string') {
    console.error("Error: Invalid raw input payload provided.");
    return; // Or throw an error
  }

  // Split the raw input into individual lines for processing
  const inputLines = rawDataPayload.trim().split('\n');

  // Ensure we have at least 3 lines of input as expected
  if (inputLines.length < 3) {
    console.error("Error: Insufficient input lines. Expected at least 3.");
    return;
  }

  // Parse the first line for game configuration parameters
  const gameConfigurationStr = inputLines[0].split(' ');
  const totalRounds = Number(gameConfigurationStr[0]);
  const cooldownThreshold = Number(gameConfigurationStr[1]);

  // Validate parsed configuration values
  if (isNaN(totalRounds) || totalRounds <= 0 || isNaN(cooldownThreshold) || cooldownThreshold < 0) {
    console.error("Error: Invalid game configuration values (totalRounds or cooldownThreshold).");
    return;
  }

  // Parse the second line for winning scores for each hand type
  const handScoresStr = inputLines[1].split(' ');
  const scoreForRockWin = Number(handScoresStr[0]);     // Score if we win against 's' (our 'r')
  const scoreForScissorsWin = Number(handScoresStr[1]); // Score if we win against 'p' (our 's')
  const scoreForPaperWin = Number(handScoresStr[2]);    // Score if we win against 'r' (our 'p')

  // Create a lookup map for scores based on opponent's move
  // 'r' (rock) opponent means we play 'p' (paper) to win, getting 'scoreForPaperWin'
  // 's' (scissors) opponent means we play 'r' (rock) to win, getting 'scoreForRockWin'
  // 'p' (paper) opponent means we play 's' (scissors) to win, getting 'scoreForScissorsWin'
  const winningMoveScores = {
    'r': scoreForPaperWin,
    's': scoreForRockWin,
    'p': scoreForScissorsWin
  };

  // Get the sequence of opponent's moves
  const opponentMoveSequence = inputLines[2];

  // Initialize an array to store the score for each successful round
  let accumulatedRoundScores = [];

  // Iterate through each round of the game
  for (let currentRoundIdx = 0; currentRoundIdx < totalRounds; ++currentRoundIdx) {
    const currentOpponentPlay = opponentMoveSequence[currentRoundIdx];
    let roundPoints = 0; // Default points for the current round

    // Check if the current move is subject to a cooldown penalty
    // This occurs if the same winning move was made 'cooldownThreshold' rounds ago
    // AND that previous move actually contributed points (was not already a penalty round)
    const previousRelevantRoundIdx = currentRoundIdx - cooldownThreshold;
    if (
      previousRelevantRoundIdx >= 0 &&
      opponentMoveSequence[previousRelevantRoundIdx] === currentOpponentPlay &&
      accumulatedRoundScores[previousRelevantRoundIdx] > 0
    ) {
      // If a cooldown penalty applies, this round yields no points
      roundPoints = 0;
    } else {
      // Otherwise, calculate points based on the opponent's current move
      // Use the lookup map for cleaner score assignment
      if (winningMoveScores.hasOwnProperty(currentOpponentPlay)) {
        roundPoints = winningMoveScores[currentOpponentPlay];
      }
      // If opponentMoveSequence contains unexpected characters, roundPoints remains 0, which is a sensible default.
    }

    // Record the points for the current round
    accumulatedRoundScores.push(roundPoints);
  }

  // Calculate the total score by summing up all round scores
  const finalTotalScore = accumulatedRoundScores.reduce((totalSum, currentValue) => totalSum + currentValue, 0);

  // Output the final calculated score
  console.log(finalTotalScore);
}

// Entry point for execution, reading from standard input
computeGameOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));