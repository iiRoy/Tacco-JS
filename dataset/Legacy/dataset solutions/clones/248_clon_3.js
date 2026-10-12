const fileSystemModule = require('fs');

function obtainInputLines() {
    const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const processedLines = rawInputData.split('\n');
    return processedLines;
}

function parseDigitString(inputString) {
    const charArray = inputString.split('');
    const numberArray = charArray.map(Number);
    return numberArray;
}

const MODULO_BASE = 10;

function performReductionStep(currentSequence) {
    const nextSequence = [];
    const sequenceLength = currentSequence.length;
    for (let elementIdx = 0; elementIdx < sequenceLength - 1; elementIdx++) {
        const sumOfAdjacent = currentSequence[elementIdx] + currentSequence[elementIdx + 1];
        nextSequence[elementIdx] = sumOfAdjacent % MODULO_BASE;
    }
    return nextSequence;
}

const allInputLines = obtainInputLines();
const lastLineExclusionCount = 1;

for (let currentLineIdx = 0; currentLineIdx < allInputLines.length - lastLineExclusionCount; currentLineIdx++) {
    const currentLineString = allInputLines[currentLineIdx];

    let digitSequence = parseDigitString(currentLineString);

    while (digitSequence.length > 1) {
        digitSequence = performReductionStep(digitSequence);
    }

    console.log(digitSequence[0]);
}
