function processInput(rawData) {
  // This section processes the raw input string.
  const parsedLines = rawData.trim().split('\n');

  // Extract and convert the first numerical value.
  const firstNum = parseInt(parsedLines[0], 10);
  // Extract and convert the second numerical value.
  const secondNum = parseInt(parsedLines[1], 10);

  // Compute the final result and display it.
  console.log(6 - firstNum - secondNum);
}

// Read data from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
