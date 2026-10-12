'use strict';

/**
 * This function serves as the primary entry point for processing input data.
 * It takes a raw string input, parses it, performs a calculation, and prints the result.
 * @param {string} rawData - The complete raw input string, typically from standard input.
 */
const processInput = (rawData) => {
  // Parse the input string:
  // 1. Split by newline to get individual lines.
  // 2. Take the first line (index 0).
  // 3. Split that line by space to get individual number strings.
  // 4. Map each number string to its numeric representation.
  const parsedNumbers = rawData.split('\n')[0].split(' ').map(numStr => Number(numStr));

  // Assign the parsed numeric values to distinct variables for clarity.
  const valX = parsedNumbers[0]; // Represents the first number from input.
  const valY = parsedNumbers[1]; // Represents the second number from input.
  const valZ = parsedNumbers[2]; // Represents the third number from input.

  let resultValue; // Declare a variable to hold the final computed answer.

  // Apply conditional logic based on the relationship between valZ, valX, and valY.
  // This implements the core algorithm for determining the output.
  if (valZ <= valX + valY) {
    // If valZ is less than or equal to the sum of valX and valY,
    // the result is simply the sum of valZ and valY.
    resultValue = valZ + valY;
  } else {
    // Otherwise (if valZ is greater than valX + valY),
    // a different calculation is performed.
    // This expression can be simplified algebraically to valX + 2 * valY + 1.
    resultValue = (valZ + valY) - (valZ - valY - valX) + 1;
  }

  // Output the final calculated result to the console.
  // This is the observable behavior of the program.
  console.log(resultValue);
};

// The program execution starts here.
// It reads the entire content of '/dev/stdin' synchronously using Node.js's 'fs' module,
// decodes it as UTF-8, and then passes this raw string to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
