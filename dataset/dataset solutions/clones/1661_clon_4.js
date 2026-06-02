"use strict";
const retrieveInputTokens = (sourceText) => sourceText.split(/ |\n/);
let currentTokenPosition = 0;

const extractNextNumericValue = (tokenArray) => Number(tokenArray[currentTokenPosition++]);
const extractNextStringValue = (tokenArray) => tokenArray[currentTokenPosition++];
const extractNextBigIntValue = (tokenArray) => BigInt(tokenArray[currentTokenPosition++]);

// These functions are not used in the original main logic, but are part of the input utility.
// Reimplementing them to avoid original names and structure.
const extractMultipleNumericValues = (count, tokenArray) => {
    const values = [];
    for (let i = 0; i < count; i++) {
        values.push(Number(tokenArray[currentTokenPosition++]));
    }
    return values;
};

const extractMatrixValues = (rows, cols, tokenArray) => {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push(Number(tokenArray[currentTokenPosition++]));
        }
        matrix.push(row);
    }
    return matrix;
};

// Replaces original xArray, which used eval.
const createMultiDimensionalArray = (dimensions, initialValueCreator) => {
    if (dimensions.length === 0) {
        return initialValueCreator();
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDimSize }, () =>
        createMultiDimensionalArray(remainingDims, initialValueCreator)
    );
};


