'use strict';

// This function is responsible for processing raw input data
// to generate a specific sequence of numbers based on given parameters.
function processData(rawData) {
  // Step 1: Prepare the input string.
  // It removes leading/trailing whitespace, splits the string into parts by space,
  // and then converts each part into an integer using the bitwise NOT operator (~~).
  let processedNumbers = rawData
    .trim()
    .split(' ')
    .map(numString => ~~numString);

  // Step 2: Extract the two primary values from the processed array.
  // 'limitVal' determines the range of numbers to generate.
  // 'centerVal' is the central point around which numbers are generated.
  const limitVal = processedNumbers[0];
  const centerVal = processedNumbers[1];

  // Step 3: Handle a specific edge case where the limit value is 1.
  // If 'limitVal' is 1, only the 'centerVal' itself should be output.
  if (limitVal === 1) {
    // Output the center value as a string.
    console.log(centerVal + '');
    return; // Exit the function early.
  }

  // Step 4: Initialize an array to store the resulting sequence of numbers.
  let finalSequence = [];

  // Step 5: Iterate to generate the sequence of numbers.
  // The loop starts from 'centerVal - (limitVal - 1)' and goes up to, but not including, 'centerVal + limitVal'.
  // This creates a sequence of '2 * limitVal - 1' numbers centered around 'centerVal'.
  for (let currentNumber = centerVal - (limitVal - 1); currentNumber < centerVal + limitVal; currentNumber++) {
    finalSequence.push(currentNumber); // Add each generated number to the sequence array.
  }

  // Step 6: Output the final sequence.
  // The numbers in the 'finalSequence' array are joined together by a single space
  // and then printed to the console.
  console.log(finalSequence.join(' '));
}

// The program starts by reading input from standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin'
// and decodes it as a 'utf8' string. This string is then passed to the 'processData' function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
