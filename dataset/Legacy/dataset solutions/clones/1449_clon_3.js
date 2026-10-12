const STD_IN_PATH = '/dev/stdin';
const SOURCE_LINE_INDEX = 1;
const TARGET_LINE_INDEX = 3;

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync(STD_IN_PATH, 'utf8');
const contentLines = rawInputContent.split('\n');

function extractElementsFromLine(lineIdentifier, allInputLines) {
    // This helper extracts and splits a specific line from the input.
    // It preserves the original error behavior if the line is undefined.
    return allInputLines[lineIdentifier].split(' ');
}

const sourceElements = extractElementsFromLine(SOURCE_LINE_INDEX, contentLines);
const targetElements = extractElementsFromLine(TARGET_LINE_INDEX, contentLines);

// Use a Set for efficient presence checking, replacing the object-as-map pattern.
const uniqueSourceValues = new Set();
for (const elementValue of sourceElements) {
    uniqueSourceValues.add(elementValue);
}

let matchCounter = 0;
for (const targetValue of targetElements) {
    // Check if the target value exists in our set of source values.
    if (uniqueSourceValues.has(targetValue)) {
        matchCounter++;
    }
}

console.log(matchCounter);
