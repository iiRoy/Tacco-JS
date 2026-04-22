function obtainInput() {
  /*
   * Utilizes the Node.js file system module to perform a blocking read
   * operation on the standard input file descriptor. The 'utf-8' encoding
   * ensures proper character interpretation.
   */
  const inputContent = require('node:fs').readFileSync('/proc/self/fd/0', 'utf-8');

  // Processes the acquired string, segmenting it into an array of lines.
  // It accommodates both Windows-style (\r\n) and Unix-style (\n) line endings.
  return inputContent.split(/\r?\n/);
}

// This function constructs an array of sequential integers.
function generateSequence(startValue, endValue) {
  let numberCollection = []; // An empty list prepared for numerical elements.

  // Iterates from the initial number up to, and including, the final number.
  for (let currentNumber = startValue; currentNumber <= endValue; currentNumber++) {
    numberCollection.push(currentNumber); // Appends the current iteration's number to the collection.
  }

  return numberCollection; // Delivers the complete numerical sequence.
}

// A global data structure representing a full deck of playing cards,
// organized by their respective suits, each containing values from 1 to 13.
var cardSet = {
  Spade: generateSequence(1, 13), // All cards for the Spades suit.
  Heart: generateSequence(1, 13), // All cards for the Hearts suit.
  Club: generateSequence(1, 13), // All cards for the Clubs suit.
  Diamond: generateSequence(1, 13) // All cards for the Diamonds suit.
};


// Processes input lines to remove specific cards from the `cardSet`
// as indicated by the input. The first line of input is often a header
// or count and is therefore skipped.
obtainInput()
  .slice(1) // Discards the initial line of input.
  .every(function(currentInputLine) { // Iterates through each subsequent data line.

    // Breaks down the current line into its constituent parts: suit and rank.
    let lineParts = currentInputLine.split(' ');
    const cardSuitChar = lineParts[0]; // Extracts the character representing the card's suit.
    const cardRankNum = Number(lineParts[1]); // Converts the card's numerical rank to a number type.

    /*
     * Locates the index of the specified card rank within its suit's array
     * and then removes that single element from the array.
     */
    cardSet[cardSuitChar].splice(cardSet[cardSuitChar].indexOf(cardRankNum), 1);

    return true; // Ensures the iteration continues for all remaining lines.
  });


// This loop is intended for debugging or final output display,
// but its body is currently commented out, mirroring the original's structure.
for (let keyOfSuit in cardSet) {
  /*
  // Example usage: logs each remaining card for the current suit.
  console.log(
    cardSet[keyOfSuit]
    .map(function(individualCardValue) {
      return keyOfSuit + ' ' + individualCardValue;
    })
    .join('\n')
  );
  */
}