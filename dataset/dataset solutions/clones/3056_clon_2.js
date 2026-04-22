'use strict'
// This function processes a given input string to calculate a specific numerical transformation cost.
function processNumericalSequence(rawInputString) {
  // Trim whitespace, split into characters, and convert each character to a number.
  // Using Number() explicitly for type conversion, instead of arithmetic coercion.
  let numericDigits = rawInputString
    .trim()
    .split('')
    .map(charItem => Number(charItem));

  // Initialize accumulators for sums at even and odd indices.
  let sumAtEvenIndices = 0;
  let sumAtOddIndices = 0;

  // Determine the total number of elements in the processed sequence.
  const sequenceLength = numericDigits.length;

  // Iterate through the numeric sequence to calculate the sums.
  for (let idx = 0; idx < sequenceLength; idx++) {
    // Check if the current index is even.
    if (idx % 2 === 0) {
      // Add the digit to the sum for even positions.
      sumAtEvenIndices += numericDigits[idx];
    } else {
      // Add the digit to the sum for odd positions.
      sumAtOddIndices += numericDigits[idx];
    }
  }

  // Calculate the target count for positions with even indices (0-indexed).
  // This is equivalent to ceil(sequenceLength / 2).
  const targetEvenCount = Math.floor(sequenceLength / 2) + (sequenceLength % 2);
  // Calculate the target count for positions with odd indices (0-indexed).
  // This is equivalent to floor(sequenceLength / 2).
  const targetOddCount = Math.floor(sequenceLength / 2);

  // Calculate the cost for the first transformation scenario:
  // (Expected sum of 1s at even positions - actual sum of 1s at even positions)
  // + (actual sum of 1s at odd positions).
  // This implies making all even positions '1' and all odd positions '0'.
  const firstOptionCost = targetEvenCount - sumAtEvenIndices + sumAtOddIndices;

  // Calculate the cost for the second transformation scenario:
  // (Actual sum of 1s at even positions)
  // + (Expected sum of 1s at odd positions - actual sum of 1s at odd positions).
  // This implies making all even positions '0' and all odd positions '1'.
  const secondOptionCost = sumAtEvenIndices + targetOddCount - sumAtOddIndices;

  // Determine the minimum number of operations required between the two scenarios.
  const optimalOperationCount = Math.min(firstOptionCost, secondOptionCost);

  // Output the final computed result to the console.
  console.log(optimalOperationCount);
}

// Read input from standard input, decode as UTF-8, and pass it to the processing function.
processNumericalSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));