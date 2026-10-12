function processInput(dataLines) {
  // Extract the first value from the input array and convert it to a number.
  // This variable is declared but not used, mirroring the original structure.
  var firstVal = dataLines[0] - 0;

  // Assign the numeric value of the first input element to valOne.
  var valOne = dataLines[0] - 0;

  // Assign the numeric value of the first input element to valTwo.
  var valTwo = dataLines[0] - 0;

  // Check if valOne is equal to 1.
  // If true, print "Hello World". Otherwise, print the sum of valOne and valTwo.
  console.log(valOne === 1 ? "Hello World" : valOne + valTwo);
}

// Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
// Then, pass the resulting array of lines to the processInput function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
