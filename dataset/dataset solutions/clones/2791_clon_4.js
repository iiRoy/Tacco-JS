'use strict';

const processInput = (rawText) => {
    const numericValues = rawText.trim().split(/\s+/).map(Number);
    const [valN, valK] = numericValues;
    return { valN, valK };
};

const { valN, valK } = processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

const PRIME_MODULUS = 1000000007;
const DERIVED_L = valN - valK + 1;

const addModulo = (operandA, operandB) => (operandA + operandB) % PRIME_MODULUS;

const multiplyModulo = (factorX, factorY) => {
    let resultAccumulator = 0;
    factorX %= PRIME_MODULUS;
    while (factorY > 0) {
        if (factorY & 1) {
            resultAccumulator = addModulo(resultAccumulator, factorX);
        }
        factorX = addModulo(factorX, factorX);
        factorY >>= 1;
    }
    return resultAccumulator;
};

const powerModulo = (baseVal, exponentVal) => {
    let res = 1;
    baseVal %= PRIME_MODULUS;
    while (exponentVal > 0) {
        if (exponentVal % 2 === 1) {
            res = multiplyModulo(res, baseVal);
        }
        baseVal = multiplyModulo(baseVal, baseVal);
        exponentVal = Math.floor(exponentVal / 2);
    }
    return res;
};

const inverseModulo = (numVal) => powerModulo(numVal, PRIME_MODULUS - 2);

const maxNForCombinations = valN;
const factorialValues = new Array(maxNForCombinations + 1);
const inverseFactorialValues = new Array(maxNForCombinations + 1);

factorialValues[0] = 1;
inverseFactorialValues[0] = 1;

for (let i = 1; i <= maxNForCombinations; i++) {
    factorialValues[i] = multiplyModulo(factorialValues[i - 1], i);
}

inverseFactorialValues[maxNForCombinations] = inverseModulo(factorialValues[maxNForCombinations]);

for (let i = maxNForCombinations - 1; i >= 1; i--) {
    inverseFactorialValues[i] = multiplyModulo(inverseFactorialValues[i + 1], i + 1);
}

const calculateCombinations = (nParam, kParam) => {
    if (kParam < 0 || kParam > nParam) {
        return 0;
    }
    const termK = inverseFactorialValues[kParam];
    const termNK = inverseFactorialValues[nParam - kParam];
    const productDenominators = multiplyModulo(termK, termNK);
    return multiplyModulo(factorialValues[nParam], productDenominators);
};

const finalResults = Array.from({ length: valK }, (_, index) => {
    const currentI = index + 1;
    const term1 = calculateCombinations(DERIVED_L, currentI);
    const term2 = calculateCombinations(valK - 1, currentI - 1);
    return multiplyModulo(term1, term2);
});

console.log(finalResults.join('\n'));
