const createInputProcessor = (() => {
  // Internal state variable to track the current processing step.
  // 0: Awaiting the count of elements (N)
  // 1: Awaiting the actual sequence of numbers
  let currentProcessingStage = 0;

  // Temporary storage for the incoming data segments.
  // Will hold N at index 0, and the array at index 1.
  let dataAccumulator = [];

  /**
   * Computes an adjusted value for a given number based on its index.
   * This is equivalent to C - I - 1 from the original problem description.
   * @param {number} originalValue The numerical element from the input sequence.
   * @param {number} elementIndex The zero-based index of the element.
   * @returns {number} The calculated adjusted value.
   */
  const deriveShiftedComponent = (originalValue, elementIndex) => {
    // A simple arithmetic transformation applied to each array element.
    const fixedOffset = 1;
    return originalValue - elementIndex - fixedOffset;
  };

  /**
   * Determines the median value of a numerical array.
   * This function first sorts the array to correctly identify the middle element.
   * @param {number[]} numericSeries An array of numbers.
   * @returns {number|undefined} The median value, or undefined if the array is empty.
   */
  const findCentralStatistic = (numericSeries) => {
    if (!Array.isArray(numericSeries) || numericSeries.length === 0) {
      return undefined; // Median is not defined for an empty set.
    }

    // Create a shallow copy and sort it numerically to avoid modifying the original array.
    const sortedSeries = [...numericSeries].sort((valA, valB) => valA - valB);
    const middleIndex = Math.floor(sortedSeries.length / 2);

    // For an array with an even number of elements, this returns the lower of the two middle elements.
    // For an odd number, it returns the single middle element.
    return sortedSeries[middleIndex];
  };

  /**
   * Calculates the sum of absolute differences between a transformed sequence and a reference value.
   * This function quantifies the total deviation from a central point.
   * @param {number[]} _originalData The original array (included for potential future use or context).
   * @param {number[]} transformedData The sequence after applying a transformation (e.g., `deriveShiftedComponent`).
   * @param {number} referencePoint The central value (e.g., median) to compare against.
   * @returns {number} The total cumulative absolute deviation.
   */
  const computeTotalDeviation = (_originalData, transformedData, referencePoint) => {
    let cumulativeAbsoluteDifference = 0;
    // Iterate through the transformed data to sum up the absolute deviations.
    for (let currentIdx = 0; currentIdx < transformedData.length; currentIdx++) {
      cumulativeAbsoluteDifference += Math.abs(transformedData[currentIdx] - referencePoint);
    }
    return cumulativeAbsoluteDifference;
  };

  // The main function returned by the IIFE, designed to handle incoming data segments
  // from a stream (e.g., standard input).
  return (incomingDataSegment) => {
    // Basic validation: ensure the input is a non-empty string.
    if (typeof incomingDataSegment !== 'string' || incomingDataSegment.trim() === '') {
      console.warn('Received empty or non-string data segment. Skipping processing for this chunk.');
      return;
    }

    const trimmedSegment = incomingDataSegment.trim();

    // A state machine pattern to handle multi-stage input processing.
    switch (currentProcessingStage) {
      case 0: // This stage expects the count of elements (N) as a single integer.
        const parsedCountN = Number(trimmedSegment);

        // Comprehensive validation for N: must be a positive integer.
        if (isNaN(parsedCountN) || !Number.isInteger(parsedCountN) || parsedCountN <= 0) {
          console.error(`Invalid count received: "${trimmedSegment}". Expected a positive integer. Resetting processing flow.`);
          dataAccumulator = []; // Clear any partially accumulated data.
          currentProcessingStage = 0; // Remain in or reset to this initial stage.
          return;
        }

        // Store the parsed count and advance the state to expect the array data.
        dataAccumulator.push(parsedCountN);
        currentProcessingStage = 1;
        break;

      case 1: // This stage expects the actual array of numbers, space-separated.
        // Split the string into individual potential number strings.
        const rawNumberStrings = trimmedSegment.split(' ');
        // Convert each part to a number and filter out any non-numeric results.
        const processedNumbers = rawNumberStrings
          .map(s => Number(s.trim()))
          .filter(n => !isNaN(n));

        // Retrieve the expected count of elements from the first stage.
        const expectedCount = dataAccumulator[0];

        // Validation: check if the number of parsed elements matches the expected count.
        if (processedNumbers.length !== expectedCount) {
          console.warn(`Element count mismatch: Expected ${expectedCount}, but received ${processedNumbers.length} valid numbers. Proceeding with available data, but input format may be incorrect.`);
          // A more strict implementation might reset here:
          // dataAccumulator = []; currentProcessingStage = 0; return;
        }

        // Store the processed array.
        dataAccumulator.push(processedNumbers);

        // --- Core Calculation Logic ---
        const actualInputArray = dataAccumulator[1]; // The array that was just received.

        // Step 1: Generate the transformed sequence.
        // This involves applying 'deriveShiftedComponent' to each element of the input array.
        const derivedComponents = [];
        for (let j = 0; j < actualInputArray.length; j++) {
          derivedComponents.push(deriveShiftedComponent(actualInputArray[j], j));
        }

        // Step 2: Find the central statistic (median) of the transformed sequence.
        const calculatedMedian = findCentralStatistic(derivedComponents);

        // Guard against an undefined median, which would happen if 'derivedComponents' was empty.
        if (calculatedMedian === undefined) {
            console.error("Failed to determine median for the derived sequence. Input array might have been empty after parsing. Resetting.");
            dataAccumulator = [];
            currentProcessingStage = 0;
            return;
        }

        // Step 3: Compute the total deviation using the transformed data and the median.
        const finalDeviationResult = computeTotalDeviation(actualInputArray, derivedComponents, calculatedMedian);

        // Output the final computed result to standard output.
        console.log(finalDeviationResult);

        // After completing a full calculation cycle, reset the state for the next pair of inputs.
        dataAccumulator = [];
        currentProcessingStage = 0;
        break;

      default: // This case should ideally never be reached, indicating an unexpected state.
        console.error('An unknown processing stage was encountered. Resetting state to prevent further errors.');
        dataAccumulator = [];
        currentProcessingStage = 0;
        break;
    }
  };
})();

// Configure the standard input stream to interpret incoming data as UTF-8 encoded text.
process.stdin.setEncoding('utf-8');

// Attach an event listener to the 'data' event of the standard input stream.
// Whenever data is received, it will be passed to our `createInputProcessor` function.
process.stdin.on('data', incomingChunk => createInputProcessor(incomingChunk));

// Optional: Listener for the 'end' event, fired when the input stream closes.
// process.stdin.on('end', () => {
//   console.log('Standard input stream has concluded.');
//   // Any final cleanup or summary could be performed here.
// });