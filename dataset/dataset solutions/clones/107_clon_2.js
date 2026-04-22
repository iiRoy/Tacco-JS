function executeProgram() {
  // Retrieve the pre-processed input data for computation.
  let processedData = rawData;

  // Initialize a two-dimensional array, a grid structure, filled with zeroes.
  // This matrix will track interactions at various points.
  let gridMatrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  // Calculate the effective length for iterating through the input lines.
  let dataLength = processedData.length - 1;

  // Loop through each line of the processed data in reverse order.
  for (; dataLength--;) {
    let currentLine = processedData[dataLength]; // Extract the current line string.
    // Parse the column and row indices from the line, applying an offset.
    let colIndex = parseInt(currentLine[0], 10) + 2;
    let rowIndex = parseInt(currentLine[2], 10) + 2;

    // A switch statement to apply different increment patterns to the grid
    // based on a specific character in the current line.
    switch (currentLine[4]) {
      case '3': // This case affects cells at a distance of 2 units.
        gridMatrix[rowIndex + 2][colIndex]++;
        gridMatrix[rowIndex - 2][colIndex]++;
        gridMatrix[rowIndex][colIndex - 2]++;
        gridMatrix[rowIndex][colIndex + 2]++;
      // Intentionally falls through to the next case.
      case '2': // This case affects cells diagonally adjacent (1 unit in both directions).
        gridMatrix[rowIndex + 1][colIndex - 1]++;
        gridMatrix[rowIndex + 1][colIndex + 1]++;
        gridMatrix[rowIndex - 1][colIndex - 1]++;
        gridMatrix[rowIndex - 1][colIndex + 1]++;
      // Intentionally falls through to the next case.
      case '1': // This case affects immediate cardinal neighbors and the center cell.
        gridMatrix[rowIndex + 1][colIndex]++;
        gridMatrix[rowIndex][colIndex - 1]++;
        gridMatrix[rowIndex][colIndex]++;
        gridMatrix[rowIndex][colIndex + 1]++;
        gridMatrix[rowIndex - 1][colIndex]++;
        break; // Exit the switch statement.
    }
  }

  // Initialize variables to store the count of empty cells and the maximum value found.
  let emptyCellsCount = 0; // Counter for grid cells that remain zero.
  let maxCellValue = 0; // Stores the highest numerical value encountered in the grid.

  // Iterate over a specific 10x10 sub-section of the grid, applying an offset.
  let rowIterator = 10;
  for (; rowIterator--;) {
    let colIterator = 10;
    for (; colIterator--;) {
      // Increment the 'emptyCellsCount' if the current grid cell's value is zero.
      emptyCellsCount += !(gridMatrix[rowIterator + 2][colIterator + 2]);
      // Update 'maxCellValue' with the larger of its current value or the cell's value.
      maxCellValue = findMaximum(gridMatrix[rowIterator + 2][colIterator + 2], maxCellValue);
    }
  }

  // Use a local alias for console to log the final results.
  let outputLogger = console;
  outputLogger.log(emptyCellsCount);
  outputLogger.log(maxCellValue);
}

// A helper function to determine the maximum of two numbers using a bitwise trick.
function findMaximum(valA, valB) {
  let tempDiff = (valA - valB);
  // This expression cleverly returns the larger of valA and valB.
  // If valA is less than valB, (tempDiff >> 31) will be -1 (in two's complement),
  // making the result valA - (tempDiff & -1) = valA - tempDiff = valA - (valA - valB) = valB.
  // If valA is greater or equal to valB, (tempDiff >> 31) will be 0,
  // making the result valA - (tempDiff & 0) = valA - 0 = valA.
  return valA - (tempDiff & (tempDiff >> 31));
}


// A global variable to accumulate all incoming raw data chunks.
let rawData = '';

// Create an alias for the global 'process' object to conform to renaming requirements.
let systemUtility = process;

// Configure the standard input stream.
systemUtility.stdin.resume(); // Begin reading data from standard input.
systemUtility.stdin.setEncoding('utf8'); // Specify UTF-8 as the character encoding for input.

// Attach an event handler for when data chunks are received.
systemUtility.stdin.on('data', function (dataSegment) {
  rawData += dataSegment; // Append each new data segment to the rawData string.
});

// Attach an event handler for when the standard input stream closes.
systemUtility.stdin.on('end', function () {
  rawData = rawData.split('\n'); // Split the accumulated raw data into an array of lines.
  executeProgram(); // Call the main program execution function.
});