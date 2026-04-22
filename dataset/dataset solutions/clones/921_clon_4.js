const utilityFS = require('node:fs');

const transformRules = new Map([
    ["TT", "T"],
    ["TF", "F"],
    ["FT", "T"]
]);

function applyBounce(computation) {
    let currentResult = computation();
    while (typeof currentResult === 'function') {
        currentResult = currentResult();
    }
    return currentResult;
}

function processSequence(currentSegment) {
    if (currentSegment.length === 1) {
        return currentSegment;
    }

    const firstPair = currentSegment.substring(0, 2);
    let nextPiece;

    if (transformRules.has(firstPair)) {
        nextPiece = transformRules.get(firstPair);
    } else {
        nextPiece = firstPair;
    }

    const trailingSegment = currentSegment.substring(2);
    const nextIterationData = nextPiece + trailingSegment;

    return () => processSequence(nextIterationData);
}

const rawData = utilityFS.readFileSync('/dev/stdin', 'utf8');
const contentLines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const startingSequence = contentLines[1];

const finalResult = applyBounce(() => processSequence(startingSequence));

console.log(finalResult);