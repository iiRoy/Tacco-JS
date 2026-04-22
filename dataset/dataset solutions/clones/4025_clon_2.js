// This function processes all incoming data.
function ExecuteGame(rawData) {
  // Each line of the raw data is split into an array.
  const parsedLines = rawData.split('\n');

  // The first line often contains the total number of items, though not directly used in calculations.
  const initialCount = parsedLines[0];

  // The actual game pieces are on the second line, separated by spaces.
  const gamePieces = parsedLines[1].split(' ');

  // Arrays to hold pieces for each participant.
  const playerOnePieces = [];
  const playerTwoPieces = [];

  // Helper function to sort numerical values in descending order.
  function descendingSorter(firstVal, secondVal) {
    return firstVal < secondVal;
  }

  // Sort the game pieces from the largest value to the smallest.
  gamePieces.sort(descendingSorter);

  // Distribute pieces alternately between the two players based on their turn.
  for (let idx = 0; idx < gamePieces.length; idx++) {
    if (idx % 2 === 0) {
      playerOnePieces.push(gamePieces[idx]);
    } else {
      playerTwoPieces.push(gamePieces[idx]);
    }
  }

  // Calculate the total score for the first player by summing their collected pieces.
  const playerOneScore = playerOnePieces.map(pieceStr => parseInt(pieceStr, 10)).reduce((currentSum, currentVal) => currentSum + currentVal, 0);

  // Calculate the total score for the second player by summing their collected pieces.
  const playerTwoScore = playerTwoPieces.map(pieceStr => parseInt(pieceStr, 10)).reduce((currentSum, currentVal) => currentSum + currentVal, 0);

  // Display the final difference between player one's score and player two's score.
  console.log(playerOneScore - playerTwoScore);
}

// Invoke the main game processing function with data read from standard input.
ExecuteGame(require('fs').readFileSync('/dev/stdin', 'utf8'));