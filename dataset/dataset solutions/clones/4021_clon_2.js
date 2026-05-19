function processInput (rawData) {
  // Parse the incoming text data into an array of numerical values.
  let numericValues = rawData.split('\n').map(Number);

  // Adjust the first numerical value by repeatedly subtracting 500
  // until it is no longer greater than 500.
  while (numericValues[0] > 500) {
    numericValues[0] -= 500;
  }

  // Output 'Yes' if the first adjusted value is less than or equal to the second value,
  // otherwise output 'No'.
  numericValues[0] <= numericValues[1]
    ? console.log('Yes')
    : console.log('No');
}

// Execute the processing function with content read from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
