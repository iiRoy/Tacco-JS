const processedSegments = input.split(/,\d+\n{0,}/);
const relevantSegmentCount = processedSegments.length - 1;

const valueOccurrences = new Map();

processedSegments.slice(0, relevantSegmentCount).forEach(segmentEntry => {
    const numericItem = parseInt(segmentEntry, 10);
    valueOccurrences.set(numericItem, (valueOccurrences.get(numericItem) || 0) + 1);
});

let highestKeyEncountered = -1;
for (const keyIdentifier of valueOccurrences.keys()) {
    if (keyIdentifier > highestKeyEncountered) {
        highestKeyEncountered = keyIdentifier;
    }
}

const resultLines = [];
for (let currentNumericIndex = 0; currentNumericIndex <= highestKeyEncountered; currentNumericIndex++) {
    const currentCount = valueOccurrences.get(currentNumericIndex);
    if (currentCount !== undefined && currentCount > 1) {
        resultLines.push(`${currentNumericIndex} ${currentCount}`);
    }
}

console.log(resultLines.join('\n'));
