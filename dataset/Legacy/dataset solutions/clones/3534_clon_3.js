const PRIME_MODULUS = 10**9 + 7;

const MAX_COMB_N = 10**5 + 30;

let factorialValues = [...new Array(MAX_COMB_N + 1)].fill(0);
let inverseFactorialValues = [...new Array(MAX_COMB_N + 1)].fill(0);

const multiplyMod = (valA, valB) => {
    const valA_high = valA >> 16;
    const valA_low = valA & 65535;
    return (valA_high * valB % PRIME_MODULUS * 65536 + valA_low * valB) % PRIME_MODULUS;
};

const getPrimeFactors = (targetNum) => {
    let primeFactorList = [];
    let tempNum = targetNum;

    for (let currentDivisor = 2; currentDivisor * currentDivisor <= tempNum; currentDivisor++) {
        let currentExponent = 0;
        while (tempNum % currentDivisor === 0) {
            tempNum /= currentDivisor;
            currentExponent++;
        }
        if (currentExponent > 0) {
            primeFactorList.push({ p: currentDivisor, e: currentExponent });
        }
    }

    if (tempNum > 1) {
        primeFactorList.push({ p: tempNum, e: 1 });
    }
    return primeFactorList;
};

const modularPower = (baseVal, powerExponent) => {
    let result = 1;
    let currentBase = baseVal;

    while (powerExponent > 0) {
        if (powerExponent & 1) {
            result = multiplyMod(result, currentBase);
        }
        currentBase = multiplyMod(currentBase, currentBase);
        powerExponent >>= 1;
    }
    return result;
};

const combinationsMod = (totalItems, chosenItems) => {
    if (totalItems === 0 && chosenItems === 0) {
        return 1;
    }
    if (totalItems < chosenItems || totalItems < 0 || chosenItems < 0) {
        return 0;
    }

    const numerator = factorialValues[totalItems];
    const denominatorPart1 = inverseFactorialValues[chosenItems];
    const denominatorPart2 = inverseFactorialValues[totalItems - chosenItems];

    return multiplyMod(numerator, multiplyMod(denominatorPart1, denominatorPart2));
};

const initializeCombinatorics = () => {
    factorialValues[0] = 1;
    inverseFactorialValues[0] = 1;

    for (let i = 0; i < MAX_COMB_N; i++) {
        factorialValues[i + 1] = multiplyMod(factorialValues[i], (i + 1));
    }

    inverseFactorialValues[MAX_COMB_N] = modularPower(factorialValues[MAX_COMB_N], PRIME_MODULUS - 2);

    for (let i = MAX_COMB_N - 1; i >= 1; i--) {
        inverseFactorialValues[i] = multiplyMod(inverseFactorialValues[i + 1], (i + 1));
    }
};

const processInputAndCalculate = (inputString) => {
    const inputParts = inputString.split(" ");
    const numN = Number(inputParts[0]);
    const numM = Number(inputParts[1]);

    const primeDecomposition = getPrimeFactors(numM);

    let finalResult = 1;

    initializeCombinatorics();

    for (const factorInfo of primeDecomposition) {
        const exponentValue = factorInfo.e;
        const upperBound = exponentValue + numN - 1;
        const lowerBound = exponentValue;

        const currentFactorCombinations = combinationsMod(upperBound, lowerBound);

        finalResult = multiplyMod(finalResult, currentFactorCombinations);
    }

    console.log(finalResult);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
