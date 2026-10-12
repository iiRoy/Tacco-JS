'use strict';

/*
 * This function processes the provided text input.
 * It identifies differences between two lines of text.
 */
function ProcessInput(inputData) {
  // Clean up the raw input and split it into individual lines.
  const processedLines = inputData.trim().split(/\r?\n/g);

  // Extract the first string from the processed lines.
  const firstString = processedLines[0];

  // Extract the second string from the processed lines.
  const secondString = processedLines[1];

  // Initialize a counter for character mismatches.
  let differenceCounter = 0;

  // Iterate through the characters of the first string.
  // Assuming both strings have the same length as per problem constraints.
  for (let idx = 0; idx < firstString.length; idx++) {
    // Compare characters at the current index from both strings.
    if (firstString.charAt(idx) !== secondString.charAt(idx)) {
      // If characters differ, increment the mismatch counter.
      differenceCounter++;
    }
  }

  // Output the final count of differing characters to the console.
  console.log(differenceCounter);
}

// Standard entry point for competitive programming environments.
// Reads input from standard input and passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
