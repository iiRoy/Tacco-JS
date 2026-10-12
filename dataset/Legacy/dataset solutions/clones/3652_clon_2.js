// This module defines a function to compute the range of three numbers provided as a string.
function processData(rawData) {
  // First, we ensure the input string has no extraneous leading or trailing spaces.
  rawData = rawData.trim();

  // Then, the cleaned string is broken into individual parts using space as a delimiter.
  // Each part is subsequently converted into a numerical type.
  const numericValues = rawData.split(" ").map(Number);

  // The core calculation involves finding the maximum and minimum among the three numbers.
  // The difference between these two extremes is then computed and displayed.
  console.log(
    Math.max(numericValues[0], Math.max(numericValues[1], numericValues[2])) -
    Math.min(numericValues[0], Math.min(numericValues[1], numericValues[2]))
  );
}

// The program initiates by reading the entire content from standard input.
// This content is then passed to our primary processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
