/*
 * This module is responsible for processing a given text input.
 * It extracts two integer values and performs a specific calculation.
 */
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  const linesArray = rawData.split("\n");

  // Parse the first number from the first line of input.
  let firstNum = Number.parseInt(linesArray[0].split(" ")[0], 10);

  // Parse the second number from the first line of input.
  let secondNum = Number.parseInt(linesArray[0].split(" ")[1], 10);

  // Initialize the outcome variable with a default negative value.
  let resultVal = -1;

  // Check if the first number is not perfectly divisible by the second number.
  if (firstNum % secondNum !== 0) {
    // If it's not divisible, assign the first number to the result.
    resultVal = firstNum;
  }

  // Output the final calculated value to the console.
  console.log(`${resultVal}`);
}

// Read the standard input synchronously and pass it to the processing function.
ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));