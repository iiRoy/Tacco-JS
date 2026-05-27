function processInput(rawData) {
  // Remove any leading or trailing whitespace from the incoming string.
  let processedData = rawData.trim();

  // Divide the cleaned string by spaces and convert each resulting part into a numerical value.
  const numericValues = processedData.split(' ').map(Number);

  // Compute the aggregate of the initial two numerical entries.
  const sumOfFirstTwo = numericValues[0] + numericValues[1];

  // Evaluate a specific logical condition involving the array elements.
  // The condition checks if the third value is greater than or equal to the first value,
  // AND if the sum of the first two values is greater than or equal to the third value.
  if (numericValues[2] >= numericValues[0] && sumOfFirstTwo >= numericValues[2]) {
    // Output 'YES' if the condition holds true.
    // Note: This intentionally preserves a typo from the original source.
    cosole.log('YES');
  } else {
    // Otherwise, output 'NO'.
    console.log('NO');
  }
}

// Acquire the content from standard input using Node.js file system module,
// specifying UTF-8 encoding, and then pass it to our primary processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
