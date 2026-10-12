const primeGenerator = (limit) => {
    const compositeTracker = new Map();
    const primeList = [];

    for (let currentNum = 2; currentNum <= limit; currentNum++) {
        if (!compositeTracker.has(currentNum)) {
            primeList.push(currentNum);
            for (let multiple = currentNum * currentNum; multiple <= limit; multiple += currentNum) {
                compositeTracker.set(multiple, true);
            }
        }
    }
    return primeList;
};

const decomposeIntoPrimes = (targetNum, availablePrimes) => {
    let remainingValue = targetNum;
    const primeExponents = availablePrimes.reduce((accumulator, currentPrime) => {
        if (remainingValue < currentPrime) {
            return accumulator;
        }
        let count = 0;
        while (remainingValue % currentPrime === 0) {
            count++;
            remainingValue /= currentPrime;
        }
        if (count > 0) {
            accumulator.set(currentPrime, count);
        }
        return accumulator;
    }, new Map());

    if (remainingValue > 1) {
        primeExponents.set(remainingValue, (primeExponents.get(remainingValue) || 0) + 1);
    }
    return Object.fromEntries(primeExponents);
};

const computeGreatestCommonDivisor = (valA, valB) => {
    while (valB !== 0) {
        const temporary = valB;
        valB = valA % valB;
        valA = temporary;
    }
    return valA;
};

const processNumbers = (inputString) => {
    const lines = inputString.split("\n");
    const inputSize = Number(lines[0]);
    const numbers = lines[1].split(" ").map(Number);

    const maximumValue = Math.max(...numbers);
    const generatedPrimes = primeGenerator(maximumValue);

    const uniqueFactorsEncountered = new Set();
    let isPairwise = true;

    for (const num of numbers) {
        const currentNumFactors = Object.keys(decomposeIntoPrimes(num, generatedPrimes)).map(Number);
        for (const factor of currentNumFactors) {
            if (uniqueFactorsEncountered.has(factor)) {
                isPairwise = false;
                break;
            }
            uniqueFactorsEncountered.add(factor);
        }
        if (!isPairwise) {
            break;
        }
    }

    if (isPairwise) {
        console.log("pairwise coprime");
        return;
    }

    const overallGCD = numbers.reduce((accumulator, current) => computeGreatestCommonDivisor(accumulator, current));

    if (overallGCD === 1) {
        console.log("setwise coprime");
        return;
    }

    console.log("not coprime");
};

processNumbers(require("fs").readFileSync("/dev/stdin", "utf8"));
