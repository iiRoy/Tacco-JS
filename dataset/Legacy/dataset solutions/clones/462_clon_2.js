// This script processes numerical input from standard input,
// performing a custom digit transformation before printing the results.

function processInput() {
  // Declare some local variables. These might not all be actively utilized
  // in the core logic, but are part of the structural definition.
  let unusedVarA, unusedVarB, unusedVarC;
  let currentNumericValue; // Variable to hold the integer parsed from each line.

  // Begin an indefinite loop to process input lines.
  for (;;) {
    // Extract the first line from our buffered input array and convert it to an integer.
    // The 'shift()' method removes the first element and returns it.
    // We specify base 10 for parsing.
    currentNumericValue = parseInt(inputDataBuffer.shift(), 10);

    // Check for the termination condition: if the parsed number is 0.
    if (currentNumericValue === 0) {
      break; // Exit the processing loop.
    }

    // Perform a series of transformations on the current number:
    // 1. Convert the number to its octal (base 8) string representation.
    // 2. Split this octal string into an array of individual character digits.
    // 3. Map each octal digit character to a new character using a custom lookup table.
    // 4. Join the transformed characters back into a single string.
    // 5. Print the final transformed string to the console.
    console.log(
      currentNumericValue.toString(8).split('').map(function (octalChar) {
        // The string '01235789' serves as a custom mapping for octal digits.
        // For example, '4' (octal) maps to '5', '5' maps to '7', etc.
        // The unary plus operator converts the character digit to a number for indexing.
        return '01235789'.charAt(+octalChar);
      }).join('')
    );
  }
}

// A global variable to accumulate all incoming data from the standard input stream.
// It starts as an empty string and will later be converted to an array of lines.
let inputDataBuffer = '';

// Activate the standard input stream to begin listening for data.
process.stdin.resume();

// Configure the encoding for the standard input stream to 'utf8'.
process.stdin.setEncoding('utf8');

// Register an event handler for the 'data' event on standard input.
// Each time a segment of data arrives, append it to our global buffer.
process.stdin.on('data', function(receivedSegment) {
  inputDataBuffer += receivedSegment;
});

// Register an event handler for the 'end' event on standard input.
// This event signals that all input has been received.
process.stdin.on('end', function() {
  // Once all data is collected, split the entire buffer into an array of strings,
  // using the newline character as the delimiter.
  inputDataBuffer = inputDataBuffer.split('\n');
  // After preparing the input, initiate the main processing routine.
  processInput();
});
