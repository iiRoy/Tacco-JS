function ProcessInput(rawData) {
  // Process the raw input string: trim whitespace and split into an array of characters.
  const charArray = rawData.trim().split("");
  // Determine the total number of elements in the character array.
  let arrayLength = charArray.length;

  // Define an internal utility function to compare two game choices.
  // 'myChoice' represents the player's selection, 'opponentChoice' is the other player's.
  function determineOutcome(myChoice, opponentChoice) {
    // If both choices are identical, the round is a tie.
    if (myChoice === opponentChoice) {
      return 0;
    }
    // If player chooses 'g' (rock) and opponent chooses 'p' (paper), player loses.
    if (myChoice === "g" && opponentChoice === "p") {
      return -1;
    }
    // If player chooses 'p' (paper) and opponent chooses 'g' (rock), player wins.
    if (myChoice === "p" && opponentChoice === "g") {
      return 1;
    }
    // This function assumes only 'g' and 'p' are valid inputs for the game.
  }

  // Initialize variables to track the cumulative score and counts of player's choices.
  let scoreTotal = 0; // The running total of points.
  let gChoiceCount = 0; // Counter for how many times 'g' was chosen by the player.
  let pChoiceCount = 0; // Counter for how many times 'p' was chosen by the player.

  // Iterate through each character in the input array to simulate game rounds.
  for (let charIndex = 0; charIndex < arrayLength; charIndex++) {
    // Handle the very first round differently.
    if (charIndex === 0) {
      // In the first round, the player always chooses 'g'.
      scoreTotal += determineOutcome("g", charArray[0]);
      gChoiceCount++; // Increment the 'g' choice counter.
    } else {
      // For subsequent rounds, apply a conditional strategy.
      // If the current opponent's choice is 'g' AND the player has chosen 'g' more times than 'p'.
      if (charArray[charIndex] === "g" && gChoiceCount > pChoiceCount) {
        // Player chooses 'p' in response.
        scoreTotal += determineOutcome("p", charArray[charIndex]);
        pChoiceCount++; // Increment the 'p' choice counter.
      }
      // If the current opponent's choice is 'p' AND the player has chosen 'g' more times than 'p'.
      else if (charArray[charIndex] === "p" && gChoiceCount > pChoiceCount) {
        // Player also chooses 'p' in response.
        scoreTotal += determineOutcome("p", charArray[charIndex]);
        pChoiceCount++; // Increment the 'p' choice counter.
      }
      // In all other scenarios (e.g., gChoiceCount <= pChoiceCount, or previous conditions not met).
      else {
        // Player chooses 'g'.
        scoreTotal += determineOutcome("g", charArray[charIndex]);
        gChoiceCount++; // Increment the 'g' choice counter.
      }
    }
  }
  // Output the final calculated score to the console.
  console.log(scoreTotal);
}

// Read input from the standard input stream and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
