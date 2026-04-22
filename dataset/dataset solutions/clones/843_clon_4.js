const fileSystem = require('fs');
const maximumValue = 100001;

const rawText = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawText.trim().split('\n');

const totalRanges = Number(processedLines[0]);
const rangeSpecifications = processedLines.slice(1).map(entry => entry.split(' ').map(Number));

const overlapChanges = new Int32Array(maximumValue + 2);

rangeSpecifications.forEach(pair => {
    const startPoint = pair[0];
    const endPoint = pair[1];
    overlapChanges[startPoint]++;
    overlapChanges[endPoint + 1]--;
});

let currentDensity = 0;
let topDensity = 1;

for (let currentNumber = 2; currentNumber <= maximumValue; ++currentNumber) {
    currentDensity += overlapChanges[currentNumber];
    if (currentDensity >= currentNumber) {
        if (currentDensity > topDensity) {
            topDensity = currentDensity;
        }
    }
}

console.log(topDensity - 1);