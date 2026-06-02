const PRIME_MODULUS = 10**9 + 7;

const MAX_COMB_N_VALUE = 10**5 + 21;

let factorialValues = Array.from({ length: MAX_COMB_N_VALUE }, () => 0);
let inverseFactorialValues = Array.from({ length: MAX_COMB_N_VALUE }, () => 0);

const multiplyMod = (valA, valB) => (valA * valB) % PRIME_MODULUS;

const getPrimeFactorization = (inputNum) => {
    let currentPrimeFactors = [];
    let tempNum = inputNum;

    for (let divisor = 2; divisor * divisor <= tempNum; divisor++) {
        let currentExponentCount = 0;
        while (tempNum % divisor === 0) {
            tempNum /= divisor;
            currentExponentCount++;
        }
        if (currentExponentCount > 0) {
            currentPrimeFactors.push({ prime: divisor, exponent: currentExponentCount });
        }
    }

    if (tempNum > 1) {
        currentPrimeFactors.push({ prime: tempNum, exponent: 1 });
    }
    return currentPrimeFactors;
};

const modularPower = (base, exponentVal) => {
    let resultPower = 1;
    let currentBase = base;
    let tempExponent = exponentVal;

    while (tempExponent > 0) {
        if (tempExponent & 1) {
            resultPower = multiplyMod(resultPower, currentBase);
        }
        currentBase = multiplyMod(currentBase, currentBase);
        tempExponent = Math.floor(tempExponent / 2);
    }
    return resultPower;
};

const calculateCombinations = (totalItems, chosenItems) => {
    if (chosenItems < 0 || chosenItems > totalItems) {
        return 0;
    }
    if (totalItems === 0 && chosenItems === 0) {
        return 1;
    }
    
    const diffItems = totalItems - chosenItems;
    const invFactorialDiff = inverseFactorialValues[diffItems];
    const invFactorialChosen = inverseFactorialValues[chosenItems];

    let intermediateProduct = multiplyMod(invFactorialDiff, invFactorialChosen);
    return multiplyMod(factorialValues[totalItems], intermediateProduct);
};

const precomputeFactorials = () => {
    factorialValues[0] = 1;
    inverseFactorialValues[0] = 1;

    for (let k = 0; k < MAX_COMB_N_VALUE - 1; k++) {
        const nextIndex = k + 1;
        factorialValues[nextIndex] = multiplyMod(factorialValues[k], nextIndex);
        inverseFactorialValues[nextIndex] = modularPower(factorialValues[nextIndex], PRIME_MODULUS - 2);
    }
};

const solveProblem = (inputString) => {
    const [numN, numM] = inputString.split(" ").map(Number);

    const primeFactorDecomposition = getPrimeFactorization(numM);
    let finalResult = 1;

    precomputeFactorials();

    for (const factorEntry of primeFactorDecomposition) {
        const currentExponent = factorEntry.exponent;
        const combinationN = currentExponent + numN - 1;
        const combinationR = currentExponent;
        
        const currentCombinationResult = calculateCombinations(combinationN, combinationR);
        finalResult = multiplyMod(finalResult, currentCombinationResult);
    }

    console.log(finalResult);
};

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
