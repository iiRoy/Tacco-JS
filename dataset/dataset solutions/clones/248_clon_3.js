const fs = require('fs'); // Import the file system module

// Define a constant for the modulo base, which is 10 for decimal digits.
const DECIMAL_BASE = 10;

/**
 * Processes a string of digits by repeatedly summing adjacent digits modulo 10
 * until only a single digit remains.
 * For example, "12345" -> "3579" -> "826" -> "08" -> "8".
 *
 * @param {string} digitSequence The input string consisting only of digits.
 * @returns {number | null} The final single digit, or null if input is invalid or empty.
 */
function reduceDigitSequence(digitSequence) {
  // Guard clause for invalid or empty input sequences.
  if (!digitSequence || typeof digitSequence !== 'string' || digitSequence.trim().length === 0) {
    // console.warn("Warning: Received an invalid or empty digit sequence."); // Could add logging
    return null;
  }

  // Convert the input string into an array of numbers.
  // This step explicitly parses each character to an integer.
  let currentDigitArray = [];
  for (let char of digitSequence) {
    const parsedDigit = parseInt(char, DECIMAL_BASE);
    if (isNaN(parsedDigit)) {
      // Handle non-digit characters if necessary, though problem implies valid input.
      // console.error(`Error: Non-digit character '${char}' found in sequence.`);
      return null; // Or throw an error, depending on desired error handling.
    }
    currentDigitArray.push(parsedDigit);
  }

  // Continuously reduce the array until only one element is left.
  while (currentDigitArray.length > 1) {
    const nextIterationArray = []; // Array to store results of the current reduction step
    const currentArrayLength = currentDigitArray.length;

    // Iterate through adjacent pairs in the current array.
    for (let index = 0; index < currentArrayLength - 1; index++) {
      const firstOperand = currentDigitArray[index];
      const secondOperand = currentDigitArray[index + 1];

      // Calculate the sum of the two adjacent digits.
      const sumOfPair = firstOperand + secondOperand;

      // Apply the modulo operation to get the new digit.
      const resultingDigit = sumOfPair % DECIMAL_BASE; // Equivalent to (sumOfPair - Math.floor(sumOfPair / DECIMAL_BASE) * DECIMAL_BASE)

      nextIterationArray.push(resultingDigit);
    }

    // Replace the current array with the newly generated array for the next iteration.
    currentDigitArray = nextIterationArray;
  }

  // After the loop, currentDigitArray will contain exactly one element.
  return currentDigitArray[0];
}

// Read the entire content from standard input synchronously.
// This is typical for competitive programming environments.
const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');

// Split the input content into individual lines.
// Filter out any empty lines that might result from trailing newlines or blank lines.
const inputLines = rawInputContent
  .split('\n')
  .map(line => line.trim()) // Trim whitespace from each line
  .filter(line => line.length > 0); // Exclude completely empty lines

// Process each valid line of input data.
for (const lineOfDigits of inputLines) {
  // Calculate the reduced digit for the current line.
  const finalReducedDigit = reduceDigitSequence(lineOfDigits);

  // Output the result to standard output.
  // Only log if a valid digit was returned.
  if (finalReducedDigit !== null) {
    console.log(finalReducedDigit);
  } else {
    // Optionally, handle cases where reduction failed for a line.
    // console.error(`Failed to process line: "${lineOfDigits}"`);
  }
}