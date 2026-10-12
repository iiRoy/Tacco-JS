function ProcessGame(gameData) {
  // The input string contains all the data for the game.
  var dataLines = gameData.split('\n');
  var finalWinner; // Variable to store the ultimate winner of the game.

  // Initialize the sequence of characters from the first line of input.
  var characterSequence = dataLines[0].split('');
  // Set the initial player.
  var activePlayer = 'First';

  /**
   * Removes a character from the sequence based on the provided indices.
   * @param {number[]} positionIndices - An array containing three indices [idx0, idx1, idx2].
   *                                     The character at idx1 is removed.
   */
  function removeCharacter(positionIndices) {
    // Remove one element at the specified middle index.
    characterSequence.splice(positionIndices[1], 1);
    // Log the current state of the character sequence after removal.
    console.log(characterSequence);
  }

  /**
   * Determines if a move is valid based on the characters at the given indices.
   * A move is valid if the characters at the first and third indices are different.
   * @param {number[]} positionIndices - An array containing three indices [idx0, idx1, idx2].
   * @returns {boolean} True if the move is valid, false otherwise.
   */
  function isValidMove(positionIndices) {
    // Check if the characters at the first and third positions are not identical.
    return !(characterSequence[positionIndices[0]] === characterSequence[positionIndices[2]]);
  }

  /**
   * Executes a single turn for the current player.
   * The player attempts to find a valid move (a triplet of characters where the first and third differ).
   * If a valid move is found, the middle character is removed, and the function returns true.
   * If no valid move is found after checking all possible triplets, the function returns false.
   * @param {string[]} currentSequence - The array of characters for the current game state.
   * @returns {boolean} True if a move was successfully made, false otherwise.
   */
  function executePlayerMove(currentSequence) {
    var positionIndices; // Array to hold the three indices for a potential move.

    // Iterate through the character sequence to find a valid triplet.
    // The loop runs up to (length - 2) to ensure there are always three characters for a triplet.
    for (var idx = 0; idx < (currentSequence.length - 2); idx++) {
      // Define the triplet of indices.
      positionIndices = [idx, idx + 1, idx + 2];

      // Log the indices being considered for the current move.
      console.log(positionIndices);
      // Check if the current triplet constitutes a valid move.
      if (isValidMove(positionIndices)) {
        // If valid, perform the character removal.
        removeCharacter(positionIndices);
        // A move was made, so return true.
        return true;
      }

      // Continue to the next iteration if the current triplet is not a valid move.
      continue;
    }
    // If the loop completes without finding any valid moves, return false.
    return false;
  }

  /**
   * Manages the game flow, cycling turns between players until no more moves can be made.
   */
  function runGameLoop() {
    // The game continues indefinitely until a player cannot make a move.
    while (true) {
      // Attempt to execute a move for the current player.
      if (executePlayerMove(characterSequence) === false) {
        // If no move can be made, the game ends.
        return;
      }

      // Switch to the next player for the subsequent turn.
      if (activePlayer === 'First') {
        activePlayer = 'Second';
      } else {
        activePlayer = 'First';
      }
    }
  }

  // Start the main game loop.
  runGameLoop();

  // Determine the final winner based on whose turn it is when the game ends.
  // The player who *cannot* make a move loses, so the *other* player wins.
  if (activePlayer === 'First') {
    finalWinner = 'Second';
  } else {
    finalWinner = 'First';
  }

  // Output the name of the winning player.
  console.log(finalWinner);
}

// This line should not be modified (it handles reading input and calling the main function).
ProcessGame(require("fs").readFileSync("/dev/stdin", "utf8"));
