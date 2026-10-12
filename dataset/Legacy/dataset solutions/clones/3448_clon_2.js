process.stdin.resume();
process.stdin.setEncoding('utf8');

// This array will store all the input lines received.
let inputDataRows = [];

// Create an interface for reading input line by line.
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each new line of input.
inputProcessor.on('line', (currentInputRow) => {
  inputDataRows.push(currentInputRow); // Add the current line to our collection.
});

// Event listener for when the input stream closes.
inputProcessor.on('close', () => {
  // Take the first line from the collected input and split it by space.
  const parsedValues = inputDataRows[0].split(' ');

  // Perform a calculation: (first value * 1) + (second value / 2)
  // The *1 ensures the first value is treated as a number.
  // The /2 naturally converts the second value to a number.
  console.log(parsedValues[0] * 1 + parsedValues[1] / 2);
});
