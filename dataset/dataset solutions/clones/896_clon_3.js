var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let currentString = rawData.trim();

const TARGET_SORTED_CHARS = "AADINNUY";
const REPLACEMENT_TEXT = "AIZUNYAN";
const SEGMENT_LENGTH = 8;

const obtainSortedSegment = (sourceString, startIndex, segmentLength) => {
    const extractedPart = sourceString.substring(startIndex, startIndex + segmentLength);
    const characters = extractedPart.split('');
    characters.sort();
    return characters.join('');
};

const maxSearchIndex = currentString.length - SEGMENT_LENGTH;

for (let searchIndex = 0; searchIndex < maxSearchIndex; ++searchIndex) {
    const currentSegmentSorted = obtainSortedSegment(currentString, searchIndex, SEGMENT_LENGTH);

    if (currentSegmentSorted === TARGET_SORTED_CHARS) {
        const prefix = currentString.substring(0, searchIndex);
        const suffix = currentString.substring(searchIndex + SEGMENT_LENGTH);
        currentString = `${prefix}${REPLACEMENT_TEXT}${suffix}`;
        break;
    }
}

console.log(currentString);
