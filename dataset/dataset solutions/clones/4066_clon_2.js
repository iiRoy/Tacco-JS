// This function serves as the primary entry point for processing the given input data.
function ProcessInput(rawData) {

  // The raw input string is split into an array of strings using space as a delimiter.
  let parsedData = rawData.split(' ');

  // The first element of the parsed array is converted to an integer and stored.
  let firstNum = parseInt(parsedData[0]);
  // The second element of the parsed array is converted to an integer and stored.
  let secondNum = parseInt(parsedData[1]);

  // We check the parity of the product of the two numbers.
  // If the product modulo 2 is equal to 1, it means the product is an odd number.
  if (firstNum * secondNum % 2 === 1) {
    console.log('%s', 'Odd'); // Output 'Odd' if the product is odd.
  } else {
    console.log('%s', 'Even'); // Otherwise, the product is even, and 'Even' is output.
  }

}

// The following line is responsible for reading input from standard input and invoking the main processing function.
// It should not be altered as it handles the environment-specific input mechanism.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
