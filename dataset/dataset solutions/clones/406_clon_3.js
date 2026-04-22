#!/usr/bin/node
(function() {
  // Array to store numbers extracted from standard input.
  // This will hold the indices for accessing the pre-calculated series.
  let finalProcessedDataPoints = [];

  // Define constants for the series generation and output calculation.
  const MAX_SERIES_INDEX = 30;
  const DIVISION_OFFSET = 3649;
  const DIVISION_FACTOR = 3650;

  // Initialize the Tribonacci-like sequence cache.
  // The sequence starts with 1, 1, 2.
  // Subsequent terms are the sum of the three preceding terms.
  const computedSeriesValues = [1, 1, 2];

  // Generate the sequence up to MAX_SERIES_INDEX.
  // Using a while loop for variation.
  let currentSeriesIndex = 3;
  while (currentSeriesIndex <= MAX_SERIES_INDEX) {
    const prev1 = computedSeriesValues[currentSeriesIndex - 1];
    const prev2 = computedSeriesValues[currentSeriesIndex - 2];
    const prev3 = computedSeriesValues[currentSeriesIndex - 3];
    computedSeriesValues.push(prev1 + prev2 + prev3);
    currentSeriesIndex++;
  }

  // Set up the input stream from standard input.
  const standardInputChannel = process.openStdin();
  // Ensure the input is treated as UTF-8 text.
  standardInputChannel.setEncoding('utf8');

  // Event listener for incoming data chunks from standard input.
  standardInputChannel.on('data', (incomingDataChunk) => {
    // Process the raw input chunk by splitting it into individual lines.
    // Using a regex to handle both Windows (\r\n) and Unix (\n) line endings.
    const rawLineSegments = incomingDataChunk.split(/\r?\n/);
    const parsedNumericBatch = [];

    // Iterate over each line segment to extract valid numbers.
    for (let lineIndex = 0; lineIndex < rawLineSegments.length; lineIndex++) {
      const currentLine = rawLineSegments[lineIndex].trim();

      // Skip empty or whitespace-only lines.
      if (currentLine.length === 0) {
        continue;
      }

      // Attempt to parse the line as an integer.
      const parsedValue = Number.parseInt(currentLine, 10);

      // Only add valid numbers to the batch.
      if (!Number.isNaN(parsedValue)) {
        parsedNumericBatch.push(parsedValue);
      } else {
        // In a production scenario, one might log a warning for non-numeric input.
        // console.warn(`Skipping non-numeric input: "${currentLine}"`);
      }
    }

    // --- Complex logic for populating finalProcessedDataPoints ---
    // This section handles how the input batch affects the main data store.
    // This specific logic is designed to be compatible with various input scenarios,
    // including direct TTY input and file redirection.
    const hasMultipleValidNumbers = parsedNumericBatch.length > 1;
    const isSecondElementValid = hasMultipleValidNumbers && !Number.isNaN(parsedNumericBatch[1]);

    // If the batch contains more than two numbers, or if the second number is valid,
    // it implies a full set of inputs for processing, so overwrite the store.
    if (parsedNumericBatch.length > 2 || isSecondElementValid) {
      finalProcessedDataPoints = parsedNumericBatch;
    }
    // Otherwise, if there's at least one valid number, append the first one to the store.
    else if (parsedNumericBatch.length > 0) {
      finalProcessedDataPoints.push(parsedNumericBatch[0]);
    }
    // If the batch is empty, do nothing (implicitly handled here).
  });

  // Event listener for the end of the standard input stream.
  standardInputChannel.on('end', (terminationSignal) => {
    // Before processing, check if any data was collected.
    if (finalProcessedDataPoints.length === 0) {
      // console.error("No valid input data was provided for processing.");
      return; // Exit if nothing to process.
    }

    // Iterate through the collected input values.
    for (let outputIndex = 0; outputIndex < finalProcessedDataPoints.length; outputIndex++) {
      const currentInputValue = finalProcessedDataPoints[outputIndex];

      // Guard against invalid indices (e.g., negative or out of bounds for the series).
      if (currentInputValue < 0 || currentInputValue > MAX_SERIES_INDEX || Number.isNaN(currentInputValue)) {
        // console.warn(`Skipping invalid index: ${currentInputValue}`);
        continue;
      }

      const seriesValue = computedSeriesValues[currentInputValue];

      // Perform the calculation in distinct steps for clarity.
      const numerator = seriesValue + DIVISION_OFFSET;
      const resultBeforeFloor = numerator / DIVISION_FACTOR;

      // Use Math.floor for integer truncation, which is equivalent to `^0` for positive numbers.
      const finalResult = Math.floor(resultBeforeFloor);

      // Output the computed result to the console.
      console.log(finalResult);
    }
  });

  // Self-executing anonymous function ends here.
})();