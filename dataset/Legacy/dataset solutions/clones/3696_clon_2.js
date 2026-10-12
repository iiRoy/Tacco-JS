'use strict';

/*
 * This module processes raw text input to calculate a specific value.
 * It demonstrates basic string manipulation and arithmetic operations.
 */
const processInput = (rawData) => {
  // Split the entire input string by newline characters,
  // then further split each resulting line by spaces.
  // This creates a 2D array of string segments.
  const parsedLines = rawData.split('\n').map((lineSegment) => {
    return lineSegment.split(' ');
  });

  // Extract the first element from the first line segment,
  // and convert it to an integer with base 10.
  const numberValue = parseInt(parsedLines[0][0], 10);

  // Calculate the final result: numberValue multiplied by (numberValue modulo 2 plus 1).
  // This effectively multiplies by 1 if numberValue is even, and by 2 if numberValue is odd.
  const finalResult = numberValue * (numberValue % 2 + 1);

  // Output the computed result to the console.
  console.log(finalResult);
};

// Read the entire content of standard input synchronously,
// using UTF-8 encoding, and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
