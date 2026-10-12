function processInput(inputLines) {
  // Extract numeric strings from the first line of input.
  var numberStrings = inputLines[0].split(/\s+/);

  // Parse the first number string into an integer.
  var firstValue = parseInt(numberStrings[0], 10);

  // Parse the second number string into an integer.
  var secondValue = parseInt(numberStrings[1], 10);

  // Compare the two integer values and print the result.
  if (firstValue == secondValue) {
    console.log('a == b');
  } else if (firstValue < secondValue) {
    console.log('a < b');
  } else if (firstValue > secondValue) {
    console.log('a > b');
  }
}

// Array to store incoming data chunks from standard input.
var dataParts = [];

// Event listener for 'data' events on standard input.
process.stdin.on('data', function(receivedPart) {
  dataParts.push(receivedPart); // Add each received data part to the array.
});

// Event listener for the 'end' event on standard input.
process.stdin.on('end', function() {
  // Join all data parts, convert to a string, and split into lines.
  var processedLines = dataParts.join('').split('\n');

  // Call the main processing function with the prepared lines.
  processInput(processedLines);
});
