var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

var sequenceLength = parseInt(lines.shift(), 10);
var initialSequence = lines.shift().split(" ").map(Number);
var operationCount = parseInt(lines.shift(), 10);
var operationPairs = lines.map(val => val.split(" ").map(Number).map(v => v - 1));

operationPairs.unshift([0, 0]); // Prepend a no-op swap for the initial state check

var orderedSequence = initialSequence.slice().sort((valA, valB) => valA - valB);

var divergentIndices = [];
for (let idx = 0; idx < sequenceLength; idx++) {
    if (initialSequence[idx] !== orderedSequence[idx]) {
        divergentIndices.push(idx);
    }
}

var currentSequenceMap = new Map();
var targetSequenceMap = new Map();

for (let idx = 0; idx < sequenceLength; idx++) {
    currentSequenceMap.set(idx, initialSequence[idx]);
    targetSequenceMap.set(idx, orderedSequence[idx]);
}

var targetMismatchSignature = divergentIndices.map(idx => targetSequenceMap.get(idx)).join(',');

let finalMatchIndex = -1;

Array.from({ length: operationCount + 1 }, (_, currentOperationIndex) => currentOperationIndex)
    .some(currentOperationIndex => {
        const [firstIdx, secondIdx] = operationPairs[currentOperationIndex];

        const valueAtFirst = currentSequenceMap.get(firstIdx);
        const valueAtSecond = currentSequenceMap.get(secondIdx);

        currentSequenceMap.set(firstIdx, valueAtSecond);
        currentSequenceMap.set(secondIdx, valueAtFirst);

        const currentMismatchSignature = divergentIndices.map(idx => currentSequenceMap.get(idx)).join(',');

        if (currentMismatchSignature === targetMismatchSignature) {
            finalMatchIndex = currentOperationIndex;
            return true;
        }
        return false;
    });

console.log(finalMatchIndex);