const calculateMinimumCollisionTime = () => {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const allInputTokens = retrieveInputTokens(rawInput);

    const robotQuantity = extractNextNumericValue(allInputTokens);
    const robotEntities = [];

    for (let i = 0; i < robotQuantity; i++) {
        const xCoord = extractNextNumericValue(allInputTokens);
        const yCoord = extractNextNumericValue(allInputTokens);
        const directionSymbol = extractNextStringValue(allInputTokens);
        robotEntities.push({
            x: xCoord,
            y: yCoord,
            direction: directionSymbol,
            sumCoords: xCoord + yCoord,
            diffCoords: xCoord - yCoord
        });
    }

    let shortestCollisionTime = Infinity;

    const updateShortestTime = (potentialTime) => {
        if (potentialTime < shortestCollisionTime) {
            shortestCollisionTime = potentialTime;
        }
    };

    // --- Orthogonal Collisions (U-D, R-L) ---

    // Group by X for Up-Down collisions
    const xCoordinateGroups = robotEntities.reduce((accumulator, robot) => {
        (accumulator[robot.x] = accumulator[robot.x] || []).push(robot);
        return accumulator;
    }, {});

    Object.values(xCoordinateGroups).forEach(groupOfRobots => {
        const upwardMovers = groupOfRobots.filter(r => r.direction === 'U').sort((a, b) => a.y - b.y);
        const downwardMovers = groupOfRobots.filter(r => r.direction === 'D').sort((a, b) => a.y - b.y);

        if (upwardMovers.length && downwardMovers.length) {
            let downPointer = 0;
            for (let upPointer = 0; upPointer < upwardMovers.length; upPointer++) {
                while (downPointer < downwardMovers.length && downwardMovers[downPointer].y <= upwardMovers[upPointer].y) {
                    downPointer++;
                }
                if (downPointer < downwardMovers.length) {
                    updateShortestTime(downwardMovers[downPointer].y - upwardMovers[upPointer].y);
                }
            }
        }
    });

    // Group by Y for Right-Left collisions
    const yCoordinateGroups = robotEntities.reduce((accumulator, robot) => {
        (accumulator[robot.y] = accumulator[robot.y] || []).push(robot);
        return accumulator;
    }, {});

    Object.values(yCoordinateGroups).forEach(groupOfRobots => {
        const rightwardMovers = groupOfRobots.filter(r => r.direction === 'R').sort((a, b) => a.x - b.x);
        const leftwardMovers = groupOfRobots.filter(r => r.direction === 'L').sort((a, b) => a.x - b.x);

        if (rightwardMovers.length && leftwardMovers.length) {
            let leftPointer = 0;
            for (let rightPointer = 0; rightPointer < rightwardMovers.length; rightPointer++) {
                while (leftPointer < leftwardMovers.length && leftwardMovers[leftPointer].x <= rightwardMovers[rightPointer].x) {
                    leftPointer++;
                }
                if (leftPointer < leftwardMovers.length) {
                    updateShortestTime(leftwardMovers[leftPointer].x - rightwardMovers[rightPointer].x);
                }
            }
        }
    });

    // --- Diagonal Collisions (constant x+y) ---
    const sumCoordinateGroups = robotEntities.reduce((accumulator, robot) => {
        (accumulator[robot.sumCoords] = accumulator[robot.sumCoords] || []).push(robot);
        return accumulator;
    }, {});

    Object.values(sumCoordinateGroups).forEach(groupOfRobots => {
        // U-R pairs
        const upRobotsForSum = groupOfRobots.filter(r => r.direction === 'U').sort((a, b) => a.y - b.y);
        const rightRobotsForSum = groupOfRobots.filter(r => r.direction === 'R').sort((a, b) => a.y - b.y); // Sort by Y to match original logic

        if (upRobotsForSum.length && rightRobotsForSum.length) {
            let rightPointer = 0;
            for (let upPointer = 0; upPointer < upRobotsForSum.length; upPointer++) {
                while (rightPointer < rightRobotsForSum.length && rightRobotsForSum[rightPointer].y <= upRobotsForSum[upPointer].y) {
                    rightPointer++;
                }
                if (rightPointer < rightRobotsForSum.length) {
                    updateShortestTime(2 * (rightRobotsForSum[rightPointer].y - upRobotsForSum[upPointer].y));
                }
            }
        }

        // D-L pairs
        const downRobotsForSum = groupOfRobots.filter(r => r.direction === 'D').sort((a, b) => a.x - b.x); // Sort by X to match original logic
        const leftRobotsForSum = groupOfRobots.filter(r => r.direction === 'L').sort((a, b) => a.x - b.x);

        if (downRobotsForSum.length && leftRobotsForSum.length) {
            let leftPointer = 0;
            for (let downPointer = 0; downPointer < downRobotsForSum.length; downPointer++) {
                while (leftPointer < leftRobotsForSum.length && leftRobotsForSum[leftPointer].x <= downRobotsForSum[downPointer].x) {
                    leftPointer++;
                }
                if (leftPointer < leftRobotsForSum.length) {
                    updateShortestTime(2 * (leftRobotsForSum[leftPointer].x - downRobotsForSum[downPointer].x));
                }
            }
        }
    });

    // --- Diagonal Collisions (constant x-y) ---
    const diffCoordinateGroups = robotEntities.reduce((accumulator, robot) => {
        (accumulator[robot.diffCoords] = accumulator[robot.diffCoords] || []).push(robot);
        return accumulator;
    }, {});

    Object.values(diffCoordinateGroups).forEach(groupOfRobots => {
        // U-L pairs
        const upRobotsForDiff = groupOfRobots.filter(r => r.direction === 'U').sort((a, b) => a.x - b.x);
        const leftRobotsForDiff = groupOfRobots.filter(r => r.direction === 'L').sort((a, b) => a.x - b.x);

        if (upRobotsForDiff.length && leftRobotsForDiff.length) {
            let leftPointer = 0;
            for (let upPointer = 0; upPointer < upRobotsForDiff.length; upPointer++) {
                while (leftPointer < leftRobotsForDiff.length && leftRobotsForDiff[leftPointer].x <= upRobotsForDiff[upPointer].x) {
                    leftPointer++;
                }
                if (leftPointer < leftRobotsForDiff.length) {
                    updateShortestTime(2 * (leftRobotsForDiff[leftPointer].x - upRobotsForDiff[upPointer].x));
                }
            }
        }

        // R-D pairs
        const rightRobotsForDiff = groupOfRobots.filter(r => r.direction === 'R').sort((a, b) => a.x - b.x);
        const downRobotsForDiff = groupOfRobots.filter(r => r.direction === 'D').sort((a, b) => a.x - b.x);

        if (rightRobotsForDiff.length && downRobotsForDiff.length) {
            let downPointer = 0;
            for (let rightPointer = 0; rightPointer < rightRobotsForDiff.length; rightPointer++) {
                while (downPointer < downRobotsForDiff.length && downRobotsForDiff[downPointer].x <= rightRobotsForDiff[rightPointer].x) {
                    downPointer++;
                }
                if (downPointer < downRobotsForDiff.length) {
                    updateShortestTime(2 * (downRobotsForDiff[downPointer].x - rightRobotsForDiff[rightPointer].x));
                }
            }
        }
    });

    return shortestCollisionTime === Infinity ? "SAFE" : shortestCollisionTime * 5;
};

const finalOutput = calculateMinimumCollisionTime();
if (finalOutput !== undefined) {
    console.log(String(finalOutput));
}
