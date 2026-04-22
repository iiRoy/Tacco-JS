const dataProvider = require('fs');
const rawContent = dataProvider.readFileSync('/dev/stdin', 'utf8');
const initialSequence = rawContent.trim();

const targetPatternLetters = { 'A': 2, 'D': 1, 'I': 1, 'N': 2, 'U': 1, 'Y': 1 };
const replacementString = "AIZUNYAN";
const patternLength = 8;

let scanningIndex = 0;
let finalOutputSegments = [];

function obtainCharacterFrequencies(inputSegment, expectedLength) {
    if (inputSegment.length !== expectedLength) return null;
    const frequencyMap = {};
    for (let character of inputSegment) {
        frequencyMap[character] = (frequencyMap[character] || 0) + 1;
    }
    return frequencyMap;
}

function compareFrequencyMaps(mapA, mapB) {
    if (!mapA || !mapB) return false;
    const keysA = Object.keys(mapA);
    const keysB = Object.keys(mapB);
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
        if (mapA[key] !== mapB[key]) return false;
    }
    return true;
}

while (scanningIndex < initialSequence.length) {
    const potentialEnd = scanningIndex + patternLength;
    
    if (potentialEnd > initialSequence.length) {
        finalOutputSegments.push(initialSequence.substring(scanningIndex));
        break;
    }

    const currentSegment = initialSequence.substring(scanningIndex, potentialEnd);
    const segmentFrequencies = obtainCharacterFrequencies(currentSegment, patternLength);

    if (compareFrequencyMaps(segmentFrequencies, targetPatternLetters)) {
        finalOutputSegments.push(replacementString);
        scanningIndex += patternLength;
    } else {
        finalOutputSegments.push(initialSequence[scanningIndex]);
        scanningIndex++;
    }
}

const resultantSequence = finalOutputSegments.join('');
console.log(resultantSequence);