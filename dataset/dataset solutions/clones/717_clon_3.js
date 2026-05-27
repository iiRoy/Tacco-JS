const MAX_LIMIT = 100000;

let seqA = [];
seqA[0] = 1;
for (let idx = 1; idx < MAX_LIMIT; idx++) {
    seqA[idx] = seqA[idx - 1] + idx + 1;
}

let seqB = [];
seqB[0] = 1;
let currentSeqBVal = 1;
let counter = 1;
while (true) {
    currentSeqBVal = seqB[counter - 1] + seqA[counter];
    if (currentSeqBVal > MAX_LIMIT) {
        break;
    }
    seqB[counter] = currentSeqBVal;
    counter++;
}

const minStepsA = new Array(MAX_LIMIT).fill(Infinity);
const minStepsB = new Array(MAX_LIMIT).fill(Infinity);

minStepsA[0] = 0;
minStepsB[0] = 0;

for (let idx = 0; idx < MAX_LIMIT; idx++) {
    for (let innerIdx = 0; innerIdx < seqB.length; innerIdx++) {
        const currentBElement = seqB[innerIdx];
        const targetIndex = idx - currentBElement;

        if (targetIndex >= 0) {
            minStepsA[idx] = Math.min(minStepsA[targetIndex] + 1, minStepsA[idx]);

            const isOddBElement = (currentBElement % 2 === 1);
            if (isOddBElement) {
                minStepsB[idx] = Math.min(minStepsB[targetIndex] + 1, minStepsB[idx]);
            }
        }
    }
}

const fs = require('fs');
const rawData = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split('\n');

let linePointer = 0;
while (true) {
    const currentLine = inputLines[linePointer++];
    const currentNum = Number(currentLine);

    if (currentNum === 0) {
        break;
    }
    console.log(minStepsA[currentNum] + " " + minStepsB[currentNum]);
}
