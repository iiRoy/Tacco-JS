function ProcessInput(rawData) {
  // Split raw input into individual lines
  var dataLines = rawData.split("\n");

  // Parse the board dimension from the first line
  var boardDimension = parseInt(dataLines[0]);

  // Parse the sequence of points from the second line
  var coordinateList = dataLines[1].split(" ").map(val => parseInt(val));

  // Initialize the main grid matrix
  var mainGrid = new Array(boardDimension + 2);
  for (var r = 0; r < boardDimension + 2; r++) {
    var rowData = new Array(boardDimension + 2).fill(0);
    mainGrid[r] = rowData;
  }

  // Populate the main grid with layer values based on distance from edges
  for (var layerIndex = Math.ceil(boardDimension / 2 - 1); layerIndex >= 0; layerIndex--) {
    for (var xCoord = 1; xCoord < boardDimension + 1; xCoord++) {
      for (var yCoord = 1; yCoord < boardDimension + 1; yCoord++) {
        if (xCoord === layerIndex + 1 || yCoord === layerIndex + 1 || xCoord === boardDimension - layerIndex || yCoord === boardDimension - layerIndex) {
          mainGrid[xCoord][yCoord] = layerIndex;
        }
      }
    }
  }

  // Set boundary cells to -2
  for (var rowBoundary = 1; rowBoundary < boardDimension + 1; rowBoundary++) {
    mainGrid[rowBoundary][0] = -2;
    mainGrid[rowBoundary][boardDimension + 1] = -2;
  }
  mainGrid[0].fill(-2);
  mainGrid[boardDimension + 1].fill(-2);

  var finalSum = 0; // Accumulator for the final score

  // Recursive function to propagate -2 (removed) status
  function propagateZero(currY, currX) {
    mainGrid[currY][currX] = -2; // Mark current cell as removed

    // Check adjacent cells for propagation (set to 0 if not yet removed)
    if (currY >= 2 && mainGrid[currY - 1][currX] >= 0 && zeroVisitedFlags[currY - 1][currX] === 0) {
      zeroVisitedFlags[currY - 1][currX] = 1;
      mainGrid[currY - 1][currX] = 0;
    }
    if (currY <= boardDimension - 1 && mainGrid[currY + 1][currX] >= 0 && zeroVisitedFlags[currY + 1][currX] === 0) {
      zeroVisitedFlags[currY + 1][currX] = 1;
      mainGrid[currY + 1][currX] = 0;
    }
    if (currX >= 2 && mainGrid[currY][currX - 1] >= 0 && zeroVisitedFlags[currY][currX - 1] === 0) {
      zeroVisitedFlags[currY][currX - 1] = 1;
      mainGrid[currY][currX - 1] = 0;
    }
    if (currX <= boardDimension - 1 && mainGrid[currY][currX + 1] >= 0 && zeroVisitedFlags[currY][currX + 1] === 0) {
      zeroVisitedFlags[currY][currX + 1] = 1;
      mainGrid[currY][currX + 1] = 0;
    }

    // Recursively call for adjacent cells that are already removed (-2)
    if (currY >= 2 && mainGrid[currY - 1][currX] === -2 && zeroVisitedFlags[currY - 1][currX] === 0) {
      zeroVisitedFlags[currY - 1][currX] = 1;
      propagateZero(currY - 1, currX);
    }
    if (currY <= boardDimension - 1 && mainGrid[currY + 1][currX] === -2 && zeroVisitedFlags[currY + 1][currX] === 0) {
      zeroVisitedFlags[currY + 1][currX] = 1;
      propagateZero(currY + 1, currX);
    }
    if (currX >= 2 && mainGrid[currY][currX - 1] === -2 && zeroVisitedFlags[currY][currX - 1] === 0) {
      zeroVisitedFlags[currY][currX - 1] = 1;
      propagateZero(currY, currX - 1);
    }
    if (currX <= boardDimension - 1 && mainGrid[currY][currX + 1] === -2 && zeroVisitedFlags[currY][currX + 1] === 0) {
      zeroVisitedFlags[currY][currX + 1] = 1;
      propagateZero(currY, currX + 1);
    }
  }

  // Recursive function to decrement surrounding cell values
  function decrementSurroundings(currRow, currCol) {
    var currentCellValue = mainGrid[currRow][currCol];

    // Check and decrement value of adjacent cells if greater and not visited
    if (currRow > 1 && mainGrid[currRow - 1][currCol] > currentCellValue && decrementVisitedFlags[currRow - 1][currCol] === 0) {
      decrementVisitedFlags[currRow - 1][currCol] = 1;
      decrementSurroundings(currRow - 1, currCol);
      mainGrid[currRow - 1][currCol]--;
    }
    if (currRow < boardDimension && mainGrid[currRow + 1][currCol] > currentCellValue && decrementVisitedFlags[currRow + 1][currCol] === 0) {
      decrementVisitedFlags[currRow + 1][currCol] = 1;
      decrementSurroundings(currRow + 1, currCol);
      mainGrid[currRow + 1][currCol]--;
    }
    if (currCol > 1 && mainGrid[currRow][currCol - 1] > currentCellValue && decrementVisitedFlags[currRow][currCol - 1] === 0) {
      decrementVisitedFlags[currRow][currCol - 1] = 1;
      decrementSurroundings(currRow, currCol - 1);
      mainGrid[currRow][currCol - 1]--;
    }
    if (currCol < boardDimension && mainGrid[currRow][currCol + 1] > currentCellValue && decrementVisitedFlags[currRow][currCol + 1] === 0) {
      decrementVisitedFlags[currRow][currCol + 1] = 1;
      decrementSurroundings(currRow, currCol + 1);
      mainGrid[currRow][currCol + 1]--;
    }
  }

  // Iterate through the sequence of points
  for (var seqIndex = 0; seqIndex < coordinateList.length; seqIndex++) {
    var cellRow = Math.ceil(coordinateList[seqIndex] / boardDimension);
    var cellCol = coordinateList[seqIndex] % boardDimension;
    if (cellCol === 0) {
      cellCol = boardDimension;
    }

    finalSum += mainGrid[cellRow][cellCol]; // Add current cell value to total

    // Initialize visited flags for decrementSurroundings
    var decrementVisitedFlags = new Array(boardDimension + 2);
    for (var mRow = 0; mRow < boardDimension + 2; mRow++) {
      var subMemoArr = new Array(boardDimension + 2).fill(0);
      decrementVisitedFlags[mRow] = subMemoArr;
    }

    // Initialize visited flags for propagateZero
    var zeroVisitedFlags = new Array(boardDimension + 2);
    for (var zRow = 0; zRow < boardDimension + 2; zRow++) {
      var subZeroArr = new Array(boardDimension + 2).fill(0);
      zeroVisitedFlags[zRow] = subZeroArr;
    }

    decrementSurroundings(cellRow, cellCol); // Apply decrement logic
    mainGrid[cellRow][cellCol] = -1; // Mark current cell as "about to be removed"

    // Check if any adjacent cell is already removed (-2)
    if (mainGrid[cellRow - 1][cellCol] === -2 || mainGrid[cellRow + 1][cellCol] === -2 || mainGrid[cellRow][cellCol - 1] === -2 || mainGrid[cellRow][cellCol + 1] === -2) {
      mainGrid[cellRow][cellCol] = -2; // Mark current cell as fully removed

      // If adjacent cells are valid and not yet removed, set them to 0
      if (cellRow >= 2 && mainGrid[cellRow - 1][cellCol] >= 0) {
        mainGrid[cellRow - 1][cellCol] = 0;
      }
      if (cellRow <= boardDimension - 1 && mainGrid[cellRow + 1][cellCol] >= 0) {
        mainGrid[cellRow + 1][cellCol] = 0;
      }
      if (cellCol >= 2 && mainGrid[cellRow][cellCol - 1] >= 0) {
        mainGrid[cellRow][cellCol - 1] = 0;
      }
      if (cellCol <= boardDimension - 1 && mainGrid[cellRow][cellCol + 1] >= 0) {
        mainGrid[cellRow][cellCol + 1] = 0;
      }

      // If adjacent cells are marked as "about to be removed" (-1), propagate removal
      if (cellRow >= 2 && mainGrid[cellRow - 1][cellCol] === -1) {
        mainGrid[cellRow - 1][cellCol] = -2;
        propagateZero(cellRow - 1, cellCol);
      }
      if (cellRow <= boardDimension - 1 && mainGrid[cellRow + 1][cellCol] === -1) {
        mainGrid[cellRow + 1][cellCol] = -2;
        propagateZero(cellRow + 1, cellCol);
      }
      if (cellCol >= 2 && mainGrid[cellRow][cellCol - 1] === -1) {
        mainGrid[cellRow][cellCol - 1] = -2;
        propagateZero(cellRow, cellCol - 1);
      }
      if (cellCol <= boardDimension - 1 && mainGrid[cellRow][cellCol + 1] === -1) {
        mainGrid[cellRow][cellCol + 1] = -2;
        propagateZero(cellRow, cellCol + 1);
      }
    }
  }

  console.log('%s', finalSum);
  return finalSum;
}

// Function to handle testing in a browser environment
function TestHandler(testIndex) {
  var testInputData = webDocument.getElementById("input" + testIndex).value;
  var calculatedResult = ProcessInput(testInputData);
  var testVerdict = "WA";
  if (calculatedResult == webDocument.getElementById("output" + testIndex).value.split("\n")[0]) {
    testVerdict = "AC";
  }
  webDocument.getElementById("result" + testIndex).innerHTML = testVerdict;
}

// Execute the main processing function with standard input for competitive programming
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));