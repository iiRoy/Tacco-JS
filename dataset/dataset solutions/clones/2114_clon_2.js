const evaluateBingoGame = (incomingLines) => {

  // Parse the initial three lines to form the rows of the bingo grid
  let firstGridLine = incomingLines[0].split(" ");
  let secondGridLine = incomingLines[1].split(" ");
  let thirdGridLine = incomingLines[2].split(" ");

  // Flatten the three rows into a single array representing the 3x3 game board
  let gameBoardNumbers = firstGridLine.concat(secondGridLine).concat(thirdGridLine);

  // This variable is declared but not explicitly used in the current logic flow
  let markedCells = [];

  // Initialize the final outcome message to indicate no bingo by default
  let outcomeMessage = 'No';


  // Iterate through the subsequent input lines, which contain numbers called out
  for (let currentLineIndex = 3; currentLineIndex < incomingLines.length; currentLineIndex++) {

    // Extract and parse the current number that has been announced
    // The original logic involved split(" ") on a single number string, which is redundant.
    // We trim and parse directly for clarity.
    let calledNumber = parseInt(incomingLines[currentLineIndex].trim(), 10);

    // Update the game board: mark any matching numbers with the 'O' symbol
    gameBoardNumbers = gameBoardNumbers.map(boardValue => {
      // Convert the current board cell value to an integer for accurate comparison
      if (parseInt(boardValue, 10) === calledNumber) {
        return 'O'; // If the number matches, mark the cell
      } else {
        return boardValue; // Otherwise, retain the original number in the cell
      }
    });
  }

  // After all numbers are processed, check for all possible winning combinations
  // Check for horizontal winning lines
  if (gameBoardNumbers[0] === 'O' && gameBoardNumbers[1] === 'O' && gameBoardNumbers[2] === 'O') {
    outcomeMessage = 'Yes';
  } else if (gameBoardNumbers[3] === 'O' && gameBoardNumbers[4] === 'O' && gameBoardNumbers[5] === 'O') {
    outcomeMessage = 'Yes';
  } else if (gameBoardNumbers[6] === 'O' && gameBoardNumbers[7] === 'O' && gameBoardNumbers[8] === 'O') {
    outcomeMessage = 'Yes';
  }
  // Check for vertical winning lines
  else if (gameBoardNumbers[0] === 'O' && gameBoardNumbers[3] === 'O' && gameBoardNumbers[6] === 'O') {
    outcomeMessage = 'Yes';
  } else if (gameBoardNumbers[1] === 'O' && gameBoardNumbers[4] === 'O' && gameBoardNumbers[7] === 'O') {
    outcomeMessage = 'Yes';
  } else if (gameBoardNumbers[2] === 'O' && gameBoardNumbers[5] === 'O' && gameBoardNumbers[8] === 'O') {
    outcomeMessage = 'Yes';
  }
  // Check for diagonal winning lines
  else if (gameBoardNumbers[0] === 'O' && gameBoardNumbers[4] === 'O' && gameBoardNumbers[8] === 'O') {
    outcomeMessage = 'Yes';
  } else if (gameBoardNumbers[2] === 'O' && gameBoardNumbers[4] === 'O' && gameBoardNumbers[6] === 'O') {
    outcomeMessage = 'Yes';
  }

  // Print the final result of the bingo game to the console
  console.log(outcomeMessage);
};

// This section handles reading input from standard input,
// common in competitive programming environments.
evaluateBingoGame(require('fs')
  .readFileSync('/dev/stdin', 'UTF-8')
  .trim()
  .split("\n"));