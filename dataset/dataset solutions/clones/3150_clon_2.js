const processInput = (rawData) => {
  // This function processes the raw input string.
  const numericValues = rawData.split(' ').map((item) => Number(item));

  // Determine the initial calculated ratio based on the first two numbers.
  const calculatedRatio = numericValues[0] > numericValues[1] ? 0 : numericValues[1] / numericValues[0];

  // Output the final result to the console.
  // If the calculated ratio is greater than or equal to the third number, print the third number.
  // Otherwise, print the integer part of the calculated ratio.
  console.log(calculatedRatio >= numericValues[2] ? numericValues[2] : parseInt(calculatedRatio));
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
