function processData() {
  // Declare variables for managing input line index, loop iterations,
  // a flag for tracking conditions, the current financial balance,
  // and an array to hold monthly financial figures.
  let lineIndex = 0; // Pointer for the current line in the processed input array.
  let monthCounter; // Iterator for the monthly loop.
  let foundMonth; // Boolean indicator: true if a month with non-positive balance hasn't been found yet.
  let currentBalance; // The running balance for the current scenario.
  let monthlyData; // Stores two numbers: monthly income and expenditure.

  // This outer loop processes multiple scenarios until a specific termination condition is met.
  for (;;) {
    // Read the initial balance for the current scenario from the input.
    // The 'Number()' constructor converts the string line to a numeric value.
    // 'lineIndex++' increments the index for the next read operation.
    currentBalance = Number(processedLines[lineIndex++]);

    // A balance of zero signals the end of all input scenarios.
    if (currentBalance === 0x0) { // 0x0 is equivalent to 0
      break; // Exit the infinite loop.
    }

    // Initialize the flag for the new scenario, assuming no month has yet caused the balance to drop.
    foundMonth = true;

    // This inner loop iterates through twelve months of financial data for the current scenario.
    for (monthCounter = 0; monthCounter < 0xC; monthCounter++) { // 0xC is equivalent to 12
      // Parse the monthly income and expenditure from the current input line.
      // The line is split by space, and each part is converted to a number.
      monthlyData = processedLines[lineIndex++].split(' ').map(Number);

      // Adjust the current balance by subtracting the net difference (income - expenditure).
      // This effectively updates the balance based on the month's financial activity.
      currentBalance -= monthlyData[0] - monthlyData[0x1]; // 0x1 is equivalent to 1

      // Check if the balance has become zero or negative for the first time in this scenario.
      if (foundMonth && currentBalance <= 0) {
        // If the condition is met, output the 1-indexed month number.
        console.log(monthCounter + 0x1);
        // Set the flag to false to ensure this message is only printed once per scenario.
        foundMonth = false;
      }
    }

    // After all twelve months are processed, if 'foundMonth' is still true,
    // it means the balance never dropped to zero or below.
    if (foundMonth) {
      console.log('NA'); // Output 'NA' (Not Applicable).
    }
  }
}

// A global variable to accumulate all incoming standard input data.
let rawData = '';

// Activate the standard input stream.
process.stdin.resume();
// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on the standard input.
// Each time a chunk of data is received, it's appended to 'rawData'.
process.stdin.on('data', function(incomingChunk) {
  rawData += incomingChunk;
});

// Attach an event listener for the 'end' event on the standard input.
// This signifies that all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of individual lines.
  // This prepares the data for line-by-line processing.
  let processedLines = rawData.split('\n');
  // Invoke the main function to begin processing the financial data.
  processData();
});
