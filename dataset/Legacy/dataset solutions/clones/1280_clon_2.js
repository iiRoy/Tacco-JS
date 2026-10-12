var deckGenerator = function () {
  // This function creates a standard 52-card deck.
  var cardCollection = []; // An array to store all generated card strings.
  var cardSuits = ['S', 'H', 'C', 'D']; // The four standard suits: Spades, Hearts, Clubs, Diamonds.
  var cardRanks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // The thirteen ranks: Ace to King.

  // Loop through each suit.
  for (var suitIndex = 0; suitIndex < cardSuits.length; suitIndex++) {
    // For every suit, loop through each rank.
    for (var rankIndex = 0; rankIndex < cardRanks.length; rankIndex++) {
      // Combine the current suit and rank to form a card string (e.g., "S 1", "H 13").
      // The rank is converted to a string explicitly.
      cardCollection.push(cardSuits[suitIndex] + ' ' + cardRanks[rankIndex].toString());
    }
  }
  // Return the complete array of card strings.
  return cardCollection;
};

var readInputLines = function () {
  // This function reads all lines from standard input.
  // It uses Node.js 'fs' module to read synchronously from '/dev/stdin'.
  // The content is assumed to be UTF-8 encoded and split by newline characters.
  return require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
};

var displayOutput = function (valueToPrint) {
  // This utility function prints a given value to the console.
  // It also returns the value, allowing for chaining or further use.
  console.log(valueToPrint);
  return valueToPrint;
};

// Execute the main logic:
// 1. Read all input lines from stdin.
var receivedLines = readInputLines();

// 2. Generate a full deck of cards.
// 3. Filter this deck to find cards that are NOT present in the received input lines.
deckGenerator()
  .filter(function (currentCard) {
    // The filter condition checks if the current card string is NOT found in the 'receivedLines' array.
    // 'indexOf' returns -1 if the element is not found.
    return receivedLines.indexOf(currentCard) === -1;
  })
  // 4. For each card that was not found in the input, display it using the 'displayOutput' function.
  .forEach(displayOutput);
