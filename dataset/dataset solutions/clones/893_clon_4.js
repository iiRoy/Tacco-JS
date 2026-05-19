const fs = require('fs');
const sourceText = fs.readFileSync('/dev/stdin', 'utf8').trim();

const replacementPattern = "AIDUNYAN";
const patternLength = replacementPattern.length;

const referenceFrequencyMap = {};
for (const char of replacementPattern) {
    referenceFrequencyMap[char] = (referenceFrequencyMap[char] || 0) + 1;
}

const constructOriginalSegment = (source, startIndex) => {
    const segmentChars = [
        source[startIndex],
        source[startIndex + 1],
        source[startIndex + 2],
        source[3],
        source[startIndex + 4],
        source[startIndex + 5],
        source[startIndex + 6],
        source[startIndex + 7]
    ];
    return segmentChars.join('');
};

const isAnagramOfReference = (segment) => {
    const segmentFrequencyMap = {};
    for (const char of segment) {
        segmentFrequencyMap[char] = (segmentFrequencyMap[char] || 0) + 1;
    }

    const segmentKeys = Object.keys(segmentFrequencyMap);
    const referenceKeys = Object.keys(referenceFrequencyMap);

    if (segmentKeys.length !== referenceKeys.length) {
        return false;
    }

    for (const key of segmentKeys) {
        if (segmentFrequencyMap[key] !== referenceFrequencyMap[key]) {
            return false;
        }
    }
    return true;
};

let finalOutput = sourceText;
let matchPosition = -1;

const iterationCount = Math.max(0, sourceText.length - patternLength);
const possibleStartIndices = Array.from({ length: iterationCount }, (_, k) => k);

possibleStartIndices.some(currentIdx => {
    const currentSegment = constructOriginalSegment(sourceText, currentIdx);
    if (isAnagramOfReference(currentSegment)) {
        matchPosition = currentIdx;
        return true;
    }
    return false;
});

if (matchPosition !== -1) {
    finalOutput = sourceText.substring(0, matchPosition) + replacementPattern + sourceText.substring(matchPosition + patternLength);
}

console.log(finalOutput);
