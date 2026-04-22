const inputLines = String(require("fs").readFileSync('/dev/stdin')).split('\n');

const segmentLength = Number(inputLines[0]);
const sourceString = inputLines[1];

const generateSequence = (currentIdx, builtSequence, bitmask, charsToProcess) => {
    if (currentIdx < 0) {
        return builtSequence;
    }

    const characterToPlace = charsToProcess[currentIdx];

    let nextBuiltSequence;
    if ((bitmask >> currentIdx) & 1) {
        nextBuiltSequence = characterToPlace + builtSequence;
    } else {
        nextBuiltSequence = builtSequence + characterToPlace;
    }

    return generateSequence(currentIdx - 1, nextBuiltSequence, bitmask, charsToProcess);
};

const firstHalfSequenceFrequencies = new Map();

const leftSegmentChars = sourceString.slice(0, segmentLength).split('');

for (let currentMask = 0; currentMask < (1 << segmentLength); currentMask++) {
    const generatedFromLeft = generateSequence(segmentLength - 1, "", currentMask, leftSegmentChars);
    firstHalfSequenceFrequencies.set(generatedFromLeft, (firstHalfSequenceFrequencies.get(generatedFromLeft) || 0) + 1);
}

let totalMatchingSequences = 0;

const rightSegmentCharsReversed = sourceString.slice(segmentLength, 2 * segmentLength).split('').reverse();

for (let currentMask = 0; currentMask < (1 << segmentLength); currentMask++) {
    const generatedFromRight = generateSequence(segmentLength - 1, "", currentMask, rightSegmentCharsReversed);
    totalMatchingSequences += firstHalfSequenceFrequencies.get(generatedFromRight) || 0;
}

console.log(totalMatchingSequences);