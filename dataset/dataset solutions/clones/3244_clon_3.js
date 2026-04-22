// This function orchestrates the entire data processing pipeline.
// It reads raw input, parses it, executes the core game logic,
// and then displays the final computed result.
function processInputData(rawData) {
  // Defensive check for empty or invalid input string.
  if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
    console.error("Error: Input data is empty or invalid. Please provide valid text input.");
    return; // Terminate execution if input is not usable.
  }

  // Split the entire input string into individual lines for processing.
  const inputLines = rawData.split('\n');

  // The first line is expected to contain the total number of data pairs (N).
  // Attempt to parse this value, ensuring it's a valid positive integer.
  const numberOfPairsString = inputLines[0];
  const totalGamePairs = parseInt(numberOfPairsString, 10);

  // Validate the parsed number of pairs.
  if (isNaN(totalGamePairs) || totalGamePairs <= 0) {
    console.error(`Error: Invalid number of game pairs specified: "${numberOfPairsString}". Expected a positive integer.`);
    return;
  }

  // Initialize two mutable arrays to store the scores for each player.
  // Using 'let' as these arrays will be populated dynamically.
  let playerOneScores = [];
  let playerTwoScores = [];

  // Populate the score arrays from the subsequent input lines.
  // Each line after the first is expected to contain two space-separated integers.
  for (let i = 1; i <= totalGamePairs; i++) {
    const currentLine = inputLines[i];
    
    // Validate that a line exists for the current pair.
    if (!currentLine) {
        console.error(`Error: Missing data for game pair ${i}. Input ended prematurely.`);
        return;
    }
    
    const scoreStrings = currentLine.split(' ');
    
    // Validate the format of the score data on the current line.
    if (scoreStrings.length < 2) {
        console.error(`Error: Incomplete score data on line ${i + 1}. Expected two scores, found ${scoreStrings.length}.`);
        return;
    }

    // Parse individual scores for Player 1 and Player 2.
    const p1Score = parseInt(scoreStrings[0], 10);
    const p2Score = parseInt(scoreStrings[1], 10);

    // Validate that parsed scores are indeed numbers.
    if (isNaN(p1Score) || isNaN(p2Score)) {
        console.error(`Error: Non-numeric score detected on line ${i + 1}. Values were "${scoreStrings[0]}" and "${scoreStrings[1]}".`);
        return;
    }

    // Add the validated scores to their respective player arrays.
    playerOneScores.push(p1Score);
    playerTwoScores.push(p2Score);
  }

  // Execute the core game logic to compute the final score.
  // We pass shallow copies of the initial score arrays to emphasize that
  // the game logic operates on its own dataset, preventing external side effects.
  const finalGameOutcome = calculateGameResult([...playerOneScores], [...playerTwoScores], totalGamePairs);
  
  // Display the final computed result to the console.
  console.log(finalGameOutcome);
}

