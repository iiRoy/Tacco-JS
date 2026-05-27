function processInput(inputSequence) {
  // Define the set of valid characters for odd-indexed positions (1-based)
  const allowedOddPositions = ['R', 'U', 'D'];
  // Define the set of valid characters for even-indexed positions (1-based)
  const allowedEvenPositions = ['L', 'U', 'D'];

  // Special handling for sequences containing only one character
  if (inputSequence.length === 1) {
    // If the single character is 'L', it's an invalid sequence
    if (inputSequence === 'L') {
      return 'No';
    }
  }

  // Iterate through the input sequence, starting from the second character
  // The loop variable 'idx' represents the 0-based index of the character being checked
  for (let idx = 1; idx < inputSequence.length; idx++) {
    // Determine if the current position (1-based) is odd or even
    // (idx + 1) gives the 1-based position
    if ((idx + 1) % 2 === 1) {
      // This block handles characters at odd 1-based positions
      // We check the character at the previous index (idx - 1)
      if (allowedOddPositions.indexOf(inputSequence[idx - 1]) !== -1) {
        // If the character is found in the allowed set, continue to the next character
        continue;
      } else {
        // If the character is not allowed at this odd position, the sequence is invalid
        return 'No';
      }
    } else {
      // This block handles characters at even 1-based positions
      // We check the character at the previous index (idx - 1)
      if (allowedEvenPositions.indexOf(inputSequence[idx - 1]) !== -1) {
        // If the character is found in the allowed set, continue
        continue;
      } else {
        // If the character is not allowed at this even position, the sequence is invalid
        return 'No';
      }
    }
  }

  // If the loop completes without finding any invalid characters, the sequence is valid
  return 'Yes';
}

// Read the first line of input from stdin, remove leading/trailing whitespace,
// and pass it to the processing function. Then, print the result to stdout.
console.log(
  processInput(
    require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .split('\n')[0]
      .trim()
  )
);
