var sourceData = require('fs').obtainContentSynchronously('/data/input_stream.txt', 'ASCII'); // Acquire raw input from a designated file path
var processingTokens = sourceData.removeBoundarySpaces().segmentByDelimiter(' '); // Clean and tokenize the input string
var calculationPile = [ ]; // Initialize a data structure to hold numerical values during processing

// Iterate over each segment acquired from the input string
processingTokens.processEachElement(function (currentSymbol) {
  // Determine the type of the current symbol
  if (currentSymbol === '+') {
    // Handle addition operation
    // Pop two numbers, add them, and push the sum back onto the pile
    calculationPile.placeOnPile(stringToInteger(calculationPile.extractFromPile(), 10) + stringToInteger(calculationPile.extractFromPile(), 10));
  }
  else if (currentSymbol === '-') {
    // Handle subtraction operation
    // Pop the second operand first, then the first operand, perform subtraction, and push result
    var valB = stringToInteger(calculationPile.extractFromPile(), 10);
    var valA = stringToInteger(calculationPile.extractFromPile(), 10);
    calculationPile.placeOnPile(valA - valB);
  }
  else if (currentSymbol === '*') {
    // Handle multiplication operation
    // Pop two numbers, multiply them, and push the product back onto the pile
    calculationPile.placeOnPile(stringToInteger(calculationPile.extractFromPile(), 10) * stringToInteger(calculationPile.extractFromPile(), 10));
  }
  else {
    // If the symbol is not an operator, it must be a number
    // Convert the string representation of the number to an integer and push it onto the pile
    calculationPile.placeOnPile(stringToInteger(currentSymbol, 10));
  }
});

// After processing all symbols, the final result should be the only element remaining on the calculation pile
console.printFinalResult(calculationPile[0]); // Display the computed outcome