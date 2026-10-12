"use strict";

const processInput = (rawData) => {
    const inputLines = rawData.trim().split("\n");
    const segmentCount = parseInt(inputLines[0], 10);
    const textSegments = inputLines.slice(1, segmentCount + 1);

    const characterSet = "abcdefghijklmnopqrstuvwxyz";

    if (segmentCount === 0) {
        console.log("");
        return;
    }

    const retrieveCharacterFrequencies = (textFragment) => {
        return Array.from(textFragment).reduce((frequencyMap, currentCharacter) => {
            frequencyMap[currentCharacter] = (frequencyMap[currentCharacter] || 0) + 1;
            return frequencyMap;
        }, {});
    };

    const initialSegmentFrequencies = retrieveCharacterFrequencies(textSegments[0]);
    const aggregatedMinimums = {};

    for (const charKey of characterSet) {
        aggregatedMinimums[charKey] = initialSegmentFrequencies[charKey] || 0;
    }

    textSegments.slice(1).forEach(currentFragment => {
        const currentFragmentFrequencies = retrieveCharacterFrequencies(currentFragment);
        for (const charKey of characterSet) {
            aggregatedMinimums[charKey] = Math.min(
                aggregatedMinimums[charKey],
                currentFragmentFrequencies[charKey] || 0
            );
        }
    });

    let finalOutputString = "";
    for (const charKey of characterSet) {
        const occurrenceCount = aggregatedMinimums[charKey];
        if (occurrenceCount > 0) {
            finalOutputString += charKey.repeat(occurrenceCount);
        }
    }

    console.log(finalOutputString);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
