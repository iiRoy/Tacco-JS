function processInputData() {
  // Declare variables for loop indices, sequence size, and sum calculations.
  let
    idx, outerLoopIdx, innerLoopIdx, countElements,
    numberSequence, maximumSum, currentSum;

  // The primary loop processes multiple sequences from the input.
  // It reads the first number of each line as the count of elements for the current sequence.
  // The loop continues as long as a valid positive integer is parsed for 'countElements'.
  for (idx = 0; countElements = parseInt(rawData[idx++], 10);) {
    // Initialize an array to store the numerical sequence for the current iteration.
    numberSequence = [];

    // Populate the 'numberSequence' array with 'countElements' integers.
    // These integers are read from subsequent lines in the 'rawData' array.
    for (outerLoopIdx = 0; outerLoopIdx < countElements; outerLoopIdx++) {
      numberSequence[outerLoopIdx] = parseInt(rawData[idx + outerLoopIdx], 10);
    }

    // Adjust the main input index to point to the line immediately after the current sequence's data.
    idx += countElements;

    // Initialize 'maximumSum' to negative infinity. This ensures that any valid sum found
    // within the sequence will be greater than this initial value.
    maximumSum = -Infinity;

    // This nested loop structure calculates the maximum subarray sum using a brute-force approach.
    // The outer loop iterates through all possible starting points of a subarray.
    for (outerLoopIdx = 0; outerLoopIdx < countElements; outerLoopIdx++) {
      // Reset 'currentSum' for each new starting point of a subarray.
      currentSum = 0;

      // The inner loop iterates through all possible ending points of a subarray,
      // starting from the current 'outerLoopIdx'.
      for (innerLoopIdx = outerLoopIdx; innerLoopIdx < countElements; innerLoopIdx++) {
        // Add the current element of the sequence to the running sum.
        currentSum += numberSequence[innerLoopIdx];

        // If the 'currentSum' is greater than the 'maximumSum' found so far, update 'maximumSum'.
        if (currentSum > maximumSum) {
          maximumSum = currentSum;
        }
      }
    }
    // After processing all subarrays for the current sequence, print the maximum sum found.
    console.log(maximumSum);
  }
}

// Declare a variable to hold all incoming standard input data as a single string.
let
  rawData = '';

// Activate the standard input stream to begin receiving data.
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on the standard input stream.
// Each time a chunk of data is received, it is appended to the 'rawData' string.
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk;
});

// Attach an event listener for the 'end' event on the standard input stream.
// This event fires when there is no more data to be read from stdin.
process.stdin.on('end', function() {
  // Once all data is received, split the 'rawData' string into an array of strings,
  // using the newline character as the delimiter. Each element in the array will be a line from the input.
  rawData = rawData.split('\n');
  // Call the main processing function to handle the parsed input data.
  processInputData();
});
