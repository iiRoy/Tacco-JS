"use strict";

const fileSystem = require("fs");

function processGame(rawData) {
    const parsedLines = rawData.split("\n");

    const gameBoardCells = parsedLines.slice(0, 3).flatMap((line, rowIndex) =>
        line.split(" ").map((value, colIndex) => ({
            cellValue: value,
            row: rowIndex,
            col: colIndex
        }))
    );

    const calledNumbersSet = new Set(parsedLines.slice(4));

    const activeCellPositions = new Set();
    for (const cellInfo of gameBoardCells) {
        if (calledNumbersSet.has(cellInfo.cellValue)) {
            activeCellPositions.add(`${cellInfo.row},${cellInfo.col}`);
        }
    }

    const winningConfigurations = [
        ["0,0", "0,1", "0,2"],
        ["1,0", "1,1", "1,2"],
        ["2,0", "2,1", "2,2"],
        ["0,0", "1,0", "2,0"],
        ["0,1", "1,1", "2,1"],
        ["0,2", "1,2", "2,2"],
        ["0,0", "1,1", "2,2"],
        ["0,2", "1,1", "2,0"]
    ];

    const gameResult = winningConfigurations.some(gameLine =>
        gameLine.every(coordinateString => activeCellPositions.has(coordinateString))
    );

    if (gameResult) {
        console.log("yes");
    } else {
        console.log("no");
    }
}

processGame(fileSystem.readFileSync("/dev/stdin", "utf8"));