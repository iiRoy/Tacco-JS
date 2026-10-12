function executePrimaryLogic() {
  // This variable holds the input data after initial processing.
  let processedData = rawInputBuffer;

  // Initialize a 2D array (matrix) with zeros.
  // This matrix will store counts based on input coordinates.
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

  // Iterate through the input data in reverse order.
  let dataLength = processedData.length - 1;
  for (; dataLength--;) {
    const currentLine = processedData[dataLength]; // Get the current line of input.
    // Parse coordinates from the line and add an offset of 2.
    const xCoord = parseInt(currentLine[0]) + 2;
    const yCoord = parseInt(currentLine[2]) + 2;

    // Apply different patterns based on the character at index 4 of the line.
    switch (currentLine[4]) {
      case '3': // Pattern 3: Adds to cells 2 units away in cardinal directions.
        gridMatrix[yCoord + 2][xCoord]++;
        gridMatrix[yCoord - 2][xCoord]++;
        gridMatrix[yCoord][xCoord - 2]++;
        gridMatrix[yCoord][xCoord + 2]++;
      // Fall-through to case '2' is intentional.
      case '2': // Pattern 2: Adds to cells 1 unit away diagonally.
        gridMatrix[yCoord + 1][xCoord - 1]++;
        gridMatrix[yCoord + 1][xCoord + 1]++;
        gridMatrix[yCoord - 1][xCoord - 1]++;
        gridMatrix[yCoord - 1][xCoord + 1]++;
      // Fall-through to case '1' is intentional.
      case '1': // Pattern 1: Adds to cells 1 unit away in cardinal directions and the center.
        gridMatrix[yCoord + 1][xCoord]++;
        gridMatrix[yCoord][xCoord - 1]++;
        gridMatrix[yCoord][xCoord]++;
        gridMatrix[yCoord][xCoord + 1]++;
        gridMatrix[yCoord - 1][xCoord]++;
        break; // Exit switch after '1' pattern.
    }
  }

  // Initialize counters for analysis.
  let notDroppedCount = 0; // Counts cells with a value of 0.
  let maxDroppedValue = 0; // Stores the maximum value found in any cell.

  // Iterate through a 10x10 sub-grid of the matrix (offset by 2).
  let rowIterator = 10;
  for (; rowIterator--;) {
    let colIterator = 10;
    for (; colIterator--;) {
      // Check if the cell at the current (offset) coordinates is zero.
      notDroppedCount += !(gridMatrix[rowIterator + 2][colIterator + 2]);
      // Update the maximum dropped value using the findMaximum helper function.
      maxDroppedValue = findMaximum(gridMatrix[rowIterator + 2][colIterator + 2], maxDroppedValue);
    }
  }

  // Output the calculated counts to the console.
  console.log(notDroppedCount);
  console.log(maxDroppedValue);
}

/**
 * Determines the maximum of two numbers using bitwise operations.
 * This is an alternative to Math.max().
 * @param {number} valA - The first numeric value.
 * @param {number} valB - The second numeric value.
 * @returns {number} The larger of the two input values.
 */
function findMaximum(valA, valB) {
  const tempDiff = (valA - valB);
  // If valA > valB, tempDiff is positive, (tempDiff >> 31) is 0, so valA - 0 = valA.
  // If valA <= valB, tempDiff is negative or zero, (tempDiff >> 31) is -1, so valA - (-tempDiff) = valA + tempDiff = valA + (valA - valB) = valB.
  return valA - (tempDiff & (tempDiff >> 31));
}

// Global variable to accumulate raw input from stdin.
let rawInputBuffer = '';

// Set up standard input processing.
process.stdin.resume(); // Keep the process alive.
process.stdin.setEncoding('utf8'); // Expect UTF-8 encoded text.

// Event listener for incoming data chunks.
process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk; // Append each chunk to the buffer.
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
  // Split the accumulated input into an array of lines.
  rawInputBuffer = rawInputBuffer.split('\n');
  // Execute the main logic after all input has been received.
  executePrimaryLogic();
});
