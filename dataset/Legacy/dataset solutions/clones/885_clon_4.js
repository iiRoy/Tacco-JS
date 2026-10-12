const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync(process.stdin.fd, 'utf8');
const allInputLines = rawInputContent.trim().split('\n');

const [entryCount, searchThreshold] = allInputLines[0].split(' ').map(Number);

const defaultIdentifier = 'kogakubu10gokan';

const dataEntries = allInputLines.slice(1, entryCount + 1);

const locatedEntryLine = dataEntries.find(currentEntry => {
    const [numericValue, textLabel] = currentEntry.split(' ');
    return Number(numericValue) >= searchThreshold;
});

let finalIdentifier;
if (locatedEntryLine) {
    finalIdentifier = locatedEntryLine.split(' ')[1];
} else {
    finalIdentifier = defaultIdentifier;
}

console.log(finalIdentifier);
