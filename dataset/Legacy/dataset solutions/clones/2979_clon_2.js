process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set input encoding to UTF-8

// Array to store all incoming lines from standard input
var inputData = [];

// Create an interface for reading lines
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each new line received
inputProcessor.on('line', (currentLine) => {
  inputData.push(currentLine); // Add the line to our data array
});

// Event listener for when the input stream closes
inputProcessor.on('close', () => {
  // Initialize a counter for valid combinations
  var solutionCount = 0;

  // Parse the first line of input to get the four numeric values
  // Assuming the input is space-separated numbers on a single line
  var firstLineParts = inputData[0].split(" ");

  var redVal = Number(firstLineParts[0]);
  var greenVal = Number(firstLineParts[1]);
  var blueVal = Number(firstLineParts[2]);
  var upperBound = Number(firstLineParts[3]);

  // Iterate through possible values for the first component (red)
  for (let idx1 = 0; idx1 * redVal <= upperBound; idx1++) {
    // Iterate through possible values for the second component (green)
    for (let idx2 = 0; idx2 * greenVal <= upperBound; idx2++) {
      // Calculate the remaining value needed for the third component (blue)
      let remainingValue = upperBound - (redVal * idx1) - (greenVal * idx2);

      // Check if the remaining value is non-negative and perfectly divisible by blueVal
      if ( ( remainingValue % blueVal === 0 ) && ( remainingValue >= 0 ) ) {
        solutionCount++; // Increment the counter if a valid combination is found
        // Optional: console.log(`Found: ${redVal}, ${greenVal}, ${remainingValue / blueVal}`);
      }
      // If the current combination of red and green already exceeds the limit,
      // no further increases in green will be valid for this red value, so break.
      else if ( remainingValue < 0 ) {
        break;
      }
    }
  }

  // Output the final count of valid combinations
  console.log(solutionCount);
});
