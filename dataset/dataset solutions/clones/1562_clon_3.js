const generateSmallPrimesAndMarkMultiples = (upperLimit) => {
    const processedPrimesTracker = (new Array(upperLimit)).fill(0);
    const collectedPrimes = [];
    for (let currentNum = 2; currentNum * currentNum <= upperLimit; currentNum++) {
        if (processedPrimesTracker[currentNum] === 0) {
            collectedPrimes.push(currentNum);
            for (let multiple = currentNum; multiple * multiple <= upperLimit; multiple += currentNum) {
                processedPrimesTracker[multiple] = 1;
            }
        }
    }
    return collectedPrimes;
};

const getPrimeFactorization = (targetNumber, precomputedPrimes) => {
    if (targetNumber <= 1) {
        return {};
    }
    const factorCounts = {};
    let tempNumber = targetNumber;

    for (const currentPrimeDivisor of precomputedPrimes) {
        if (tempNumber < currentPrimeDivisor) {
            break;
        }
        while (tempNumber % currentPrimeDivisor === 0) {
            factorCounts[currentPrimeDivisor] = (factorCounts[currentPrimeDivisor] || 0) + 1;
            tempNumber /= currentPrimeDivisor;
        }
    }
    if (tempNumber > 1) {
        factorCounts[tempNumber] = 1;
    }
    return factorCounts;
};

const calculateGreatestCommonDivisor = (num1, num2) => {
    while (num2 !== 0) {
        const temp = num2;
        num2 = num1 % num2;
        num1 = temp;
    }
    return num1;
};

const checkPairwiseCoprime = (numbersArray, smallPrimesList, maxPossibleValue) => {
    const primeFactorOccurrences = new Array(maxPossibleValue).fill(0);
    let areElementsPairwiseCoprime = true;

    for (const currentNumber of numbersArray) {
        const currentNumFactors = Object.keys(getPrimeFactorization(currentNumber, smallPrimesList)).map(Number);
        for (const factor of currentNumFactors) {
            if (primeFactorOccurrences[factor] === 1) {
                areElementsPairwiseCoprime = false;
                break;
            }
            primeFactorOccurrences[factor] = 1;
        }
        if (!areElementsPairwiseCoprime) {
            break;
        }
    }
    return areElementsPairwiseCoprime;
};

const checkSetwiseCoprime = (numbersArray) => {
    let overallGCD = 0;
    for (const num of numbersArray) {
        overallGCD = calculateGreatestCommonDivisor(overallGCD, num);
    }
    return overallGCD === 1;
};

const processCoprimalityCheck = (inputString) => {
    const lines = inputString.trim().split("\n");
    const N = Number(lines[0]);
    const numbersArray = lines[1].split(" ").map(Number);

    const MAX_ARRAY_VALUE_LIMIT = 10**6 + 1;
    
    const smallPrimes = generateSmallPrimesAndMarkMultiples(MAX_ARRAY_VALUE_LIMIT);

    const isPairwise = checkPairwiseCoprime(numbersArray, smallPrimes, MAX_ARRAY_VALUE_LIMIT);

    if (isPairwise) {
        console.log("pairwise coprime");
        return;
    }
    
    const isSetwise = checkSetwiseCoprime(numbersArray);
    
    if (isSetwise) {
        console.log("setwise coprime");
        return;
    }
    
    console.log("not coprime");
};

processCoprimalityCheck(require("fs").readFileSync("/dev/stdin", "utf8"));
