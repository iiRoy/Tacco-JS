var totalSum = 0x0; // Initialize a variable to store the accumulated sum of numbers.

// Activate the standard input stream to begin receiving data.
process.stdin.resume();

// Configure the encoding for the incoming standard input data.
process.stdin.setEncoding('utf8');

// Register a callback function to handle chunks of data received from standard input.
process.stdin.on('data', function(dataChunk) {
  // Extract all sequences of one or more digits from the current data chunk.
  var numericStrings = dataChunk.match(/[0-9]+/g);

  // Iterate through the array of extracted numeric strings.
  for (var idx in numericStrings) {
    // Convert each string to a number and add it to the running total.
    totalSum += Number(numericStrings[idx]);
  }
});

// Register a callback function to execute when the standard input stream ends.
process.stdin.on('end', function() {
  // Output the final calculated sum to the console.
  console.log(totalSum);
});
