function processData() {
  // Store the processed input lines
  let rawInputLines = input;

  // Initialize a 2D array (matrix) to store counts.
  // The original code uses a 14x14 matrix, padded with 2 on each side for easier indexing.
  // This allows direct use of iy+2, iy-2, ix+2, ix-2 without boundary checks for the core logic.
  const gridMatrix = [
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

  // Iterate through the input lines in reverse order, excluding the last empty line if present.
  let lineCount = rawInputLines.length - 1;
  for (; lineCount--;) {
    const currentLine = rawInputLines[lineCount];
    // Parse coordinates and adjust by adding 2 for padding.
    const colIndex = parseInt(currentLine[0]) + 2;
    const rowIndex = parseInt(currentLine[2]) + 2;

    // Apply increments based on the type specified in currentLine[4].
    // The switch statement uses fall-through behavior.
    switch (currentLine[4]) {
      case '3': // Type 3 includes Type 2 and Type 1 increments
        gridMatrix[rowIndex + 2][colIndex]++;
        gridMatrix[rowIndex - 2][colIndex]++;
        gridMatrix[rowIndex][colIndex - 2]++;
        gridMatrix[rowIndex][colIndex + 2]++;
      case '2': // Type 2 includes Type 1 increments
        gridMatrix[rowIndex + 1][colIndex - 1]++;
        gridMatrix[rowIndex + 1][colIndex + 1]++;
        gridMatrix[rowIndex - 1][colIndex - 1]++;
        gridMatrix[rowIndex - 1][colIndex + 1]++;
      case '1': // Type 1 increments
        gridMatrix[rowIndex + 1][colIndex]++;
        gridMatrix[rowIndex][colIndex - 1]++;
        gridMatrix[rowIndex][colIndex]++;
        gridMatrix[rowIndex][colIndex + 1]++;
        gridMatrix[rowIndex - 1][colIndex]++;
        break; // Exit switch after Type 1 operations
    }
  }

  // Calculate the number of cells with zero drops and the maximum drops in any cell.
  let notDroppedCount = 0; // Counter for cells with 0 drops
  let maxDroppedCount = 0; // Stores the maximum number of drops in any cell

  // Iterate over the effective 10x10 grid (excluding the padding).
  let rowIter = 10;
  for (; rowIter--;) {
    let colIter = 10;
    for (; colIter--;) {
      // Check if the cell has zero drops (value is 0).
      // The `!` operator converts 0 to true, and any non-zero to false.
      // `notDroppedCount` increments if the cell value is 0.
      notDroppedCount += !(gridMatrix[rowIter + 2][colIter + 2]);
      // Update `maxDroppedCount` with the maximum value found so far.
      maxDroppedCount = findMaximum(gridMatrix[rowIter + 2][colIter + 2], maxDroppedCount);
    }
  }

  // Output the results to the console.
  console.log(notDroppedCount);
  console.log(maxDroppedCount);
}

// Custom function to find the maximum of two numbers using bitwise operations.
// This is equivalent to Math.max(valA, valB) for non-negative integers.
function findMaximum(valA, valB) {
  const tempDiff = (valA - valB);
  // If valA > valB, tempDiff is positive, (tempDiff >> 31) is 0, so valA - 0 = valA.
  // If valA <= valB, tempDiff is negative or zero, (tempDiff >> 31) is -1 (for negative),
  // so tempDiff & -1 is tempDiff. Then valA - tempDiff = valA - (valA - valB) = valB.
  return valA - (tempDiff & (tempDiff >> 31));
}

// Global variable to accumulate input data.
let fullInputString = '';

// Set up standard input processing for Node.js environment.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
  fullInputString += dataChunk;
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
  // Split the accumulated input string by newline characters.
  input = fullInputString.split('\n');
  // Call the main processing function.
  processData();
});
