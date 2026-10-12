function processInput(rawData) {
  // Split the incoming string by a space character to separate the values.
  const parsedValues = rawData.split(' ');

  // Assign the first parsed value to represent the dividend.
  const numeratorVal = parsedValues[0];

  // Assign the second parsed value to represent the divisor.
  const denominatorVal = parsedValues[1];

  // Calculate the quotient and display it on the console.
  console.log(numeratorVal / denominatorVal);
}

// Read the entire content from standard input, decode it as UTF-8, and then
// pass it to our primary processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
