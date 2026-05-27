function executeProgram() {
  // Declare variables for processing card hands.
  let cardValues; // Renamed 'hands'
  let uniqueCardsMap; // Renamed 'pattern'
  let tempValue; // Renamed 'swap'
  let inputIndex = 0x0; // Renamed 'i', changed literal representation
  let loopCounter; // Renamed 'j'

  // Main processing loop: continues until a specific termination condition is met.
  for (;;) {
    // Check if the current input line indicates termination (a '0').
    if (rawData[inputIndex] === '0') { // Renamed 'input', used strict equality for string '0'
      break; // Exit the infinite loop.
    }

    // Initialize an array to store the five card values for the current hand.
    cardValues = []; // Renamed 'hands'

    // Populate the 'cardValues' array with five numbers from the input.
    for (loopCounter = 0; loopCounter < 0b101; loopCounter++) { // Renamed 'j', changed literal '5'
      cardValues.push(Number(rawData[inputIndex++])); // Renamed 'hands', 'input', 'i'
    }

    // Create a map (object) to track the presence of unique card values in the hand.
    uniqueCardsMap = cardValues.reduce(function (cardPresence, currentCard) { // Renamed 'pattern', 'hands', 'pat', 'h'
      cardPresence[currentCard] = true; // Mark the current card as present.
      return cardPresence; // Return the updated map.
    }, {}); // Start with an empty object.

    // Extract unique card values, convert them to numbers, and sort them numerically.
    const sortedUniqueCards = Object.keys(uniqueCardsMap) // Renamed 'keys', 'pattern'
      .map(Number) // Convert string keys to actual numbers.
      .sort(function (valA, valB) { // Renamed 'x', 'y' for sort function arguments.
        return valA - valB; // Sort in ascending numerical order.
      });

    // Conditional logic based on the number of unique card values found.
    if (sortedUniqueCards.length === 0x2) { // Renamed 'keys', changed literal '2'
      // If there are exactly two unique cards, apply specific reordering logic.
      if (sortedUniqueCards[0x1] - sortedUniqueCards[0x0] === 0x2) { // Renamed 'keys', changed literals '1', '0', '2'
        // If the difference between the two unique cards is 2, swap their positions.
        tempValue = sortedUniqueCards[0x0]; // Renamed 'swap', 'keys', changed literal '0'
        sortedUniqueCards[0x0] = sortedUniqueCards[0x1]; // Renamed 'keys', changed literals '0', '1'
        sortedUniqueCards[0x1] = tempValue; // Renamed 'keys', changed literal '1'
      }
      // For each card in the original hand, print its 1-based index in the sorted unique list.
      cardValues.forEach(function (individualCard) { // Renamed 'hands', 'h'
        console.log(sortedUniqueCards.indexOf(individualCard) + 0x1); // Renamed 'keys', changed literal '1'
      });
    } else {
      // If the number of unique cards is not two, print a default value for each card.
      cardValues.forEach(function () { // Renamed 'hands'
        console.log(0x3); // Changed literal '3'
      });
    }
  }
}

// Global variable to store the raw input received from standard input.
let rawData = ''; // Renamed 'input'

// Configure standard input stream.
process.stdin.resume(); // Ensures the process stays alive to receive input.
process.stdin.setEncoding('utf8'); // Sets the encoding for incoming data.

// Event listener for when data chunks are received from stdin.
process.stdin.on('data', function(dataChunk) { // Renamed 'chunk'
  rawData += dataChunk; // Append the received data chunk to the 'rawData' string.
});

// Event listener for when the standard input stream ends.
process.stdin.on('end', function() {
  rawData = rawData.split('\n'); // Split the accumulated raw data into an array of lines.
  executeProgram(); // Call the main program execution function.
});
