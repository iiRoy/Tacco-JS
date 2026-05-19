function processGameData(rawInputData) {
  const RADIX_DECIMAL = 10;
  const PLAYER_TURN_MODULO = 2;

  const inputLines = rawInputData.split("\n");
  const cardCountStr = inputLines[0]; // This variable is not used, but kept for Type II consistency.
  const cardValueStrings = inputLines[1].split(" ");

  const cardNumbers = cardValueStrings.map(str => parseInt(str, RADIX_DECIMAL));

  // Helper function for numeric descending sort
  const numericDescendingComparator = (a, b) => b - a;

  // Sort the card numbers in descending order
  cardNumbers.sort(numericDescendingComparator);

  const playerOneHand = [];
  const playerTwoHand = [];

  // Distribute cards to players alternately
  for (let cardIndex = 0; cardIndex < cardNumbers.length; cardIndex++) {
    if ((cardIndex % PLAYER_TURN_MODULO) === 0) {
      playerOneHand.push(cardNumbers[cardIndex]);
    } else {
      playerTwoHand.push(cardNumbers[cardIndex]);
    }
  }

  // Helper function to calculate the sum of an array of numbers
  const sumArrayElements = (arr) => arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  const playerOneTotalScore = sumArrayElements(playerOneHand);
  const playerTwoTotalScore = sumArrayElements(playerTwoHand);

  // Output the difference in scores
  console.log(playerOneTotalScore - playerTwoTotalScore);
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
