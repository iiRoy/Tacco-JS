const lineInputModule = require('readline');

// This section sets up an interface to handle input and output streams.
// It's analogous to BufferedReader and System.in/System.out in Java.
const inputHandler = lineInputModule.createInterface({
  input: process.stdin,  // Specifies the standard input stream for reading data.
  output: process.stdout // Specifies the standard output stream for writing results.
});

// An event listener is attached to the 'line' event, which triggers
// whenever a complete line of input is received from the standard input.
inputHandler.on('line', (receivedLine) => {
  // The received input string is split into an array of substrings
  // using a space character as the delimiter.
  const numericStrings = receivedLine.split(' ');

  // The first and second elements of the array are converted from
  // string format to numerical integer values.
  const firstOperand = Number(numericStrings[0]);
  const secondOperand = Number(numericStrings[1]);

  // The primary calculation is performed:
  // The second operand is divided by the first, the result is floored (integer division),
  // and then one is added to that floored value.
  const computedValue = Math.floor(secondOperand / firstOperand) + 1;

  // The final calculated numerical value is converted back to a string
  // and then written to the standard output stream.
  process.stdout.write(computedValue.toString());

  // After processing the line, the input interface is closed,
  // indicating that no further input is expected for this execution.
  inputHandler.close();
});
