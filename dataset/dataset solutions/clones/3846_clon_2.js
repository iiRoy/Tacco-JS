'use strict';

/*
 * This module processes an input string to determine a specific numerical outcome.
 * It demonstrates basic string manipulation, array operations, and conditional logic.
 */
function processInput(inputString) {
  // Initialize the input string with a default value for demonstration or testing.
  // This line might be overridden by actual input later.
  inputString = '1 1\n';

  // Parse the input string:
  // 1. Split by newline to get the first line.
  // 2. Split the first line by space to get individual number strings.
  // 3. Map each string to its numerical representation.
  const parsedNumbers = inputString.split('\n')[0].split(' ').map(currentValue => Number(currentValue));

  // Extract the first and second numbers from the parsed array.
  const firstNumber = parsedNumbers[0];
  const secondNumber = parsedNumbers[1];

  // Determine the result based on a conditional comparison.
  // If the first number is less than or equal to the second, the result is the first number.
  // Otherwise, the result is the first number minus one.
  let resultValue = (firstNumber <= secondNumber) ? firstNumber : (firstNumber - 1);

  // Output the calculated result to the console.
  console.log(resultValue);
}

// Invoke the main processing function with content read from standard input.
// The 'fs' module is used to read the file synchronously, and 'utf8' specifies the encoding.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
