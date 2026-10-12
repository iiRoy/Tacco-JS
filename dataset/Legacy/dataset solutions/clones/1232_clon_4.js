const fileSystemOperations = require('fs');
const rawInputContent = fileSystemOperations.readFileSync('/dev/stdin', 'utf8');

function* generateOutputStrings(inputStringData) {
    const linesOfData = inputStringData.split('\n');
    let currentCaseIdentifier = 1;
    for (const lineEntry of linesOfData) {
        const parsedNumericValue = Number(lineEntry);
        if (parsedNumericValue === 0) {
            return;
        }
        yield `Case ${currentCaseIdentifier}: ${parsedNumericValue}`;
        currentCaseIdentifier++;
    }
}

for (const outputLine of generateOutputStrings(rawInputContent)) {
    console.log(outputLine);
}
