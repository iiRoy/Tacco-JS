"use strict";
const InputReader = (function() {
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
    const tokenizedInput = rawData.split(/ |\n/);
    let tokenIndex = 0;

    const readInt = () => {
        return parseInt(tokenizedInput[tokenIndex++], 10);
    };

    const readString = () => {
        return tokenizedInput[tokenIndex++];
    };

    const readBigInt = () => {
        return BigInt(tokenizedInput[tokenIndex++]);
    };

    const readInts = (count, isStringArray) => {
        const sliceEnd = tokenIndex + count;
        const result = tokenizedInput.slice(tokenIndex, sliceEnd);
        tokenIndex = sliceEnd;
        return isStringArray ? result : result.map(val => parseInt(val, 10));
    };

    const readMatrix = (height, width, isStringMatrix) => {
        const matrix = [];
        for (let r = 0; r < height; r++) {
            const sliceEnd = tokenIndex + width;
            const row = tokenizedInput.slice(tokenIndex, sliceEnd);
            tokenIndex = sliceEnd;
            matrix.push(isStringMatrix ? row : row.map(val => parseInt(val, 10)));
        }
        return matrix;
    };

    const createMultiDimArray = (initialValue, ...dimensions) => {
        if (dimensions.length === 0) {
            return initialValue;
        }
        const currentDimSize = dimensions[0];
        const remainingDims = dimensions.slice(1);
        return Array.from({ length: currentDimSize }, () =>
            createMultiDimArray(initialValue, ...remainingDims)
        );
    };

    return {
        readInt,
        readString,
        readBigInt,
        readInts,
        readMatrix,
        createMultiDimArray
    };
})();

function executeLogic() {
    const dimensionSize = InputReader.readInt();
    let maxScore = 0;
    let trivialCasesCount = 0;
    const pendingUpdates = [];

    const dynamicProgTable = InputReader.createMultiDimArray(-1, dimensionSize, dimensionSize);

    let currentTriplet = InputReader.readInts(2).sort((a, b) => a - b);
    dynamicProgTable[currentTriplet[0] - 1][currentTriplet[1] - 1] = 0;

    const updateDynamicProgTable = (prevRow, prevCol, currRow, currCol) => {
        const prevScoreValue = dynamicProgTable[prevRow][prevCol];
        const prevScorePlusOne = (prevScoreValue === -1) ? 0 : prevScoreValue + 1;
        
        const potentialNewScore = Math.max(dynamicProgTable[currRow][currCol], prevScorePlusOne);
        
        pendingUpdates.push([currRow, currCol, potentialNewScore]);
        maxScore = Math.max(maxScore, potentialNewScore);
    };

    const handleIdenticalFirstCoord = (fixedCoord, targetCoord, n) => {
        for (let loopIdx = 0; loopIdx < fixedCoord; loopIdx++) {
            updateDynamicProgTable(loopIdx, fixedCoord, loopIdx, targetCoord);
        }
        for (let loopIdx = fixedCoord + 1; loopIdx < targetCoord; loopIdx++) {
            updateDynamicProgTable(fixedCoord, loopIdx, loopIdx, targetCoord);
        }
        for (let loopIdx = targetCoord; loopIdx < n; loopIdx++) {
            updateDynamicProgTable(fixedCoord, loopIdx, targetCoord, loopIdx);
        }
    };

    const handleIdenticalSecondCoord = (fixedCoord, targetCoord, n) => {
        for (let loopIdx = 0; loopIdx < targetCoord; loopIdx++) {
            updateDynamicProgTable(loopIdx, fixedCoord, loopIdx, targetCoord);
        }
        for (let loopIdx = targetCoord; loopIdx < fixedCoord; loopIdx++) {
            updateDynamicProgTable(loopIdx, fixedCoord, targetCoord, loopIdx);
        }
        for (let loopIdx = fixedCoord + 1; loopIdx < n; loopIdx++) {
            updateDynamicProgTable(fixedCoord, loopIdx, targetCoord, loopIdx);
        }
    };

    for (let iterationCounter = 1; iterationCounter < dimensionSize; iterationCounter++) {
        currentTriplet = InputReader.readInts(3).sort((a, b) => a - b).map(val => val - 1);

        const c0 = currentTriplet[0];
        const c1 = currentTriplet[1];
        const c2 = currentTriplet[2];

        if (c0 === c2) {
            trivialCasesCount++;
            continue;
        }

        pendingUpdates.length = 0;

        updateDynamicProgTable(c0, c0, c1, c2);

        if (c0 !== c1) {
            updateDynamicProgTable(c1, c1, c0, c2);
        } else {
            handleIdenticalFirstCoord(c0, c2, dimensionSize);
        }

        if (c1 !== c2) {
            updateDynamicProgTable(c2, c2, c0, c1);
        } else {
            handleIdenticalSecondCoord(c1, c0, dimensionSize);
        }

        while (pendingUpdates.length > 0) {
            const [rowIdx, colIdx, scoreVal] = pendingUpdates.pop();
            dynamicProgTable[rowIdx][colIdx] = Math.max(dynamicProgTable[rowIdx][colIdx], scoreVal);
        }
    }

    const finalCoord = InputReader.readInt() - 1;
    updateDynamicProgTable(finalCoord, finalCoord, finalCoord, finalCoord);

    return maxScore + trivialCasesCount;
}

const programOutput = executeLogic();
if (programOutput !== undefined) {
    console.log(String(programOutput));
}
