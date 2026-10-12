#!/usr/bin/node
(function() {
  let gridData = [];
  let inputLines = [];
  const standardInput = process.openStdin();
  standardInput.setEncoding('utf8');

  const processConnectedComponent = function(colIdx, rowIdx, currentGrid) {
    const numRows = currentGrid.length;
    const numCols = currentGrid[0].length;

    // Guard clause for out-of-bounds or already visited cells (value 0)
    if (colIdx < 0 || colIdx >= numCols || rowIdx < 0 || rowIdx >= numRows || currentGrid[rowIdx][colIdx] === 0) {
      return;
    }

    // Mark the current cell as visited by setting its value to 0
    currentGrid[rowIdx][colIdx] = 0;

    // Define all 8 possible directions for neighbors (cardinal and diagonal)
    const neighborOffsets = [
      [-1, 0], [1, 0], [0, -1], [0, 1],   // Horizontal and Vertical
      [-1, -1], [1, -1], [-1, 1], [1, 1]  // Diagonal
    ];

    // Recursively call the function for all valid neighbors
    for (const offset of neighborOffsets) {
      const nextCol = colIdx + offset[0];
      const nextRow = rowIdx + offset[1];
      processConnectedComponent(nextCol, nextRow, currentGrid);
    }
  };

  const parseLineOfNumbers = (lineStr) => {
    if (lineStr === '') {
      return null; // Indicate an empty or invalid line
    }
    return lineStr.split(" ").map(valStr => parseInt(valStr, 10));
  };

  let partialInputBuffer = "";
  standardInput.on('data', function(chunk) {
    let combinedInput = partialInputBuffer + chunk;
    let lines = combinedInput.split("\n");
    partialInputBuffer = lines.pop(); // The last element is either a partial line or an empty string

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const currentLine = lines[lineIndex];
      const parsedNumbers = parseLineOfNumbers(currentLine);
      if (parsedNumbers !== null) { // Only add valid parsed lines
        inputLines.push(parsedNumbers);
      }
    }
  });

  const processGrid = (gridDataParam) => {
    let currentComponentCount = 0;
    const numRowsInGrid = gridDataParam.length;
    if (numRowsInGrid === 0) { // Handle case of an empty grid
      return 0;
    }
    const numColsInGrid = gridDataParam[0].length;

    for (let colIter = 0; colIter < numColsInGrid; colIter++) {
      for (let rowIter = 0; rowIter < numRowsInGrid; rowIter++) {
        // If a cell contains '1', it's the start of a new connected component
        if (gridDataParam[rowIter][colIter] === 1) {
          currentComponentCount++;
          processConnectedComponent(colIter, rowIter, gridDataParam);
        }
      }
    }
    return currentComponentCount;
  };

  standardInput.on('end', function(endEventArg) {
    while (true) {
      const headerLine = inputLines.shift(); // Get the next header line
      
      // Check for termination condition or malformed header
      if (!headerLine || headerLine.length < 2 || headerLine[1] === 0) {
        break;
      }
      
      const gridHeight = headerLine[1]; // The second element of the header is the grid height

      // Extract the grid rows using splice, which also removes them from inputLines
      const currentGridData = inputLines.splice(0, gridHeight);
      
      const resultCount = processGrid(currentGridData);
      console.log(resultCount);
    }
  });
}).call(this);
