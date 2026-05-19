const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const dataLines = fileContent.split('\n');
let initialValue = parseInt(dataLines[0].trim(), 10);

const primeModulus = 1000000007;

const calculatePower = (base, exponent, modulus) => {
    let result = 1;
    base %= modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) result = (result * base) % modulus;
        base = (base * base) % modulus;
        exponent = Math.floor(exponent / 2);
    }
    return result;
};

const maxCombinatorialN = (initialValue > 0) ? (2 * initialValue - 2) : 0;
const factorialStorage = new Array(maxCombinatorialN + 1);
const inverseFactorialStorage = new Array(maxCombinatorialN + 1);

factorialStorage[0] = 1;
if (maxCombinatorialN >= 0) {
    for (let k = 1; k <= maxCombinatorialN; k++) {
        factorialStorage[k] = (factorialStorage[k - 1] * k) % primeModulus;
    }

    inverseFactorialStorage[maxCombinatorialN] = calculatePower(factorialStorage[maxCombinatorialN], primeModulus - 2, primeModulus);
    for (let k = maxCombinatorialN - 1; k >= 0; k--) {
        inverseFactorialStorage[k] = (inverseFactorialStorage[k + 1] * (k + 1)) % primeModulus;
    }
}

const getCombinatorialCoefficient = (n, k) => {
    if (k < 0 || k > n) {
        return 0;
    }
    const numerator = factorialStorage[n];
    const invDenom1 = inverseFactorialStorage[k];
    const invDenom2 = inverseFactorialStorage[n - k];

    return (numerator * invDenom1 % primeModulus * invDenom2 % primeModulus);
};

const iterationCount = Math.floor(initialValue / 3);

const totalAccumulator = Array.from({ length: iterationCount }, (_, currentIdx) => {
    const columnIdx = initialValue - (currentIdx + 1) * 3;
    return getCombinatorialCoefficient(currentIdx + columnIdx, currentIdx);
}).reduce((acc, val) => (acc + val) % primeModulus, 0);

console.log(totalAccumulator);
