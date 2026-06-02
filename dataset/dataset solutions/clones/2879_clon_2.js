process.stdin.resume(); // Activate the standard input stream
process.stdin.setEncoding('utf8'); // Define the character encoding for incoming data

// This array will hold all the input lines received from stdin.
var inputData = [];

// Initialize a readline interface to handle input and output streams.
var inputHandler = require('readline').createInterface({
  input: process.stdin, // Specify standard input as the source
  output: process.stdout // Specify standard output (though not directly used for writing by this interface)
});

// Attach an event listener for each 'line' of input received.
inputHandler.on('line', (currentLine) => {
  inputData.push(currentLine); // Store the current line in our data array.
});

// Attach an event listener for the 'close' event, which fires when the input stream ends.
inputHandler.on('close', () => {
  // Retrieve the first line of input, which is the string we need to process.
  var inputString = inputData[0];
  // Initialize a variable to keep track of the number of transformations.
  var transformationCount = 0;

  // Continue looping as long as the target substring "ABC" is found within the string.
  while (inputString.includes("ABC")) {
    // Replace the first occurrence of "ABC" with "BCA".
    inputString = inputString.replace("ABC", "BCA");
    // Increment the counter for each successful replacement.
    transformationCount++;
  }

  // Output the final count of transformations to the console.
  console.log(transformationCount);
});
