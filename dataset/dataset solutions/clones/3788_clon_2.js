function processInputValues(rawTextData) {
  // This function takes a string, parses two numbers from it,
  // calculates their sum, difference, and product, then
  // prints the maximum of these three results.

  let numericSegments = rawTextData.split(' '); // Divide the input string by spaces.

  // Convert the first segment to a base-10 integer.
  numericSegments[0] = parseInt(numericSegments[0], 10);

  // Convert the second segment to a base-10 integer.
  numericSegments[1] = parseInt(numericSegments[1], 10);

  let combinedSum = numericSegments[0] + numericSegments[1]; // Compute the addition result.

  let combinedDifference = numericSegments[0] - numericSegments[1]; // Determine the subtraction result.

  let combinedProduct = numericSegments[0] * numericSegments[1]; // Calculate the multiplication result.

  let greatestValue = Math.max(combinedSum, combinedDifference, combinedProduct); // Find the largest among the three.

  // Check for the negative zero edge case and normalize to positive zero.
  if (greatestValue === -0) {
    greatestValue = 0;
  }

  console.log(greatestValue); // Display the final maximum value.
}

// Obtain input by synchronously reading the standard input stream
// and then pass the acquired text data to the main processing routine.
processInputValues(require('fs').readFileSync('/dev/stdin', 'utf8'));