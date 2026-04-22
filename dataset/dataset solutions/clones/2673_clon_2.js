/*
 * This module contains a function designed to process a specific
 * string input, perform a numerical calculation, and then log the result.
 * It's structured to read from standard input.
 */

const performCalculation = sourceText => {

  // First, parse the incoming string data into an array of numbers.
  // The input is expected to be a single line with space-separated integers.
  let numericParts = sourceText
    .split('\n')[0]     // Isolate the first line of the input
    .split(' ')         // Split the line by spaces into string components
    .map(singleEntry => parseInt(singleEntry, 10)); // Convert each component to an integer (base 10)

  // Perform the core arithmetic operation based on specific indices.
  // The calculation is: third_number - (first_number - second_number).
  const outputQuantity = numericParts[2] - (numericParts[0] - numericParts[1]);

  // Determine the final value to be displayed.
  // If the calculated quantity is negative, output 0; otherwise, output the quantity itself.
  console.log(outputQuantity < 0 ? 0 : outputQuantity);
};

// Execute the primary function by reading content from the standard input stream.
// This leverages Node.js's file system module to synchronously read the file.
performCalculation(
  require("fs").readFileSync("/dev/stdin", "utf8")
);