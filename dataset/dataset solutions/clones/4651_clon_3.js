const inputSource = require("fs");

const rawInputBuffer = inputSource.readFileSync(process.stdin.fd);
let fullInputPayload = rawInputBuffer.toString('utf8');

if (!fullInputPayload.trim().length) {
    console.log("");
    process.exit(0);
}

const inputLineSegments = fullInputPayload.split('\n');
const processedDataSegments = inputLineSegments.slice(1, -1);

if (processedDataSegments.length === 0) {
    console.log("");
    process.exit(0);
}

const characterFrequencyMaps = processedDataSegments.map(dataString => {
    const currentSegmentFrequencies = {};
    for (const charElement of dataString) {
        currentSegmentFrequencies[charElement] = (currentSegmentFrequencies[charElement] || 0) + 1;
    }
    return currentSegmentFrequencies;
});

let aggregatedMinimumFrequencies = {};

if (characterFrequencyMaps.length > 0) {
    Object.assign(aggregatedMinimumFrequencies, characterFrequencyMaps[0]);
}

for (let idx = 1; idx < characterFrequencyMaps.length; idx++) {
    const nextFrequencyMap = characterFrequencyMaps[idx];
    const temporaryAggregatedMap = {};

    for (const charKey in aggregatedMinimumFrequencies) {
        const currentMinimum = aggregatedMinimumFrequencies[charKey];
        const nextLineOccurrence = nextFrequencyMap[charKey] || 0; // Explicitly treat undefined as 0
        temporaryAggregatedMap[charKey] = Math.min(currentMinimum, nextLineOccurrence);
    }
    aggregatedMinimumFrequencies = temporaryAggregatedMap;
}

const resultComponentArray = [];

for (const charIdentifier in aggregatedMinimumFrequencies) {
    const repetitionFactor = aggregatedMinimumFrequencies[charIdentifier];
    if (repetitionFactor > 0) {
        resultComponentArray.push(charIdentifier.repeat(repetitionFactor));
    }
}

const sortedResultComponents = resultComponentArray.sort();
const finalOutputResult = sortedResultComponents.join('');

console.log(finalOutputResult);