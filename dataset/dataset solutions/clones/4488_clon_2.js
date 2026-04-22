// This program processes a given input string to perform a sequence of calculations
// based on configuration parameters and a numeric sequence, ultimately producing
// a specific value derived from the final state of an accumulator.

function CalculateFinalValue(inputStringData) {
  // Split the entire raw input string into individual lines for easier processing.
  let parsedLines = inputStringData.split('\n');

  // The first line contains space-separated configuration values.
  // These are parsed as integers and stored for later use.
  const controlValues = parsedLines[0].split(' ').map(parseInt);

  // The second line contains the main sequence of numbers to be processed.
  // Each element is also parsed as an integer.
  let sequenceOfNumbers = parsedLines[1].split(' ').map(parseInt);

  // An initial transformation step for the numeric sequence.
  // Each number in the sequence is replaced by its remainder when divided by 2.
  // This effectively converts the sequence into a series of 0s and 1s.
  { // This block is intentionally kept to maintain the original code's structural layout.
    for (let currentIdx = 0; currentIdx < sequenceOfNumbers.length; currentIdx++) {
      sequenceOfNumbers[currentIdx] %= 2; // Apply the modulo 2 operation.
    }
  }

  // Initialize a pair of BigInt accumulators.
  // BigInts are used to handle potentially very large numbers during calculations.
  let resultPair = [1n, 0n]; // The 'n' suffix denotes a BigInt literal.

  // Iterate through the transformed sequence of numbers, updating the accumulator pair.
  for (let currentIdx = 0; currentIdx < sequenceOfNumbers.length; currentIdx++) {
    // Check the value of the current number in the sequence.
    if (sequenceOfNumbers[currentIdx] === 0) {
      // If the current number is 0, double both elements of the result pair.
      resultPair[0] *= 2n;
      resultPair[1] *= 2n;
    } else {
      // If the current number is 1, update the result pair based on their sum.
      // Both elements become equal to their previous sum.
      const temporarySum = resultPair[0] + resultPair[1];
      resultPair[0] = temporarySum;
      resultPair[1] = temporarySum;
    }
    // Log the current state of the accumulator pair after each iteration.
    console.log(resultPair);
  }

  // After processing all numbers, retrieve the final result.
  // The specific element from the result pair is determined by a control value
  // obtained from the initial configuration parameters.
  // The chosen BigInt element is then converted to a string for output.
  console.log(resultPair[controlValues[1]].toString());
}

// Invoke the main processing function with data read from standard input.
// The input is read as a UTF-8 string and any leading/trailing whitespace is removed.
CalculateFinalValue(require('node:fs').readFileSync('/proc/self/fd/0', 'utf8').trim());