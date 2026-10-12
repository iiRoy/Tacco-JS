function processInput(rawData) {
  // Clean up the raw input string by removing leading/trailing whitespace.
  rawData = rawData.trim();

  // Split the cleaned string by newline characters and convert each part to a number.
  // Destructure the resulting array into four distinct numerical variables.
  const [val1, val2, val3, val4] = rawData.split('\n').map(Number);

  // Perform a conditional calculation based on the comparison of the first two values.
  // If the first value is greater than the second, calculate a specific expression.
  // Otherwise, calculate a different expression.
  // Log the final computed result to the console.
  console.log(val1 > val2 ? val2 * val3 + (val1 - val2) * val4 : val2 * val3);
}

// Read the content of the standard input file synchronously using Node.js 'fs' module.
// Pass the read content to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
