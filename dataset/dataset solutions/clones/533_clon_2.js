"use strict";

/**
 * This function serves as the primary entry point for processing input data.
 * It takes a raw string, parses it, and performs a specific calculation.
 * @param {string} rawData The complete input string received from the environment.
 */
function ProcessInput(rawData) {
  // Divide the incoming string into an array of substrings based on space delimiter.
  const numStrings = rawData.split(" ");

  // Perform a calculation: concatenate the first two string elements,
  // then implicitly convert the resulting string to a number and divide by two.
  // The result is then printed to the standard output.
  console.log((numStrings[0] + numStrings[1]) / 2);
}

// Execute the main processing function by reading data from standard input.
// The input is read synchronously and decoded as UTF-8.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
