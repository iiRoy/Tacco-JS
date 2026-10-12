let appSettings = {
  inputSource: '/dev/stdin', // Path to standard input for Linux systems
  lineDelimiter: '\n'         // Newline character for line separation
};

// Read the input file, decode as ASCII, split into lines, and parse numbers
const parsedInputVectors = require('fs').readFileSync(appSettings.inputSource, 'ascii')
  .split(appSettings.lineDelimiter, 3) // Split into at most 3 lines
  .map(function(currentInputLine) {
    // For each line, split by space and convert parts to numbers
    return currentInputLine.split(' ').map(Number);
  });

// Calculate the absolute differences between corresponding elements of the second and third input vectors
const vectorDifferences = (function(firstVector, secondVector) {
  let differenceResults = []; // Initialize an array to store results
  // Iterate over the elements of the first vector
  for (let elementIndex in firstVector) {
    // Calculate the absolute difference and add it to the results array
    differenceResults.push(Math.abs(firstVector[elementIndex] - secondVector[elementIndex]));
  }
  return differenceResults; // Return the array of differences
})(parsedInputVectors[1], parsedInputVectors[2]); // Pass the second and third parsed lines as vectors

// Output the sum of all absolute differences (L1 norm)
console.log(
  vectorDifferences.reduce(function(accumulatedValue, currentElementValue) {
    return accumulatedValue + currentElementValue;
  }, 0) // Start sum from 0
);

// Output the Euclidean distance (L2 norm)
console.log(
  Math.sqrt(
    vectorDifferences.reduce(function(accumulatedValue, currentElementValue) {
      return accumulatedValue + currentElementValue * currentElementValue;
    }, 0) // Start sum of squares from 0
  )
);

// Output the L3 norm
console.log(
  Math.pow(
    vectorDifferences.reduce(function(accumulatedValue, currentElementValue) {
      return accumulatedValue + currentElementValue * currentElementValue * currentElementValue;
    }, 0), // Start sum of cubes from 0
    1 / 3 // Raise to the power of 1/3
  )
);

// Output the Chebyshev distance (L-infinity norm)
console.log(
  vectorDifferences.reduce(function(accumulatedValue, currentElementValue) {
    return Math.max(accumulatedValue, currentElementValue);
  }, 0) // Start with 0, find maximum absolute difference
);
