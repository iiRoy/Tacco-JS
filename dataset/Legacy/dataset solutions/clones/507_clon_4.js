const fs = require('fs');
const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');

let accumulatedValue = 0;
const dataLines = rawInputContent.trim().split('\n');

for (const currentLine of dataLines) {
    const numericalRepresentation = Number(currentLine);
    accumulatedValue = accumulatedValue + numericalRepresentation;
}

console.log(accumulatedValue);
