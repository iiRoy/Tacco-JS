/* This module analyzes two numbers from an input string to determine parity of their product. */
function processInputData(rawDataString) {
  // Split the raw input string by space characters to get individual value tokens.
  let tokenizedValues = rawDataString.split(" ");

  // Parse the first token as an integer with base 10.
  let firstNumber = parseInt(tokenizedValues[0], 10);

  // Parse the second token as an integer, also with base 10.
  let secondNumber = parseInt(tokenizedValues[1], 10);

  // Check if the product of the two numbers is an even number.
  // An even number has a remainder of 0 when divided by 2.
  if (firstNumber * secondNumber % 2 === 0) {
    console.log("Even"); // Output 'Even' if the product is even.
  }
  else {
    console.log("Odd"); // Otherwise, output 'Odd' if the product is odd.
  }
}

// Invoke the primary processing function with data read from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));