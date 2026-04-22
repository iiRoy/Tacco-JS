const getPrimality = (val) => {
    if (val < 2) return false;
    if (val === 2 || val === 3) return true;
    if (val % 2 === 0 || val % 3 === 0) return false;
    for (let div = 5; div * div <= val; div += 6) {
        if (val % div === 0 || val % (div + 2) === 0) return false;
    }
    return true;
};

const obtainPrimeSet = (cap) => {
    const collectedPrimes = new Set();
    for (let num = 2; num <= cap; num++) {
        if (getPrimality(num)) {
            collectedPrimes.add(num);
        }
    }
    return collectedPrimes;
};

const primeNumbersGlobal = obtainPrimeSet(1000000);

const fileSystem = require('fs');
const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawContent.trim().split('\n');

let linePointer = 0;

while (true) {
    const currentLine = processedLines[linePointer++].split(' ').map(Number);
    const itemCount = currentLine[0];
    const desiredTotal = currentLine[1];

    if (itemCount === 0 && desiredTotal === 0) break;

    const availableItems = [];
    for (let k = 0; k < itemCount; k++) {
        availableItems.push(Number(processedLines[linePointer++]));
    }

    const reachableTotals = new Set([0]);
    const sumsToExplore = [0];
    let exploreHead = 0;

    while (exploreHead < sumsToExplore.length) {
        const currentAccumulation = sumsToExplore[exploreHead++];

        for (const elementValue of availableItems) {
            const nextAccumulation = currentAccumulation + elementValue;
            if (nextAccumulation <= desiredTotal && !reachableTotals.has(nextAccumulation)) {
                reachableTotals.add(nextAccumulation);
                sumsToExplore.push(nextAccumulation);
            }
        }
    }

    const validPrimeSums = Array.from(reachableTotals)
                                .filter(s => s > 0 && s <= desiredTotal && primeNumbersGlobal.has(s));

    if (validPrimeSums.length === 0) {
        console.log("NA");
    } else {
        const maximalPrimeSum = Math.max(...validPrimeSums);
        console.log(maximalPrimeSum);
    }
}