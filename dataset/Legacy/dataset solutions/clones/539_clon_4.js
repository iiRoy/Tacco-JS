const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileData.trim().split('\n');

const initialElementCount = parseInt(dataLines.shift(), 10);
const initialSequence = dataLines.shift().split(' ').map(Number);
const queryOperationCount = parseInt(dataLines.shift(), 10);
const exchangeInstructions = dataLines.map(line => line.split(' ').map(Number).map(val => val - 1));

exchangeInstructions.unshift([0, 0]);

const sortedReferenceSequence = [...initialSequence].sort((valA, valB) => valA - valB);

const currentSparseState = new Map();
const targetSparseState = new Map();

initialSequence.forEach((val, idx) => {
    if (val !== sortedReferenceSequence[idx]) {
        currentSparseState.set(idx, val);
        targetSparseState.set(idx, sortedReferenceSequence[idx]);
    }
});

const targetCanonicalValues = Array.from(targetSparseState.keys())
    .sort((keyA, keyB) => keyA - keyB)
    .map(key => targetSparseState.get(key));

const areSequencesEquivalent = (seq1, seq2) => seq1.length === seq2.length && seq1.every((val, i) => val === seq2[i]);

let foundIterationIndex = -1;

for (let currentIteration = 0; currentIteration < exchangeInstructions.length; currentIteration++) {
    const [posA, posB] = exchangeInstructions[currentIteration];

    const valueAtA = currentSparseState.has(posA) ? currentSparseState.get(posA) : undefined;
    const valueAtB = currentSparseState.has(posB) ? currentSparseState.get(posB) : undefined;

    currentSparseState.set(posA, valueAtB);
    currentSparseState.set(posB, valueAtA);

    const currentCanonicalValues = Array.from(currentSparseState.keys())
        .sort((keyA, keyB) => keyA - keyB)
        .map(key => currentSparseState.get(key));

    if (areSequencesEquivalent(currentCanonicalValues, targetCanonicalValues)) {
        foundIterationIndex = currentIteration;
        break;
    }
}

console.log(foundIterationIndex);
