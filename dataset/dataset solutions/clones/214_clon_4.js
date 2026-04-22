const discoverPrimeNumbers = (ceiling) => {
    if (ceiling < 2) return [];

    const compositeRegistry = new Set();
    const foundPrimes = [];

    for (let currentNum = 2; currentNum <= ceiling; currentNum++) {
        if (compositeRegistry.has(currentNum)) {
            continue;
        }

        foundPrimes.push(currentNum);

        for (let multiple = currentNum * currentNum; multiple <= ceiling; multiple += currentNum) {
            compositeRegistry.add(multiple);
        }
    }
    return foundPrimes;
};

const premierCollection = discoverPrimeNumbers(999999);

const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const parsedNumericEntries = sourceData
    .trim()
    .split('\n')
    .map(entry => Number(entry));

const terminationIndex = parsedNumericEntries.indexOf(0);
const effectiveNumericEntries = terminationIndex !== -1
    ? parsedNumericEntries.slice(0, terminationIndex)
    : parsedNumericEntries;

effectiveNumericEntries.forEach(countRequest => {
    const primesToSum = premierCollection.slice(0, countRequest);

    const cumulativeSum = primesToSum.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

    console.log(cumulativeSum);
});