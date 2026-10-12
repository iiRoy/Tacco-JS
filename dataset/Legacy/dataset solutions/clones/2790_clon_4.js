const fs = require("fs");

const MOD_CONSTANT = 1000000007;

const performModularMultiplication = (...factors) => {
    const modulus = MOD_CONSTANT;
    let currentProduct = 1;

    const multiplyTwoNumbers = (valA, valB) => {
        let resAccumulator = 0;
        valA %= modulus;
        while (valB > 0) {
            if (valB % 2 === 1) {
                resAccumulator = (resAccumulator + valA) % modulus;
            }
            valA = (valA * 2) % modulus;
            valB = Math.floor(valB / 2);
        }
        return resAccumulator;
    };

    for (const factor of factors) {
        currentProduct = multiplyTwoNumbers(currentProduct, factor);
    }
    return currentProduct;
};

const calculateModularPower = (baseValue, exponentValue) => {
    let finalResult = 1;
    baseValue %= MOD_CONSTANT;
    while (exponentValue > 0) {
        if (exponentValue % 2 === 1) {
            finalResult = performModularMultiplication(finalResult, baseValue);
        }
        baseValue = performModularMultiplication(baseValue, baseValue);
        exponentValue = Math.floor(exponentValue / 2);
    }
    return finalResult;
};

const findModularInverse = (numberValue) => {
    return calculateModularPower(numberValue, MOD_CONSTANT - 2);
};

let factorialCache = [];
let inverseFactorialCache = [];

const initializeCombinatorialTables = (maximumValue) => {
    factorialCache = new Array(maximumValue + 1);
    inverseFactorialCache = new Array(maximumValue + 1);

    factorialCache[0] = 1;
    for (let k = 1; k <= maximumValue; k++) {
        factorialCache[k] = performModularMultiplication(factorialCache[k - 1], k);
    }

    inverseFactorialCache[maximumValue] = findModularInverse(factorialCache[maximumValue]);
    for (let k = maximumValue - 1; k >= 0; k--) {
        inverseFactorialCache[k] = performModularMultiplication(inverseFactorialCache[k + 1], k + 1);
    }
};

const computeCombinations = (nValue, kValue) => {
    if (kValue < 0 || kValue > nValue) return 0;
    return performModularMultiplication(factorialCache[nValue], inverseFactorialCache[kValue], inverseFactorialCache[nValue - kValue]);
};

function* generateInputTokens(rawInputText) {
    const parsedTokens = rawInputText.trim().split(/\s+/g);
    for (const token of parsedTokens) {
        yield token;
    }
}

const standardInputData = fs.readFileSync("/dev/stdin", "utf8");
const inputTokenIterator = generateInputTokens(standardInputData);

const retrieveNextInteger = () => parseInt(inputTokenIterator.next().value, 10);

const primaryN = retrieveNextInteger();
const primaryK = retrieveNextInteger();

initializeCombinatorialTables(primaryN);

for (let currentIteration = 1; currentIteration <= primaryK; currentIteration++) {
    const firstTerm = computeCombinations(primaryN - primaryK + 1, currentIteration);
    const secondTerm = computeCombinations(primaryK - 1, currentIteration - 1);
    const finalCalculatedResult = performModularMultiplication(firstTerm, secondTerm);
    console.log(finalCalculatedResult);
}

module.exports = () => {};
