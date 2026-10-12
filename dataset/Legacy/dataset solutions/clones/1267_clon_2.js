'use strict';
(function(inputContent) {
  // This function constructs a mosaic pattern based on provided dimensions.
  function generatePattern(dimensions) {
    // Extract height and width from the input array.
    var heightVal = dimensions[0]; // The vertical extent of the pattern.
    var widthVal = dimensions[1]; // The horizontal extent of the pattern.

    // Initialize an array to build the first type of row.
    var firstRowPattern = [];
    var currentSymbol = ''; // Temporary variable to hold the character.

    // Populate the first row pattern: alternating '#' and '.' starting with '#'.
    for (var idxA = 0; idxA < widthVal; idxA++) {
      currentSymbol = (idxA % 2 === 0) ? '#' : '.'; // Determine character based on index parity.
      firstRowPattern.push(currentSymbol); // Add character to the row.
    }
    firstRowPattern = firstRowPattern.join(''); // Convert array of characters to a single string.

    // Initialize an array to build the second type of row.
    var secondRowPattern = [];
    // Populate the second row pattern: alternating '.' and '#' starting with '.'.
    for (var idxB = 0; idxB < widthVal; idxB++) {
      currentSymbol = (idxB % 2 === 0) ? '.' : '#'; // Determine character based on index parity.
      secondRowPattern.push(currentSymbol); // Add character to the row.
    }
    secondRowPattern = secondRowPattern.join(''); // Convert array of characters to a single string.

    // Initialize an array to store all the generated lines of the mosaic.
    var finalOutputLines = [];
    // Construct the full mosaic by alternating the two row patterns.
    for (var idxC = 0; idxC < heightVal; idxC++) {
      currentSymbol = (idxC % 2 === 0) ? firstRowPattern : secondRowPattern; // Choose row pattern based on line index parity.
      finalOutputLines.push(currentSymbol); // Add the chosen row string to the result.
    }
    // Join all lines with newline characters to form the complete mosaic string.
    return finalOutputLines.join('\n');
  }

  // Process the raw input data from stdin.
  var rawInputData = inputContent.toString().trim().split('\n');
  // Filter out the '0 0' termination marker and get the actual dimension pairs.
  var processedDimensions = rawInputData.slice(0, rawInputData.indexOf('0 0'));
  // Convert each dimension string pair into an array of two numbers.
  processedDimensions = processedDimensions.map(function(dimensionString) {
    return dimensionString.split(' ').map(Number);
  });

  // Generate all mosaic patterns using the processed dimensions.
  var allPatternsCombined = processedDimensions.map(generatePattern);
  // Join all generated patterns with double newlines for separation.
  allPatternsCombined = allPatternsCombined.join('\n\n');

  // Output the final combined patterns to the console.
  console.log(allPatternsCombined);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
