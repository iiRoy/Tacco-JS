const fileSystem = require('fs');

const maximumValueLimit = 100001;

let rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
let processedInputLines = rawInputContent.trim().split('\n');

let numberOfRanges = Number(processedInputLines.shift());

let rangeImpactDifferentials = new Array(maximumValueLimit + 2).fill(0);

for (let currentRangeIndex = 0; currentRangeIndex < numberOfRanges; currentRangeIndex++) {
    let [startPoint, endPoint] = processedInputLines.shift().split(' ').map(Number);
    rangeImpactDifferentials[startPoint]++;
    rangeImpactDifferentials[endPoint + 1]--;
}

let cumulativeFrequencyCounts = new Array(maximumValueLimit + 1).fill(0);
let currentRunningSum = 0;

for (let numberIdentifier = 2; numberIdentifier <= maximumValueLimit; numberIdentifier++) {
    currentRunningSum += rangeImpactDifferentials[numberIdentifier];
    cumulativeFrequencyCounts[numberIdentifier] = 1 + currentRunningSum;
}

let highestMatchingNumber = 1;

for (let numberIdentifier = 2; numberIdentifier <= maximumValueLimit; numberIdentifier++) {
    if (cumulativeFrequencyCounts[numberIdentifier] >= numberIdentifier) {
        highestMatchingNumber = numberIdentifier;
    }
}

console.log(highestMatchingNumber - 1);
