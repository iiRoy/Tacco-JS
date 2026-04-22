function ProcessInputData(rawText) {
  // This line preprocesses the raw input string.
  // It removes leading/trailing whitespace and then splits it into an array of individual characters.
  let inputChars = rawText
    .trim()
    .split("");

  // 'charCount' stores the total number of characters obtained from the input.
  let charCount = inputChars.length;

  // The 'DetermineOutcome' function evaluates the result of a single round of interaction.
  // 'playerChoice' represents the action taken by the player.
  // 'opponentChoice' represents the action taken by the opposing entity.
  function DetermineOutcome(playerChoice, opponentChoice) {
    // If both participants choose the same action, the round is a draw.
    if (playerChoice === opponentChoice) {
      return 0; // A score of zero indicates no change in points.
    }

    // This block defines a specific rule: if the player chooses 'g' and the opponent chooses 'p'.
    if (playerChoice === "g" && opponentChoice === "p") {
      return -1; // The player loses one point in this scenario.
    }

    // This block defines another specific rule: if the player chooses 'p' and the opponent chooses 'g'.
    if (playerChoice === "p" && opponentChoice === "g") {
      return 1; // The player gains one point in this scenario.
    }
  } // End of DetermineOutcome function.

  // 'scoreAccumulator' keeps track of the player's total score throughout the game.
  let scoreAccumulator = 0;
  // 'firstOptionWins' counts how many times the player chose the 'g' strategy.
  let firstOptionWins = 0;
  // 'secondOptionWins' counts how many times the player chose the 'p' strategy.
  let secondOptionWins = 0;

  // A loop to iterate through each character in the processed input array.
  for (let currentIndex = 0; currentIndex < charCount; currentIndex++) {
    // Special logic applied only to the very first character in the sequence.
    if (currentIndex === 0) {
      // For the initial move, the player always defaults to the 'g' choice.
      scoreAccumulator += DetermineOutcome("g", inputChars[0]);
      firstOptionWins++; // Increment the count for the 'g' strategy.
    }
    // Logic for all subsequent characters after the first one.
    else {
      // Condition 1: If the current opponent's action is 'g' AND the 'g' strategy has been
      // utilized more frequently than the 'p' strategy by the player.
      if (inputChars[currentIndex] === "g" && firstOptionWins > secondOptionWins) {
        // In this specific case, the player chooses the 'p' strategy.
        scoreAccumulator += DetermineOutcome("p", inputChars[currentIndex]);
        secondOptionWins++; // Increment the count for the 'p' strategy.
      }
      // Condition 2: If the current opponent's action is 'p' AND the 'g' strategy has been
      // utilized more frequently than the 'p' strategy by the player.
      else if (inputChars[currentIndex] === "p" && firstOptionWins > secondOptionWins) {
        // Again, in this case, the player chooses the 'p' strategy.
        scoreAccumulator += DetermineOutcome("p", inputChars[currentIndex]);
        secondOptionWins++; // Increment the count for the 'p' strategy.
      }
      // Default case: If none of the above specific conditions are met.
      else {
        // The player defaults to choosing the 'g' strategy.
        scoreAccumulator += DetermineOutcome("g", inputChars[currentIndex]);
        firstOptionWins++; // Increment the count for the 'g' strategy.
      }
    }
  } // End of iteration loop.

  // After processing all characters, the final accumulated score is printed to the console.
  console.log(scoreAccumulator);
} // End of ProcessInputData function.

// This line reads the input from standard input, decodes it as UTF-8,
// and then passes it to our main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));