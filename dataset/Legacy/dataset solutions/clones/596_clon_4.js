const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawInputData.trim().split("\n");

const dimensions = lineSegments.shift().split(" ").map(Number);
const rowLimit = dimensions[0];
const colCount = dimensions[1];

const segmentValues = [];
for (let j = 0; j < rowLimit - 1; j++) {
    segmentValues.push(Number(lineSegments.shift()));
}

const movementInstructions = [];
for (let j = 0; j < colCount; j++) {
    movementInstructions.push(Number(lineSegments.shift()));
}

const generateNumericRange = (start, end, step = 1) => {
    const result = [];
    if (step > 0) {
        for (let current = start; current <= end; current += step) {
            result.push(current);
        }
    } else if (step < 0) {
        for (let current = start; current >= end; current += step) {
            result.push(current);
        }
    }
    return result;
};

const finalState = movementInstructions.reduce((accumulator, instructionMagnitude) => {
    const directionFactor = instructionMagnitude > 0 ? 1 : -1;
    const stepsToTake = Math.abs(instructionMagnitude);

    let indicesForSummation = [];
    if (stepsToTake > 0) {
        if (directionFactor === 1) {
            indicesForSummation = generateNumericRange(accumulator.currentPointer, accumulator.currentPointer + stepsToTake - 1, 1);
        } else {
            indicesForSummation = generateNumericRange(accumulator.currentPointer - 1, accumulator.currentPointer - stepsToTake, -1);
        }
    }

    const segmentSum = indicesForSummation.reduce((segAcc, idx) => segAcc + segmentValues[idx], 0);

    const nextPointerPosition = accumulator.currentPointer + (directionFactor * stepsToTake);

    return {
        totalSum: accumulator.totalSum + segmentSum,
        currentPointer: nextPointerPosition
    };
}, { totalSum: 0, currentPointer: 0 });

console.log(finalState.totalSum % 100000);
