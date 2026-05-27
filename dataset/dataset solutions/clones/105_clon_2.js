function executeProcessing() {
  // Store the processed input lines locally for manipulation.
  var parsedInputLines = rawInputBuffer;

  // Initialize a 2D array (grid) to store cell counts.
  // The grid dimensions are extended by 2 in each direction (-2 to 11)
  // to handle boundary conditions from the input coordinates (0-9)
  // and the operations that access adjacent cells.
  var cellGrid = [];
  for (var rowIndex = -2; rowIndex < 12; rowIndex++) {
    cellGrid[rowIndex] = [];
    for (var colIndex = -2; colIndex < 12; colIndex++) {
      cellGrid[rowIndex][colIndex] = 0; // All cells start with a zero count.
    }
  }

  // Process each line of input, iterating backwards from the end.
  // The last line is typically empty due to `split('\n')`, so `length - 1`
  // and then `len--` correctly processes all meaningful lines.
  var remainingEntries = parsedInputLines.length - 1;
  while (remainingEntries--) {
    var currentEntry = parsedInputLines[remainingEntries];

    // Parse the X and Y coordinates from the current input line.
    // Assuming format "X Y Z" where X and Y are single digits.
    var xCoord = parseInt(currentEntry[0]);
    var yCoord = parseInt(currentEntry[2]);

    // The character at index 4 determines the pattern of cell increments.
    switch (currentEntry[4]) {
      case '3': // Pattern 3: Cross shape with 2-unit offset
        cellGrid[yCoord + 2][xCoord]++;
        cellGrid[yCoord - 2][xCoord]++;
        cellGrid[yCoord][xCoord - 2]++;
        cellGrid[yCoord][xCoord + 2]++;
      // Fall-through to Pattern 2 (no break)
      case '2': // Pattern 2: Diagonal cross shape with 1-unit offset
        cellGrid[yCoord + 1][xCoord - 1]++;
        cellGrid[yCoord + 1][xCoord + 1]++;
        cellGrid[yCoord - 1][xCoord - 1]++;
        cellGrid[yCoord - 1][xCoord + 1]++;
      // Fall-through to Pattern 1 (no break)
      case '1': // Pattern 1: Plus shape with 1-unit offset, plus center
        cellGrid[yCoord + 1][xCoord]++;
        cellGrid[yCoord][xCoord - 1]++;
        cellGrid[yCoord][xCoord]++; // Center cell
        cellGrid[yCoord][xCoord + 1]++;
        cellGrid[yCoord - 1][xCoord]++;
        break; // End of switch for this entry
    }
  }

  // Calculate the number of cells with zero drops and the maximum drops in any cell.
  var nonDroppedCount = 0; // Counter for cells that received no drops.
  var maximumDropped = 0; // Stores the highest drop count found.

  // Iterate through the core 10x10 grid (from 0 to 9 for both x and y).
  var rowIter = 10;
  while (rowIter--) {
    var colIter = 10;
    while (colIter--) {
      // If a cell has zero drops, increment the nonDroppedCount.
      if (!cellGrid[rowIter][colIter]) {
        nonDroppedCount++;
      }
      // Update maximumDropped if the current cell's value is higher.
      maximumDropped = determineMax(cellGrid[rowIter][colIter], maximumDropped);
    }
  }

  // Output the calculated results to the console.
  console.log(nonDroppedCount);
  console.log(maximumDropped);
}

// Custom function to find the maximum of two numbers using bitwise operations.
// This is an alternative to Math.max, often used for performance in specific contexts.
function determineMax(valueA, valueB) {
  var tempDifference = valueA - valueB;
  // If tempDifference is negative, (tempDifference >> 31) will be -1 (all 1s).
  // If tempDifference is positive or zero, (tempDifference >> 31) will be 0.
  // (tempDifference & (tempDifference >> 31)) effectively becomes:
  // - tempDifference if tempDifference is negative (valueA < valueB)
  // - 0 if tempDifference is positive or zero (valueA >= valueB)
  // So, valueA - (negative_diff) = valueA + positive_diff = valueB
  // And, valueA - 0 = valueA
  // This correctly returns the larger of the two.
  return valueA - (tempDifference & (tempDifference >> 31));
}

// Global variable to accumulate raw input from stdin.
var rawInputBuffer = '';

// Set up standard input processing.
process.stdin.resume(); // Keep the process alive while waiting for input.
process.stdin.setEncoding('utf8'); // Interpret input as UTF-8 text.

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
  rawInputBuffer += dataChunk; // Append each chunk to the buffer.
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
  // Split the accumulated input into an array of lines.
  rawInputBuffer = rawInputBuffer.split('\n');
  // Once all input is received, execute the main processing logic.
  executeProcessing();
});
