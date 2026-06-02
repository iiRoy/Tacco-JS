var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedString = rawData.trim();

const SUBSTRING_LENGTH = 8;
const TARGET_SORTED_STRING = "AADINNUY";
const REPLACEMENT_STRING = "AIZUNYAN";

function obtainSortedSegment(sourceText, startIndex, segmentLen) {
    const segmentChars = [];
    for (let k = 0; k < segmentLen; k++) {
        segmentChars.push(sourceText[startIndex + k]);
    }
    segmentChars.sort();
    return segmentChars.join('');
}

for (var currentIndex = 0; currentIndex < processedString.length - SUBSTRING_LENGTH + 1; currentIndex++) {
    var currentSegmentSorted = obtainSortedSegment(processedString, currentIndex, SUBSTRING_LENGTH);

    if (currentSegmentSorted === TARGET_SORTED_STRING) {
        const prefix = processedString.substring(0, currentIndex);
        const suffix = processedString.substring(currentIndex + SUBSTRING_LENGTH);
        processedString = prefix + REPLACEMENT_STRING + suffix;
        currentIndex += SUBSTRING_LENGTH - 1;
    }
}

console.log(processedString);
