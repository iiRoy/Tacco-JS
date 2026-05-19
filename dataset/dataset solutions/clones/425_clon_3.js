const fileSystem = require('fs');
const RAW_INPUT_SOURCE = '/dev/stdin';

function parseAndSumPair(lineContent) {
    const numberStrings = lineContent.split(" ");
    const firstValue = Number(numberStrings[0]);
    const secondValue = Number(numberStrings[1]);
    return firstValue + secondValue;
}

function identifyHighestScoreEntry(scoreCollection) {
    let currentHighest = -Infinity;
    let highestIndex = -1;
    const candidateIdentifiers = ["A", "B", "C", "D"];

    for (let index = 0; index < scoreCollection.length; index++) {
        const scoreValue = scoreCollection[index];
        if (scoreValue > currentHighest) {
            currentHighest = scoreValue;
            highestIndex = index;
        }
    }
    return {
        label: candidateIdentifiers[highestIndex],
        value: currentHighest
    };
}

const rawInputData = fileSystem.readFileSync(RAW_INPUT_SOURCE, 'utf8');
const processedInputLines = rawInputData.trim().split("\n");

let accumulatedScores = [];
const BLOCK_SIZE = 4;
const TERMINATION_MARKER = "0 0";

for (let lineIterator = 0; lineIterator < processedInputLines.length; lineIterator++) {
    const currentLine = processedInputLines[lineIterator];

    if (accumulatedScores.length === 0 && currentLine === TERMINATION_MARKER) {
        break;
    }

    if (accumulatedScores.length === BLOCK_SIZE) {
        const result = identifyHighestScoreEntry(accumulatedScores);
        console.log(`${result.label} ${result.value}`);
        accumulatedScores = [];
    } else {
        const sumOfCurrentPair = parseAndSumPair(currentLine);
        accumulatedScores.push(sumOfCurrentPair);
    }
}
