function processInput(rawData) {
  // This function processes the given raw input data.
  const parsedNumbers = rawData.trim().split('\n').map((numStr) => parseInt(numStr, 10));

  // Check a specific condition based on elements at indices 4, 0, and 5.
  if (parsedNumbers[4] - parsedNumbers[0] <= parsedNumbers[5]) {
    console.log('Yay!'); // Output for the true condition.
  } else {
    console.log(':('); // Output for the false condition.
  }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
