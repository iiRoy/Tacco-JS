function processInputData() {
  // Iterate over each line of processed input
  rawDataBuffer.forEach(function(currentLine) {
    // Skip empty lines after trimming whitespace
    if (currentLine.trim() === '') {
      return;
    }

    // Convert the line to a floating-point number
    currentLine = parseFloat(currentLine);

    // Calculate the sum of the generated sequence and print it
    console.log(calculateSequenceSum(currentLine));
  });
}

function calculateSequenceSum(initialValue) {
  // Declare variables for loop counter and an unused maximum iterations value
  var loopCounter,
    maxIterations = 10, // This variable is declared but not used in the loop condition or body.
    // Initialize an array with the starting number
    sequenceArray = [initialValue];

  // Loop from 2 up to and including 10
  for (loopCounter = 2; loopCounter <= 10; loopCounter++) {
    // Check if the current loop counter is an even number
    if (loopCounter % 2 === 0) {
      // If even, multiply the last element by 2 and append to the array
      sequenceArray[sequenceArray.length] = sequenceArray[sequenceArray.length - 1] * 2;
    } else {
      // If odd, divide the last element by 3 and append to the array
      sequenceArray[sequenceArray.length] = sequenceArray[sequenceArray.length - 1] / 3;
    }
  }

  // Sum all elements in the generated sequence array
  return sequenceArray.reduce(function(accumulator, currentElement) {
    return accumulator + currentElement;
  });
}

// Variable to accumulate incoming data from standard input
var rawDataBuffer = '';

// Resume standard input stream to start receiving data
process.stdin.resume();

// Set the encoding for standard input to UTF-8
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks from standard input
process.stdin.on('data', function(dataChunk) {
  // Append each received chunk to the raw data buffer
  rawDataBuffer += dataChunk;
});

// Event listener for 'end' of standard input stream
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines
  rawDataBuffer = rawDataBuffer.split('\n');
  // Call the main processing function
  processInputData();
});
