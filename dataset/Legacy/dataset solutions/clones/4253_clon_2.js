function ProcessData(inputString) {
  // Convert the provided input string into an integer value.
  let startNumber = parseInt(inputString);

  /*
   * This loop iterates downwards from the initial number.
   * It searches for the largest integer (greater than 1)
   * whose square root is also an integer.
   */
  for (let currentCandidate = startNumber; currentCandidate > 1; currentCandidate--) {
    // Calculate the square root of the current number.
    // Then, check if the remainder when divided by 1 is 0.
    // This condition effectively tests if the square root is a whole number.
    if (Math.sqrt(currentCandidate) % 1 === 0) {
      // If a perfect square is found, print it to the console.
      console.log(currentCandidate);
      // Terminate the loop as we've found the largest such number.
      break;
    }
  }
}

// Read the entire content from standard input as a UTF-8 string.
// Then, pass this string to the main data processing function.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
