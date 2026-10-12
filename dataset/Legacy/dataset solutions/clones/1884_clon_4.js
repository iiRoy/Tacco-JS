const MOD_VAL = 998244353;

function multiply(factor1, factor2) {
    return Number((BigInt(factor1) * BigInt(factor2)) % BigInt(MOD_VAL));
}

function power(base, exponent) {
    if (exponent < 0) return 1; // Preserves original function's behavior for negative exponents
    if (exponent === 0) return 1;
    if (exponent === 1) return base % MOD_VAL;

    const halfPower = power(base, Math.floor(exponent / 2));
    let result = multiply(halfPower, halfPower);
    if (exponent % 2 === 1) {
        result = multiply(result, base);
    }
    return result;
}

function modularInverse(val) {
    if (val === 1) return 1;
    return power(val, MOD_VAL - 2);
}

let factorialCache;
let inverseFactorialCache;

function precomputeFactorials(limit) {
    factorialCache = new Array(limit + 1);
    inverseFactorialCache = new Array(limit + 1);
    factorialCache[0] = 1;

    for (let i = 1; i <= limit; i++) {
        factorialCache[i] = multiply(factorialCache[i - 1], i);
    }

    inverseFactorialCache[limit] = modularInverse(factorialCache[limit]);
    for (let i = limit - 1; i >= 0; i--) {
        inverseFactorialCache[i] = multiply(inverseFactorialCache[i + 1], (i + 1));
    }
}

function getCombinations(nVal, kVal) {
    if (kVal < 0 || kVal > nVal) return 0;
    return multiply(factorialCache[nVal], multiply(inverseFactorialCache[kVal], inverseFactorialCache[nVal - kVal]));
}

((rawInput) => {
    const dataLines = rawInput.split('\n');
    let [numN, numM, numK] = dataLines[0].split(' ').map(Number);

    precomputeFactorials(numN);

    const finalResult = Array.from({ length: numK + 1 }, (_, currentK) => {
        const termCombinations = getCombinations(numN, currentK);
        const termPower = power(numM - 1, numN - currentK - 1);
        return multiply(multiply(termCombinations, termPower), numM);
    }).reduce((accumulator, currentTerm) => (accumulator + currentTerm) % MOD_VAL, 0);

    console.log(finalResult);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
