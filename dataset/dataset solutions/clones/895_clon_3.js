const fileSystem = require('fs');
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let processedString = rawData.trim();

const TARGET_SEQUENCE_VALUE = "AIZUNYAN";
const SORTED_PATTERN_VALUE = "AADINNUY";
const SEGMENT_LENGTH = 8;
const ADVANCE_OFFSET = SEGMENT_LENGTH - 1;

const initialStringLength = processedString.length;

for (let currentPosition = 0; currentPosition <= initialStringLength - SEGMENT_LENGTH; currentPosition++) {
    // Extract the current 8-character segment from the processed string
    const segmentChars = processedString.substring(currentPosition, currentPosition + SEGMENT_LENGTH).split('');
    const segmentString = segmentChars.join("");

    // Check if the current segment directly matches the target sequence
    if (segmentString === TARGET_SEQUENCE_VALUE) {
        currentPosition += ADVANCE_OFFSET;
        continue;
    }

    // If no direct match, sort the characters of the segment and check against the sorted pattern
    const sortedSegmentString = segmentChars.slice().sort().join("");

    if (sortedSegmentString === SORTED_PATTERN_VALUE) {
        // If a sorted match is found, replace the original segment with the target sequence
        const prefixPart = processedString.slice(0, currentPosition);
        const suffixPart = processedString.slice(currentPosition + SEGMENT_LENGTH);
        processedString = prefixPart + TARGET_SEQUENCE_VALUE + suffixPart;
        currentPosition += ADVANCE_OFFSET;
    }
}

console.log(processedString);
