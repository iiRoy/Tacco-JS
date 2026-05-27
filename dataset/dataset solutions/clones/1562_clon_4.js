const primeGenerator = (limit) => {
    const compositeStatus = new Array(limit + 1).fill(false);
    const primeSequence = [];
    for (let currentNum = 2; currentNum * currentNum <= limit; currentNum++) {
        if (!compositeStatus[currentNum]) {
            primeSequence.push(currentNum);
            for (let multiple = currentNum; multiple * multiple <= limit; multiple += currentNum) {
                compositeStatus[multiple] = true;
            }
        }
    }
    return primeSequence;
};

const primeFactorDecomposition = (value, precomputedPrimes) => {
    let remainingValue = value;
    const factorMap = new Map();

    for (const p of precomputedPrimes) {
        if (remainingValue < p) {
            break;
        }
        if (remainingValue % p === 0) {
            let count = 0;
            do {
                count++;
                remainingValue /= p;
            } while (remainingValue % p === 0);
            factorMap.set(p, count);
        }
    }

    if (remainingValue > 1) {
        factorMap.set(remainingValue, 1);
    }
    return factorMap;
};

const computeGreatestCommonDivisor = (first, second) => {
    let currentA = first;
    let currentB = second;
    while (currentB !== 0) {
        const temp = currentB;
        currentB = currentA % currentB;
        currentA = temp;
    }
    return currentA;
};

const processInput = (inputString) => {
    const lines = inputString.split("\n");
    const elementCount = Number(lines[0]);
    const inputNumbers = lines[1].split(" ").map(Number);
    
    const upperBound = 10**6 + 1;
    
    const smallPrimes = primeGenerator(upperBound);

    let arePairwiseCoprime = true;
    const encounteredPrimes = new Set();

    inputNumbers.some(num => {
        const currentFactors = primeFactorDecomposition(num, smallPrimes);
        for (const factor of currentFactors.keys()) {
            if (encounteredPrimes.has(factor)) {
                arePairwiseCoprime = false;
                return true;
            }
            encounteredPrimes.add(factor);
        }
        return false;
    });

    if (arePairwiseCoprime) {
        console.log("pairwise coprime");
        return;
    }
    
    const overallDivisor = inputNumbers.reduce((currentGcd, num) =>
        computeGreatestCommonDivisor(currentGcd, num)
    );
    
    if (overallDivisor === 1) {
        console.log("setwise coprime");
        return;
    }
    
    console.log("not coprime");
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
