// This function processes an array of string inputs.
function processInput(dataLines) {
  // Extract the first numeric value from the input array.
  // The '-0' is a common JavaScript idiom to convert a string to a number.
  let firstValue = dataLines[0] - 0;

  // Extract the second numeric value.
  let alphaNum = dataLines[1] - 0;

  // Extract the third numeric value.
  let betaNum = dataLines[2] - 0;

  // Based on the value of alphaNum, print either "Hello World" or the sum of alphaNum and betaNum.
  // This uses a ternary operator for conditional output.
  console.log(alphaNum == 1 ? "Hello World" : alphaNum + betaNum);
}

// Read input from standard input, decode it, trim whitespace, and split into lines.
// Then, pass the resulting array of strings to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
