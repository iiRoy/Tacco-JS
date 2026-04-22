(function executeMainProcess() {
  // This section handles reading input and orchestrating the main calculation.
  // It's designed as an Immediately Invoked Function Expression (IIFE)
  // to encapsulate variables and provide a clear execution flow.

  const fileSystemModule = require('fs'); // Standard Node.js module for file operations.
  const standardInputPath = '/dev/stdin'; // Path to read input from, typically standard input stream.

  /**
   * Core logic function to perform the calculation based on parsed input.
   * This function implements the main algorithm.
   * @param {string} rawInputString - The complete raw input content as a single string.
   * @returns {string} The final calculated result, formatted as a string.
   */
  const performComplexCalculation = (rawInputString) => {
    // Stage 1: Input parsing and initial validation.
    // Clean the input string by removing leading/trailing whitespace
    // and then split it into individual lines.
    const processedInputLines = rawInputString.trim().split('\n');

    // Crucial check: Ensure we have at least two lines for valid input (N and array A).
    if (processedInputLines.length < 2) {
      console.error('Error: Insufficient input lines provided. Expected at least two lines.');
      return 'Input Error'; // Return an error indicator if input is malformed.
    }

    // Parse the first line to extract the primary count, often denoted as N.
    const firstLineSegments = processedInputLines[0].split(' ');
    // Convert the first segment to an integer.
    const primaryCount = parseInt(firstLineSegments[0], 10);

    // Validate the parsed primaryCount. It must be a non-negative number.
    if (isNaN(primaryCount) || primaryCount < 0) {
      console.error('Error: Invalid or non-positive primary count (N) parsed.');
      return 'Input Error';
    }

    // Parse the second line to get the sequence of operational values.
    // Each value is converted to an integer.
    const operationalSequence = processedInputLines[1].split(' ').map(token => parseInt(token, 10));

    // Optional validation: Check if the length of the operational sequence
    // matches the primary count. While not strictly enforced by the original,
    // it's good practice for robust Type III cloning.
    if (operationalSequence.length !== primaryCount) {
      console.warn(`Warning: Operational sequence length (${operationalSequence.length}) does not match primary count (${primaryCount}). Proceeding with available data.`);
    }

    // Stage 2: Initialize constants and dynamic data structures.
    const modulusConstant = 1000000007; // A large prime number for modulo operations.
    const trackingArrayDimension = primaryCount + 1; // Size for our dynamic tracking array.

    // Initialize the tracking array with zeros.
    // Using a manual loop for initialization instead of `fill()` to introduce variation.
    const dynamicTracker = new Array(trackingArrayDimension);
    for (let k = 0; k < trackingArrayDimension; k++) {
      dynamicTracker[k] = 0;
    }

    // Set an initial specific value at the first position of the tracker array.
    dynamicTracker[0] = 3;

    // Initialize the cumulative product, which will be updated throughout the loop.
    let currentCumulativeProduct = 1;

    // Stage 3: Main iterative computation loop.
    // The loop runs 'primaryCount' times, processing each element of the operational sequence.
    for (let currentIterationIndex = 0; currentIterationIndex < primaryCount; currentIterationIndex++) {
      // Fetch the current value from the input sequence for this iteration.
      const sequenceElementValue = operationalSequence[currentIterationIndex];

      // Retrieve the current count from the dynamicTracker based on the sequence element value.
      // If `sequenceElementValue` is out of bounds, `dynamicTracker[sequenceElementValue]` will be `undefined`.
      // Multiplying by `undefined` will result in `NaN` (Not-a-Number), which propagates.
      const trackerValueAtElement = dynamicTracker[sequenceElementValue];

      // Update the cumulative product: multiply by the tracker value and apply modulo.
      currentCumulativeProduct = (currentCumulativeProduct * trackerValueAtElement) % modulusConstant;

      // Stage 4: Update the dynamic tracker array.
      // Decrement the count at the position indicated by the current sequence element.
      // Add a boundary check for robustness. If out of bounds, the original would try
      // to decrement `undefined`, which results in `NaN` being propagated.
      if (sequenceElementValue >= 0 && sequenceElementValue < trackingArrayDimension) {
        dynamicTracker[sequenceElementValue]--;
      } else {
        console.warn(`Warning: Attempted to decrement out-of-bounds tracker index: ${sequenceElementValue}. NaN propagation likely.`);
      }

      // Increment the count at the position immediately following the current sequence element.
      const nextTrackerPosition = sequenceElementValue + 1;
      // Add a boundary check. If `nextTrackerPosition` is out of bounds,
      // `dynamicTracker[nextTrackerPosition]` would be `undefined`, and `undefined++`
      // results in `NaN` being assigned to that position.
      if (nextTrackerPosition >= 0 && nextTrackerPosition < trackingArrayDimension) {
        dynamicTracker[nextTrackerPosition]++;
      } else {
        console.warn(`Warning: Attempted to increment out-of-bounds tracker index: ${nextTrackerPosition}. NaN propagation likely.`);
      }
    }

    // Stage 5: Return the final computed result.
    // Convert the numerical result to a string before returning.
    return String(currentCumulativeProduct);
  };

  // Main execution block:
  try {
    // Read the entire content of the standard input file synchronously.
    const rawInputContents = fileSystemModule.readFileSync(standardInputPath, 'utf8');

    // Call the main calculation function with the raw input.
    const finalComputedOutput = performComplexCalculation(rawInputContents);

    // Print the final result to the console (standard output).
    console.log(finalComputedOutput);
  } catch (executionError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error('An unhandled error occurred during script execution:', executionError.message);
    // Provide a simplified output for the user in case of a fatal error.
    console.log('Execution failed due to an error.');
  }
})();