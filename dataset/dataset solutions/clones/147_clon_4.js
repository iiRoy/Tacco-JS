((sourceMaterial) => {
  // Utility function to verify if a given coordinate pair falls within the 8x8 grid boundaries.
  // This replaces the 'check' function from the original.
  const isWithinBoundary = (colIndex, rowIndex) =>
    colIndex >= 0 && colIndex < 8 && rowIndex >= 0 && rowIndex < 8;

  // A registry of all recognized geometric patterns.
  // Each pattern has a unique label and a list of coordinate offsets relative to the starting point.
  // This data structure replaces the 'if/else if' chain in the original's 'exists_' function.
  const patternRegistry = [
    { label: 'A', offsets: [[1, 0], [0, 1], [1, 1]] },
    { label: 'B', offsets: [[0, 1], [0, 2], [0, 3]] },
    { label: 'C', offsets: [[1, 0], [2, 0], [3, 0]] },
    { label: 'D', offsets: [[0, 1], [-1, 1], [-1, 2]] },
    { label: 'E', offsets: [[1, 0], [1, 1], [2, 1]] },
    { label: 'F', offsets: [[0, 1], [1, 1], [1, 2]] },
    { label: 'G', offsets: [[1, 0], [0, 1], [-1, 1]] },
  ];

  // Function to determine which geometric pattern, if any, is formed starting from a given coordinate.
  // This replaces the 'exists_' function from the original.
  const ascertainStructure = (initialColumn, initialRow) => {
    for (const pattern of patternRegistry) {
      let allPointsValid = true;
      for (const [dx, dy] of pattern.offsets) {
        // Check if all relative points for the current pattern are within bounds.
        if (!isWithinBoundary(initialColumn + dx, initialRow + dy)) {
          allPointsValid = false;
          break; // If any point is out of bounds, this pattern doesn't match.
        }
      }
      if (allPointsValid) {
        return pattern.label; // Return the label of the first matching pattern.
      }
    }
    return undefined; // If no pattern matches, return undefined.
  };

  // Recursively searches for the first occurrence of the number '1' in a 2D grid.
  // This provides a divergent strategy compared to the original's imperative nested loops in 'exists'.
  const findFirstMark = (gridData, currentR = 0, currentC = 0) => {
    if (currentR >= 8) { // Base case: All rows have been checked.
      return null;
    }

    if (currentC >= 8) { // Base case: End of the current row, move to the next.
      return findFirstMark(gridData, currentR + 1, 0);
    }

    if (gridData[currentR][currentC] === 1) {
      // Found the first '1', return its column and row.
      return { col: currentC, row: currentR };
    }

    // Continue the search in the next column of the current row.
    return findFirstMark(gridData, currentR, currentC + 1);
  };

  // Parses the raw input string into an array of 2D number arrays (grids).
  // This replaces the initial input processing logic within the original's IIFE.
  const parseInputGrids = (rawText) => {
    const gridBlocks = rawText.replace(/\n$/, '').split('\n\n');
    const resultGrids = [];

    for (let currentBlock of gridBlocks) {
      const lines = currentBlock.split('\n');
      const currentGrid = [];
      for (let lineContent of lines) {
        // Convert each character in the line to a number using Array.from.
        currentGrid.push(Array.from(lineContent, char => Number(char)));
      }
      resultGrids.push(currentGrid);
    }
    return resultGrids;
  };

  // Main execution sequence.
  const allGrids = parseInputGrids(sourceMaterial);

  // Process each parsed grid individually.
  for (const singleGrid of allGrids) {
    const startingCoordinate = findFirstMark(singleGrid);
    let finalResult;
    if (startingCoordinate) {
      // If a '1' is found, try to ascertain its structure.
      finalResult = ascertainStructure(startingCoordinate.col, startingCoordinate.row);
    } else {
      // If no '1' is found, the result is undefined, mirroring original behavior.
      finalResult = undefined;
    }
    console.log(finalResult);
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));