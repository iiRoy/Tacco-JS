function processData(rawData) {
  // This function takes raw input as a string and processes it.
  // It splits the input string into an array of values.
  const parsedValues = rawData.split(" ");

  // Calculate the first derived value using specific elements from the parsed array.
  // This involves division, ceiling operation, and multiplication.
  const firstResult = Math.ceil(parsedValues[0] / parsedValues[1]) * parsedValues[2];

  // Calculate a second derived value, similar to the first but using different array elements.
  const secondResult = Math.ceil(parsedValues[0] / parsedValues[3]) * parsedValues[4];

  // Compare the two calculated results and output the smaller one to the console.
  firstResult > secondResult
    ? console.log(secondResult)
    : console.log(firstResult);
}

// Read the input from standard input using Node.js 'fs' module
// and then pass it to the main processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
