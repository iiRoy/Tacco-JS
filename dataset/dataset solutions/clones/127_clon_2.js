// This module handles file system operations.
const fileSystemModule = require("fs");

// Read input from standard input, decode as UTF-8, remove leading/trailing whitespace,
// then split the content into an array where each element is a line.
const rawInputLines = fileSystemModule.readFileSync("/dev/stdin", "utf8")
                                      .trim()
                                      .split('\n');

// Iterate through each received line to process its numerical content.
rawInputLines.map(
  function (currentInputLine) { // 'currentInputLine' is expected to be a string representing an integer.
    let outputCollection = ""; // This variable will accumulate the powers of two found in the current line's number.

    // Loop from bit position 0 up to 9 (inclusive). This corresponds to checking powers of two from 2^0 to 2^9.
    for (
      let bitIndex = 0; // Initialize the counter for the current bit position.
      bitIndex <= 9;    // The loop continues as long as the bit position is within the range [0, 9].
      bitIndex++        // Increment the bit position for the next iteration.
    ) {
      // Calculate the current power of two (e.g., 1, 2, 4, 8, ..., 512).
      const powerOfTwoValue = 1 << bitIndex;

      // Convert the input string to an integer explicitly for bitwise operations.
      // Then, perform a bitwise AND operation between the calculated power of two and the input number.
      // If the result is non-zero, it means that particular bit is set in the input number.
      if (
        (powerOfTwoValue & parseInt(currentInputLine, 10))
      ) {
        // If the bit is set, append its numeric value (the power of two) to our output string, followed by a space.
        outputCollection += powerOfTwoValue + " ";
      }
    }

    // After checking all relevant bit positions for the current line, print the collected string.
    console.log(outputCollection);
  }
);