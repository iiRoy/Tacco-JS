"use strict";

const createInputReader = () => {
    const fileSystemModule = require("fs");
    const inputFilePath = "/dev/stdin";
    const encodingType = "utf8";

    const rawFileContent = fileSystemModule.readFileSync(inputFilePath, encodingType);
    const processedLines = rawFileContent.trim().split("\n");

    let currentLinePointer = 0;
    const totalAvailableLines = processedLines.length;

    const readerOperations = {
        hasMore: () => currentLinePointer < totalAvailableLines,
        readNext: () => {
            if (!readerOperations.hasMore()) {
                throw new Error("ArrayIndexOutOfBoundsException: No more lines to read from input.");
            }
            return processedLines[currentLinePointer++];
        }
    };
    return readerOperations;
};

const globalInputSource = createInputReader();

const getNextInputLine = () => globalInputSource.readNext();
const getNextInputInteger = () => parseInt(globalInputSource.readNext());
const getNextInputStringArray = () => globalInputSource.readNext().split(" ");
const getNextInputIntegerArray = () => globalInputSource.readNext().split(" ").map(Number);
const getNextInputCharacterArray = () => globalInputSource.readNext().split("");
const checkHasMoreInput = () => globalInputSource.hasMore();
const emitOutput = (...outputArgs) => console.log(...outputArgs);

const runSolver = () => {
    const targetCoordinateValue = getNextInputInteger();
    let currentElapsedTime = 0;
    const startingPosition = 0;
    let positionsToProcessQueue = [startingPosition];

    const checkTargetCondition = (currentPos, timeStep, targetVal) => {
        const potentialPositionA = currentPos - timeStep;
        const potentialPositionB = currentPos + timeStep;
        return potentialPositionA === targetVal || potentialPositionB === targetVal;
    };

    while (positionsToProcessQueue.length > 0) {
        currentElapsedTime = currentElapsedTime + 1;
        const currentLevelQueueSize = positionsToProcessQueue.length;

        for (let i = 0; i < currentLevelQueueSize; i++) {
            const processedPosition = positionsToProcessQueue.shift();

            if (checkTargetCondition(processedPosition, currentElapsedTime, targetCoordinateValue)) {
                emitOutput(currentElapsedTime);
                return;
            }

            const newPositionLeft = processedPosition - currentElapsedTime;
            const newPositionRight = processedPosition + currentElapsedTime;
            const newPositionStay = processedPosition;

            positionsToProcessQueue.push(newPositionLeft, newPositionRight, newPositionStay);
        }
    }
};

runSolver();
