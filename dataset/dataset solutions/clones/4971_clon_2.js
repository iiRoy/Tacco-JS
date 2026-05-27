'use strict';

// This function processes the input to simulate a game or turn-based process.
function ProcessInput(rawData) {
  // Divide the incoming raw data string into individual lines.
  const lineSegments = rawData.split('\n');

  // Establish an object to manage character queues for three distinct players.
  const charQueues = {
    a: [...lineSegments[0]], // Player 'a's queue, initialized from the first line.
    b: [...lineSegments[1]], // Player 'b's queue, initialized from the second line.
    c: [...lineSegments[2]]  // Player 'c's queue, initialized from the third line.
  };

  // Designate the starting player.
  let currentTurn = 'a';
  // A temporary variable to hold the identifier of the subsequent player.
  let nextPlayer = '';
  // The variable that will ultimately store the identifier of the winning player.
  let finalOutcome = '';

  // Commence an indefinite loop to simulate game turns.
  while (1) {
    // Extract the next player's identifier from the current player's queue.
    nextPlayer = charQueues[currentTurn].shift();

    // Evaluate if the current player's queue has become empty.
    if (charQueues[currentTurn].length === 0) {
      // If the queue is empty, the current player is declared the winner.
      finalOutcome = currentTurn.toUpperCase();
      // Terminate the game loop.
      break;
    }

    // Transfer control to the next player.
    currentTurn = nextPlayer;
  }

  // Display the final winner to the console.
  console.log(finalOutcome);
}

// Execute the main processing function by reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
