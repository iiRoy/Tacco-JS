var receivedData = ''; // Initialize a string to accumulate all incoming data.
var inputStream = process.stdin; // Get a reference to the standard input stream.

// Ensure the input stream is active and ready to receive data.
inputStream.resume();

// Set the character encoding for the incoming data to UTF-8.
inputStream.setEncoding('utf-8');

// Attach an event listener for 'data' events.
// This function will be called whenever new data chunks are available.
inputStream.on('data', function(dataPortion) {
  receivedData += dataPortion; // Append the new data chunk to our accumulated string.
});

// Attach an event listener for the 'end' event.
// This function will execute once the entire input stream has finished.
inputStream.on('end', function() {
  // Split the accumulated data into an array of lines using the newline character.
  var processedLines = receivedData.split("\n");
  var resultCollection = []; // An array to store the processed strings before final output.
  var lineIndex = 0; // An index to iterate through the processedLines array.

  // Loop until a line containing only a hyphen '-' is encountered.
  while ('-' !== processedLines[lineIndex]) {
    // Get the initial string (cards) and increment the line index.
    var currentString = processedLines[lineIndex++];
    // Get the number of shuffles (m) and increment the line index.
    var shuffleCount = processedLines[lineIndex++];

    // Perform the specified number of shuffles.
    for (var loopCounter = 0; loopCounter < shuffleCount; loopCounter++) {
      // Get the cut point (h) for the current shuffle and increment the line index.
      var cutPoint = processedLines[lineIndex++];
      // Perform the string rotation: take the substring from 'h' to the end,
      // then append the substring from the beginning to 'h'.
      currentString = currentString.substr(cutPoint) + currentString.substr(0, cutPoint);
    }
    // Add the final shuffled string to our collection.
    resultCollection.push(currentString);
  }

  // Join all the processed strings in the result collection with newline characters
  // and print the final output to the console.
  console.log(resultCollection.join('\n'));
});
