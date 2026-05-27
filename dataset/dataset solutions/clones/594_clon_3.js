const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const parseNumericLine = (lineString) => lineString.split(" ").map(Number);
const parseSingleNumber = (numberString) => Number(numberString);

let inputLines = rawData.trim().split("\n");

const dimensions = parseNumericLine(inputLines.shift());
const rowsCount = dimensions[0];
const colsCount = dimensions[1];

const segmentValues = [];
for (let segmentIndex = 0; segmentIndex < rowsCount - 1; segmentIndex++) {
    segmentValues.push(parseSingleNumber(inputLines.shift()));
}

const moveInstructions = [];
for (let instructionIndex = 0; instructionIndex < colsCount; instructionIndex++) {
    moveInstructions.push(parseSingleNumber(inputLines.shift()));
}

let totalAccumulation = 0;
let currentPosition = 0;

for (const instructionValue of moveInstructions) {
    const directionFactor = instructionValue > 0 ? 1 : -1;
    let stepsToExecute = Math.abs(instructionValue);

    for (let stepCount = 0; stepCount < stepsToExecute; stepCount++) {
        if (directionFactor === 1) {
            totalAccumulation += segmentValues[currentPosition];
        }
        currentPosition += directionFactor;
        if (directionFactor === -1) {
            totalAccumulation += segmentValues[currentPosition];
        }
    }
}

console.log(totalAccumulation);
