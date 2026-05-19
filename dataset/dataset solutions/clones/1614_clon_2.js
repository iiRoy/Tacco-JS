function processInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  let lines = rawData.split('\n');

  // Remove the first line from the array. This often contains metadata like the number of elements.
  lines.shift();

  // Initialize a counter to keep track of pairs that satisfy the condition.
  let validPairCount = 0;

  // Iterate through the array using the first index, 'idxA'.
  for (let idxA = 0; idxA < lines.length; idxA++) {
    // For each 'idxA', iterate through the rest of the array using 'idxB',
    // ensuring 'idxB' is always greater than 'idxA' to form unique pairs.
    for (let idxB = idxA + 1; idxB < lines.length; idxB++) {
      // Calculate a scaled product of the two numbers.
      // Each number is multiplied by 10^9 before multiplication.
      // This effectively checks if the product of the original numbers (lines[idxA] * lines[idxB])
      // results in an integer, by checking if the scaled product is divisible by (10^9 * 10^9).
      let productValue = (lines[idxA] * 1000000000) * (lines[idxB] * 1000000000);

      // Check if the calculated 'productValue' is perfectly divisible by the square of the scaling factor (10^9 * 10^9).
      // If the remainder is 0, it means the unscaled product would have been an integer.
      if (productValue % (1000000000 * 1000000000) == 0) {
        // If the condition is met, increment the counter for valid pairs.
        validPairCount++;
      }
    }
  }

  // Output the final total count of valid pairs to the console.
  console.log(validPairCount);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
