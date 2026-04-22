const processInput = (rawData) => {
  // Store the initial numeric value from the input
  const initialValue = rawData;
  let totalSum = 0; // This variable will accumulate our calculated sum
  let remainder = initialValue; // This holds the current value being processed

  // Iterate downwards from a specific starting number
  for (let iteratorIndex = 11; iteratorIndex > 0; iteratorIndex--) {
    // Apply different multipliers based on the iterator's value
    if (iteratorIndex > 6) {
      // If the index is greater than 6, double the floored division result
      totalSum += Math.floor(remainder / iteratorIndex) * 2;
    } else {
      // Otherwise, just add the floored division result
      totalSum += Math.floor(remainder / iteratorIndex);
    }
    // Update the remainder for the next iteration of the loop
    remainder %= iteratorIndex;
  }
  // Output the final computed total sum to the console
  console.log(totalSum);
};

// Read input from standard input and pass it to our processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));