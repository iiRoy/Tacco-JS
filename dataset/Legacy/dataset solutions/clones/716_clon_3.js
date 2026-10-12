#!/usr/bin/node
(function() {
  var gridData = [];
  var inputLines = [];
  var inputStream = process.openStdin();
  inputStream.setEncoding('utf8');

  var exploreAndClear = function(colIdx, rowIdx) {
    const numRows = gridData.length;
    const numCols = gridData.length > 0 ? gridData[0].length : 0;

    if (colIdx < 0 || colIdx >= numCols || rowIdx < 0 || rowIdx >= numRows || !gridData[rowIdx][colIdx]) {
      return;
    }

    gridData[rowIdx][colIdx] = 0; // Mark as visited (clear)

    const neighborOffsets = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal directions
      [-1, -1], [1, -1], [-1, 1], [1, 1]  // Diagonal directions
    ];

    for (const [dx, dy] of neighborOffsets) {
      exploreAndClear(colIdx + dx, rowIdx + dy);
    }
  };

  var partialInputBuffer = "";
  inputStream.on('data', function(chunk) {
    var processedLines = (partialInputBuffer + chunk).split("\n");
    partialInputBuffer = processedLines.pop();
    for (var lineNum = 0; lineNum < processedLines.length; lineNum++) {
      if (processedLines[lineNum] === '') continue;
      var rowValues = processedLines[lineNum].split(" ");
      rowValues = rowValues.map(val => parseInt(val, 10));
      inputLines.push(rowValues);
    }
  });

  inputStream.on('end', function(endEventArg) {
    var colIter, rowIter, islandCount;
    const ISLAND_CELL_VALUE = 1;

    while (true) {
      islandCount = 0;
      const currentGridDimensions = inputLines.shift();
      
      if (!currentGridDimensions) {
          break; // No more input lines
      }

      const gridHeight = currentGridDimensions[1];
      
      if (!gridHeight) { // Signal to stop processing
        break;
      }

      gridData = inputLines.slice(0, gridHeight);

      const currentGridWidth = gridData.length > 0 ? gridData[0].length : 0;
      const actualGridRows = gridData.length;

      for (colIter = 0; colIter < currentGridWidth; colIter++) {
        for (rowIter = 0; rowIter < actualGridRows; rowIter++) {
          if (gridData[rowIter][colIter] === ISLAND_CELL_VALUE) {
            islandCount++;
            exploreAndClear(colIter, rowIter);
          }
        }
      }
      console.log(islandCount);

      inputLines = inputLines.slice(gridHeight);
    }
  });
}).call(this);
