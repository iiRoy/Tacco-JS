"use strict";

const solveBingoChallenge = (fullInputString) => {
    const inputLines = fullInputString.trim().split('\n').filter(Boolean);

    const boardMatrix = inputLines.slice(0, 3).map(line =>
        line.split(' ').map(Number)
    );

    const totalCalledNumbersToConsider = Number(inputLines[3]);
    const rawCalledNumbersList = inputLines.slice(4).map(Number);
    
    const effectiveCalledNumbers = rawCalledNumbersList.slice(0, totalCalledNumbersToConsider);
    const calledNumbersSet = new Set(effectiveCalledNumbers);

    const winningCombinations = [];

    boardMatrix.forEach(row => winningCombinations.push(row));

    for (let colIndex = 0; colIndex < 3; colIndex++) {
        const columnNumbers = [];
        for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            columnNumbers.push(boardMatrix[rowIndex][colIndex]);
        }
        winningCombinations.push(columnNumbers);
    }

    winningCombinations.push([
        boardMatrix[0][0],
        boardMatrix[1][1],
        boardMatrix[2][2]
    ]);

    winningCombinations.push([
        boardMatrix[0][2],
        boardMatrix[1][1],
        boardMatrix[2][0]
    ]);

    const bingoAchieved = winningCombinations.some(line =>
        line.every(numberOnLine => calledNumbersSet.has(numberOnLine))
    );

    return bingoAchieved ? "Yes" : "No";
};

solveBingoChallenge(require('fs').readFileSync('/dev/stdin', 'utf8'));