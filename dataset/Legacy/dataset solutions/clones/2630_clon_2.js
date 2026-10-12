'use strict'; // Enforce strict mode for cleaner code execution.

/**
 * Processes the given raw input data to calculate the equivalent resistance
 * of resistors connected in parallel.
 * @param {string} rawData - The raw input string, typically from standard input.
 */
function ProcessInput(rawData) {
  // Parse the input string:
  // 1. Split by newline characters.
  // 2. Take the second line (index 1), which contains the resistor values.
  // 3. Split this line by spaces to get individual string representations of numbers.
  // 4. Map each string to its numerical equivalent.
  const resistorValues = rawData.split("\n")[1].split(" ").map(x => Number(x));

  // Initialize a variable to accumulate the sum of the reciprocals of the resistor values.
  let sumOfReciprocals = 0.0; // Using a floating-point literal for clarity.

  // Iterate through each numerical resistor value in the array.
  for (const currentResistor of resistorValues) {
    // Add the reciprocal of the current resistor value to the accumulator.
    sumOfReciprocals += 1 / currentResistor;
  }

  // Calculate the final equivalent resistance by taking the reciprocal of the
  // accumulated sum of reciprocals, and print this result to the console.
  console.log(1 / sumOfReciprocals);
}

// Read the entire content from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
