function processInputData() {
  // Declare and initialize essential variables for processing.
  let
    lineIndex = 0, // Serves as the current index for reading input lines
    monthCounter, // Counter for iterating through monthly data points
    foundEarlyDepletion, // A boolean flag to indicate if a threshold was met early
    currentResourceLevel, // Represents the quantity of a resource being tracked
    monthlyData; // An array to hold parsed consumption and production figures per month

  // This is the main processing loop, it continues indefinitely until a specific condition is met.
  for (;;) {
    currentResourceLevel = Number(applicationDataBuffer[lineIndex++]); // Read and convert the initial resource level from input.
    // If the resource level read is zero, it signifies the end of input or a termination command.
    if (currentResourceLevel === 0) {
      break; // Exit the infinite loop.
    }

    foundEarlyDepletion = true; // Reset the flag for each new resource level scenario.
    // Loop through twelve sets of monthly data.
    for (monthCounter = 0; monthCounter < 12; monthCounter++) {
      // Parse the monthly consumption and production values from the input line.
      monthlyData = applicationDataBuffer[lineIndex++].split(' ').map(Number);
      // Adjust the current resource level by subtracting consumption and adding production.
      currentResourceLevel -= monthlyData[0] - monthlyData[1];

      // Check if the resource level has dropped to or below zero for the first time in this cycle.
      if (foundEarlyDepletion && currentResourceLevel <= 0) {
        console.log(monthCounter + 1); // Output the 1-indexed month number when depletion occurred.
        foundEarlyDepletion = false; // Set the flag to false as depletion has been reported for this cycle.
      }
    }

    // After processing all 12 months, if depletion was never reported early, output 'NA'.
    if (foundEarlyDepletion) {
      console.log('NA');
    }
  }
}

// Global buffer to accumulate all incoming data from standard input.
let applicationDataBuffer = '';

// Begin listening for standard input.
process.stdin.resume(); // Ensure the input stream remains open and active.
process.stdin.setEncoding('utf8'); // Specify the character encoding for the input data.

// Event handler for when data chunks are received.
process.stdin.on('data', function (dataPortion) {
  applicationDataBuffer += dataPortion; // Append each received data portion to the buffer.
});

// Event handler for when the input stream has ended.
process.stdin.on('end', function () {
  // Once all data is received, split the entire buffer into an array of lines.
  applicationDataBuffer = applicationDataBuffer.split('\n');
  // Call the main processing function to handle the prepared data.
  processInputData();
});