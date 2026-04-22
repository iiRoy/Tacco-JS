const processInput = (rawText) => {
    const lineSegments = rawText.split('\n');
    const totalStrings = Number(lineSegments[0]);
    let charOccurrenceMaps = [];

    for (let currentLineIndex = 1; currentLineIndex <= totalStrings; currentLineIndex++) {
        const textSegment = lineSegments[currentLineIndex];
        const charFrequencies = {};
        for (const charUnit of textSegment) {
            charFrequencies[charUnit] = (charFrequencies[charUnit] || 0) + 1;
        }
        charOccurrenceMaps.push(charFrequencies);
    }

    if (charOccurrenceMaps.length === 0) {
        return '';
    }

    let sharedCharCounts = { ...charOccurrenceMaps[0] };

    for (let mapIndex = 1; mapIndex < charOccurrenceMaps.length; mapIndex++) {
        const currentSegmentMap = charOccurrenceMaps[mapIndex];
        const updatedSharedCounts = {};

        for (const charKey in sharedCharCounts) {
            if (currentSegmentMap.hasOwnProperty(charKey)) {
                updatedSharedCounts[charKey] = Math.min(sharedCharCounts[charKey], currentSegmentMap[charKey]);
            }
        }
        sharedCharCounts = updatedSharedCounts;
    }

    let finalCharSequence = [];
    const orderedKeys = Object.keys(sharedCharCounts).sort();

    for (const charKey of orderedKeys) {
        for (let count = 0; count < sharedCharCounts[charKey]; count++) {
            finalCharSequence.push(charKey);
        }
    }

    return finalCharSequence.join('');
};

const acquiredData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const computedResult = processInput(acquiredData);

if (computedResult.length === 0) {
    console.log();
} else {
    console.log(computedResult);
}