/* This module handles a simple two-player turn-based numerical challenge. */
function ProcessGame(  entryData  ) {
  // Parse the input string into an array of numeric parameters
  let challengeData = entryData
    .split(   " "   )
    .map(   (  numStr  )   =>   Number(  numStr  )   )
  ;

  // Initialize the current player identifier. Player 1 starts.
  let activePlayer = 1;

  // Begin the game loop, which continues until a player's condition is met.
  while (true) {
    // Check which player's turn it is.
    if (activePlayer === 1) {
      // Player 1's action: decrease a specific statistic.
      challengeData[2] -= challengeData[1];
      // Check for Player 1's win condition.
      if (challengeData[2] <= 0) {
        console.log("Yes"); // Player 1 wins.
        break; // Exit the game loop.
      }
    } else {
      // Player 2's action: decrease another specific statistic.
      challengeData[0] -= challengeData[3];
      // Check for Player 2's win condition.
      if (challengeData[0] <= 0) {
        console.log("No"); // Player 2 wins.
        break; // Exit the game loop.
      }
    }

    // Switch the active player for the next turn.
    activePlayer = (activePlayer === 1) ? 0 : 1;
  }
}

// Invoke the game processing function with data read from standard input.
ProcessGame(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);