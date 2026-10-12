const processGame = (inputLines) => {
  // Initialize three rows of the bingo card from the first three input lines.
  // Each line contains space-separated numbers.
  var rowOne = inputLines[0].split(" ");
  var rowTwo = inputLines[1].split(" ");
  var rowThree = inputLines[2].split(" ");

  // Concatenate the rows into a single flat array representing the 3x3 bingo board.
  var gameBoard = rowOne.concat(rowTwo).concat(rowThree);

  // This variable is declared but not used in the current logic.
  var winningPatterns = [];

  // Initialize the final result status to 'No'.
  var resultStatus = 'No';

  // Iterate through the remaining input lines, which represent called numbers.
  // Start from index 3, as the first three lines are for the board setup.
  for (var idx = 3; idx < inputLines.length; idx++) {
    // For each called number, update the game board.
    // If a number on the board matches the called number, mark it with 'O'.
    gameBoard = gameBoard.map(currentValue => {
      // Convert both the board value and the called number to actual numbers for comparison.
      // Note: inputLines[idx].split(" ") will result in an array like ["10"],
      // and Number(["10"]) correctly evaluates to 10.
      if (Number(currentValue) == Number(inputLines[idx].split(" "))) {
        return 'O'; // Mark as 'O' if it's a match.
      } else {
        return currentValue; // Otherwise, keep the original value.
      }
    });
  }

  // Check for winning conditions (bingo) across rows, columns, and diagonals.
  // Row 1 check:
  if (gameBoard[0] === 'O' && gameBoard[1] === 'O' && gameBoard[2] === 'O') {
    resultStatus = 'Yes';
  }
  // Row 2 check:
  else if (gameBoard[3] === 'O' && gameBoard[4] === 'O' && gameBoard[5] === 'O') {
    resultStatus = 'Yes';
  }
  // Row 3 check:
  else if (gameBoard[6] === 'O' && gameBoard[7] === 'O' && gameBoard[8] === 'O') {
    resultStatus = 'Yes';
  }
  // Column 1 check:
  else if (gameBoard[0] === 'O' && gameBoard[3] === 'O' && gameBoard[6] === 'O') {
    resultStatus = 'Yes';
  }
  // Column 2 check:
  else if (gameBoard[1] === 'O' && gameBoard[4] === 'O' && gameBoard[7] === 'O') {
    resultStatus = 'Yes';
  }
  // Column 3 check:
  else if (gameBoard[2] === 'O' && gameBoard[5] === 'O' && gameBoard[8] === 'O') {
    resultStatus = 'Yes';
  }
  // Diagonal (top-left to bottom-right) check:
  else if (gameBoard[0] === 'O' && gameBoard[4] === 'O' && gameBoard[8] === 'O') {
    resultStatus = 'Yes';
  }
  // Diagonal (top-right to bottom-left) check:
  else if (gameBoard[2] === 'O' && gameBoard[4] === 'O' && gameBoard[6] === 'O') {
    resultStatus = 'Yes';
  }

  // Output the final bingo status.
  console.log(resultStatus);
};

// Read input from standard input, process it, and pass it to the main function.
processGame(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
