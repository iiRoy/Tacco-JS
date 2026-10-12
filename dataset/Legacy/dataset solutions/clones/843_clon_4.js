const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileContent.trim().split('\n');

const rangeCount = Number(lineSegments[0]);
const intervalDefinitions = lineSegments.slice(1).map(segment => segment.split(' ').map(Number));

const UPPER_BOUND = 100001;
const tallyArray = Array(UPPER_BOUND + 1).fill(0);

intervalDefinitions.forEach(boundaryPair => {
    let currentPoint = boundaryPair[0];
    while (currentPoint <= boundaryPair[1]) {
        tallyArray[currentPoint]++;
        currentPoint++;
    }
});

const ultimateValue = Array.from({ length: UPPER_BOUND - 1 }, (_, indexOffset) => indexOffset + 2)
    .reduce((currentHighest, numericIdentifier) => {
        const observedFrequency = tallyArray[numericIdentifier];
        if (observedFrequency < numericIdentifier) {
            return currentHighest;
        }
        return Math.max(currentHighest, observedFrequency);
    }, 1);

console.log(ultimateValue - 1);
