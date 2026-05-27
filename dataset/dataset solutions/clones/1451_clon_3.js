const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

function parseLineToNumbers(lineContent) {
    const stringNumbers = lineContent.split(" ");
    const numericArray = stringNumbers.map(Number);
    return numericArray;
}

const lines = rawData.trim().split("\n");

const firstNumArrayRaw = lines[1];
const firstNumArray = parseLineToNumbers(firstNumArrayRaw);

const secondNumArrayRaw = lines[3];
const secondNumArray = parseLineToNumbers(secondNumArrayRaw);

const firstNumSet = new Set(firstNumArray);

let matchCount = 0;

for (const currentVal of secondNumArray) {
    const isPresentInFirstSet = firstNumSet.has(currentVal);
    if (isPresentInFirstSet) {
        matchCount++;
    }
}

console.log(matchCount);
