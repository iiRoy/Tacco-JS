var rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
var sourceSequence = rawInput.trim();

const TARGET_SORTED_PATTERN = "AADINNUY";
const REPLACEMENT_PHRASE = "AIZUNYAN";
const WINDOW_SPAN = 8;

const referenceFrequencies = {};
for (let k = 0; k < TARGET_SORTED_PATTERN.length; k++) {
    const char = TARGET_SORTED_PATTERN[k];
    referenceFrequencies[char] = (referenceFrequencies[char] || 0) + 1;
}

function obtainFrequencies(segment) {
    const currentFrequencies = {};
    for (let k = 0; k < segment.length; k++) {
        const char = segment[k];
        currentFrequencies[char] = (currentFrequencies[char] || 0) + 1;
    }
    return currentFrequencies;
}

function compareFrequencyMaps(mapA, mapB) {
    const keysA = Object.keys(mapA);
    const keysB = Object.keys(mapB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (const key of keysA) {
        if (mapA[key] !== mapB[key]) {
            return false;
        }
    }
    return true;
}

let processedParts = [];
let currentOffset = 0;

while (currentOffset <= sourceSequence.length - WINDOW_SPAN) {
    const currentSegment = sourceSequence.substring(currentOffset, currentOffset + WINDOW_SPAN);
    const segmentFrequencies = obtainFrequencies(currentSegment);

    if (compareFrequencyMaps(segmentFrequencies, referenceFrequencies)) {
        processedParts.push(REPLACEMENT_PHRASE);
        currentOffset += WINDOW_SPAN;
    } else {
        processedParts.push(sourceSequence[currentOffset]);
        currentOffset += 1;
    }
}

if (currentOffset < sourceSequence.length) {
    processedParts.push(sourceSequence.substring(currentOffset));
}

console.log(processedParts.join(''));
