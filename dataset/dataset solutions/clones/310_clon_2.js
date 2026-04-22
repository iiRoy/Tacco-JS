function calculateMaxSubarraySum() {
  // Primary function to orchestrate the entire matrix processing and maximum subarray sum calculation.
  var matrixDimension = acquireDatum(); // Obtain the dimension of the square matrix from input.

  var spatialInformation = []; // Initialize a 2D array to store matrix values and later, prefix sums.

  // Loop through rows to populate the initial matrix.
  performRepeatedly(matrixDimension, function(rowIndex) {
    spatialInformation[rowIndex] = []; // Initialize current row.
    // Loop through columns to populate values for the current row.
    performRepeatedly(matrixDimension, function(colIndex) {
      spatialInformation[rowIndex][colIndex] = acquireDatum(); // Read and assign value.
    });
  });

  // Calculate 1D prefix sums for each row to efficiently compute column sums later.
  performRepeatedly(matrixDimension, function(rowIndex) {
    // Initialize a sentinel value at index -1 for prefix sum calculation.
    // This allows spatialInformation[rowIndex][colIndex - 1] to work correctly for colIndex = 0.
    spatialInformation[rowIndex][-1] = 0;
    // Iterate through columns to compute cumulative sums.
    performRepeatedly(matrixDimension, function(colIndex) {
      spatialInformation[rowIndex][colIndex] += spatialInformation[rowIndex][colIndex - 1]; // Accumulate sum.
    });
  });

  var overallMaximum = -Infinity; // Initialize the overall maximum sum found to negative infinity.

  // Iterate through all possible pairs of left and right column boundaries (leftBoundary, rightBoundary).
  // 'leftBoundary' is exclusive, 'rightBoundary' is inclusive.
  performRepeatedly(-1, matrixDimension - 1, function(leftBoundary) {
    performRepeatedly(leftBoundary + 1, matrixDimension, function(rightBoundary) {
      var verticalSlice = []; // Create a temporary array to store sums for the current column strip.
      // Calculate the sum for each row within the current column strip [leftBoundary+1, rightBoundary].
      performRepeatedly(matrixDimension, function(rowIndex) {
        verticalSlice[rowIndex] = spatialInformation[rowIndex][rightBoundary] - spatialInformation[rowIndex][leftBoundary];
      });

      // Apply Kadane's algorithm to find the maximum subarray sum in the 'verticalSlice'.
      // 'dynamicProgrammingResults' stores the maximum sum ending at each position.
      var dynamicProgrammingResults = [verticalSlice[0]]; // Base case for Kadane's.
      performRepeatedly(1, matrixDimension, function(itemIndex) {
        // Kadane's recurrence: max sum ending at 'itemIndex' is either
        // (max sum ending at 'itemIndex-1' + current value) or (current value itself).
        dynamicProgrammingResults[itemIndex] = Math.max(dynamicProgrammingResults[itemIndex - 1] + verticalSlice[itemIndex], verticalSlice[itemIndex]);
      });
      // Update the overall maximum sum by comparing with the maximum value in 'dynamicProgrammingResults'.
      overallMaximum = Math.max(overallMaximum, Math.max.apply(null, dynamicProgrammingResults));
    });
  });
  displayResult(overallMaximum); // Output the final calculated maximum sum.
}
 
// Helper function for performing repetitive tasks with a callback.
// Supports two signatures:
// 1. (count, callback) - loops from 0 up to count (exclusive).
// 2. (start, end, callback) - loops from start (inclusive) up to end (exclusive).
function performRepeatedly(lowerBound, upperBound, actionCallback) {
  if (actionCallback == null) { // Check if the first signature (count, callback) is used.
    actionCallback = upperBound; // Assign callback.
    upperBound = lowerBound;    // Assign count as upper bound.
    lowerBound = 0;             // Set start to 0.
  }
  // Execute the loop.
  for (var loopIndex = lowerBound; loopIndex < upperBound; ++loopIndex) {
    actionCallback(loopIndex); // Invoke the provided callback with the current index.
  }
}
 
// Set up standard input processing for Node.js environment.
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var incomingStreamData = '';      // Buffer to accumulate incoming standard input data.
var dataPointer = 0;              // Pointer to the current position within the processed input buffer.
 
// Function to read the next value from the input buffer.
// Can optionally specify 'expectedFormat' to handle different data types.
function acquireDatum(expectedFormat) {
  if (expectedFormat === 'text') { // If expecting a string.
    return incomingStreamData[dataPointer++];
  } else { // Default: expecting a number.
    return +incomingStreamData[dataPointer++]; // Convert to number using unary plus.
  }
}
 
// Function to display a value to standard output.
function displayResult(dataToRender) {
  console.log(dataToRender);
}
 
// Event listener for incoming data chunks on standard input.
process.stdin.on('data', function(inputChunk) {
  incomingStreamData += inputChunk; // Append chunk to the buffer.
});

// Event listener for the 'end' of standard input stream.
process.stdin.on('end', function() {
  // Split the accumulated input by whitespace into an array of strings.
  incomingStreamData = incomingStreamData.split(/\s+/);
  // Once all input is received and processed, initiate the main computation.
  calculateMaxSubarraySum();
});