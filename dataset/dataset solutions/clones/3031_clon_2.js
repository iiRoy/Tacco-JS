'use strict' /* This ensures strict mode for better error handling. */

/**
 * Orchestrates the primary data processing flow.
 * @param {string} rawData - The raw string input to be processed.
 */
const processInput = rawData => {
  // Step 1: Parse the incoming text data.
  // It's assumed the input consists of lines, each containing space-separated elements.
  const parsedLines = rawData
    .split('\n') // Divide the entire input string into individual line strings.
    .map(lineSegment => lineSegment.split(' ')) // For each line, split it into an array of strings by space.

  // Step 2: Extract and convert the necessary numeric values from the first parsed line.
  // The problem expects three integer values from the very first line of input.
  const firstValue = Number.parseInt(parsedLines[0][0], 10) // Convert the first element to an integer.
  const secondValue = Number.parseInt(parsedLines[0][1], 10) // Convert the second element to an integer.
  const midValue = Number.parseInt(parsedLines[0][2], 10) // Convert the third element to an integer.

  // Step 3: Evaluate the relationship between the three numbers.
  // Determine if the 'midValue' lies strictly between 'firstValue' and 'secondValue',
  // regardless of their order.
  if (
    firstValue < midValue && // Check if midValue is greater than firstValue
    midValue < secondValue // AND midValue is less than secondValue
  ) {
    // If the condition is met, output a positive confirmation.
    console.log('Yes')
  } else if (
    secondValue < midValue && // OR check if midValue is greater than secondValue
    midValue < firstValue // AND midValue is less than firstValue
  ) {
    // If this alternate condition is met, output a positive confirmation.
    console.log('Yes')
  } else {
    // If neither of the above conditions is met, output a negative confirmation.
    console.log('No')
  }
}

// Step 4: Initiate the processing by reading data from standard input.
// This part handles the execution of the main processing function.
processInput(
  require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' })
) // Use 'node:fs' for explicit module namespace, and an options object for encoding.