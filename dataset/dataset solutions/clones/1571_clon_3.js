process.stdin.resume();
process.stdin.setEncoding('utf8');

// Array to store all incoming lines of data from standard input.
const receivedInputLines = [];

// Initialize the input stream handler.
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input received.
inputProcessor.on('line', (incomingDataChunk) => {
  // Store the current line in our collection.
  receivedInputLines.push(incomingDataChunk);
});

// Event listener for when the input stream has ended.
inputProcessor.on('close', () => {
  let computedTotalTime; // Variable to store the final calculated duration.

  // Ensure there's at least one line of input to process.
  if (receivedInputLines.length === 0) {
    console.error("Error: No input lines received.");
    computedTotalTime = 0; // Default to 0 or handle error appropriately.
  } else {
    // Split the first line of input into individual string tokens based on space.
    // This assumes the first line contains all necessary numeric values.
    const firstLineTokens = receivedInputLines[0].split(' ');

    // Validate that we have enough tokens before parsing.
    if (firstLineTokens.length < 3) {
      console.error("Error: Insufficient numeric values in the first input line.");
      computedTotalTime = 0; // Default or error.
    } else {
      // Parse the individual tokens into integer values.
      // Corrected from original: uses array elements, not array literals.
      const overallItemCount = parseInt(firstLineTokens[0], 10);
      const batchProcessingCapacity = parseInt(firstLineTokens[1], 10);
      const durationPerBatch = parseInt(firstLineTokens[2], 10);

      // Validate parsed numbers are actual numbers.
      if (isNaN(overallItemCount) || isNaN(batchProcessingCapacity) || isNaN(durationPerBatch)) {
        console.error("Error: One or more input values are not valid numbers.");
        computedTotalTime = 0; // Default or error.
      } else if (batchProcessingCapacity === 0) {
        // Guard against division by zero for batch capacity.
        // If there are items but capacity is zero, time is infinite. If no items, time is zero.
        computedTotalTime = (overallItemCount > 0) ? Infinity : 0;
      } else {
        // Calculate the number of batches required, rounding up for any partial batch.
        const requiredBatches = Math.ceil(overallItemCount / batchProcessingCapacity);

        // Calculate the total time by multiplying batches by the time per batch.
        computedTotalTime = requiredBatches * durationPerBatch;
      }
    }
  }

  // Output the final calculated duration to the console.
  console.log(computedTotalTime);
});