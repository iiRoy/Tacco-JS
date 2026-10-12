const fileSystem = require('fs');

function retrieveLargestSum(registryMap, upperLimit) {
    for (let currentKey = upperLimit; currentKey >= 0; currentKey--) {
        if (registryMap.has(currentKey)) {
            return registryMap.get(currentKey);
        }
    }
    return 0n;
}

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");

const numericValues = inputLines[1].split(" ").map(Number);
numericValues.sort((valA, valB) => valA - valB);

const queryValues = inputLines[3].split(" ").map(Number);
const comparisonStrings = inputLines[4].split(" ");

const sumRegistry = new Map();
let currentAccumulator = 0n;

for (const val of numericValues) {
    currentAccumulator += BigInt(val);
    sumRegistry.set(val, currentAccumulator);
}

for (let queryIndex = 0; queryIndex < queryValues.length; queryIndex++) {
    const currentQuery = queryValues[queryIndex];
    const currentComparisonString = comparisonStrings[queryIndex];

    const computedSum = retrieveLargestSum(sumRegistry, currentQuery);
    const parsedComparisonValue = BigInt(currentComparisonString);

    if (parsedComparisonValue <= computedSum) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}
