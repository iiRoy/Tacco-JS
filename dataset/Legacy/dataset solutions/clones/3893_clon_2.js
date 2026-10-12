function processInput(dataLines) {
  // Parse the first line of input to extract N, M, and X values.
  let firstLineData = parseLineOfNumbers(dataLines[0]);
  let numItems = firstLineData[0]; // Represents N from the problem statement
  let totalPositions = firstLineData[1]; // Represents M from the problem statement
  let thresholdValue = firstLineData[2]; // Represents X from the problem statement

  // Parse the second line of input to get the array of item costs.
  let itemCosts = parseLineOfNumbers(dataLines[1]);

  // Calculate the count of items whose cost exceeds the threshold value X.
  let itemsAboveThreshold = itemCosts.filter((currentCost) => currentCost > thresholdValue).length;

  // Output the minimum of two values:
  // 1. The count of items above the threshold.
  // 2. The total positions minus the count of items above the threshold.
  console.log(Math.min(itemsAboveThreshold, totalPositions - itemsAboveThreshold));
}

function parseLineOfNumbers(inputString) {
  // Initialize an empty array to store the integer results.
  let parsedNumbers = [];
  // Split the input string by spaces to get an array of string representations of numbers.
  let stringParts = inputString.split(' ');
  // Iterate through each string part and convert it to an integer.
  for (let idx = 0; idx < stringParts.length; idx++) {
    parsedNumbers.push(parseInt(stringParts[idx], 10)); // Use radix 10 for explicit decimal parsing.
  }
  return parsedNumbers;
}

// Global variable to accumulate all incoming data from standard input.
let rawDataBuffer = '';

// Resume the standard input stream to begin listening for data.
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events from stdin.
// This function is called whenever a chunk of data is received.
process.stdin.on('data', function(dataChunk) {
  rawDataBuffer += dataChunk; // Append the current data chunk to the buffer.
});

// Attach an event listener for the 'end' event from stdin.
// This function is called when the input stream has finished.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines, using newline as the delimiter.
  let processedLines = rawDataBuffer.split('\n');
  // Call the main processing function with the array of input lines.
  processInput(processedLines);
});
