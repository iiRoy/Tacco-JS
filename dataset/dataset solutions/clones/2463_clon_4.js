const acquireNumericalValue = () => {
    const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
    return parseInt(dataStream.trim().split(/\s+/)[0], 10);
};

const primeModulo = 998244353n;

const multiplyModular = (firstValue, secondValue) => (firstValue * secondValue) % primeModulo;

const exponentiateModularRecursive = (baseVal, expVal) => {
    let base = BigInt(baseVal);
    let exponent = BigInt(expVal);

    if (exponent === 0n) return 1n;
    if (exponent === 1n) return base % primeModulo;

    let halfPower = exponentiateModularRecursive(base, exponent / 2n);
    let result = multiplyModular(halfPower, halfPower);

    if (exponent % 2n === 1n) {
        result = multiplyModular(result, base);
    }
    return result;
};

const multiplicativeInverse = (value) => {
    return exponentiateModularRecursive(BigInt(value), primeModulo - 2n);
};

const maximumN = 200005;
const factorialTable = new Array(maximumN);
const inverseFactorialTable = new Array(maximumN);

const initializeCombinatoricsTables = () => {
    factorialTable[0] = 1n;
    inverseFactorialTable[0] = 1n;
    for (let index = 1; index < maximumN; index++) {
        factorialTable[index] = multiplyModular(factorialTable[index - 1], BigInt(index));
        inverseFactorialTable[index] = multiplicativeInverse(factorialTable[index]);
    }
};

initializeCombinatoricsTables();

const obtainCombinations = (totalItems, chosenItems) => {
    if (chosenItems < 0 || chosenItems > totalItems) return 0n;
    return multiplyModular(factorialTable[Number(totalItems)], multiplyModular(inverseFactorialTable[Number(chosenItems)], inverseFactorialTable[Number(totalItems - chosenItems)]));
};

const executeCalculation = () => {
    const inputQuantity = acquireNumericalValue();
    const N_bigint = BigInt(inputQuantity);

    let finalAnswer = exponentiateModularRecursive(3n, N_bigint);

    const loopUpperLimit = Math.floor(inputQuantity / 2);

    for (let currentIteration = 0; currentIteration < loopUpperLimit; currentIteration++) {
        const currentTerm = multiplyModular(
            2n,
            multiplyModular(
                exponentiateModularRecursive(2n, currentIteration),
                obtainCombinations(N_bigint, BigInt(currentIteration))
            )
        );
        finalAnswer = (finalAnswer - currentTerm + primeModulo) % primeModulo;
    }

    return Number(finalAnswer);
};

console.log(executeCalculation());