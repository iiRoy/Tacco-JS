const PRIME_MODULUS = 10**9 + 7;
const MAX_LIMIT = 10**5 + 1000;

let factorialValues = new Array(MAX_LIMIT + 1).fill(0);
let inverseFactorialValues = new Array(MAX_LIMIT + 1).fill(0);

const decomposeIntoPrimes = (initialValue) => {
    const primeExponents = new Map();
    let remainingValue = initialValue;
    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= remainingValue; divisorCandidate++) {
        if (remainingValue % divisorCandidate === 0) {
            let currentExponent = 0;
            while (remainingValue % divisorCandidate === 0) {
                remainingValue /= divisorCandidate;
                currentExponent++;
            }
            primeExponents.set(divisorCandidate, currentExponent);
        }
    }
    if (remainingValue > 1) {
        primeExponents.set(remainingValue, (primeExponents.get(remainingValue) || 0) + 1);
    }
    return primeExponents;
};

const modularExponentiation = (baseVal, powerVal) => {
    const bigMod = BigInt(PRIME_MODULUS);
    const bigBase = BigInt(baseVal);

    const recursivePower = (b, p) => {
        if (p === 0) return BigInt(1);
        if (p === 1) return b % bigMod;
        
        let halfPower = recursivePower(b, Math.floor(p / 2));
        let squaredHalf = (halfPower * halfPower) % bigMod;
        
        if (p % 2 === 1) {
            return (squaredHalf * b) % bigMod;
        } else {
            return squaredHalf;
        }
    };
    return Number(recursivePower(bigBase, powerVal));
};

const calculateCombinations = (totalItems, chosenItems) => {
    if (totalItems === 0 && chosenItems === 0) return 1;
    if (totalItems < chosenItems || totalItems < 0) return 1;

    const bigMod = BigInt(PRIME_MODULUS);
    const intermediateProduct = (BigInt(inverseFactorialValues[totalItems - chosenItems]) * BigInt(inverseFactorialValues[chosenItems])) % bigMod;
    return Number((intermediateProduct * BigInt(factorialValues[totalItems])) % bigMod);
};

const prepareCombinatorics = () => {
    factorialValues[0] = 1;
    for (let idx = 0; idx < MAX_LIMIT; idx++) {
        factorialValues[idx + 1] = (BigInt(factorialValues[idx]) * BigInt(idx + 1)) % BigInt(PRIME_MODULUS);
    }

    inverseFactorialValues[MAX_LIMIT] = modularExponentiation(factorialValues[MAX_LIMIT], PRIME_MODULUS - 2);
    for (let idx = MAX_LIMIT - 1; idx >= 0; idx--) {
        inverseFactorialValues[idx] = (BigInt(inverseFactorialValues[idx + 1]) * BigInt(idx + 1)) % BigInt(PRIME_MODULUS);
    }
};

const processInputAndCompute = (inputString) => {
    const [inputN, inputM] = inputString.split(" ").map(Number);
    const primeDecomposition = decomposeIntoPrimes(inputM);
    let finalResult = 1;

    prepareCombinatorics();

    for (const [primeFactor, exponentCount] of primeDecomposition.entries()) {
        let upperBound = exponentCount + inputN - 1;
        let lowerBound = exponentCount;
        
        if (upperBound < 2 * lowerBound) {
            lowerBound = upperBound - lowerBound;
        }
        
        finalResult = (BigInt(finalResult) * BigInt(calculateCombinations(upperBound, lowerBound))) % BigInt(PRIME_MODULUS);
    }
    console.log(Number(finalResult));
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
