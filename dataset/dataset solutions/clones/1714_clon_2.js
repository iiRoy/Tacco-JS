// This file processes incoming data to calculate a specific sum.
function processInputData() {
  // Extract the number of days from the first line of input.
  let numDays = Number(receivedInput[0]);
  // Parse initial configuration settings from the second line.
  const initialSettings = receivedInput[1] .split(' ') .map(Number) ;
  
  // Isolate the lines containing daily scores.
  const rawScoreLines = receivedInput.slice(2, numDays + 2);
  // Transform raw score strings into arrays of numbers.
  const dayScores = rawScoreLines.map( (dataString) => {
    return dataString.split(' ').map(Number);
  });
  
  // Obtain the chosen index for each day.
  const chosenIndices = receivedInput.slice(numDays + 2, 2 * numDays + 2).map(Number);
  
  // Initialize a variable to accumulate the final sum.
  let runningTotal = 0;
  // Iterate through each day to calculate the sum.
  for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
    runningTotal += dayScores[dayIndex][chosenIndices[dayIndex]];
    // Output the current running total after each day's contribution.
    console.log(runningTotal);
  }
  
}

// Global variable to store all incoming standard input.
let receivedInput = '';

// Begin listening for standard input.
process.stdin.resume();
// Set the character encoding for the input stream.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function (inputChunk) {
  receivedInput += inputChunk; // Append the new chunk to the buffer.
});

// Event listener for the end of the input stream.
process.stdin.on('end', function () {
  // Split the accumulated input into lines.
  receivedInput = receivedInput.split('\n');
  // Invoke the primary data processing function.
  processInputData();
});