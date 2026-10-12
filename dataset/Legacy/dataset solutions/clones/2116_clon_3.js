"use strict";

const fs = require("fs");

function checkBingoWin(gridStatus) {
  // Check for a bingo in any row
  for (let r = 0; r < 3; r++) {
    if (gridStatus[r][0] && gridStatus[r][1] && gridStatus[r][2]) {
      return true;
    }
  }

  // Check for a bingo in any column
  for (let c = 0; c < 3; c++) {
    if (gridStatus[0][c] && gridStatus[1][c] && gridStatus[2][c]) {
      return true;
    }
  }

  // Check for a bingo in the main diagonal (top-left to bottom-right)
  if (gridStatus[0][0] && gridStatus[1][1] && gridStatus[2][2]) {
    return true;
  }

  // Check for a bingo in the anti-diagonal (top-right to bottom-left)
  if (gridStatus[0][2] && gridStatus[1][1] && gridStatus[2][0]) {
    return true;
  }

  // If no bingo pattern is found after all checks
  return false;
}

function evaluateBingoGame(rawInputString) {
  const inputLines = rawInputString.split("\n");

  // Parse the 3x3 bingo card numbers
  const bingoGrid = inputLines.slice(0, 3).map(lineSegment => lineSegment.split(" "));

  // The number of calls (n) is read from input but not used in this specific logic.
  // Renamed to indicate its unused nature.
  const _numberOfCalls = inputLines[3];

  // Parse the list of numbers called during the game
  const bingoCalls = inputLines.slice(4);

  // Initialize a 3x3 grid to keep track of marked cells, all initially set to false
  const markedGrid = Array.from({ length: 3 }, () => Array(3).fill(false));

  // Iterate through each called number to mark corresponding cells on the bingo grid
  bingoCalls.forEach(currentCallValue => {
    for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
      for (let colIdx = 0; colIdx < 3; colIdx++) {
        if (bingoGrid[rowIdx][colIdx] === currentCallValue) {
          markedGrid[rowIdx][colIdx] = true;
        }
      }
    }
  });

  // After all numbers are marked, check if a bingo has been achieved
  if (checkBingoWin(markedGrid)) {
    console.log("yes");
  } else {
    console.log("no");
  }
}

evaluateBingoGame(fs.readFileSync("/dev/stdin", "utf8"));
