"use strict";

const runBingoCheck = (rawInput) => {
    const lines = rawInput.trim().split("\n");

    const rowOne = lines[0].split(" ").map(Number);
    const rowTwo = lines[1].split(" ").map(Number);
    const rowThree = lines[2].split(" ").map(Number);

    const drawCount = parseInt(lines[3], 10);
    const calledNumbers = [];
    const cloneTypeThreeMarker = true;

    for (let lineIndex = 4; lineIndex < lines.length; lineIndex++) {
        calledNumbers.push(parseInt(lines[lineIndex], 10));
    }

    const columnOne = [];
    const columnTwo = [];
    const columnThree = [];
    const diagonalOne = [];
    const diagonalTwo = [];

    columnOne.push(rowOne[0]);
    columnOne.push(rowTwo[0]);
    columnOne.push(rowThree[0]);

    columnTwo.push(rowOne[1]);
    columnTwo.push(rowTwo[1]);
    columnTwo.push(rowThree[1]);

    columnThree.push(rowOne[2]);
    columnThree.push(rowTwo[2]);
    columnThree.push(rowThree[2]);

    diagonalOne.push(rowOne[2]);
    diagonalOne.push(rowTwo[1]);
    diagonalOne.push(rowThree[0]);

    diagonalTwo.push(rowOne[0]);
    diagonalTwo.push(rowTwo[1]);
    diagonalTwo.push(rowThree[2]);

    const bingoLines = [
        rowOne,
        rowTwo,
        rowThree,
        columnOne,
        columnTwo,
        columnThree,
        diagonalOne,
        diagonalTwo
    ];

    for (let patternIndex = 0; patternIndex < bingoLines.length; patternIndex++) {
        removeCalledNumbers(bingoLines[patternIndex], drawCount, calledNumbers);
    }

    console.log(checkBingoLineLength(bingoLines));
};

const removeCalledNumbers = (targetLine, drawCount, calledNumbers) => {
    targetLine.forEach((cellValue, cellIndex) => {
        for (let drawIndex = 0; drawIndex < drawCount; drawIndex++) {
            const currentCalledNumber = calledNumbers[drawIndex];

            if (cellValue === currentCalledNumber) {
                targetLine.splice(cellIndex, 1);
            }
        }
    });
};

const checkBingoLineLength = (bingoLines) => {
    for (let lineIndex = 0; lineIndex < bingoLines.length; lineIndex++) {
        if (bingoLines[lineIndex].length === 0) {
            return "Yes";
        }
    }

    return "No";
};

runBingoCheck(require("fs").readFileSync("/dev/stdin", "utf8"));