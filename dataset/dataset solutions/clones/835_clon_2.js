const markConnected = (rowCoord, colCoord, targetHue) => {
  const verticalOffsets = [-1, 0, 0, 1];
  const horizontalOffsets = [0, -1, 1, 0];

  for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
    let neighborRow = rowCoord + verticalOffsets[directionIndex];
    let neighborCol = colCoord + horizontalOffsets[directionIndex];

    if (neighborRow < 0 || neighborCol < 0 || neighborRow >= 12 || neighborCol >= 6) {
      continue;
    }

    if (gameGrid[neighborRow][neighborCol] === targetHue) {
      currentGroupSize++;
      if (currentGroupSize === 4) {
        destructionPoints.push([neighborRow, neighborCol]);
      }
      gameGrid[neighborRow][neighborCol] = targetHue + currentGroupSize;
      markConnected(neighborRow, neighborCol, targetHue);
    }
  }
};

const clearGroup = (rowCoord, colCoord, targetHue) => {
  const verticalOffsets = [-1, 0, 0, 1];
  const horizontalOffsets = [0, -1, 1, 0];

  for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
    let neighborRow = rowCoord + verticalOffsets[directionIndex];
    let neighborCol = colCoord + horizontalOffsets[directionIndex];

    if (neighborRow < 0 || neighborCol < 0 || neighborRow >= 12 || neighborCol >= 6) {
      continue;
    }

    if (gameGrid[neighborRow][neighborCol] === targetHue) {
      gameGrid[neighborRow][neighborCol] = ".";
      clearGroup(neighborRow, neighborCol, targetHue);
    } else if (gameGrid[neighborRow][neighborCol] === "O") {
      gameGrid[neighborRow][neighborCol] = ".";
    }
  }
};

const shiftDown = (rowCoord, colCoord) => {
  let initialRow = rowCoord;
  while (rowCoord > 0) {
    rowCoord--;
    if (gameGrid[rowCoord][colCoord] !== ".") {
      gameGrid[initialRow][colCoord] = gameGrid[rowCoord][colCoord];
      gameGrid[rowCoord][colCoord] = ".";
      break;
    }
  }
};

let gameGrid = [];
let destructionPoints = [];
let currentGroupSize;

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");
let testCasesCount = parseInt(inputLines.shift());

for (let testCaseIndex = 0; testCaseIndex < testCasesCount; testCaseIndex++) {
  gameGrid = [];
  for (let rowIndex = 0; rowIndex < 12; rowIndex++) {
    const rowBlocks = inputLines.shift().split("");
    gameGrid.push(rowBlocks);
  }

  let totalPoints = 0;
  while (true) {
    destructionPoints = [];

    for (let rowIndex = 0; rowIndex < 12; rowIndex++) {
      for (let colIndex = 0; colIndex < 6; colIndex++) {
        const currentBlock = gameGrid[rowIndex][colIndex];

        if (currentBlock === "R") {
          currentGroupSize = 1;
          gameGrid[rowIndex][colIndex] = "R" + currentGroupSize;
          markConnected(rowIndex, colIndex, "R");
        }
        if (currentBlock === "G") {
          currentGroupSize = 1;
          gameGrid[rowIndex][colIndex] = "G" + currentGroupSize;
          markConnected(rowIndex, colIndex, "G");
        }
        if (currentBlock === "B") {
          currentGroupSize = 1;
          gameGrid[rowIndex][colIndex] = "B" + currentGroupSize;
          markConnected(rowIndex, colIndex, "B");
        }
        if (currentBlock === "Y") {
          currentGroupSize = 1;
          gameGrid[rowIndex][colIndex] = "Y" + currentGroupSize;
          markConnected(rowIndex, colIndex, "Y");
        }
        if (currentBlock === "P") {
          currentGroupSize = 1;
          gameGrid[rowIndex][colIndex] = "P" + currentGroupSize;
          markConnected(rowIndex, colIndex, "P");
        }
      }
    }

    for (let rowIndex = 0; rowIndex < 12; rowIndex++) {
      for (let colIndex = 0; colIndex < 6; colIndex++) {
        gameGrid[rowIndex][colIndex] = gameGrid[rowIndex][colIndex].slice(0, 1);
      }
    }

    if (destructionPoints.length === 0) {
      break;
    }

    totalPoints++;

    destructionPoints.forEach((pointCoords) => {
      const targetRow = pointCoords[0];
      const targetCol = pointCoords[1];
      const blockColor = gameGrid[targetRow][targetCol];

      if (blockColor !== ".") {
        clearGroup(targetRow, targetCol, blockColor);
      }
    });

    for (let rowIndex = 11; rowIndex > 0; rowIndex--) {
      for (let colIndex = 0; colIndex < 6; colIndex++) {
        if (gameGrid[rowIndex][colIndex] === ".") {
          shiftDown(rowIndex, colIndex);
        }
      }
    }
  }
  console.log(totalPoints);
}