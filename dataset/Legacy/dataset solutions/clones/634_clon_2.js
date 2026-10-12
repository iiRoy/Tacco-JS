function primaryRoutine() {
  // Read the number of rows for processing
  let rowQuantity = readInputToken();
  // Read the number of columns for each row
  let colQuantity = readInputToken();

  // Iterate for each row based on the provided quantity
  iterateTimes(rowQuantity, function() {
    // Obtain the current line as a string
    let currentLine = readInputToken('string');
    // Initialize an array to store calculated distances
    let distanceArray = [];
    // Initialize a counter for cloud distance, -1 means no cloud encountered yet
    let cloudDistance = -1;

    // Loop through each character in the current line
    iterateTimes(colQuantity, function(idx) {
      // Check if the current character is a 'c' (representing a cloud)
      if (currentLine.charAt(idx) === 'c') {
        // If it's a cloud, the distance is 0
        distanceArray.push(0);
        // Reset the cloud distance counter for subsequent non-cloud characters
        cloudDistance = 1;
      } else {
        // If it's not a cloud, calculate distance based on the last cloud
        // If a cloud has been encountered (cloudDistance is not -1), increment and use it
        // Otherwise, push -1 indicating no cloud has been seen yet in this row
        distanceArray.push(cloudDistance !== -1 ? cloudDistance++ : -1);
      }
    });
    // Output the calculated distances for the current row, joined by spaces
    displayOutput(distanceArray.join(' '));
  });
}

// A utility function to repeat an action a specified number of times
function iterateTimes(count, actionCallback) {
  for (let idx = 0; idx < count; ++idx) {
    actionCallback(idx); // Execute the callback, passing the current index
  }
}

// Standard Node.js input stream setup
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Global buffer to accumulate all input data
let rawInputBuffer = '';
// Global pointer to track the current position in the parsed input array
let bufferPosition = 0;

// Function to read a token from the input buffer
function readInputToken(tokenKind) {
  if (tokenKind === 'string') {
    // If 'string' type is requested, return the token as is
    return rawInputBuffer[bufferPosition++];
  } else {
    // Otherwise, parse the token as a number
    return +rawInputBuffer[bufferPosition++];
  }
}

// Function to display output to the console
function displayOutput(outputValue) {
  console.log(outputValue);
}

// Event listener for incoming data chunks from stdin
process.stdin.on('data', function(dataSegment) {
  rawInputBuffer += dataSegment; // Append new data to the buffer
});

// Event listener for the end of the input stream
process.stdin.on('end', function() {
  // Split the accumulated input by whitespace to get individual tokens
  rawInputBuffer = rawInputBuffer.split(/\s+/);
  // Initiate the main processing routine
  primaryRoutine();
});
