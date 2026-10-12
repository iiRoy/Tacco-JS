const fileSystem = require('fs');

function parseEntryLine(lineContent) {
    const parts = lineContent.split(" ");
    return {
        identifier: parts[0],
        numericValue: Number(parts[1])
    };
}

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputData.trim().split('\n');

const totalEntriesCount = parseInt(processedLines.shift(), 10);

const aggregatedDataMap = {};

for (let entryIndex = 0; entryIndex < totalEntriesCount; entryIndex++) {
    const currentLineText = processedLines[entryIndex];
    const parsedEntry = parseEntryLine(currentLineText);
    const currentIdentifier = parsedEntry.identifier;
    const currentNumericValue = parsedEntry.numericValue;

    aggregatedDataMap[currentIdentifier] = (aggregatedDataMap[currentIdentifier] || 0) + currentNumericValue;
}

const sortedIdentifiersList = Object.keys(aggregatedDataMap).sort();

for (let outputIndex = 0; outputIndex < sortedIdentifiersList.length; outputIndex++) {
    const keyToOutput = sortedIdentifiersList[outputIndex];
    console.log(`${keyToOutput} ${aggregatedDataMap[keyToOutput]}`);
}
