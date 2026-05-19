function processData() {
  const dataLines = rawInputBuffer;

  // Constants for grid dimensions and offset mapping original coordinates to 0-indexed array
  const GRID_MIN_COORD = -2;
  const GRID_MAX_COORD = 11;
  const GRID_OFFSET = -GRID_MIN_COORD; // Offset to make smallest original index (-2) map to 0
  const GRID_DIMENSION = GRID_MAX_COORD - GRID_MIN_COORD + 1; // Total size: 11 - (-2) + 1 = 14

  // Initialize gridCounts (renamed from 'f') using Array.from for moderate structural change.
  // This creates a 0-indexed 2D array, which will be accessed using GRID_OFFSET.
  const gridCounts = Array.from({ length: GRID_DIMENSION }, () =>
    Array.from({ length: GRID_DIMENSION }, () => 0)
  );

  // Replicate original loop behavior: processes dataLines[dataLines.length - 2] down to dataLines[0].
  // This means it skips the last element (often an empty string from split('\n'))
  // and also skips all elements if dataLines.length is 0 or 1.
  for (let lineIndex = dataLines.length - 2; lineIndex >= 0; --lineIndex) {
    const currentLine = dataLines[lineIndex];

    // Original code would produce NaN from parseInt if currentLine is empty or malformed,
    // leading to runtime errors when accessing gridCounts[NaN + offset][NaN + offset].
    // This behavior is preserved.
    const parsedX = parseInt(currentLine[0], 10);
    const parsedY = parseInt(currentLine[2], 10);
    const patternType = currentLine[4];

    // Introduce temporary constants for offsets for clarity
    const offset_1 = 1;
    const offset_2 = 2;

    // Helper function for incrementing grid cell, applying the necessary offset
    const incrementGridCell = (yCoord, xCoord) => {
      gridCounts[yCoord + GRID_OFFSET][xCoord + GRID_OFFSET]++;
    };

    switch (patternType) {
      case '3':
        incrementGridCell(parsedY + offset_2, parsedX);
        incrementGridCell(parsedY - offset_2, parsedX);
        incrementGridCell(parsedY, parsedX - offset_2);
        incrementGridCell(parsedY, parsedX + offset_2);
      // Fall-through is preserved as in the original code
      case '2':
        incrementGridCell(parsedY + offset_1, parsedX - offset_1);
        incrementGridCell(parsedY + offset_1, parsedX + offset_1);
        incrementGridCell(parsedY - offset_1, parsedX - offset_1);
        incrementGridCell(parsedY - offset_1, parsedX + offset_1);
      // Fall-through is preserved as in the original code
      case '1':
        incrementGridCell(parsedY + offset_1, parsedX);
        incrementGridCell(parsedY, parsedX - offset_1);
        incrementGridCell(parsedY, parsedX);
        incrementGridCell(parsedY, parsedX + offset_1);
        incrementGridCell(parsedY - offset_1, parsedX);
        break;
    }
  }

  // Renamed nd to notDroppedCount, md to maxDroppedCount
  let notDroppedCount = 0;
  let maxDroppedCount = 0;

  // Original loop iterates y from 9 down to 0, x from 9 down to 0.
  // These are the "visible" grid coordinates (0-9).
  const DISPLAY_GRID_MAX_COORD = 9;

  for (let rowIdx = DISPLAY_GRID_MAX_COORD; rowIdx >= 0; --rowIdx) {
    for (let colIdx = DISPLAY_GRID_MAX_COORD; colIdx >= 0; --colIdx) {
      // Access grid with offset to map original coordinates to 0-indexed array
      const currentCellCount = gridCounts[rowIdx + GRID_OFFSET][colIdx + GRID_OFFSET];
      // Rewrite !(f[y][x]) to (currentCellCount === 0) for clarity
      if (currentCellCount === 0) {
        notDroppedCount++;
      }
      // Renamed mx to findMax and used Math.max for observable equivalence
      maxDroppedCount = findMax(currentCellCount, maxDroppedCount);
    }
  }

  console.log(notDroppedCount);
  console.log(maxDroppedCount);
}

// Renamed mx to findMax, a to valA, b to valB.
// Rewritten using Math.max for observable equivalence, replacing the bitwise trick.
function findMax(valA, valB) {
  return Math.max(valA, valB);
}

// Renamed input to rawInputBuffer
let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
  // Split input by newline and then call the main processing function
  rawInputBuffer = rawInputBuffer.split('\n');
  processData(); // Call the renamed main function
});
