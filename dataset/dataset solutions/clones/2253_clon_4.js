"use strict";

const obtainInput = (() => {
    let inputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentLineIndex = 0;

    const extractNextValue = (returnAsString = false) => {
        let lineParts = inputLines[currentLineIndex].split(" ");
        let value = lineParts.pop();
        inputLines[currentLineIndex] = lineParts.join(" ");
        if (!lineParts.length) {
            currentLineIndex++;
        }
        return returnAsString ? value : Number(value);
    };

    const retrieveEntireLine = (returnAsStrings = false) => {
        let parts = inputLines[currentLineIndex++].split(" ");
        return returnAsStrings ? parts : parts.map(Number);
    };

    const fetchLineGroup = (count, returnAsStrings = false) => {
        let group = [];
        for (let i = 0; i < count; i++) {
            group.push(retrieveEntireLine(returnAsStrings));
        }
        return group;
    };

    const getLineCollection = (count, returnAsString = false) => {
        let segments = [];
        for (let i = 0; i < count; i++) {
            segments.push(returnAsString ? inputLines[currentLineIndex++] : Number(inputLines[currentLineIndex++]));
        }
        return segments;
    };

    return {
        advanceAndExtract: extractNextValue,
        getLineAsArray: retrieveEntireLine,
        getMultiLineArray: fetchLineGroup,
        getLineCollection: getLineCollection,
    };
})();

const initializeGrid = (rows, cols, initialValue) => {
    let grid = [];
    for (let r = 0; r < rows; r++) {
        grid.push(Array(cols).fill(initialValue));
    }
    return grid;
};

const calculateDistancesFromOrigin = (initialRow, initialCol, totalRows, totalCols, terrainMap) => {
    let distanceMatrix = initializeGrid(totalRows, totalCols, -1);
    distanceMatrix[initialRow][initialCol] = 0;

    let explorationFrontier = [{ r: initialRow, c: initialCol, d: 0 }];
    let queuePointer = 0;

    const rowDelta = [-1, 1, 0, 0];
    const colDelta = [0, 0, -1, 1];

    while (queuePointer < explorationFrontier.length) {
        let { r: currentRow, c: currentCol, d: currentPathLength } = explorationFrontier[queuePointer++];

        for (let i = 0; i < 4; i++) {
            let nextRow = currentRow + rowDelta[i];
            let nextCol = currentCol + colDelta[i];

            if (nextRow >= 0 && nextRow < totalRows &&
                nextCol >= 0 && nextCol < totalCols &&
                distanceMatrix[nextRow][nextCol] === -1 &&
                terrainMap[nextRow][nextCol] === ".") {

                distanceMatrix[nextRow][nextCol] = currentPathLength + 1;
                explorationFrontier.push({ r: nextRow, c: nextCol, d: currentPathLength + 1 });
            }
        }
    }
    return distanceMatrix;
};

const processGridChallenge = () => {
    let mapHeight = obtainInput.advanceAndExtract();
    let mapWidth = obtainInput.advanceAndExtract();
    let mapLayout = obtainInput.getLineCollection(mapHeight, true);

    let ultimateMaxDistance = 0;

    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            if (mapLayout[r][c] === ".") {
                let currentBFSResult = calculateDistancesFromOrigin(r, c, mapHeight, mapWidth, mapLayout);

                let maxFromCurrentSource = currentBFSResult.flat().reduce((currentMax, value) => {
                    if (value === -1) return currentMax;
                    return Math.max(currentMax, value);
                }, 0);

                ultimateMaxDistance = Math.max(ultimateMaxDistance, maxFromCurrentSource);
            }
        }
    }
    return ultimateMaxDistance;
};

console.log(processGridChallenge());