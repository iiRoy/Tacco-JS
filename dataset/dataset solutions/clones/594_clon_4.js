const sourceReader = require('fs');
const rawInputContent = sourceReader.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputContent.trim().split('\n');

const [dimensionA, dimensionB] = processedLines.shift().split(' ').map(Number);

const sequenceData = processedLines.splice(0, dimensionA - 1).map(Number);
const movementInstructions = processedLines.splice(0, dimensionB).map(Number);

let currentPointerPosition = 0;

const finalAccumulatedValue = movementInstructions.reduce((totalAccumulator, currentInstruction) => {
    const directionIndicator = Math.sign(currentInstruction);
    const absoluteSteps = Math.abs(currentInstruction);
    let segmentContribution = 0;

    if (directionIndicator === 1) {
        segmentContribution = sequenceData.slice(currentPointerPosition, currentPointerPosition + absoluteSteps).reduce((subTotal, elementValue) => subTotal + elementValue, 0);
    } else {
        segmentContribution = sequenceData.slice(currentPointerPosition - absoluteSteps, currentPointerPosition).reduce((subTotal, elementValue) => subTotal + elementValue, 0);
    }

    currentPointerPosition += currentInstruction;
    return totalAccumulator + segmentContribution;
}, 0);

console.log(finalAccumulatedValue);
