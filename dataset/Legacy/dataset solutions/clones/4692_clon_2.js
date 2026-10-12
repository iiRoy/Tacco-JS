function ProcessInput(rawData) {
  // Process the incoming raw data string.
  // First, remove leading/trailing whitespace, then split by space,
  // and finally parse the resulting string into an integer.
  let numericValue = parseInt(rawData.trim().split(' '));

  // Perform the initial arithmetic operation.
  const firstCalculation = 800.0 * numericValue;

  // Execute the secondary arithmetic operation.
  const secondCalculation = 2e2 * (numericValue / 15.0);

  // Output the difference between the two calculated values to the console.
  console.log(firstCalculation - secondCalculation);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
