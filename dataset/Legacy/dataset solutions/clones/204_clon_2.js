function processInputData() {
  // Iterate through each line of the processed input data
  rawData.forEach(function(currentLine) {
    // Perform a replacement operation on the current line
    // Swapping 'apple' with 'peach' and 'peach' with 'apple'
    console.log(currentLine.replace(/apple|peach/g, function(matchedWord) {
      // Conditional check to determine the replacement
      return matchedWord === 'apple' ? 'peach' : 'apple';
    }));
  });
}

// Global variable to store the raw input stream data
var rawData = '';

// Activate the standard input stream
process.stdin.resume();

// Set the character encoding for the input stream
process.stdin.setEncoding('utf8');

// Event handler for when data chunks are received
process.stdin.on('data', function(dataChunk) {
  // Append the incoming data chunk to the rawData string
  rawData += dataChunk;
});

// Event handler for when the input stream ends
process.stdin.on('end', function() {
  // Split the accumulated rawData into an array of lines
  rawData = rawData.split('\n');
  // Invoke the primary data processing function
  processInputData();
});
