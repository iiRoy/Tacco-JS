function computePrimeSet(limitValue) {
    const allNumbers = new Set();
    for (let c = 2; c <= limitValue; c++) {
        allNumbers.add(c);
    }

    const rootLimit = Math.floor(Math.sqrt(limitValue));
    for (let currentCandidate = 2; currentCandidate <= rootLimit; currentCandidate++) {
        if (allNumbers.has(currentCandidate)) {
            for (let multiple = currentCandidate * currentCandidate; multiple <= limitValue; multiple += currentCandidate) {
                allNumbers.delete(multiple);
            }
        }
    }
    return allNumbers;
}

const maximumValue = 1000000;
const knownPrimes = computePrimeSet(maximumValue);

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedLines = rawInputData.trim().split("\n");

while (true) {
    const configLine = parsedLines.shift().split(" ").map(Number);
    const numElements = configLine[0];
    const targetSum = configLine[1];

    if (numElements === 0 && targetSum === 0) {
        break;
    }

    const componentValues = [];
    for (let i = 0; i < numElements; i++) {
        componentValues.push(Number(parsedLines.shift()));
    }

    let possibleTotals = new Set([0]);

    for (const currentComponent of componentValues) {
        const sumsToAddNext = new Set();
        for (const existingTotal of possibleTotals) {
            const newTotal = existingTotal + currentComponent;
            if (newTotal <= maximumValue) {
                sumsToAddNext.add(newTotal);
            }
        }
        for (const s of sumsToAddNext) {
            possibleTotals.add(s);
        }
    }

    let finalAnswer = "NA";
    for (let checkValue = targetSum; checkValue >= 1; checkValue--) {
        if (possibleTotals.has(checkValue) && knownPrimes.has(checkValue)) {
            finalAnswer = checkValue;
            break;
        }
    }
    console.log(finalAnswer);
}