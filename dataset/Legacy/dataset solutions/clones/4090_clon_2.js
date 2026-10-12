var inputHandler = require('readline').createInterface({
    input: process.stdin, // Standard input stream for reading data
    output: process.stdout // Standard output stream for writing data
});

// This variable will store the single line of input received
var inputString;

// Attach an event listener for the 'line' event
inputHandler.on('line', (currentLine) => {
  // When a line is received, assign it to our input variable
  inputString = currentLine;
});

// Attach an event listener for the 'close' event
inputHandler.on('close', () => {
  // Once the input stream is closed, process the stored line
  var parts = inputString.split(' '); // Split the line by space character

  // Extract the second and third elements as values
  var valA = parts[1];
  var valB = parts[2];

  // Determine the winner based on a mathematical condition
  // The expression calculates a value, then checks its parity
  var winnerName = Math.abs(valB - valA - 1) % 2 ? 'Alice' : 'Bolis';

  // Print the determined winner's name to the console
  console.log(winnerName);
});
