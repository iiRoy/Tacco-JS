function processInput(rawData) {
  // Convert the raw input string to a numerical value.
  const numericValue = Number(rawData);

  // Calculate the sum of the number, its square, and its cube.
  // Then, print the result to the console.
  console.log(numericValue + Math.pow(numericValue, 2) + Math.pow(numericValue, 3));
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