// This function simulates a game where players take turns picking scores
// from a shared pool of pairs. It calculates the cumulative score based on
// specific selection rules and turn-based additions/subtractions.
// Parameters:
// - p1InitialScores: An array representing Player 1's initial available scores.
// - p2InitialScores: An array representing Player 2's initial available scores.
// - roundsToPlay: The total number of rounds to be played in the game.
// Returns: The final cumulative score after all rounds are completed.
function calculateGameResult(p1InitialScores, p2InitialScores, roundsToPlay) {
  // Handle edge cases for the number of rounds.
  if (roundsToPlay < 0) {
    console.warn("Warning: Negative number of rounds specified. Adjusting to 0 rounds.");
    return 0; // A negative round count doesn't make sense, so return 0.
  }
  if (roundsToPlay === 0) {
    return 0; // If no rounds, the score remains 0.
  }

  // Create a combined array of score objects for easier management.
  // Each object represents a pair of scores available for a round.
  let activeGamePairs = p1InitialScores.map((p1Val, index) => ({
    playerOneValue: p1Val,
    playerTwoValue: p2InitialScores[index]
  }));

  // Initialize the accumulator for the game's final score.
  let cumulativeGameScore = 0;

  // Iterate through each round of the game.
  for (let currentRoundIndex = 0; currentRoundIndex < roundsToPlay; currentRoundIndex++) {
    // Determine whose turn it is based on the round index parity.
    // Player 1 takes even rounds (0, 2, 4...), Player 2 takes odd rounds (1, 3, 5...).
    const isPlayerOnesTurn = (currentRoundIndex % 2 === 0);

    let chosenPairIndex;    // Index of the pair chosen in the current round.
    let selectedScoreValue; // The specific score value added/subtracted this round.

    // Player 1's turn: selects a pair based on their score, tie-broken by Player 2's score.
    if (isPlayerOnesTurn) {
      // Find the optimal pair index by considering Player 1's values as primary
      // and Player 2's values as tie-breakers.
      chosenPairIndex = findOptimalIndex(
        activeGamePairs.map(pair => pair.playerOneValue),
        activeGamePairs.map(pair => pair.playerTwoValue)
      );
      // Add Player 1's score from the chosen pair to the cumulative total.
      selectedScoreValue = activeGamePairs[chosenPairIndex].playerOneValue;
      cumulativeGameScore += selectedScoreValue;
    }
    // Player 2's turn: selects a pair based on their score, tie-broken by Player 1's score.
    else {
      // Find the optimal pair index by considering Player 2's values as primary
      // and Player 1's values as tie-breakers.
      chosenPairIndex = findOptimalIndex(
        activeGamePairs.map(pair => pair.playerTwoValue),
        activeGamePairs.map(pair => pair.playerOneValue)
      );
      // Subtract Player 2's score from the chosen pair from the cumulative total.
      selectedScoreValue = activeGamePairs[chosenPairIndex].playerTwoValue;
      cumulativeGameScore -= selectedScoreValue;
    }

    // After a pair is chosen, it is removed from the available pool.
    // A robust check ensures the index is valid before attempting to splice.
    if (chosenPairIndex >= 0 && chosenPairIndex < activeGamePairs.length) {
        activeGamePairs.splice(chosenPairIndex, 1);
    } else {
        // This scenario indicates a critical error in the selection logic,
        // as findOptimalIndex should always return a valid index for a non-empty array.
        console.error(`Logic Error: findOptimalIndex returned an invalid index (${chosenPairIndex}) for round ${currentRoundIndex}.`);
        break; // Halt the game to prevent further errors or crashes.
    }
  }

  // Return the final calculated score after all rounds are played.
  return cumulativeGameScore;
}

// This utility function determines the index of the "best" element in a primary array,
// using a secondary array for tie-breaking.
// The "best" element is defined as the maximum value found in 'primaryArray'.
// If multiple elements share the maximum value, the one with the largest
// corresponding value in 'tiebreakerArray' is chosen. If there are still ties
// (same max value, same tie-breaker value), the rightmost (highest index)
// among them is selected.
// Parameters:
// - primaryArray: The array whose maximum value is being sought.
// - tiebreakerArray: The array used to resolve ties in 'primaryArray'.
// Returns: The zero-based index of the optimal element, or -1 if primaryArray is empty.
function findOptimalIndex(primaryArray, tiebreakerArray) {
  // Handle the edge case of an empty primary array.
  if (!primaryArray || primaryArray.length === 0) {
    return -1; // No elements to choose from.
  }

  // Initialize the tracking variables with the first element's data.
  let currentBestIndex = 0;
  let currentMaxValue = primaryArray[0];
  let currentMaxTiebreakerValue = tiebreakerArray[0];

  // Iterate through the array starting from the second element.
  // The loop condition `i < primaryArray.length` correctly covers all valid indices.
  for (let i = 1; i < primaryArray.length; i++) {
    const candidateValue = primaryArray[i];
    const candidateTiebreaker = tiebreakerArray[i];

    // If a new strictly greater maximum value is found, update all tracking variables.
    if (candidateValue > currentMaxValue) {
      currentMaxValue = candidateValue;
      currentMaxTiebreakerValue = candidateTiebreaker;
      currentBestIndex = i;
    }
    // If the candidate value is equal to the current maximum,
    // use the tiebreaker array to make a decision.
    else if (candidateValue === currentMaxValue) {
      // If the candidate's tiebreaker value is greater than or equal to
      // the current best tiebreaker value, then this candidate becomes the new best.
      // The "greater than or equal" condition ensures that if multiple elements
      // have the same max primary value AND same max tiebreaker value,
      // the one with the highest index (rightmost) is chosen, matching the original logic.
      if (candidateTiebreaker >= currentMaxTiebreakerValue) {
        currentMaxTiebreakerValue = candidateTiebreaker;
        currentBestIndex = i;
      }
    }
  }

  // Return the index of the determined optimal element.
  return currentBestIndex;
}

// Entry point for execution: Reads input from standard input and processes it.
// This part is typically environment-specific and is kept consistent with common
// competitive programming input methods.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));