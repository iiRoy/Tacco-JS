// This function processes the input data for a card game.
function ProcessGame(rawData) {
  // The raw input string is divided into individual lines.
  var lines = rawData.split("\n");

  // The first line typically contains the number of cards, but it's not used in this logic.
  var cardCountStr = lines[0];

  // The second line contains space-separated card values.
  var cardValues = lines[1].split(" ");

  // Arrays to store cards for each player.
  var playerOneCards = [];
  var playerTwoCards = [];

  // A custom comparison function for sorting numbers in descending order.
  // This function leverages JavaScript's Array.prototype.sort behavior
  // where a positive return value means 'b' comes before 'a'.
  // For string numbers, 'valA < valB' evaluates to true (1) if 'valA' is numerically smaller than 'valB',
  // causing 'valB' to be placed before 'valA', effectively sorting in descending numerical order.
  function descendingSort(valA, valB) {
    return valA < valB;
  }

  // Sort the card values in descending order based on the custom comparison.
  cardValues.sort(descendingSort);

  // Players take turns picking cards from the sorted list.
  // Player One (Alice) picks first, then Player Two (Bob), and so on.
  for (var idx = 0; idx < cardValues.length; idx++) {
    // If the current index is even, it's Player One's turn.
    if (idx % 2 === 0) {
      playerOneCards.push(cardValues[idx]);
    }
    // Otherwise, it's Player Two's turn.
    else {
      playerTwoCards.push(cardValues[idx]);
    }
  }

  // Calculate the total score for Player One.
  // Each card value string is converted to an integer and then summed up.
  var playerOneScore = playerOneCards.map(cardStr => parseInt(cardStr, 10)).reduce((currentSum, currentVal) => currentSum + currentVal);

  // Calculate the total score for Player Two.
  // Similar to Player One, card value strings are parsed to integers and summed.
  var playerTwoScore = playerTwoCards.map(cardStr => parseInt(cardStr, 10)).reduce((currentSum, currentVal) => currentSum + currentVal);

  // Output the difference between Player One's score and Player Two's score.
  console.log(playerOneScore - playerTwoScore);
}

// Read the entire input from standard input, assuming UTF-8 encoding.
// Then, pass the read content to the main processing function.
ProcessGame(require("fs").readFileSync("/dev/stdin", "utf8"));
