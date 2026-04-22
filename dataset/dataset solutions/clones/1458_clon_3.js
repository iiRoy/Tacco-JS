function processInputData(inputRows) {
  let currentReadIndex = 0; // Manages the current position in the input array

  // Loop indefinitely until an explicit termination condition is met
  while (true) {
    // Attempt to extract and parse the expected number of items for the current dataset.
    // Using `Number()` is a concise way to parse numeric strings, handling both integers and floats.
    const expectedItemCount = Number(inputRows[currentReadIndex++]);

    // Termination condition: If the parsed count is zero or not a valid number (e.g., empty line, non-numeric input),
    // it signals the end of input or an invalid dataset, so we exit the loop.
    if (expectedItemCount === 0 || isNaN(expectedItemCount)) {
      break;
    }

    // Retrieve the line containing the numeric values for the current dataset.
    // Split the string by one or more whitespace characters.
    // Filter out any empty strings that might result from extra spaces or leading/trailing whitespace.
    const stringValueSegments = inputRows[currentReadIndex++].split(/\s+/).filter(segment => segment.trim() !== '');

    // Convert each string segment to a number.
    // Filter out any results that are NaN (Not-a-Number), ensuring only valid numbers are processed.
    const numericalDataSet = stringValueSegments.map(str => Number(str)).filter(num => !isNaN(num));

    // Guard clause: If, after parsing and filtering, no valid numbers remain, log a warning and
    // proceed to the next dataset without performing calculations.
    if (numericalDataSet.length === 0) {
      console.error("Warning: Current dataset contains no valid numerical entries. Skipping calculations.");
      continue;
    }

    // --- Calculation of Mean (Average) ---
    let runningSum = 0;
    for (const dataPoint of numericalDataSet) {
      runningSum += dataPoint;
    }
    const datasetMean = runningSum / numericalDataSet.length;

    // --- Calculation of Variance ---
    let sumOfSquaredDifferencesFromMean = 0;
    for (const dataPoint of numericalDataSet) {
      const differenceFromMean = dataPoint - datasetMean;
      // Square the difference. Direct multiplication is often preferred over Math.pow for squaring.
      sumOfSquaredDifferencesFromMean += (differenceFromMean * differenceFromMean);
    }
    const calculatedVariance = sumOfSquaredDifferencesFromMean / numericalDataSet.length;

    // --- Calculation of Standard Deviation ---
    const finalStandardDeviation = Math.sqrt(calculatedVariance);

    // Output the computed standard deviation, formatted to six decimal places for consistency.
    console.log(finalStandardDeviation.toFixed(6));
  }
}

// A temporary storage array for incoming data buffers from standard input.
const receivedDataBuffers = [];

// Event listener for chunks of data arriving via standard input.
process.stdin.on('data', (inputBufferSegment) => {
  // Convert each buffer segment to a string immediately and store it.
  receivedDataBuffers.push(inputBufferSegment.toString());
});

// Event listener for the end of the standard input stream.
process.stdin.on('end', () => {
  // Join all collected string segments into a single large string.
  // Split this string into individual lines.
  // Filter out any empty lines that might occur, for example, from trailing newlines.
  const processedInputLines = receivedDataBuffers.join('').split('\n').filter(line => line.trim() !== '');

  // Invoke the main processing function with the prepared array of input lines.
  processInputData(processedInputLines);
});