function ProcessInputData(rawInputData) {
  // Split the entire input string by newline characters into an array of lines.
  rawInputData = rawInputData.split('\n');

  // Parse grid dimensions from the first line of input.
  // The first number is the height, the second is the width.
  var gridDimensions = rawInputData[0].split(' ');
  var gridHeight = parseInt(gridDimensions[0], 10); // Convert string to integer, specifying base 10.
  var gridWidth = parseInt(gridDimensions[1], 10);

  // Parse the total number of distinct color segments from the second line.
  var numColorSegments = parseInt(rawInputData[1], 10);

  // Extract the string array containing the lengths of each color segment from the third line.
  var segmentLengthsArray = rawInputData[2].split(' ');

  // Initialize an empty array to store the flattened sequence of color blocks.
  // Each element will represent a color ID for a cell in the grid.
  var flatColorGrid = [];

  // Populate the flatColorGrid based on the provided segment lengths.
  // 'outerLoopCounter' here represents the segment index (0-based).
  for (var outerLoopCounter = 0; outerLoopCounter < numColorSegments; outerLoopCounter++) {
    // Get the length of the current color segment.
    var currentSegmentLength = parseInt(segmentLengthsArray[outerLoopCounter], 10);
    // Add the color ID (segment index + 1) to the flatColorGrid 'currentSegmentLength' times.
    for (var innerLoopCounter = 0; innerLoopCounter < currentSegmentLength; innerLoopCounter++) {
      flatColorGrid.push(outerLoopCounter + 1);
    }
  }

  // Initialize an empty string that will accumulate the final formatted output.
  var finalResultString = '';
  // Create an array to hold the string representation of each row of the grid.
  // It's initialized with 'gridHeight' empty strings.
  var currentGridRows = new Array(gridHeight).fill('');

  // Iterate through each row of the grid to construct its string representation.
  // 'outerLoopCounter' now represents the current row index.
  for (var outerLoopCounter = 0; outerLoopCounter < gridHeight; outerLoopCounter++) {
    // The first element of the current row is directly taken from the flatColorGrid.
    // Its index is calculated as (current row index * grid width).
    currentGridRows[outerLoopCounter] = flatColorGrid[outerLoopCounter * gridWidth];

    // Iterate through the remaining columns of the current row (starting from the second column).
    // 'innerLoopCounter' now represents the current column index.
    for (var innerLoopCounter = 1; innerLoopCounter < gridWidth; innerLoopCounter++) {
      // Calculate the corresponding index in the flatColorGrid for the current cell.
      var flatGridIndex = outerLoopCounter * gridWidth + innerLoopCounter;

      // Alternate the order of concatenation based on whether the row index is even or odd.
      // For even-indexed rows, append the new element to the right.
      // For odd-indexed rows, prepend the new element to the left.
      if (outerLoopCounter % 2 === 0) {
        currentGridRows[outerLoopCounter] = currentGridRows[outerLoopCounter] + ' ' + flatColorGrid[flatGridIndex];
      } else {
        currentGridRows[outerLoopCounter] = flatColorGrid[flatGridIndex] + ' ' + currentGridRows[outerLoopCounter];
      }

      // If this is the last column of the current row, append a newline character.
      if (innerLoopCounter === gridWidth - 1) {
        currentGridRows[outerLoopCounter] = currentGridRows[outerLoopCounter] + '\n';
      }
    }
    // Append the fully constructed row string to the final output string.
    finalResultString += currentGridRows[outerLoopCounter];
  }

  // Remove the very last newline character from the final output string, if present.
  finalResultString = finalResultString.slice(0, -1);

  // Print the final formatted grid to the console.
  console.log('%s', finalResultString);
}

// Read input from standard input using Node.js 'fs' module and pass it to the processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
