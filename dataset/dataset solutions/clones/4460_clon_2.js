'use strict'; // Enforce strict mode for cleaner code practices.

/**
 * Primary function to handle the given input and determine the number with the most
 * consecutive divisions by two.
 * @param {string} rawInputText The raw string input received from the environment.
 */
const processInputData = rawInputText => {
  // Parse the input string to an integer, representing the upper limit for our search.
  // The '10' specifies base-10 parsing.
  const numericalUpperBoundary = parseInt(rawInputText.trim(), 10);

  // Initialize variables to store the number that yields the maximum divisions by two
  // and the actual count of those divisions.
  let optimalNumberFound = 0;
  let maximumDivisionsCount = -1; // Start with -1 to ensure the first valid count (0 or more) is captured.

  // Iterate through all integers from 1 up to the specified upper boundary.
  for (let currentIterationValue = 1; currentIterationValue <= numericalUpperBoundary; currentIterationValue++) {
    // For each number, initialize a temporary holder for its value and a counter
    // for how many times it can be divided by two.
    let temporaryNumberHolder = currentIterationValue;
    let temporaryDivisionCounter = 0;

    // Continuously divide the temporary number by two until it becomes odd.
    // This loop runs as long as the number is even.
    while (true) {
      if (temporaryNumberHolder % 2 === 1) { // If the number is odd, we can't divide by two anymore.
        break; // Exit the division loop.
      }
      temporaryNumberHolder /= 2; // Perform integer division by two.
      temporaryDivisionCounter++; // Increment the count of successful divisions.
    }

    // After determining the division count for the current number,
    // compare it with the global maximum found so far.
    if (temporaryDivisionCounter > maximumDivisionsCount) {
      optimalNumberFound = currentIterationValue; // Update the number if a new maximum is found.
      maximumDivisionsCount = temporaryDivisionCounter; // Update the maximum division count.
    }
  }

  // Output the final result to the standard console.
  console.log(optimalNumberFound);
};

// Execute the main processing function with data read from standard input.
// This loads the 'fs' (file system) module, reads the entire content of '/dev/stdin'
// as a UTF-8 encoded string, and passes it to our processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));