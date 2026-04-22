/*
 * This script processes sequential numerical inputs.
 * It accumulates sums based on defined block sizes until a zero input is encountered.
 */
const initiateDataCrunching = () => {
  // Declare various numeric accumulators and loop indices.
  let subLoopCounter; // Controls inner iteration count.
  let auxiliaryVariableK; // Unused placeholder.
  let mainCycleIndex; // Tracks the outer loop's progress.
  let temporaryBufferB; // Another unused variable.
  let conditionalFlagC; // Yet another unused variable.
  let overallTotalW; // A potential grand total, currently dormant.
  let currentSegmentSize; // Defines how many items are in the current block.
  let accumulatedBlockSum; // Stores the sum for the current processing block.

  /*
   * Begin the primary data ingestion and processing loop.
   * This loop is designed to run indefinitely until an explicit break condition.
   */
  for (mainCycleIndex = 0; ; mainCycleIndex++) {
    // Reset the block sum at the start of each new processing cycle.
    accumulatedBlockSum = 0;

    // Read the first line of input for the current cycle.
    // This line typically dictates the size of the subsequent data segment.
    const inputStringOne = readline();
    // Convert the received string into its integer representation.
    currentSegmentSize = parseInt(inputStringOne, 10); // Base 10 for clarity.

    // Evaluate the parsed segment size. A value of zero signals termination.
    if (currentSegmentSize === 0) {
      // If zero, the processing should halt immediately.
      break;
    }

    // Initiate a secondary loop to process items within the current segment.
    // This loop iterates a quarter of the 'currentSegmentSize' times.
    for (
      subLoopCounter = 0;
      subLoopCounter < currentSegmentSize / 4;
      subLoopCounter++
    ) {
      // Fetch the next input line, which is expected to be a data point.
      const inputStringTwo = readline();
      // Parse this data point into an integer.
      const dataPointValue = parseInt(inputStringTwo, 10);
      // Add the parsed data point to the running sum for the current block.
      accumulatedBlockSum = accumulatedBlockSum + dataPointValue;
    }

    // Display the final accumulated sum for the just-processed block.
    console.log(accumulatedBlockSum);
  } // End of the main data processing loop.
};