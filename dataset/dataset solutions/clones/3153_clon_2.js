function processInput(rawData) {
  // Split the incoming string data by spaces to get individual parameters.
  const parameters = rawData.split(' ');

  // Convert the string parameters into numerical values.
  let firstNum = Number(parameters[0]);
  let secondNum = Number(parameters[1]);
  let targetRank = Number(parameters[2]);

  // Create an array with the two numbers, ensuring the smaller one is at index 0.
  // This simplifies the loop's starting point.
  let sortedPair = firstNum < secondNum ? [firstNum, secondNum] : [secondNum, firstNum];

  // Initialize variables for the iteration process.
  let currentDivisor = 0; // This will hold the potential common divisor.
  let resultValue;       // This variable will store the K-th common divisor when found.
  let foundCount = 0;    // Tracks how many common divisors have been identified.

  // Iterate downwards from the smaller of the two numbers.
  // A common divisor cannot be larger than the smaller of the two numbers.
  for (currentDivisor = sortedPair[0]; currentDivisor > 0; --currentDivisor) {
    // Check if the current number divides both elements of the pair without a remainder.
    if (Number.isInteger(sortedPair[0] / currentDivisor) && Number.isInteger(sortedPair[1] / currentDivisor)) {
      // If it's a common divisor, increment the count.
      foundCount++;

      // If this is the K-th common divisor we are looking for, store it and stop.
      if (foundCount === targetRank) {
        resultValue = currentDivisor; // Assign the value (though 'currentDivisor' is logged directly).
        break; // Exit the loop early as the target has been met.
      }
    }
  }

  // Output the value of the K-th common divisor found.
  console.log(currentDivisor);
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
