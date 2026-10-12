function processInputData(rawData) {
  // Split the raw input into an array of lines
  const linesOfText = rawData.split('\n');

  // Parse the second line (index 1) into an array of numbers
  // The first line (index 0) contains the count for the loop
  let numericValues = linesOfText[1].split(' ').map(Number);

  // Initialize an empty string to build the reversed sequence
  let resultString = '';

  // Get the iteration count from the first line and convert it to an integer
  const loopIterations = parseInt(linesOfText[0], 10); // Explicit radix 10

  // Loop from the specified count down to 1
  for (let idx = loopIterations; idx > 0; idx--) {
    // Append the number at the (idx-1) position to the result string, followed by a space
    resultString += numericValues[idx - 1] + ' ';
  }

  // Print the final string, removing any trailing whitespace
  console.log(resultString.trim());
}

// Read the entire content of standard input synchronously
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf-8');

// Call the main processing function with the read content
processInputData(fileContent);
