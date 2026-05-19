var fs = require('fs'); // Import the file system module

// Determine the size of the standard input stream
var dataSize = fs.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var dataBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var actualBytesRead = fs.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string and split it into lines
var rawInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Execute the primary processing function
processData();

/**
 * Main function to process the input data and determine the output name.
 */
function processData() {
  // Assign the parsed input lines to a local variable for clarity
  var inputDataRows = rawInputLines;

  // Parse the first line to get N and Q values
  // N represents the number of entries to check
  var numEntries = inputDataRows[0].split(' ')[0] - 0;
  // Q is the query value to compare against
  var queryValue = inputDataRows[0].split(' ')[1] - 0;

  var currentEntry; // Variable to hold each parsed line pair
  var resultName = 'kogakubu10gokan'; // Default name, will be updated if a condition is met

  // Iterate through the entries starting from the second line (index 1)
  // up to and including the N-th entry.
  for (var idx = 1; idx <= numEntries; idx++) {
    // Split each entry line by space to get the pair of values
    currentEntry = inputDataRows[idx].split(' ');

    // Check if the query value is less than or equal to the first element of the current pair
    if (queryValue <= currentEntry[0] - 0) {
      // If the condition is met, update the result name with the second element of the pair
      resultName = currentEntry[1];
      // Exit the loop as the first matching condition determines the name
      break;
    }
  }

  // Output the determined name to the console
  console.log(resultName);
}
