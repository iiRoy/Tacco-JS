const computeCharacterFrequencies = (inputString) => {
    const charFrequencyMap = {};
    for (const charValue of inputString) {
        charFrequencyMap[charValue] = (charFrequencyMap[charValue] || 0) + 1;
    }
    return charFrequencyMap;
};

const fileSystemModule = require("fs");

const rawInputBuffer = fileSystemModule.readFileSync(0);
const fullInputContent = rawInputBuffer.toString();

const allContentLines = fullInputContent.split('\n');

const dataLines = allContentLines.slice(1, -1);

const lineFrequencyMaps = dataLines.map(computeCharacterFrequencies);

const aggregatedMinFrequencies = lineFrequencyMaps.reduce((currentMinMap, nextLineMap) => {
    for (const characterIdentifier in currentMinMap) {
        currentMinMap[characterIdentifier] = Math.min(
            currentMinMap[characterIdentifier],
            nextLineMap[characterIdentifier] || 0
        );
    }
    return currentMinMap;
});

const finalOutputParts = [];
const uniqueCharacters = Object.keys(aggregatedMinFrequencies);

for (const charKeyToRepeat of uniqueCharacters) {
    const repetitionCount = aggregatedMinFrequencies[charKeyToRepeat];
    finalOutputParts.push(charKeyToRepeat.repeat(repetitionCount));
}

finalOutputParts.sort();
const finalResultString = finalOutputParts.join('');

console.log(finalResultString);
