function processInput(dataLines) {
  // Initialize a counter for the specific character.
  let countOfTwos = 0;

  // Iterate through each character of the initial data string.
  for (let charIndex = 0; charIndex < dataLines[0].length; charIndex++) {
    // Check if the current character matches our target.
    if (dataLines[0][charIndex] === '2') {
      // Increment the counter upon a match.
      countOfTwos++;
    }
  }

  // Display the final tally to the standard output.
  console.log(countOfTwos);
}


// This helper function is designed to convert a single string line
// into an array of integer values.
// Note: This function is defined but not invoked in the current program flow.
function convertLineToNumbers(inputString) {
  let resultArray = []; // An array to hold the numerical results.
  // Split the incoming string by spaces to isolate potential numbers.
  const stringParts = inputString.split(' ');

  // Loop through each segment of the split string.
  for (let partIndex = 0; partIndex < stringParts.length; partIndex++) {
    // Parse each segment into an integer and add it to our result array.
    resultArray.push(parseInt(stringParts[partIndex]));
  }
  return resultArray; // Return the collection of parsed numbers.
}

// A global variable to accumulate all data received from standard input.
let receivedData = '';

// Prepare standard input stream for data reception.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Attach an event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
  receivedData += dataChunk; // Concatenate each new chunk to the accumulated data.
});

// Attach an event listener for when the standard input stream ends.
process.stdin.on('end', function() {
  // Once all data is received, split it into an array of lines.
  const linesArray = receivedData.split('\n');
  // Pass the processed lines to the primary function for execution.
  processInput(linesArray);
});
