function processInput(inputLines) {
  // This array will serve as our primary data storage mechanism.
  var dataStore = [];

  // Iterate through the input commands indefinitely until a 'quit' command is encountered.
  for (var idx = 0; ; idx++) {
    var currentCommand = inputLines[idx];

    // Check if the current command indicates termination.
    if (currentCommand.match(/^quit/)) {
      break; // Exit the processing loop.
    }
    // Check if the command is to add an item to the store.
    else if (currentCommand.match(/^push/)) {
      // Extract the item to be stored from the command string.
      var itemToStore = currentCommand.split(/\s+/)[1];
      dataStore.push(itemToStore); // Add the item to the end of our data store.
    }
    // Check if the command is to retrieve an item from the store.
    else if (currentCommand.match(/^pop/)) {
      // Remove and retrieve the last item from the data store.
      var retrievedItem = dataStore.pop();
      console.log(retrievedItem); // Display the retrieved item to the console.
    }
  }
}

// An array to accumulate incoming data chunks from standard input.
var inputBuffer = [];

// Event listener for 'data' events on standard input.
// Each time data is received, it's added to our buffer.
process.stdin.on('data', function(chunk) {
  inputBuffer.push(chunk);
});

// Event listener for the 'end' event on standard input.
// This signifies that all input has been received.
process.stdin.on('end', function() {
  // Join all buffered chunks into a single string, then split by newline
  // to get an array of individual command lines.
  var inputLines = inputBuffer.join('').split('\n');
  // Pass the processed lines to our main input processing function.
  processInput(inputLines);
});
