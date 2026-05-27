'use strict'; // Enable strict mode for cleaner code

/**
 * Processes the given input string to calculate and print a specific value.
 * This function takes raw string data, converts it to a number,
 * and then performs a calculation based on that number.
 * @param {string} rawData - The raw input string received from the environment.
 */
function ProcessInput(rawData) {
  // Convert the input string to a numerical value.
  // This assumes the input is a valid number string.
  const numVal = Number(rawData);

  // Perform the calculation: (numVal - 2) * 180
  // And output the result to the console.
  console.log((numVal - 2) * 180);
}

// Read input from standard input, decode it as UTF-8, and remove leading/trailing whitespace.
// Then, pass this processed input string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
