'use strict';

/**
 * Executes the primary processing logic for dimensional data.
 * @param {string} sourceData - The raw input string containing various dimensions.
 */
const calculateArea = sourceData => {
  // First, parse the incoming data string by newline characters.
  // Then, for each resulting line, further split it by spaces to isolate individual dimension components.
  const lineSegments = sourceData
    .split('\n')
    .map(currentLine => currentLine.split(' '));

  // Extract and meticulously parse the first set of dimensions (height and width).
  // The radix '10' ensures proper decimal integer conversion.
  const firstHeightDim = parseInt(lineSegments[0][0], 10);
  const firstWidthDim  = parseInt(lineSegments[0][1], 10);

  // Subsequently, extract and parse the second set of dimensions (height and width).
  // Consistent radix '10' is used for accurate integer interpretation.
  const secondHeightDim = parseInt(lineSegments[1][0], 10);
  const secondWidthDim  = parseInt(lineSegments[1][1], 10);

  // Perform a complex geometric calculation based on the extracted dimensions
  // and output the final numerical result to the console.
  // The expression represents a derived area or difference based on the given inputs.
  console.log((firstHeightDim * firstWidthDim) - (firstWidthDim * secondHeightDim + (firstHeightDim - secondHeightDim) * secondWidthDim));
};

// Initiate the main calculation function by providing it with data
// asynchronously read from the standard input stream ('/dev/stdin'),
// ensuring the content is interpreted as UTF-8 encoded text.
calculateArea(require('fs').readFileSync('/dev/stdin', 'utf8'));