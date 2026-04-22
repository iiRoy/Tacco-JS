/*
 * This module provides a data processing pipeline for calculating a specific deviation metric.
 * It's designed to handle input in two stages.
 */
const dataPipelineInitializer = (initialInput => {

  // Helper function to derive an individual component value based on its position.
  const deriveIndividualComponent = (currentVal, idxPos) => {
    return currentVal - idxPos - 1;
  };

  /**
   * Aggregates absolute differences between derived offsets and a reference point.
   * @param {Array<number>} sourceCollection - The original array of numbers.
   * @param {Array<number>} offsetCollection - An array of derived offset values.
   * @param {number} baseReference - The central reference point for deviation.
   * @returns {number} The total aggregated deviation.
   */
  const calculateTotalDiscrepancy = (sourceCollection, offsetCollection, baseReference) => {
    return sourceCollection.reduce((accumulatedSum, currentSourceItem, currentIdx) => {
      // Summing up the absolute difference for each element
      return accumulatedSum + Math.abs(offsetCollection[currentIdx] - baseReference);
    }, 0);
  };

  // Function to create a new array by applying the individual component derivation to each element.
  const generateOffsetCollection = inputCollection => inputCollection.map((dataItem, dataPosition) => {
    return deriveIndividualComponent(dataItem, dataPosition);
  });

  // Retrieves the median value from a numeric array.
  const obtainMedianElement = numericSequence => {
    const midPoint = Math.floor(numericSequence.length / 2);
    return numericSequence[midPoint];
  };

  // Internal state storage for multi-stage processing.
  let processingBuffer = [];

  // The main processing function returned by the initializer.
  return (incomingDataSegment) => {
    // Check if the buffer is empty, indicating the first stage of input.
    if (!processingBuffer.length) {
      // Parse and store the initial count value.
      processingBuffer.push(parseInt(incomingDataSegment, 10)); // Stores the N-value
    }
    // If the buffer contains one element, it's the second stage of input.
    else if (processingBuffer.length === 1) {
      // Parse the space-separated numbers into an array and store it.
      processingBuffer.push(incomingDataSegment.split(' ').map(itemStr => parseInt(itemStr, 10))); // Stores the main data array

      // Calculate the offset factors for the main data array.
      const computedFactors = generateOffsetCollection(processingBuffer[1]);

      // Determine the median of these computed factors.
      const centralOffsetValue = obtainMedianElement(computedFactors);

      // Finally, compute the overall deviation using the original data, factors, and median.
      const finalDeviationResult = calculateTotalDiscrepancy(processingBuffer[1], computedFactors, centralOffsetValue);

      // Output the calculated result.
      console.log(finalDeviationResult);

      // Reset the buffer for the next pair of inputs.
      processingBuffer = [];
    }
  };
})();

// Configure standard input encoding to 'utf-8'.
process.stdin.setEncoding('utf-8');

// Attach an event listener to process incoming data chunks.
process.stdin.on('data', incomingChunk => dataPipelineInitializer(incomingChunk));