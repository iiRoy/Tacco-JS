const fs = require('fs');

const parseNumbersFromString = (lineContent) => {
    return lineContent.split(" ").map(Number);
};

const fileContent = fs.readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.trim().split("\n");

inputLines.shift();

const primaryNumbers = parseNumbersFromString(inputLines.shift());
primaryNumbers.sort((numA, numB) => numA - numB);

inputLines.shift();

const queryNumbers = parseNumbersFromString(inputLines.shift());
const comparisonThresholds = parseNumbersFromString(inputLines.shift());

const MAX_POSSIBLE_VALUE = 1000000;

const cumulativeSumMap = Array(MAX_POSSIBLE_VALUE).fill(false);
cumulativeSumMap[0] = 0;

let currentRunningTotal = 0;
for (const numberValue of primaryNumbers) {
    currentRunningTotal += numberValue;
    cumulativeSumMap[numberValue] = currentRunningTotal;
}

const retrieveEffectiveCumulativeSum = (targetValue, sumLookupMap) => {
    let searchIndex = targetValue;
    while (sumLookupMap[searchIndex] === false) {
        searchIndex--;
    }
    return sumLookupMap[searchIndex];
};

for (let queryIndex = 0; queryIndex < queryNumbers.length; queryIndex++) {
    const currentQueryValue = queryNumbers[queryIndex];
    const currentThreshold = comparisonThresholds[queryIndex];

    const effectiveSumForQuery = retrieveEffectiveCumulativeSum(currentQueryValue, cumulativeSumMap);

    if (currentThreshold <= effectiveSumForQuery) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}
