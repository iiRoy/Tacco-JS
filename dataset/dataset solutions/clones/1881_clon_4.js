function calcModProduct(operandOne, operandTwo, modulusValue) {
    return (operandOne * operandTwo) % modulusValue;
}
function computeModPower(baseVal, exponentVal, modulusValue) {
    if (exponentVal === 0n) return 1n;
    if (exponentVal === 1n) return baseVal % modulusValue;
    let halfPowerResult = computeModPower(baseVal, exponentVal / 2n, modulusValue);
    let squaredHalf = calcModProduct(halfPowerResult, halfPowerResult, modulusValue);
    if (exponentVal % 2n === 1n) {
        return calcModProduct(squaredHalf, baseVal, modulusValue);
    } else {
        return squaredHalf;
    }
}
function obtainModInverse(numberVal, modulusValue) {
    return computeModPower(numberVal, modulusValue - 2n, modulusValue);
}
function getModCombinations(nLimit, kLimit, modulusValue) {
    const factorials = new Array(Number(nLimit) + 1);
    const inverseFactorials = new Array(Number(nLimit) + 1);
    factorials[0] = 1n;
    inverseFactorials[0] = 1n;
    for (let i = 1; i <= nLimit; i++) {
        factorials[i] = calcModProduct(factorials[i - 1], BigInt(i), modulusValue);
    }
    inverseFactorials[Number(nLimit)] = obtainModInverse(factorials[Number(nLimit)], modulusValue);
    for (let i = Number(nLimit) - 1; i >= 1; i--) {
        inverseFactorials[i] = calcModProduct(inverseFactorials[i + 1], BigInt(i + 1), modulusValue);
    }
    const combinationSeries = [];
    for (let i = 0; i <= kLimit; i++) {
        let termN = factorials[Number(nLimit)];
        let termK = inverseFactorials[Number(i)];
        let termNK = inverseFactorials[Number(nLimit - BigInt(i))];
        let currentCombination = calcModProduct(termN, termK, modulusValue);
        currentCombination = calcModProduct(currentCombination, termNK, modulusValue);
        combinationSeries.push(currentCombination);
    }
    return combinationSeries;
}
function processInputData(rawDataContent) {
    const parsedNumericInputs = rawDataContent.trim().split("\n").map(line => line.split(" ").map(Number));
    const [alpha, beta, gamma] = parsedNumericInputs[0].map(BigInt);
    const PRIME_MODULUS = 998244353n;
    const combinationsRangeN = alpha - 1n;
    const combinationsRangeK = gamma;
    const combinatoricValues = getModCombinations(combinationsRangeN, combinationsRangeK, PRIME_MODULUS);
    const baseForPower = beta - 1n;
    const initialExponentForPower = alpha - gamma - 1n;
    const finalAccumulatedSum = Array.from({ length: Number(combinationsRangeK) + 1 }, (_, idx) => BigInt(idx)).reduce((accumulator, iterationIndex) => {
        const currentCombinationTerm = combinatoricValues[Number(combinationsRangeK - iterationIndex)];
        const currentPowerTerm = computeModPower(baseForPower, initialExponentForPower + iterationIndex, PRIME_MODULUS);
        return (accumulator + calcModProduct(currentCombinationTerm, currentPowerTerm, PRIME_MODULUS)) % PRIME_MODULUS;
    }, 0n);
    let overallResult = calcModProduct(finalAccumulatedSum, beta, PRIME_MODULUS);
    console.log(Number(overallResult));
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));