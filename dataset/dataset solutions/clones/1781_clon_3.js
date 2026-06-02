"use strict";
const STDIN_PATH = "/dev/stdin";
const rawData = require("fs").readFileSync(STDIN_PATH, "utf8");
var tokenStream = rawData.split(/ |\n/), tokenIndex = 0;

function readNum() { return +tokenStream[tokenIndex++]; }
function readStr() { return tokenStream[tokenIndex++]; }
function readBigInt() { return BigInt(tokenStream[tokenIndex++]); }

function readNums(count, asStrings) {
    const values = tokenStream.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    return asStrings ? values : values.map(val => +val);
}

function readMatrix(height, width, asStrings) {
    const resultMatrix = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        const row = tokenStream.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        resultMatrix.push(asStrings ? row : row.map(val => +val));
    }
    return resultMatrix;
}

function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array(currentDimensionSize).fill(null).map(() => createMultiDimArray(initialValue, ...remainingDimensions));
}

var programResult = executeProgram();
if (programResult !== undefined) console.log(String(programResult));

function executeProgram() {
    const infinityVal = 1e9;
    const deltaX = [0, 1, 0, -1];
    const deltaY = [-1, 0, 1, 0];
    const directionCount = 4;

    const dimensionInputs = readNums(3);
    const heightVal = dimensionInputs[0];
    const widthVal = dimensionInputs[1];
    const maxMoveDistance = dimensionInputs[2];

    const coordinateInputs = readNums(4);
    const startY = coordinateInputs[0];
    const startX = coordinateInputs[1];
    const goalY = coordinateInputs[2];
    const goalX = coordinateInputs[3];

    const gridMap = Array(heightVal + 2);
    const paddedWidth = widthVal + 2;
    const borderRow = Array(paddedWidth).fill('@').join('');

    gridMap[0] = borderRow;
    for (let currentIdx = 0; currentIdx < heightVal; currentIdx++) {
        gridMap[currentIdx + 1] = '@' + readStr() + '@';
    }
    gridMap[heightVal + 1] = borderRow;

    const distanceGrid = createMultiDimArray(infinityVal, heightVal + 2, widthVal + 2);
    distanceGrid[startY][startX] = 0;

    let currentLevelQueue = [startY, startX];
    let currentDistance = 0;

    while (currentLevelQueue.length > 0) {
        let nextLevelQueue = [];
        while (currentLevelQueue.length > 0) {
            const currentX = currentLevelQueue.pop();
            const currentY = currentLevelQueue.pop();

            for (let directionIdx = 0; directionIdx < directionCount; directionIdx++) {
                let nextX = currentX;
                let nextY = currentY;
                for (let stepCount = 0; stepCount < maxMoveDistance; stepCount++) {
                    nextX += deltaX[directionIdx];
                    nextY += deltaY[directionIdx];

                    if (gridMap[nextY][nextX] === '@') {
                        break;
                    }

                    if (distanceGrid[nextY][nextX] <= currentDistance) {
                        break;
                    }

                    distanceGrid[nextY][nextX] = currentDistance + 1;
                    nextLevelQueue.push(nextY, nextX);
                }
            }
        }
        currentLevelQueue = nextLevelQueue;
        currentDistance++;
    }

    const finalDistance = distanceGrid[goalY][goalX];
    return finalDistance === infinityVal ? -1 : finalDistance;
}
