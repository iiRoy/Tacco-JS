const dataAcquisition = require("fs").readFileSync("/dev/stdin", "utf8");

const PRIME_MODULUS = 998244353n;

function calculatePower(baseValue, exponentValue) {
    if (exponentValue === 0n) {
        return 1n;
    }
    if (exponentValue === 1n) {
        return baseValue % PRIME_MODULUS;
    }
    const halfExp = exponentValue / 2n;
    let resHalf = calculatePower(baseValue, halfExp);
    let resSquared = (resHalf * resHalf) % PRIME_MODULUS;

    if (exponentValue % 2n === 1n) {
        resSquared = (resSquared * baseValue) % PRIME_MODULUS;
    }
    return resSquared;
}

function findInverse(numberToInvert) {
    return calculatePower(numberToInvert, PRIME_MODULUS - 2n);
}

const inverseLookup = new Map();

function retrieveOrComputeInverse(value) {
    if (inverseLookup.has(value)) {
        return inverseLookup.get(value);
    }
    const computedInverse = findInverse(value);
    inverseLookup.set(value, computedInverse);
    return computedInverse;
}

function computeCombinations(totalItems, chosenItems) {
    if (chosenItems < 0n || chosenItems > totalItems) {
        return 0n;
    }
    if (chosenItems === 0n || chosenItems === totalItems) {
        return 1n;
    }
    if (chosenItems > totalItems / 2n) {
        chosenItems = totalItems - chosenItems;
    }

    let combinationResult = 1n;
    for (let i = 0n; i < chosenItems; i++) {
        combinationResult = (combinationResult * (totalItems - i)) % PRIME_MODULUS;
        combinationResult = (combinationResult * retrieveOrComputeInverse(i + 1n)) % PRIME_MODULUS;
    }
    return combinationResult;
}

function recursiveSeriesSum(currentIteration, maxIteration, totalN, totalM) {
    if (currentIteration > maxIteration) {
        return 0n;
    }

    const combinationTerm = computeCombinations(totalN - 1n, currentIteration);
    const baseForPower = totalM - 1n;
    const exponentForPower = totalN - currentIteration - 1n;

    let powerTerm;
    if (exponentForPower < 0n) {
        powerTerm = 0n;
    } else {
        powerTerm = calculatePower(baseForPower, exponentForPower);
    }

    let currentSummand = (combinationTerm * totalM) % PRIME_MODULUS;
    currentSummand = (currentSummand * powerTerm) % PRIME_MODULUS;

    const remainingSum = recursiveSeriesSum(currentIteration + 1n, maxIteration, totalN, totalM);

    return (currentSummand + remainingSum) % PRIME_MODULUS;
}

function processInputAndCompute(inputString) {
    const dataLines = inputString.split('\n');
    let [valueN, valueM, valueK] = dataLines[0].split(' ').map(BigInt);

    const overallTotal = recursiveSeriesSum(0n, valueK, valueN, valueM);

    return overallTotal.toString();
}

console.log(processInputAndCompute(dataAcquisition));