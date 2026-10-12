function processInput(inputLines) {
  // This object will store the state of each card, initially all present.
  var cardRegistry = {};
  // Define the four standard suit types for a deck of cards.
  var suitTypes = ['S', 'H', 'C', 'D'];

  // Iterate through each suit type.
  for (var suitIndex = 0; suitIndex < suitTypes.length; suitIndex++) {
    // For each suit, iterate through card ranks from 1 (Ace) to 13 (King).
    for (var rankValue = 1; rankValue <= 13; rankValue++) {
      // Construct the card identifier string (e.g., "S 1", "H 13")
      // and mark it as present in our registry.
      cardRegistry[suitTypes[suitIndex] + ' ' + rankValue] = true;
    }
  }

  // Now, process the input lines to mark cards that have been "removed" or "seen".
  // The first line typically contains the count, so we skip it and start from the second.
  for (var lineIterator = 1; lineIterator < inputLines.length; lineIterator++) {
    // Mark the card specified in the current input line as not present.
    cardRegistry[inputLines[lineIterator]] = false;
  }

  // Finally, iterate through all possible cards in our registry.
  for (var currentCardKey in cardRegistry) {
    // If a card is still marked as 'true', it means it was not present in the input,
    // so it's a missing card.
    if (cardRegistry[currentCardKey]) {
      // Print the identifier of the missing card to standard output.
      console.log(currentCardKey);
    }
  }
}

// Array to accumulate data chunks received from standard input.
var inputBufferParts = [];

// Event listener for incoming data from stdin.
process.stdin.on('data', function(dataSegment) {
  // Append each received data chunk to our buffer array.
  inputBufferParts.push(dataSegment);
});

// Event listener for the 'end' of standard input stream.
process.stdin.on('end', function() {
  // Join all buffered data chunks into a single string,
  // then split it by newline characters to get an array of lines.
  var inputLines = inputBufferParts.join('').split('\n');
  // Call the main processing function with the parsed input lines.
  processInput(inputLines);
});
