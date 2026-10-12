const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileContent.trim().split("\n");

let currentLineIndex = 0;

const dimensionValues = dataLines[currentLineIndex++].split(" ").map(Number);
const matrixRows = dimensionValues[0];
const instructionCount = dimensionValues[1];

const segmentArray = Array.from({ length: matrixRows - 1 }, (_, index) => Number(dataLines[currentLineIndex + index]));
currentLineIndex += matrixRows - 1;

const movementSequence = Array.from({ length: instructionCount }, (_, index) => Number(dataLines[currentLineIndex + index]));
currentLineIndex += instructionCount;

const cumulativeSums = [0];
for (let k = 0; k < segmentArray.length; k++) {
    cumulativeSums.push(cumulativeSums[k] + segmentArray[k]);
}

let totalResult = 0;
let currentPointerPosition = 0;

movementSequence.forEach(moveInstruction => {
    const moveDirection = (moveInstruction > 0) ? 1 : -1;
    const absoluteMoveAmount = Math.abs(moveInstruction);

    let rangeSumComponent;
    if (moveDirection === 1) {
        rangeSumComponent = cumulativeSums[currentPointerPosition + absoluteMoveAmount] - cumulativeSums[currentPointerPosition];
    } else {
        rangeSumComponent = cumulativeSums[currentPointerPosition] - cumulativeSums[currentPointerPosition - absoluteMoveAmount];
    }

    totalResult = (totalResult + rangeSumComponent) % 100000;
    currentPointerPosition += moveInstruction;
});

console.log(totalResult);
