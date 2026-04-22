'use strict';

const processInput = (rawData) => {
  // Extract individual lines from the raw input string.
  const lines = rawData.trim().split('\n');

  // Parse the second numerical value from the first line to determine the target character position.
  const positionIndex = parseInt(lines[0].split(' ')[1], 10);

  // Get the string that needs modification.
  const targetString = lines[1];

  // Construct the final output string by converting the character at the specified index to lowercase.
  console.log(
    `${targetString.slice(0, positionIndex - 1)}` +
    `${targetString.slice(positionIndex - 1, positionIndex).toLowerCase()}` +
    `${targetString.slice(positionIndex)}`
  );
};

// Read the system's standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));