"use strict";

const fileSystem = require("fs");

function processGame(rawInput) {
  const inputLines = rawInput.split("\n");

  const gameGrid = inputLines.slice(0, 3).map(lineContent => lineContent.split(" "));

  const drawnNumbers = new Set(inputLines.slice(4));

  const markedCoordinates = new Set();

  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    for (let colIndex = 0; colIndex < 3; colIndex++) {
      const cellValue = gameGrid[rowIndex][colIndex];
      if (drawnNumbers.has(cellValue)) {
        markedCoordinates.add(`${rowIndex},${colIndex}`);
      }
    }
  }

  const winningPatterns = [
    ["0,0", "0,1", "0,2"],
    ["1,0", "1,1", "1,2"],
    ["2,0", "2,1", "2,2"],
    ["0,0", "1,0", "2,0"],
    ["0,1", "1,1", "2,1"],
    ["0,2", "1,2", "2,2"],
    ["0,0", "1,1", "2,2"],
    ["0,2", "1,1", "2,0"]
  ];

  const hasBingo = winningPatterns.some(pattern =>
    pattern.every(coord => markedCoordinates.has(coord))
  );

  if (hasBingo) {
    console.log("yes");
  } else {
    console.log("no");
  }
}

processGame(fileSystem.readFileSync("/dev/stdin", "utf8"));
