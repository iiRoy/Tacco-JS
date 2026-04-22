function parseInteger(inputString) {
  return Number.parseInt(inputString);
}


function parseDecimal(inputStr) {
  return Number.parseFloat(inputStr);
}


function isEvenNumber(numericVal) {
  return (numericVal % 2) === 0;
}


function isOddNumber(numVal) {
  return (numVal % 2) === 1;
}


Array.prototype.orderNumbersAscending = function() {
  return this.sort((elemA, elemB) => (elemA - elemB));
};


Array.prototype.orderNumbersDescending = function() {
  return this.sort((itemA, itemB) => (itemB - itemA));
};


Array.prototype.orderStringsAscending = function() {
  return this.sort();
};


Array.prototype.orderStringsDescending = function() {
  return this.sort().reverse();
};


Array.prototype.removeElement = function(targetValue) {
  return this.filter(currentElement => currentElement !== targetValue);
};


function executeProgram(inputLines) {

  var dimensionsArray = inputLines[0].split(' ').map(parseInteger);

  var gridHeight = dimensionsArray[0];
  var gridWidth = dimensionsArray[1];
  var maxSteps = dimensionsArray[2];

  var startCoordinates = [];

  var gameGrid = inputLines.slice(1).map(lineContent => lineContent.split(''));

  gridScanLoop:
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
      if (gameGrid[rowIdx][colIdx] === 'S_SPOT') {
        startCoordinates = [rowIdx, colIdx];
        break gridScanLoop;
      }
    }
  }


  function explorePath(currentRow, currentCol, stepCount) {
    if (stepCount > maxSteps) {
      return;
    }

    if (
      currentRow < 0 || gridHeight <= currentRow ||
      currentCol < 0 || gridWidth <= currentCol
    ) {
      return;
    }

    var cellValue = gameGrid[currentRow][currentCol];

    if (
      cellValue === 'EMPTY_SPACE' || cellValue === 'S_SPOT' ||
      ((typeof cellValue === 'number') && cellValue > stepCount)
    ) {
      gameGrid[currentRow][currentCol] = stepCount;

      setTimeout(function() {
        explorePath(currentRow - 1, currentCol, stepCount + 1);
        explorePath(currentRow + 1, currentCol, stepCount + 1);
        explorePath(currentRow, currentCol - 1, stepCount + 1);
        explorePath(currentRow, currentCol + 1, stepCount + 1);
      }, 0);
    }
  }

  explorePath(startCoordinates[0], startCoordinates[1], 0);


  function calculateMinExitSteps(currentH, currentW) {
    var distToBottom = (gridHeight - 1) - currentH;
    var distToTop = currentH;
    var distToRight = (gridWidth - 1) - currentW;
    var distToLeft = currentW;

    return Math.min(distToBottom, distToTop, distToRight, distToLeft);
  }


  var shortestPath = Infinity;

  gridProcessLoop:
  for (var rowIterator = 0; rowIterator < gridHeight; rowIterator++) {
    for (var colIterator = 0; colIterator < gridWidth; colIterator++) {
      var gridCellData = gameGrid[rowIterator][colIterator];

      if (typeof gridCellData === 'number') {
        var exitDistance = calculateMinExitSteps(rowIterator, colIterator);

        if (exitDistance === 0) {
          shortestPath = 1;
          break gridProcessLoop;
        }

        shortestPath = Math.min(shortestPath, Math.ceil(exitDistance / maxSteps) + 1);
      }
    }
  }

  console.log(shortestPath);
}


executeProgram(
  require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(eachLine => eachLine.trim())
);