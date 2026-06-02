function processGridData(rawDataLines) {
  // Extract grid dimensions from the initial line of input.
  // The first number represents the height, the second is the width.
  const gridHeight = rawDataLines[0].split(' ')[0] - 0;
  const gridWidth = rawDataLines[0].split(' ')[1] - 0;

  // This array will store the 1-indexed [row, column] coordinates of all cells
  // that contain an odd numerical value.
  const oddCellCoordinates = [];

  // Iterate through each row of the grid data, starting from the first actual data row.
  for (let currentRowIndex = 1; currentRowIndex <= gridHeight; currentRowIndex++) {
    // For rows with an odd index, process cell values from left to right.
    if (currentRowIndex % 2 === 1) {
      rawDataLines[currentRowIndex].split(' ').forEach((cellValue, currentColOffset) => {
        // If the current cell's value is odd, add its coordinates to our list.
        if (cellValue % 2 === 1) {
          oddCellCoordinates.push([currentRowIndex, currentColOffset + 1]);
        }
      });
    }
    // For rows with an even index, process cell values from right to left.
    else {
      rawDataLines[currentRowIndex].split(' ').reverse().forEach((cellValue, currentColOffset) => {
        // If the current cell's value is odd, add its coordinates to our list.
        // The column index needs to be adjusted because of the reversed iteration.
        if (cellValue % 2 === 1) {
          oddCellCoordinates.push([currentRowIndex, gridWidth - currentColOffset]);
        }
      });
    }
  }

  // This array will accumulate the individual movement segments.
  // Each segment is represented as [start_row, start_col, end_row, end_col].
  const pathSegments = [];

  // Process the collected odd cell coordinates in pairs.
  // Each pair defines a path from a 'current' odd cell to a 'target' odd cell.
  for (let pairIndex = 0; pairIndex < Math.floor(oddCellCoordinates.length / 2); pairIndex++) {
    let currentPosition = oddCellCoordinates[pairIndex * 2];
    const targetPosition = oddCellCoordinates[pairIndex * 2 + 1];

    // This check handles cases where a target position might be unexpectedly missing,
    // though it's unlikely given the loop condition.
    if (targetPosition === null) {
      break;
    }

    // Convert the target position array to a string for efficient comparison
    // within the movement generation loop.
    const targetPositionString = targetPosition.toString();

    // Generate a sequence of single-step moves to get from the current position
    // to the target position.
    while (currentPosition.toString() !== targetPositionString) {
      // If the current column is different from the target column, move horizontally.
      if (currentPosition[1] !== targetPosition[1]) {
        if (currentPosition[1] < targetPosition[1]) {
          // Move one step to the right.
          pathSegments.push([currentPosition[0], currentPosition[1], currentPosition[0], ++currentPosition[1]]);
        } else {
          // Move one step to the left.
          pathSegments.push([currentPosition[0], currentPosition[1], currentPosition[0], --currentPosition[1]]);
        }
      }
      // If the columns are the same, it means we need to move vertically (downwards).
      else {
        // Move one step down.
        pathSegments.push([currentPosition[0], currentPosition[1], ++currentPosition[0], currentPosition[1]]);
      }
    }
  }

  // Output the total count of generated movement segments.
  console.log(pathSegments.length);
  // Output each movement segment on a new line, formatted as "r1 c1 r2 c2".
  console.log(pathSegments.join('\n'));
}

// Read the entire input from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and split it into an array of lines.
// Then, pass this array to our main processing function.
processGridData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
