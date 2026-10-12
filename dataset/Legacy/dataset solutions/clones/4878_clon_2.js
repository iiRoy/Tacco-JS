function ProcessString(inputStr) {
  // Determine the total length of the provided string.
  const strLen = inputStr.length;

  // Initialize a counter for character changes.
  let changeCount = 0;

  // Store the first character of the string for comparison.
  let prevChar = inputStr[0];

  // Iterate through the string, starting from the second character.
  for (let idx = 1; idx < strLen; idx++) {
    // Check if the current character is different from the character stored previously.
    if (inputStr[idx] !== prevChar) {
      // If a difference is found, increment the counter.
      changeCount++;
      // Update the 'previous character' to the current character for the next iteration.
      prevChar = inputStr[idx];
    }
  }

  // Output the final tally of character changes to the console.
  console.log(changeCount);
}

// Read input from standard input, decode it as UTF-8, and remove any leading or trailing whitespace.
ProcessString(require("fs").readFileSync("/dev/stdin", "utf8").trim());
