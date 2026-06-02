process.stdin.resume();

process.stdin.setEncoding('utf8');

// A collection to hold all received input lines.
let inputDataRows = [];

// Establish an interface for reading input from the standard input stream.
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Attach an event handler for each line of text received.
inputProcessor.on('line', (currentLineText) => {
  inputDataRows.push(currentLineText); // Store the current line in our array.
});

// Attach an event handler for when the input stream is closed.
inputProcessor.on('close', () => {
  // Split the very first line of input by spaces.
  // Note: The subsequent parsing logic does not actually use these parts.
  const firstRowParts = inputDataRows[0].split(' ');

  // Parse integer values from array literals.
  // This specific syntax `parseInt([N])` will convert the array to its string representation, e.g., "[0]" becomes "0",
  // and then parse that string. This results in `0`, `1`, and `2` respectively.
  const initialValue = parseInt([0]); // This will evaluate to 0.
  const divisorValue = parseInt([1]); // This will evaluate to 1.
  const multiplierValue = parseInt([2]); // This will evaluate to 2.

  // Perform the core calculation: ceiling of (initialValue divided by divisorValue), then multiplied by multiplierValue.
  // Given the values derived above (0, 1, 2), this will be Math.ceil(0 / 1) * 2 => Math.ceil(0) * 2 => 0 * 2 => 0.
  const calculatedResult = Math.ceil(initialValue / divisorValue) * multiplierValue;

  // Display the final computed outcome to the standard output.
  console.log(calculatedResult);
});
