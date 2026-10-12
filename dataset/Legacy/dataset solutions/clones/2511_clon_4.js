const inputLines = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const sourceString = inputLines[0];
const repeatCount = Number.parseInt(inputLines[1], 10);

let blockSegments = [];
let singlePassRewrites = 0;

if (sourceString.length > 0) {
    let currentCharacter = sourceString[0];
    let currentBlockLength = 0;

    for (let i = 0; i < sourceString.length; i++) {
        if (sourceString[i] === currentCharacter) {
            currentBlockLength++;
        } else {
            blockSegments.push(currentCharacter.repeat(currentBlockLength));
            singlePassRewrites += Math.floor(currentBlockLength / 2);
            currentCharacter = sourceString[i];
            currentBlockLength = 1;
        }
    }
    blockSegments.push(currentCharacter.repeat(currentBlockLength));
    singlePassRewrites += Math.floor(currentBlockLength / 2);
}

let finalRewrites = singlePassRewrites * repeatCount;

const evaluateBoundaryCondition = (initialSegment, finalSegment, multiplier) => {
    if (multiplier <= 1) {
        return 0;
    }

    // These accesses are designed to replicate the original code's TypeError
    // if initialSegment or finalSegment are too short (length < 2),
    // as initialSegment[1] or finalSegment[1] would be undefined,
    // leading to undefined.length.
    const initialSecondCharParity = initialSegment[1].length % 2;
    const finalSecondCharParity = finalSegment[1].length % 2;

    if (initialSegment.charAt(0) === finalSegment.charAt(0) && initialSecondCharParity === 1 && finalSecondCharParity === 1) {
        return multiplier - 1;
    }
    return 0;
};

const firstChunk = blockSegments[0];
const lastChunk = blockSegments[blockSegments.length - 1];

const additionalRewrites = evaluateBoundaryCondition(firstChunk, lastChunk, repeatCount);

finalRewrites += additionalRewrites;

console.log(finalRewrites);
