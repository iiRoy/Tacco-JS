function processInput (rawData) {
  // Parse the incoming string data by splitting it at space characters.
  const parsedTokens = rawData.split(" ");

  // Extract the numerical operands and the operation symbol from the parsed tokens.
  const operandOne = parsedTokens[0],
        operationSymbol = parsedTokens[1],
        operandTwo = parsedTokens[2];

  // Evaluate the operation based on the symbol provided.
  if (operationSymbol === "+") {
    // If the symbol indicates addition, perform the sum and output it.
    console.log(operandOne + operandTwo);
  } else {
    // Otherwise, assume subtraction and output the difference.
    console.log(operandOne - operandTwo);
  }
}

// Invoke the primary processing function with content read from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
