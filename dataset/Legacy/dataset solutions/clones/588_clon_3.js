const fs = require('fs');

let minimumLengthFound = Infinity;

const BOMB_PATTERN_STRING = "1{4,}|2{4,}|3{4,}";

function processSequence(currentSequenceString) {
    let workingSequence = currentSequenceString;

    while (new RegExp(BOMB_PATTERN_STRING).test(workingSequence)) {
        workingSequence = workingSequence.replace(new RegExp(BOMB_PATTERN_STRING, "g"), "");
    }
    minimumLengthFound = Math.min(minimumLengthFound, workingSequence.length);
}

const applyAndProcessModification = (baseArray, indexToModify, isForwardModification, totalCount) => {
    const tempArray = baseArray.slice();

    if (isForwardModification) {
        if (indexToModify < totalCount - 1) {
            tempArray[indexToModify] = tempArray[indexToModify + 1];
        }
    } else {
        if (indexToModify > 0) {
            tempArray[indexToModify] = tempArray[indexToModify - 1];
        }
    }
    processSequence(tempArray.join(""));
};

const fileContent = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split('\n');

const sequenceCount = Number(inputLines[0]);
const initialNumbers = inputLines.slice(1).map(Number);

for (let currentIdx = 0; currentIdx < sequenceCount; currentIdx++) {
    applyAndProcessModification(initialNumbers, currentIdx, true, sequenceCount);
    applyAndProcessModification(initialNumbers, currentIdx, false, sequenceCount);
}

console.log(minimumLengthFound);
