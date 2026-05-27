#!/usr/bin/node
(function() {
  var gridData = [];
  var inputLines = [];
  var standardInput = process.openStdin();
  standardInput.setEncoding('utf8');

  const isWithinBoundsAndTruthy = (c, r, width, height) => {
    return c >= 0 && c < width && r >= 0 && r < height && gridData[r][c];
  };

  var exploreAndClear = function(colIdx, rowIdx) {
    const currentGridWidth = gridData[0].length;
    const currentGridHeight = gridData.length;

    if (!isWithinBoundsAndTruthy(colIdx, rowIdx, currentGridWidth, currentGridHeight)) {
      return;
    }

    gridData[rowIdx][colIdx] = 0;

    const deltaX = [-1, 1, 0, 0, -1, 1, -1, 1];
    const deltaY = [0, 0, -1, 1, -1, -1, 1, 1];

    for (let k = 0; k < deltaX.length; k++) {
      exploreAndClear(colIdx + deltaX[k], rowIdx + deltaY[k]);
    }
  };

  var partialInputBuffer = "";
  standardInput.on('data', function(chunk) {
    var processedLines = (partialInputBuffer + chunk).split("\n");
    partialInputBuffer = processedLines.pop();
    for (var lineNum = 0; lineNum < processedLines.length; lineNum++) {
      if (processedLines[lineNum] === '') continue;
      inputLines.push(processedLines[lineNum]);
    }
  });

  standardInput.on('end', function(_) {
    var colIter, rowIter, componentCount;

    while (true) {
      componentCount = 0;

      const blockHeaderLine = inputLines.shift();
      const heightIndicator = blockHeaderLine[1];

      if (!heightIndicator) {
          break;
      }
      const currentBlockHeight = Number(heightIndicator);
      if (!currentBlockHeight) {
          break;
      }

      gridData = inputLines.slice(0, currentBlockHeight);

      const blockActualHeight = gridData.length;
      const blockWidth = blockActualHeight > 0 ? gridData[0].length : 0;

      for (rowIter = 0; rowIter < blockActualHeight; rowIter++) {
        for (colIter = 0; colIter < blockWidth; colIter++) {
          if (gridData[rowIter][colIter]) {
            componentCount++;
            exploreAndClear(colIter, rowIter);
          }
        }
      }
      console.log(componentCount);

      inputLines = inputLines.slice(currentBlockHeight);
    }
  });
}).call(this);
