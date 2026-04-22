const numberFilter = (upperBound) => {
    let isNotPrime = new Map();
    for (let k = 2; k * k <= upperBound; k++) {
        if (!isNotPrime.has(k)) {
            for (let m = k * k; m <= upperBound; m += k) {
                isNotPrime.set(m, true);
            }
        }
    }
    return Array.from({ length: upperBound - 1 }, (_, index) => index + 2)
                .filter(val => !isNotPrime.has(val));
};

const componentDecomposer = (val, primeList) => {
    let parts = new Map();
    let currentVal = val;

    for (let p of primeList) {
        if (p * p > currentVal && currentVal > 1) {
            if (!parts.has(currentVal)) parts.set(currentVal, 0);
            parts.set(currentVal, parts.get(currentVal) + 1);
            currentVal = 1;
            break;
        }
        if (currentVal < p) break;
        while (currentVal % p === 0) {
            if (!parts.has(p)) parts.set(p, 0);
            parts.set(p, parts.get(p) + 1);
            currentVal /= p;
        }
        if (currentVal === 1) break;
    }
    if (currentVal > 1) {
        if (!parts.has(currentVal)) parts.set(currentVal, 0);
        parts.set(currentVal, parts.get(currentVal) + 1);
    }
    return Array.from(parts.keys());
};

const findGreatestCommonDivisor = (first, second) => {
    while (second !== 0) {
        let temporary = second;
        second = first % second;
        first = temporary;
    }
    return first;
};

const handleData = (inputString) => {
    const lines = inputString.split("\n");
    const quantity = Number(lines[0]);
    const inputNumbers = lines[1].split(" ").map(Number);
    
    const MAX_VALUE_LIMIT = 10**6 + 1;
    
    const primeList = numberFilter(MAX_VALUE_LIMIT);
    
    let arePairwiseCoprime = true;
    let encounteredFactors = new Set();
    
    for (const currentNum of inputNumbers) {
        const uniquePrimeFactors = componentDecomposer(currentNum, primeList);
        for (const factor of uniquePrimeFactors) {
            if (encounteredFactors.has(factor)) {
                arePairwiseCoprime = false;
                break;
            }
            encounteredFactors.add(factor);
        }
        if (!arePairwiseCoprime) {
            break;
        }
    }
    
    if (arePairwiseCoprime) {
        console.log("pairwise coprime");
        return;
    }
    
    let overallDivisor = 0;
    for (const num of inputNumbers) {
        overallDivisor = findGreatestCommonDivisor(overallDivisor, num);
    }
    
    if (overallDivisor === 1) {
        console.log("setwise coprime");
        return;
    }
    
    console.log("not coprime");
};

handleData(require("fs").readFileSync("/dev/stdin", "utf8"));