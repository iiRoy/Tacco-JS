"use strict";
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
var inputTokens = fileContent.split(/ |\n/), tokenPointer = 0;

function readNumber() { return +inputTokens[tokenPointer++]; }
function readString() { return inputTokens[tokenPointer++]; }
function readBigInt() { return BigInt(inputTokens[tokenPointer++]); }

function readNumbersArray(count, mapToNumber) {
    if (mapToNumber) {
        return inputTokens.slice(tokenPointer, tokenPointer += count);
    } else {
        return inputTokens.slice(tokenPointer, tokenPointer += count).map(val => +val);
    }
}

function readMatrixData(rows, cols, mapToNumber) {
    var resultMatrix = [], rowIndex = 0;
    if (mapToNumber) {
        for (; rowIndex < rows; rowIndex++) {
            resultMatrix.push(inputTokens.slice(tokenPointer, tokenPointer += cols));
        }
    } else {
        for (; rowIndex < rows; rowIndex++) {
            resultMatrix.push(inputTokens.slice(tokenPointer, tokenPointer += cols).map(val => +val));
        }
    }
    return resultMatrix;
}

function createFilledArray(initialValue) {
    var args = arguments, argCount = args.length,
        arrayCreationString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

var executionResult = solveGridProblem();
if (executionResult !== undefined) {
    console.log(String(executionResult));
}

function solveGridProblem() {
    const largeNumber = 1e9;
    const deltaCoordsX = [0, 1, 0, -1];
    const deltaCoordsY = [-1, 0, 1, 0];
    const numDirections = 4;

    var [gridHeight, gridWidth, maxSteps] = readNumbersArray(3);
    var [startYCoord, startXCoord, goalYCoord, goalXCoord] = readNumbersArray(4);

    const borderChar = '@';
    const paddedWidth = gridWidth + 2;
    const paddedHeight = gridHeight + 2;

    var gridMap = Array(paddedHeight);

    const createBorderRow = (width, char) => createFilledArray(`'${char}'`, width).join("");

    gridMap[0] = createBorderRow(paddedWidth, borderChar);
    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        gridMap[rowIdx + 1] = borderChar + readString() + borderChar;
    }
    gridMap[paddedHeight - 1] = createBorderRow(paddedWidth, borderChar);

    var distanceGrid = createFilledArray(largeNumber, paddedHeight, paddedWidth);
    distanceGrid[startYCoord][startXCoord] = 0;

    var currentLevelNodes = [startYCoord, startXCoord];
    var currentDistance = 0;

    while (currentLevelNodes.length > 0) {
        var nextLevelNodes = [];
        while (currentLevelNodes.length > 0) {
            var currentX = currentLevelNodes.pop();
            var currentY = currentLevelNodes.pop();

            for (var directionIndex = 0; directionIndex < numDirections; directionIndex++) {
                var tempX = currentX;
                var tempY = currentY;

                for (var stepCount = 0; stepCount < maxSteps; stepCount++) {
                    tempX += deltaCoordsX[directionIndex];
                    tempY += deltaCoordsY[directionIndex];

                    if (gridMap[tempY][tempX] === borderChar) {
                        break;
                    }

                    if (distanceGrid[tempY][tempX] <= currentDistance) {
                        break;
                    }

                    const newDistanceValue = currentDistance + 1;
                    if (distanceGrid[tempY][tempX] > newDistanceValue) {
                        distanceGrid[tempY][tempX] = newDistanceValue;
                        nextLevelNodes.push(tempY, tempX);
                    }
                }
            }
        }
        currentLevelNodes = nextLevelNodes;
        currentDistance++;
    }

    const finalDistance = distanceGrid[goalYCoord][goalXCoord];
    return finalDistance === largeNumber ? -1 : finalDistance;
}
