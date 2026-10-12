var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from stdin
var lineBuffer = (rawData.trim()).split("\n"); // Split input into an array of lines

// Main game loop continues until termination condition
while (true) {
   // Get game parameters (M: number of players, N: number of moves)
   var gameParams = lineBuffer.shift().split(" ").map(Number);

   // Check for termination condition (M=0 and N=0)
   if (gameParams[0] === 0 && gameParams[1] === 0) {
      break; // Exit the game loop
   }

   // Initialize array to hold active player IDs
   var activePlayers = [];
   // Populate players from 1 to M
   for (var idx = 0; idx < gameParams[0]; idx++) {
      activePlayers[idx] = idx + 1;
   }

   // Array to store the sequence of game moves
   var gameMoves = [];
   // Read N game moves from the input buffer
   for (var idx = 0; idx < gameParams[1]; idx++) {
      var currentMoveStr = lineBuffer.shift(); // Get the next move string
      gameMoves.push(currentMoveStr); // Add it to the moves array
   }

   var fizzBuzzCounter = 1; // Counter for FizzBuzz sequence, starts at 1
   var playerElimIndex = 0; // Index for the current player whose turn it is

   // Iterate through each game move to simulate the game
   gameMoves.forEach(function(currentMoveStr) {
      // Build the expected FizzBuzz output for the current turn
      var fizzBuzzOutput = "";
      if (fizzBuzzCounter % 3 === 0) { // Check for divisibility by 3
         fizzBuzzOutput += "Fizz";
      }
      if (fizzBuzzCounter % 5 === 0) { // Check for divisibility by 5
         fizzBuzzOutput += "Buzz";
      }
      if (fizzBuzzOutput === "") { // If no Fizz or Buzz, use the number itself
         fizzBuzzOutput = fizzBuzzCounter;
      }

      // Check if the player's move matches the expected FizzBuzz output
      if (currentMoveStr != fizzBuzzOutput) {
         activePlayers.splice(playerElimIndex, 1); // Eliminate the current player
         // Note: playerElimIndex is not decremented here.
         // The next player to be checked will be at the same playerElimIndex
         // if the array length decreases, or the next index if it doesn't.
         // The subsequent increment and wrap-around logic handles this correctly.
      }

      fizzBuzzCounter++; // Always increment the FizzBuzz sequence counter for the next turn

      // Always increment the player index for the next turn, regardless of elimination
      playerElimIndex++;

      // Wrap around the player index if it exceeds the current number of active players
      if (playerElimIndex >= activePlayers.length) {
         playerElimIndex = 0;
      }
   }); // End of forEach loop for game moves

   // Output the remaining players, space-separated
   console.log(activePlayers.join(" "));
}
