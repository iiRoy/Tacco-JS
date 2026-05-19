const processInputGrid = (rawData) => {
  // Split the input string into lines, discard the first line (header/metadata),
  // filter out any empty lines, and then split each remaining line into individual characters.
  // This creates a 2D array (matrix) of characters representing the grid.
  const gridData = rawData
    .split('\n')
    .slice(1)
    .filter((nonEmptyLine) => nonEmptyLine)
    .map((gridRow) => gridRow.split(''));

  // Iterate over each row of the grid.
  const processedGrid = gridData.map((rowChars, rowIndex, currentGrid) => {
    // For each character in the current row, determine its new value.
    const processedRow = rowChars.map((cellValue, colIndex) => {
      // If the cell contains a bomb ('#'), keep it as is.
      if (cellValue === '#') {
        return '#';
      } else {
        // Otherwise, calculate the number of adjacent bombs.
        let totalBombCount = 0;

        // Define the row indices for neighbors (current row, and adjacent rows if they exist).
        const neighborRowIndices = [rowIndex - 1, rowIndex, rowIndex + 1].filter(
          (neighborRowIdx) => currentGrid[neighborRowIdx]
        );

        // Iterate through valid neighbor row indices.
        for (const neighborRowIdx of neighborRowIndices) {
          let rowBombCount = 0;
          // Define the column indices for neighbors (current column, and adjacent columns if they exist).
          const neighborColIndices = [colIndex - 1, colIndex, colIndex + 1];

          // Iterate through valid neighbor column indices.
          for (const neighborColIdx of neighborColIndices) {
            // Check if the neighbor cell exists and contains a bomb.
            if (
              currentGrid[neighborRowIdx][neighborColIdx] &&
              currentGrid[neighborRowIdx][neighborColIdx] === '#'
            ) {
              rowBombCount++;
            }
          }
          totalBombCount += rowBombCount;
        }
        // Return the count of adjacent bombs as a string.
        return String(totalBombCount);
      }
    });
    // Join the processed characters of the current row back into a string.
    return processedRow.join('');
  });

  // Join all processed rows back into a single string, separated by newlines.
  return processedGrid.join('\n');
};

// Read input from standard input, process it, and print the result to console.
console.log(processInputGrid(require('fs').readFileSync('/dev/stdin', 'utf8')));
