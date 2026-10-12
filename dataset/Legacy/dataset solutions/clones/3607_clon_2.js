const consoleInputHandler = require('readline'); // Module for handling input and output streams.

// Create an interface to manage interactions with the console.
const ioManager = consoleInputHandler.createInterface({
  input: process.stdin,  // Direct input from the standard input stream.
  output: process.stdout // Direct output to the standard output stream.
});

// Present a prompt to the user and await their numerical input.
ioManager.question("Input a number: ", (receivedText) => {
  // Parse the received string into an integer, specifying base 10.
  const processedNumber = parseInt(receivedText, 10);

  // Determine if the integer is an even number.
  if (processedNumber % 2 === 0) {
    // If the remainder of division by two is zero, it's even.
    console.log(1);
  } else {
    // Otherwise, the number is odd.
    console.log(0);
  }

  // Close the input/output interface once processing is complete.
  ioManager.close();
});
