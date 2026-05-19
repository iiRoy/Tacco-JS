function ProcessInput(inputString) {
  // Initialize a variable to keep track of character mismatches.
  let mismatchedCount = 0;

  // Determine the starting point for comparison, which is the ceiling of half the string's length.
  // This effectively marks the beginning of the second half of the string.
  const midpointIndex = Math.ceil(inputString.length / 2);

  // Iterate through the string from the calculated midpoint up to, but not including, the end.
  // This loop focuses on the latter half of the string.
  for (let idx = midpointIndex; idx < inputString.length; idx++) {
    // Compare the character at the current index 'idx' with its corresponding character
    // from the first half of the string. The mirrored index is calculated to find
    // the character that would be at the same position if the string were reversed.
    if (inputString[inputString.length - idx - 1] !== inputString[idx]) {
      // If the characters do not match, increment the mismatch counter.
      mismatchedCount++;
    }
  }

  // Display the final count of differing characters to the standard output.
  console.log(mismatchedCount);
}

// Read the entire content from standard input, assuming UTF-8 encoding.
// Then, remove any leading or trailing whitespace from the input string.
// Finally, pass this processed string to our main function for analysis.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
