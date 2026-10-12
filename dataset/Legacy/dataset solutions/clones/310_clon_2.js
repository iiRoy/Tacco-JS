function executeProgram() {
  // Read the dimension of the square matrix from input.
  let dimension = readInput();

  // Initialize a 2D array (matrix) to store the input data.
  const matrixData = [];
  iterateRange(dimension, function(rowIdx) {
    matrixData[rowIdx] = [];
    iterateRange(dimension, function(colIdx) {
      matrixData[rowIdx][colIdx] = readInput();
    });
  });

  // Pre-process the matrix to compute prefix sums for each row.
  // This allows for O(1) sum calculation of any sub-row.
  iterateRange(dimension, function(rowIdx) {
    // Initialize a sentinel value at index -1 for easier prefix sum calculation.
    matrixData[rowIdx][-1] = 0;
    iterateRange(dimension, function(colIdx) {
      matrixData[rowIdx][colIdx] += matrixData[rowIdx][colIdx - 1];
    });
  });

  // Initialize the maximum sum found so far to negative infinity.
  let finalResult = -Infinity;

  // Iterate through all possible pairs of column indices (left and right boundaries).
  // This defines the horizontal slice of the sub-matrix.
  iterateRange(-1, dimension - 1, function(firstLoopVar) {
    iterateRange(firstLoopVar + 1, dimension, function(secondLoopVar) {
      // For the current column slice, create a 1D array representing the sum of elements
      // in that slice for each row.
      const tempArray = [];
      iterateRange(dimension, function(subArrayIdx) {
        tempArray[subArrayIdx] = matrixData[subArrayIdx][secondLoopVar] - matrixData[subArrayIdx][firstLoopVar];
      });

      // Apply Kadane's algorithm to the 1D array (tempArray) to find the maximum sub-array sum.
      // This effectively finds the maximum sum sub-rectangle within the current column slice.
      const dynamicProg = [tempArray[0]];
      iterateRange(1, dimension, function(subArrayIdx) {
        dynamicProg[subArrayIdx] = Math.max(dynamicProg[subArrayIdx - 1] + tempArray[subArrayIdx], tempArray[subArrayIdx]);
      });

      // Update the overall maximum sum if the current Kadane's result is greater.
      finalResult = Math.max(finalResult, Math.max.apply(null, dynamicProg));
    });
  });

  // Output the final maximum sub-matrix sum.
  outputValue(finalResult);
}

// A utility function for iterating over a range, similar to a for loop.
// It can be called with (end, callback) or (start, end, callback).
function iterateRange(startVal, endVal, callbackFn) {
  // If only two arguments are provided, assume startVal is 0.
  if (callbackFn == null) {
    callbackFn = endVal;
    endVal = startVal;
    startVal = 0;
  }
  // Execute the callback for each number in the range [startVal, endVal).
  for (let loopCounter = startVal; loopCounter < endVal; ++loopCounter) {
    callbackFn(loopCounter);
  }
}

// Standard input/output setup for Node.js environment.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Variables to store and manage input data.
let rawData = '';
let dataPointer = 0;

// Function to read a value from the processed input array.
function readInput(dataType) {
  if (dataType === 'string') {
    return rawData[dataPointer++];
  } else {
    // Convert to number by default.
    return +rawData[dataPointer++];
  }
}

// Function to print a value to the console.
function outputValue(valueToPrint) {
  console.log(valueToPrint);
}

// Event listener for incoming data chunks from stdin.
process.stdin.on('data', function(dataSegment) {
  rawData += dataSegment;
});

// Event listener for the end of stdin input.
process.stdin.on('end', function() {
  // Split the entire input string by whitespace into an array.
  rawData = rawData.split(/\s+/);
  // Execute the main program logic.
  executeProgram();
});
