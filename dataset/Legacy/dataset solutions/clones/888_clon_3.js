const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';

const rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');
const allInputLines = rawInputContent.trim().split('\n');

const parseNumericToken = (tokenValue) => {
    return Number(tokenValue);
};

const configurationLine = allInputLines.shift();
const configurationTokens = configurationLine.split(' ');

const numberOfDataEntries = parseNumericToken(configurationTokens[0]);
const comparisonThresholdValue = parseNumericToken(configurationTokens[1]);

let finalOutputString = "kogakubu10gokan";

for (let currentEntryIndex = 0; currentEntryIndex < numberOfDataEntries; ++currentEntryIndex) {
    const currentDataLine = allInputLines[currentEntryIndex];
    const currentLineParts = currentDataLine.split(' ');

    const candidateNumericValue = parseNumericToken(currentLineParts[0]);

    if (candidateNumericValue <= comparisonThresholdValue) {
        finalOutputString = currentLineParts[1];
    }
}

console.log(finalOutputString);
