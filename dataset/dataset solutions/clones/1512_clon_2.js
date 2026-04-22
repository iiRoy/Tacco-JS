function calculateCount(dataString) {
  // This function processes the provided string input to calculate a specific count.

  // Parse the initial line of the input data to determine the upper boundary for calculations.
  const upperBound = Number(dataString.split('\n')[0]);

  // Initialize an accumulator variable to store the final tally.
  let resultAccumulator = 0;

  /*
   * Commence a nested loop structure.
   * The outer loop iterates downwards from the 'upperBound' to 1, representing the first factor.
   */
  for (let factorOne = upperBound; factorOne > 0; factorOne--) {
    // The inner loop also iterates downwards from 'upperBound' to 1, representing the second factor.
    for (let factorTwo = upperBound; factorTwo > 0; factorTwo--) {
      // Check if the product of the current pair of factors is less than the defined 'upperBound'.
      if (factorOne * factorTwo < upperBound) {
        // If the condition is met, increment the accumulator.
        resultAccumulator++;
      }
    }
  }

  // Output the final computed count to the console.
  console.log(resultAccumulator);
}

// Invoke the primary processing function by reading content from standard input.
calculateCount(require("fs").readFileSync("/dev/stdin", "utf8"));