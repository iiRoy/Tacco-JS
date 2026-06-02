function processInput() {
  // Retrieve the second line of input, split it into individual words.
  // The 'receivedData' global variable holds all input lines.
  let wordArray = receivedData[1].split(' ');

  // Reverse the order of the words in the array.
  wordArray.reverse();

  // Join the reversed words back into a single string, separated by spaces.
  const reversedSentence = wordArray.join(' ');

  // Output the resulting string to the console.
  console.log(reversedSentence);
}

// Declare a global variable to accumulate incoming data from standard input.
let receivedData = '';

// Begin reading from standard input.
process.stdin.resume();
// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach a listener for 'data' events.
// Each time a chunk of data is received, append it to 'receivedData'.
process.stdin.on('data', function(dataSegment) {
  receivedData += dataSegment;
});

// Attach a listener for the 'end' event.
// This event fires when there is no more data to be read from stdin.
process.stdin.on('end', function() {
  // Once all data is received, split the accumulated string by newline characters.
  // This creates an array where each element is a line from the input.
  receivedData = receivedData.split('\n');
  // Call the primary processing function to handle the input.
  processInput();
});
