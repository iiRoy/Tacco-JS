function processInput() {
  // Iterate through each line of the raw input data.
  for (let outerIndex = 0; outerIndex < rawData.length; outerIndex++) {
    // Initialize an object to store counts for 'JOI' and 'IOI' substrings.
    let resultCounts = {
      JOI: 0,
      IOI: 0
    };

    // Get the current line from the input array.
    const currentLine = rawData[outerIndex];

    // Loop through the current line to find 3-character substrings.
    // The loop stops 2 characters before the end to ensure a 3-char substring can always be formed.
    for (let innerIndex = 0; innerIndex < currentLine.length - 2; innerIndex++) {
      // Extract a 3-character segment starting from the current innerIndex.
      const subStringSegment = currentLine.substring(innerIndex, innerIndex + 3);

      // Increment the counter for the found substring (either 'JOI' or 'IOI').
      // If the substring is neither, this operation will do nothing as the keys are fixed.
      resultCounts[subStringSegment]++;
    }

    // Output the count of 'JOI' occurrences for the current line.
    console.log(resultCounts.JOI);
    // Output the count of 'IOI' occurrences for the current line.
    console.log(resultCounts.IOI);
  }
}

// Declare a global variable to accumulate incoming data from standard input.
let rawData = '';

// Begin reading from standard input.
process.stdin.resume();
// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach a listener for the 'data' event, which fires when input data is available.
process.stdin.on('data', function(dataPortion) {
  // Append the received data chunk to the rawData string.
  rawData += dataPortion;
});

// Attach a listener for the 'end' event, which fires when all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated rawData into an array of strings, using newline as the delimiter.
  // This effectively creates an array where each element is a line from the input.
  rawData = rawData.split('\n');
  // Call the main processing function to handle the parsed input.
  processInput();
});
