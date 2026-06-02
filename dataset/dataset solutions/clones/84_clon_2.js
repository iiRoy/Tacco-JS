var
systemModule = require('sys'); // Import the 'sys' module for system-level operations

/**
 * Main function to process the collected input data.
 * It converts the input to uppercase and prints it to standard output.
 */
function processInputData() {
  // Output the accumulated data after converting it to uppercase
  systemModule.print(receivedData.toUpperCase());
}

// Declare a variable to accumulate all incoming data from standard input
var
receivedData = '';

// Start reading from standard input
process.stdin.resume();

// Set the encoding for standard input to UTF-8
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on standard input
// This function will be called whenever a new chunk of data is available
process.stdin.on('data', function(dataSegment) {
  // Append the current data segment to our accumulated data string
  receivedData += dataSegment;
});

// Attach an event listener for the 'end' event on standard input
// This function will be called when there is no more data to read
process.stdin.on('end', function() {
  // Once all data has been received, execute the primary processing function
  processInputData();
});
