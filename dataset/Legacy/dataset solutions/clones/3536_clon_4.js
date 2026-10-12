const PRIME_MODULUS = 10**9 + 7;
const UPPER_BOUND = 10**5 + 21;

let factorials = new Array(UPPER_BOUND).fill(0);
let invFactorials = new Array(UPPER_BOUND).fill(0);

const modMultiply = (valA, valB) => {
    let result = 0;
    valA %= PRIME_MODULUS;
    while (valB > 0) {
        if (valB & 1) {
            result = (result + valA) % PRIME_MODULUS;
        }
        valA = (valA * 2) % PRIME_MODULUS;
        valB >>= 1;
    }
    return result;
};

const primeDecomposition = (num) => {
    const factors = [];
    let currentNum = num;
    for (let divisor = 2; divisor * divisor <= currentNum; divisor++) {
        if (currentNum % divisor === 0) {
            let count = 0;
            do {
                currentNum /= divisor;
                count++;
            } while (currentNum % divisor === 0);
            factors.push([divisor, count]);
        }
    }
    if (currentNum > 1) {
        factors.push([currentNum, 1]);
    }
    return factors;
};

const modPower = (base, exponent) => {
    if (exponent === 0) return 1;
    if (exponent % 2 === 0) {
        const halfPower = modPower(base, exponent / 2);
        return modMultiply(halfPower, halfPower);
    } else {
        return modMultiply(base, modPower(base, exponent - 1));
    }
};

const combinations = (nVal, rVal) => {
    if (nVal === 0 && rVal === 0) return 1;
    if (nVal < rVal || nVal < 0) return 0;
    return modMultiply(modMultiply(factorials[nVal], invFactorials[rVal]), invFactorials[nVal - rVal]);
};

const precomputeFactorials = () => {
    factorials[0] = 1;
    for (let i = 0; i < UPPER_BOUND - 1; i++) {
        factorials[i + 1] = modMultiply(factorials[i], (i + 1));
    }
    invFactorials[UPPER_BOUND - 1] = modPower(factorials[UPPER_BOUND - 1], PRIME_MODULUS - 2);
    for (let i = UPPER_BOUND - 2; i >= 0; i--) {
        invFactorials[i] = modMultiply(invFactorials[i + 1], (i + 1));
    }
};

const solve = (inputData) => {
    const [numN, numM] = inputData.split(" ").map(Number);

    precomputeFactorials();

    const primeFactors = primeDecomposition(numM);

    const finalResult = primeFactors.reduce((accumulator, currentFactor) => {
        const [, exponentVal] = currentFactor;
        const nCr_n = exponentVal + numN - 1;
        const nCr_r = exponentVal;
        return modMultiply(accumulator, combinations(nCr_n, nCr_r));
    }, 1);

    console.log(finalResult);
};

solve(require("fs").readFileSync("/dev/stdin", "utf8"));
