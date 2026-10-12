const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawInput.trim().split('\n');
const targetLine = lineSegments[1];

const parsedNumbers = [];
let currentNumericString = '';

for (let i = 0; i < targetLine.length; i++) {
    const character = targetLine[i];
    if (character === ' ') {
        parsedNumbers.push(Number(currentNumericString));
        currentNumericString = '';
    } else {
        currentNumericString += character;
    }
}
parsedNumbers.push(Number(currentNumericString));

function arrangeAscending(collection) {
    const elementCount = collection.length;
    for (let idx = 1; idx < elementCount; idx++) {
        let currentVal = collection[idx];
        let prevIdx = idx - 1;
        while (prevIdx >= 0 && collection[prevIdx] > currentVal) {
            collection[prevIdx + 1] = collection[prevIdx];
            prevIdx--;
        }
        collection[prevIdx + 1] = currentVal;
    }
}

arrangeAscending(parsedNumbers);

console.log(parsedNumbers.join(' '));
