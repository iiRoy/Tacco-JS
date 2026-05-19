const processInput = (inputData) => {
  // Initialize the starting value from the input.
  const initialValue = inputData;
  let totalOperations = 0; // This variable will accumulate the final count.
  let remainingValue = initialValue; // This variable tracks the value yet to be processed.

  // Loop through divisors from 11 down to 1.
  for (let iterator = 11; iterator > 0; iterator--) {
    // Check if the current divisor is greater than 6.
    if (iterator > 6) {
      // If divisor is greater than 6, add twice the quotient to the total.
      totalOperations += Math.floor(remainingValue / iterator) * 2;
    } else {
      // Otherwise (divisor is 6 or less), add the quotient directly to the total.
      totalOperations += Math.floor(remainingValue / iterator);
    }
    // Update the remaining value by taking the modulo with the current divisor.
    remainingValue = remainingValue % iterator;
  }

  // Output the final calculated total operations to the console.
  console.log(totalOperations);
};

// Read the input from standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
