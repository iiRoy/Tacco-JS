function processGridData(rawDataLines) {
  // Extracting grid dimensions from the first line of input data.
  // The first number represents the total number of rows in the grid.
  var gridRows = rawDataLines[0].split(" ")[0] - 0;
  // The second number represents the total number of columns in the grid.
  var gridCols = rawDataLines[0].split(" ")[1] - 0;

  // This array will store the [row, column] coordinates of all cells
  // that contain an odd numerical value.
  var oddCellCoordinates = [];

  // Iterate through each row of the grid, starting from the first data row (index 1).
  for (var rowIndex = 1; rowIndex <= gridRows; rowIndex++) {
    // Check if the current row's index is an odd number.
    if (rowIndex % 2 === 1) {
      // For odd-indexed rows, cells are processed from left to right.
      rawDataLines[rowIndex].split(" ").forEach((cellValue, colIndex) => {
        // If the numeric value of the cell is odd, record its position.
        if (cellValue % 2 === 1) {
          oddCellCoordinates.push([rowIndex, colIndex + 1]); // Store 1-based column index.
        }
      });
    } else {
      // For even-indexed rows, cells are processed in reverse order (right to left).
      rawDataLines[rowIndex].split(" ").reverse().forEach((cellValue, reverseColIndex) => {
        // If the numeric value of the cell is odd, record its position.
        if (cellValue % 2 === 1) {
          // Calculate the correct 1-based column index for reversed traversal.
          oddCellCoordinates.push([rowIndex, gridCols - reverseColIndex]);
        }
      });
    }
  }

  // This array will accumulate all the individual movement steps required
  // to connect the odd-valued cells in pairs.
  var movementInstructions = [];

  // Process the collected odd cell coordinates in consecutive pairs.
  // Each pair defines a start and end point for a movement sequence.
  for (var pairIterator = 0; pairIterator < Math.floor(oddCellCoordinates.length / 2); pairIterator++) {
    // Get the current starting position for the path segment.
    var currentPosition = oddCellCoordinates[pairIterator * 2];
    // Get the designated target position for the path segment.
    var targetPosition = oddCellCoordinates[pairIterator * 2 + 1];

    // If there is no valid target position (e.g., an odd total number of odd cells),
    // break out of the loop as no further pairs can be formed.
    if (targetPosition === null) {
      break;
    }

    // Convert the target position array into a string for efficient comparison
    // within the inner movement loop.
    var targetPositionString = targetPosition.toString();

    // Continue generating movement steps until the current position
    // matches the target position.
    while (currentPosition.toString() !== targetPositionString) {
      // Check if the current column is different from the target column.
      if (currentPosition[1] !== targetPosition[1]) {
        // If the current column is less than the target column, move right.
        if (currentPosition[1] < targetPosition[1]) {
          movementInstructions.push([currentPosition[0], currentPosition[1], currentPosition[0], ++currentPosition[1]]);
        }
        // Otherwise (current column is greater), move left.
        else {
          movementInstructions.push([currentPosition[0], currentPosition[1], currentPosition[0], --currentPosition[1]]);
        }
      }
      // If the columns are the same, then the row must be different, so move down.
      else {
        movementInstructions.push([currentPosition[0], currentPosition[1], ++currentPosition[0], currentPosition[1]]);
      }
    }
  }

  // Output the total count of generated movement instructions.
  console.log(movementInstructions.length);
  // Output each movement instruction on a new line, representing the path.
  console.log(movementInstructions.join("\n"));
}


// Initiate the grid data processing by reading input from standard input.
// The input is assumed to be UTF-8 encoded, trimmed of whitespace, and split by newlines.
processGridData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));