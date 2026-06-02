"use strict";

const generateCharFrequencyMap = (textSource) => {
    const frequencyRegister = new Map();
    for (const characterUnit of textSource) {
        frequencyRegister.set(characterUnit, (frequencyRegister.get(characterUnit) || 0) + 1);
    }
    return frequencyRegister;
};

const assembleOrderedString = (frequencyRegister, orderAscending) => {
    const distinctCharacters = Array.from(frequencyRegister.keys());
    distinctCharacters.sort((charA, charB) => orderAscending ? charA.localeCompare(charB) : charB.localeCompare(a));

    let assembledResult = [];
    for (const charKey of distinctCharacters) {
        const occurrenceCount = frequencyRegister.get(charKey);
        for (let i = 0; i < occurrenceCount; i++) {
            assembledResult.push(charKey);
        }
    }
    return assembledResult.join('');
};

const processInputData = (inputPayload) => {
    const inputLines = inputPayload.split("\n");
    const primaryString = inputLines[0];
    const secondaryString = inputLines[1];

    const primaryFrequencies = generateCharFrequencyMap(primaryString);
    const secondaryFrequencies = generateCharFrequencyMap(secondaryString);

    const orderedPrimary = assembleOrderedString(primaryFrequencies, true);
    const orderedSecondary = assembleOrderedString(secondaryFrequencies, false);

    console.log(orderedPrimary < orderedSecondary ? "Yes" : "No");
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
