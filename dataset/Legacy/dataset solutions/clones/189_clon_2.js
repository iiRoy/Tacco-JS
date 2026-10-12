var currentValue = 'A';

var processedParts; // Declared to mimic the implicitly global 'input' from the original code.

// Activate the standard input stream to begin receiving data.
process.stdin.resume();

// Configure the encoding for the incoming data from standard input.
process.stdin.setEncoding('utf8');

// Attach an event handler for when data chunks are received from stdin.
process.stdin.on('data', function(receivedData) // Renamed 'chunk' to 'receivedData'
{
  // Clean up the received data by trimming whitespace and splitting it by a comma.
  processedParts = receivedData.trim().split(','); // Renamed 'input' to 'processedParts'

  // Check if the first element of the processed data matches the current stored value.
  if (processedParts[0] == currentValue) {
    // If there's a match, update the stored value with the second element.
    currentValue = processedParts[1];
  }
  // Otherwise, check if the second element of the processed data matches the current stored value.
  else if (processedParts[1] == currentValue) {
    // If this condition is met, update the stored value with the first element.
    currentValue = processedParts[0];
  }
});

// Attach an event handler for when the standard input stream signals its end.
process.stdin.on('end', function() {
  // Once all input has been processed, output the final stored value to the console.
  console.log(currentValue);
});
