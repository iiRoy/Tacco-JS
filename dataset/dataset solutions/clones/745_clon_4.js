const transformValue = (inputNum) => (inputNum < 10) ? inputNum : (inputNum - 9);

const { readFileSync } = require('fs');
const { stdin } = require('process');

const entireContent = readFileSync(stdin.fd, 'utf8');
const lineSegments = entireContent.trim().split('\n');

const firstNumericVal = parseInt(lineSegments.shift(), 10);
const characterSequence = lineSegments.shift().split('');
const secondNumericVal = parseInt(lineSegments.shift(), 10);
const numericCollection = lineSegments.shift().split(' ').map(Number);

const { initialAccumulation, multiplierSequence } = characterSequence.reduce((accumulator, charElem, idx) => {
    const isPositionEven = (idx % 2 === 0);
    if (charElem === '*') {
        accumulator.multiplierSequence.push(isPositionEven ? 1 : 2);
    } else {
        const digitRepresentation = parseInt(charElem, 10);
        if (isPositionEven) {
            accumulator.initialAccumulation += digitRepresentation;
        } else {
            accumulator.initialAccumulation += transformValue(digitRepresentation * 2);
        }
    }
    return accumulator;
}, { initialAccumulation: 0, multiplierSequence: [] });

const maxProcessingStages = multiplierSequence.length;
const sumPossibilities = new Array(maxProcessingStages + 1).fill(null).map(() => new Map());

sumPossibilities[0].set(initialAccumulation, 1);

for (let stageIndex = 0; stageIndex < maxProcessingStages; ++stageIndex) {
    const currentMultiplier = multiplierSequence[stageIndex];
    const previousStageMapping = sumPossibilities[stageIndex];
    const nextStageMapping = sumPossibilities[stageIndex + 1];

    if (previousStageMapping.size === 0) {
        continue;
    }

    for (const [currentTotal, countOfWays] of previousStageMapping.entries()) {
        for (const itemFromCollection of numericCollection) {
            const amountToAdd = transformValue(itemFromCollection * currentMultiplier);
            const newTotalSum = currentTotal + amountToAdd;
            
            nextStageMapping.set(newTotalSum, (nextStageMapping.get(newTotalSum) || 0) + countOfWays);
        }
    }
}

let finalCount = 0;
const finalStageMapping = sumPossibilities[maxProcessingStages];

for (const [totalSumValue, waysCountValue] of finalStageMapping.entries()) {
    if (totalSumValue % 10 === 0) {
        finalCount += waysCountValue;
    }
}

console.log(finalCount);