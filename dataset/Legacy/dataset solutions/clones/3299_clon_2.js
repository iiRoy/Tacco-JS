function processInput(dataLines) {
  // Determine the total number of items to process from the first line of input.
  let numEntries = parseInt(dataLines[0]);

  // Initialize a dynamic programming table to store maximum accumulated values.
  // This table will hold the maximum cost to paint a house up to a certain row with a specific color.
  let memoTable = Array(numEntries);

  // Iterate through each row (representing a house) from the first to the last.
  for (let rowIndex = 0; rowIndex < numEntries; rowIndex++) {
    // Parse the costs for the current house from the input data.
    // Each line after the first contains three space-separated costs for the three colors.
    let currentCosts = dataLines[rowIndex + 1].split(' ');

    // For the very first house (rowIndex 0), the maximum cost is simply its own cost for each color.
    if (rowIndex === 0) {
      memoTable[0] = [
        parseInt(currentCosts[0]),
        parseInt(currentCosts[1]),
        parseInt(currentCosts[2])
      ];
    } else {
      // For subsequent houses, calculate the maximum cost based on the previous house's costs.
      // Iterate through each possible color for the current house (0, 1, 2).
      for (let colIndex = 0; colIndex < 3; colIndex++) {
        let accumulatedMax = null; // Initialize a variable to find the maximum possible sum for the current cell.

        // Consider the two colors from the previous house that are different from the current house's color.
        // This ensures that adjacent houses do not have the same color.
        for (let offset = 1; offset < 3; offset++) {
          // Calculate the index of the previous house's color.
          // (colIndex + 1) % 3 and (colIndex + 2) % 3 will give the two other distinct colors.
          let prevColorIndex = (colIndex + offset) % 3;

          // Calculate a candidate sum: the maximum cost to paint the previous house with 'prevColorIndex'
          // plus the cost to paint the current house with 'colIndex'.
          let candidateSum = memoTable[rowIndex - 1][prevColorIndex] + parseInt(currentCosts[colIndex]);

          // If 'accumulatedMax' is not yet set or if the 'candidateSum' is greater, update 'accumulatedMax'.
          if (accumulatedMax === null || accumulatedMax < candidateSum) {
            accumulatedMax = candidateSum;
          }
        }

        // Ensure the current row in the memoTable is initialized before assigning a value.
        if (!memoTable[rowIndex]) {
          memoTable[rowIndex] = [];
        }
        // Store the calculated maximum accumulated cost for the current house and color.
        memoTable[rowIndex][colIndex] = accumulatedMax;
      }
    }
  }

  // After iterating through all houses, the maximum value in the last row of the memoTable
  // represents the overall maximum cost to paint all houses.
  console.log(Math.max(...memoTable[numEntries - 1]));
}


// A buffer to accumulate all incoming data from standard input.
let rawDataBuffer = '';

// Configure standard input to resume reading and use UTF-8 encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Attach an event listener to handle incoming data chunks.
// Each chunk is appended to the 'rawDataBuffer'.
process.stdin.on('data', function(dataChunk) {
  rawDataBuffer += dataChunk;
});

// Attach an event listener for when the standard input stream ends.
// At this point, all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines.
  let processedLines = rawDataBuffer.split('\n');
  // Call the main processing function with the array of input lines.
  processInput(processedLines);
});
