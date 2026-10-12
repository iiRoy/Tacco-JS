const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const dataLines = rawInputContent.split('\n');

function* generateFormattedOutput(sourceEntries) {
    let currentEntryIndex = 0;
    for (const singleEntry of sourceEntries) {
        yield `Case ${currentEntryIndex}: ${singleEntry}`;
        currentEntryIndex++;
    }
}

for (const outputLine of generateFormattedOutput(dataLines)) {
    console.log(outputLine);
}
