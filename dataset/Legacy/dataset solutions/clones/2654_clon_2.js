function processInput(rawData) {
  // Split the incoming string by spaces to get individual components.
  const parts = rawData.split(' ');

  // Parse the first component into an integer, using base 10.
  const val1 = parseInt(parts[0], 10);
  // Parse the second component into an integer, using base 10.
  const val2 = parseInt(parts[1], 10);

  // Initialize a variable to hold the maximum value found so far.
  // Start with the sum of the two numbers.
  let greatestResult = val1 + val2;

  // Check if the difference (val1 - val2) is greater than the current maximum.
  if (greatestResult < val1 - val2) {
    // If it is, update the maximum.
    greatestResult = val1 - val2;
  }

  // Check if the product (val1 * val2) is greater than the current maximum.
  if (greatestResult < val1 * val2) {
    // If it is, update the maximum.
    greatestResult = val1 * val2;
  }

  // Output the final greatest result to the console.
  console.log(greatestResult);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
