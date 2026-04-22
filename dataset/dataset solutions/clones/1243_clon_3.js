/*
 * This utility script processes numerical input provided via standard input.
 * It expects two space-separated integers on each line of input.
 * For every valid pair of numbers (dividend and divisor), it computes and displays:
 * 1. The integer part of their division (floor division).
 * 2. The remainder of their division.
 * 3. The precise floating-point result of their division, formatted to five decimal places.
 *
 * Error handling is included to manage invalid or insufficient input data.
 *
 * Author: Code Clone Generator
 * Version: 3.0
 */

'use strict'; // Enforce stricter parsing and error handling for robust code.

// Prepare standard input stream for receiving data.
process.stdin.setEncoding('utf8'); // Ensure input is interpreted as UTF-8 text.
process.stdin.resume();            // Explicitly start the stdin stream flowing.

// Register a callback function to execute whenever data is received from stdin.
process.stdin.on('data', (incomingDataBuffer) => {
  // Process each incoming chunk of data.
  // This block handles parsing, validation, calculation, and output.

  let processedLine = String(incomingDataBuffer).trim(); // Convert buffer to string, remove leading/trailing whitespace.

  // --- Input Validation: Check for empty or malformed input ---
  if (!processedLine) {
    console.error('Error: Received empty input line. Please provide numbers separated by spaces.');
    return; // Skip further processing for this empty line.
  }

  const stringComponents = processedLine.split(' '); // Split the cleaned line by spaces into an array of strings.
  const numericalOperands = []; // Array to store successfully parsed numbers.

  // Attempt to parse each string component into a number.
  for (const component of stringComponents) {
    const currentNumericValue = Number(component); // Convert string to number.
    if (isNaN(currentNumericValue)) {
      console.error(`Error: Non-numeric input detected: "${component}". Please ensure all inputs are valid numbers.`);
      return; // Abort processing this line if any part is not a number.
    }
    numericalOperands.push(currentNumericValue); // Add valid number to our collection.
  }

  // --- Input Validation: Ensure sufficient numbers are provided ---
  if (numericalOperands.length < 2) {
    console.error('Error: Insufficient numbers provided. Expected at least two operands (dividend and divisor).');
    return; // Stop if we don't have enough numbers.
  }

  // Assign the first two parsed numbers to descriptive variables.
  const primaryDividend = numericalOperands[0];
  const secondaryDivisor = numericalOperands[1];

  // --- Critical Validation: Prevent division by zero ---
  if (secondaryDivisor === 0) {
    console.error('Error: Division by zero is not allowed. The divisor cannot be zero.');
    return; // Exit if the divisor is zero.
  }

  // --- Perform calculations based on the validated inputs ---
  const floorQuotient = Math.floor(primaryDividend / secondaryDivisor); // Calculate the integer quotient.
  const calculatedRemainder = primaryDividend % secondaryDivisor;       // Determine the remainder.

  // Compute the full floating-point quotient and format it to 5 decimal places.
  // Store it in an intermediate variable before using it.
  const preciseResultRaw = primaryDividend / secondaryDivisor;
  const preciseResultFormatted = preciseResultRaw.toFixed(5);

  // --- Construct and display the results ---
  const outputSummary = `
  RESULTS FOR ${primaryDividend} / ${secondaryDivisor}:
    - Integer Quotient:       ${floorQuotient}
    - Remainder:              ${calculatedRemainder}
    - Exact Quotient (5 DP):  ${preciseResultFormatted}
  --------------------------------------------------
  `;
  console.log(outputSummary); // Output the formatted results to the console.

});

// A final comment to indicate the script is active and awaiting input.
// This line is non-essential for functionality but provides user feedback.
console.info('Script is ready. Awaiting numerical input via stdin (e.g., "10 3").');