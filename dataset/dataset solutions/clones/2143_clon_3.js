const MODULO_VALUE = 1000000007;
const BASE_CASE_ONE = 1;
const EXCLUSION_VALUE = 0;

function computeBinomialCoefficient(total, choose) {
    if (choose === EXCLUSION_VALUE) return BASE_CASE_ONE;
    if (total === EXCLUSION_VALUE) return BASE_CASE_ONE;
    return total * computeBinomialCoefficient(total - BASE_CASE_ONE, choose - BASE_CASE_ONE) / choose;
}

function processInputAndCalculate(inputString) {
    const MOD_VAL = MODULO_VALUE;
    const EXCL_VAL = EXCLUSION_VALUE;

    const inputLineSegments = inputString.split("\n")[0].split(" ");
    const totalElements = Number(inputLineSegments[0]);
    const excludedIdxA = Number(inputLineSegments[1]);
    const excludedIdxB = Number(inputLineSegments[2]);

    const getModCombination = (nVal, kVal) => {
        return computeBinomialCoefficient(nVal, kVal) % MOD_VAL;
    };

    const combinationResults = new Array(totalElements + BASE_CASE_ONE).fill(EXCL_VAL);

    const halfRangeLimit = Math.floor(totalElements / 2);
    for (let currentK = 0; currentK <= halfRangeLimit; currentK++) {
        const calculatedModComb = getModCombination(totalElements, currentK);
        combinationResults[currentK] = calculatedModComb;
        combinationResults[totalElements - currentK] = calculatedModComb;
    }

    if (totalElements % 2 === BASE_CASE_ONE) {
        const midPointIndex = Math.floor(totalElements / 2) + BASE_CASE_ONE;
        combinationResults[midPointIndex] = getModCombination(totalElements, midPointIndex);
    }

    combinationResults[excludedIdxA] = EXCL_VAL;
    combinationResults[excludedIdxB] = EXCL_VAL;

    let cumulativeSum = 0;
    for (let elementIndex = BASE_CASE_ONE; elementIndex <= totalElements; elementIndex++) {
        cumulativeSum = (cumulativeSum + combinationResults[elementIndex]) % MOD_VAL;
    }

    console.log(cumulativeSum);
    return;
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
processInputAndCalculate(fileData);
