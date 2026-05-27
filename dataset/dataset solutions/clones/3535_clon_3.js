const PRIME_MODULUS = 10**9 + 7;
const MAX_VAL_N = 10**5 + 1000;

let factorialValues = new Array(MAX_VAL_N).fill(0);
let invFactorialValues = new Array(MAX_VAL_N).fill(0);

const getPrimeFactors = (numToFactor) => {
    let primeFactorList = [];
    let currentNum = numToFactor;
    const limitDivisor = Math.sqrt(currentNum);

    for (let divisorCandidate = 2; divisorCandidate <= limitDivisor; divisorCandidate++) {
        let currentExponent = 0;
        while (currentNum % divisorCandidate === 0) {
            currentNum /= divisorCandidate;
            currentExponent++;
        }
        if (currentExponent > 0) {
            primeFactorList.push({ primeBase: divisorCandidate, primePower: currentExponent });
        }
    }
    
    if (currentNum > 1) {
        primeFactorList.push({ primeBase: currentNum, primePower: 1 });
    }
    return primeFactorList;
};

const modularExponentiation = (baseVal, exponentVal) => {
    let resultPower = BigInt(1);
    let currentBase = BigInt(baseVal);
    const modulusBigInt = BigInt(PRIME_MODULUS);

    let tempExponent = exponentVal;
    while (tempExponent !== 0) {
        if (tempExponent % 2 === 1) { // Check if the last bit is 1 (equivalent to n & 1)
            resultPower = (resultPower * currentBase) % modulusBigInt;
        }
        currentBase = (currentBase * currentBase) % modulusBigInt;
        tempExponent = Math.floor(tempExponent / 2); // Equivalent to n >> 1
    }
    return Number(resultPower);
};

const calculateCombinations = (totalItems, itemsToChoose) => {
    if (totalItems === 0 && itemsToChoose === 0) return 1;
    if (itemsToChoose < 0 || itemsToChoose > totalItems) return 1; // Preserving original behavior for n < r or n < 0
    if (totalItems < 0) return 1; // Explicitly preserving original behavior for n < 0

    const modulusBigInt = BigInt(PRIME_MODULUS);
    
    const invRFact = BigInt(invFactorialValues[itemsToChoose]);
    const invNMinusRFact = BigInt(invFactorialValues[totalItems - itemsToChoose]);
    
    let tempInverseProduct = (invRFact * invNMinusRFact) % modulusBigInt;
    let finalCombination = (tempInverseProduct * BigInt(factorialValues[totalItems])) % modulusBigInt;
    
    return Number(finalCombination);
};

const initializeCombinatorics = () => {
    factorialValues[0] = 1;
    invFactorialValues[0] = 1;
    const modulusBigInt = BigInt(PRIME_MODULUS);
    const inverseExponent = PRIME_MODULUS - 2;

    for (let idx = 0; idx < MAX_VAL_N; idx++) {
        // Calculate factorialValues[idx + 1]
        const currentFactorial = BigInt(factorialValues[idx]);
        const nextIndex = BigInt(idx + 1);
        const nextFactorialVal = (currentFactorial * nextIndex) % modulusBigInt;
        factorialValues[idx + 1] = Number(nextFactorialVal);

        // Calculate invFactorialValues[idx + 1] using modular exponentiation
        invFactorialValues[idx + 1] = modularExponentiation(factorialValues[idx + 1], inverseExponent);
    }
};

const processInputAndCalculate = (inputString) => {
    const inputParts = inputString.split(" ").map(Number);
    const valN = inputParts[0];
    const valM = inputParts[1];
    
    const primeDecomposition = getPrimeFactors(valM);
    let finalAnswer = 1;

    initializeCombinatorics();

    for (const factorEntry of primeDecomposition) {
        const primeExponent = factorEntry.primePower;
        let upperComb = primeExponent + valN - 1;
        let lowerComb = primeExponent;

        if (upperComb < 2 * lowerComb) {
            lowerComb = upperComb - lowerComb;
        }
        
        const currentFactorCombinations = calculateCombinations(upperComb, lowerComb);
        finalAnswer = (finalAnswer * currentFactorCombinations) % PRIME_MODULUS;
    }
    console.log(finalAnswer);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
