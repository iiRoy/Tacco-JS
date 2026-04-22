"use strict";

const processInputData = (inputContent) => {
    const lines = inputContent.trim().split('\n');
    const numEntries = parseInt(lines[0], 10);
    const dataSegments = lines.slice(1, numEntries + 1);

    const createCharacterCountMap = (textSegment) => {
        const charToCountMap = new Map();
        for (const charSymbol of textSegment) {
            charToCountMap.set(charSymbol, (charToCountMap.get(charSymbol) || 0) + 1);
        }
        return charToCountMap;
    };

    const allSegmentMaps = dataSegments.map(createCharacterCountMap);

    const aggregatedCharacterMinimums = new Map();
    const fullAlphabet = 'abcdefghijklmnopqrstuvwxyz';

    // Initialize aggregatedCharacterMinimums with frequencies from the first data segment.
    // If numEntries is 0, allSegmentMaps[0] will be undefined, leading to an error,
    // which mirrors the original code's undefined behavior (potential crash for Infinity pushes).
    for (const charKey of fullAlphabet) {
        aggregatedCharacterMinimums.set(charKey, allSegmentMaps[0].get(charKey) || 0);
    }

    // Iterate through the remaining segment maps (from the second one)
    for (let segmentIndex = 1; segmentIndex < numEntries; ++segmentIndex) {
        const currentSegmentFrequencies = allSegmentMaps[segmentIndex];
        for (const charKey of fullAlphabet) {
            const currentMinimumValue = aggregatedCharacterMinimums.get(charKey);
            const countFromCurrentSegment = currentSegmentFrequencies.get(charKey) || 0;
            aggregatedCharacterMinimums.set(charKey, Math.min(currentMinimumValue, countFromCurrentSegment));
        }
    }

    // Construct the final output string from the aggregated minimum counts
    let finalConcatenatedResult = [];
    for (const charKey of fullAlphabet) {
        const resultingCount = aggregatedCharacterMinimums.get(charKey);
        if (resultingCount > 0) {
            finalConcatenatedResult.push(...Array.from({ length: resultingCount }, () => charKey));
        }
    }

    console.log(finalConcatenatedResult.join(''));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));