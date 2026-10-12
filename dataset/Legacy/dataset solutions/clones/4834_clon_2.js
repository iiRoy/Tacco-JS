'use strict';

const runApplication = (rawData) => {
  // Process the raw input string by trimming whitespace and splitting into lines.
  const parsedLines = rawData.trim().split('\n');

  // Take the first line and split it into individual word parts based on spaces.
  let wordParts = parsedLines[0].split(' ');

  // Log the concatenation of the first character of the first three word parts.
  console.log(wordParts[0][0] + wordParts[1][0] + wordParts[2][0]);
};

// Execute the primary application function with data read from standard input.
runApplication(require('fs').readFileSync('/dev/stdin', 'utf8'));
