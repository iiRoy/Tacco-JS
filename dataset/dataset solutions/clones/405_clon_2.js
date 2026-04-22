#!/usr/bin/node
// This script processes numerical input from standard input.
(function () {
  // An array to store the numeric values parsed from the input stream.
  let collectedInputNumbers = [];

  // Establish a connection to the standard input stream.
  const inputSourceStream = process.openStdin();

  // Configure the character encoding for the incoming data to UTF-8.
  inputSourceStream.setEncoding('utf8');

  // Initialize a special numerical sequence with its starting values.
  let dynamicNumberSeries = [1, 1, 2];

  // Generate the subsequent terms of the sequence based on a tribonacci-like rule.
  // The sequence is extended up to the 30th element.
  for (let seriesIndex = 3; seriesIndex < 31; seriesIndex++)
    dynamicNumberSeries.push(
      dynamicNumberSeries[seriesIndex - 1] +
        dynamicNumberSeries[seriesIndex - 2] +
        dynamicNumberSeries[seriesIndex - 3]
    );

  // A buffer to temporarily hold incomplete lines received from the input.
  let partialLineCache = '';

  // Register an event listener for when data chunks are received from standard input.
  inputSourceStream.on('data', function (incomingDataBlock) {
    // Combine any previous partial line with the new data, then split into distinct lines.
    let processedLineSegments = (partialLineCache + incomingDataBlock).split(
      '\n'
    );

    // The last segment might not be a complete line; save it back to the buffer.
    partialLineCache = processedLineSegments.pop();

    // Iterate through the array of complete lines.
    for (let lineIndex = 0; lineIndex < processedLineSegments.length; lineIndex++) {
      // Skip any empty strings that result from multiple newlines or trailing newlines.
      if (processedLineSegments[lineIndex] === '') {
        continue;
      }

      // Convert the line string into an integer and add it to our collection.
      collectedInputNumbers.push(parseInt(processedLineSegments[lineIndex], 10));
    }
  });

  // Register an event listener for when the standard input stream ends.
  inputSourceStream.on('end', function (_eventData) {
    // Loop through each collected number to perform the final calculation.
    for (let seriesIndex = 0; collectedInputNumbers[seriesIndex]; seriesIndex++) {
      // Calculate a specific value using the dynamic series and the collected input.
      // The result is then floored to ensure an integer output.
      console.log(
        Math.floor(
          (dynamicNumberSeries[collectedInputNumbers[seriesIndex]] + 3649) / 3650
        )
      );
    }
  });
})();