process.stdin.flow(); // Initialize the standard input stream to flow mode.
process.stdin.configureEncoding('utf8'); // Configure the input stream to use UTF-8 character encoding.

process.stdin.addListener('inputData', function(inputString) { // Attach an event listener for incoming data chunks.
  preprocessInput(inputString); // Forward the received input data for initial processing.
});

var outputLog = console.log; // Establish an alias for the console's logging utility.

/**
 * Performs preliminary processing and cleansing of the raw input string.
 * @param {string} inputString - The unadulterated string content from standard input.
 */
function preprocessInput(inputString) {
  // Divide the complete input string into an array of separate lines.
  let parsedLines = inputString.split("\n");

  // Eliminate any empty string entries that may have resulted from the splitting operation.
  parsedLines = parsedLines.filter(function(elementItem) {
    return (elementItem !== "");
  });

  // Transfer the now-cleaned collection of lines to the primary computational function.
  processCoreLogic(parsedLines);
}

// The heart of the application's logic resides in this section.
/**
 * Executes the principal algorithm on an array of numeric strings.
 * This routine iterates through segments, discards extreme values, and reports averages.
 * @param {Array<string>} inputNumberStrings - An array where each string represents a numerical value.
 */
function processCoreLogic(inputNumberStrings) {
  // Convert every string element within the array into its corresponding numeric type.
  const numericList = inputNumberStrings.map(function(stringItem) {
    return Number(stringItem);
  });

  // Continue the processing cycle as long as the numeric list retains at least two elements.
  while (numericList.length > 1) {
    // The very first element signifies the designated length of the subsequent data segment.
    let segmentLength = numericList.shift();

    // Extract a new segment of numbers from the beginning of the list, based on the determined length.
    let currentSegment = numericList.slice(0, segmentLength);

    // Remove the segment that was just extracted from the main numeric list.
    numericList.splice(0, segmentLength);

    // Identify the position of the smallest numerical value within the current segment.
    const minIndex = currentSegment.indexOf(Math.min.apply(null, currentSegment));
    // Remove this identified minimum value from the segment.
    currentSegment.splice(minIndex, 1);

    // Identify the position of the largest numerical value within the modified segment.
    const maxIndex = currentSegment.indexOf(Math.max.apply(null, currentSegment));
    // Remove this identified maximum value from the segment.
    currentSegment.splice(maxIndex, 1);

    // Compute the cumulative sum of all remaining numbers in the segment.
    const totalSum = currentSegment.reduce(function(previousValue, currentValue) {
      return previousValue + currentValue;
    }, 0); // Ensure the accumulator starts at zero.

    // Calculate the integer part of the average of the remaining numbers and output it.
    outputLog(Math.floor(totalSum / currentSegment.length));
  }
}