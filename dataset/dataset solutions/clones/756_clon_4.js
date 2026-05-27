const getLines = (sourceText) => {
    const lines = sourceText.trim().split('\n');
    let currentLineIndex = 0;
    return {
        fetch: () => (currentLineIndex < lines.length ? lines[currentLineIndex++] : undefined),
    };
};

const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineProcessor = getLines(sourceContent);

const initialLength = Number(lineProcessor.fetch());
const [initialTerm, progressionStep] = lineProcessor.fetch().split(' ').map(Number);

const generateProgression = (len, term, step) =>
    Array.from({ length: len }, (_, index) => term + index * step);

let activeSequence = generateProgression(initialLength, initialTerm, progressionStep);

const numOperations = Number(lineProcessor.fetch());

const operationDispatch = {
    0: (sequence, p1, p2) => { // Swap
        const tempVal = sequence[p1];
        sequence[p1] = sequence[p2];
        sequence[p2] = tempVal;
        return sequence;
    },
    1: (sequence, p1, p2) => { // Assign (x != 0)
        sequence[p1] = sequence[p2];
        return sequence;
    }
};

activeSequence = Array.from({ length: numOperations }).reduce((currentArr, _, opIteration) => {
    const [opCode, paramA, paramB] = lineProcessor.fetch().split(' ').map(Number);
    const effectiveIdxA = paramA - 1;
    const effectiveIdxB = paramB - 1;

    const handler = operationDispatch[opCode] || operationDispatch[1];
    return handler(currentArr, effectiveIdxA, effectiveIdxB);
}, activeSequence);

const finalAccessIndex = Number(lineProcessor.fetch());
console.log(activeSequence[finalAccessIndex - 1]);
