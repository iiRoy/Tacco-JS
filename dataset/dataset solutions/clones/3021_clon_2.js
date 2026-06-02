const MOD_VALUE = 998244353;

let elementCount;
let totalSumOfElements;
let numericValues = [];

const memoizationCache = new Map();

function calculateCombinations(currentIndex, currentRedSum, currentGreenSum) {
    if (currentIndex === elementCount) {
        const currentBlueSum = totalSumOfElements - currentRedSum - currentGreenSum;

        if (currentRedSum === 0 || currentGreenSum === 0 || currentBlueSum === 0) {
            return 0;
        }

        if (currentRedSum + currentGreenSum > currentBlueSum &&
            currentGreenSum + currentBlueSum > currentRedSum &&
            currentBlueSum + currentRedSum > currentGreenSum) {
            return 1;
        } else {
            return 0;
        }
    }

    const stateKey = `${currentIndex},${currentRedSum},${currentGreenSum}`;

    if (memoizationCache.has(stateKey)) {
        return memoizationCache.get(stateKey);
    }

    let resultCount = calculateCombinations(currentIndex + 1, currentRedSum + numericValues[currentIndex], currentGreenSum) % MOD_VALUE;

    resultCount = (resultCount + calculateCombinations(currentIndex + 1, currentRedSum, currentGreenSum + numericValues[currentIndex])) % MOD_VALUE;

    resultCount = (resultCount + calculateCombinations(currentIndex + 1, currentRedSum, currentGreenSum)) % MOD_VALUE;

    memoizationCache.set(stateKey, resultCount);

    return resultCount;
}

function processInputAndSolve() {
    // `readLine()` is expected to be a global function provided by the execution environment
    // (e.g., a competitive programming platform) to read a line from standard input.
    // The original C++ code uses `cin`, which implies reading from standard input.

    elementCount = parseInt(readLine());

    numericValues = new Array(elementCount);

    totalSumOfElements = 0;

    for (let loopIndex = 0; loopIndex < elementCount; ++loopIndex) {
        numericValues[loopIndex] = parseInt(readLine());
        totalSumOfElements += numericValues[loopIndex];
    }

    numericValues.sort((valueA, valueB) => valueA - valueB);

    return calculateCombinations(0, 0, 0);
}

function mainExecution() {
    const finalAnswer = processInputAndSolve();

    console.log(finalAnswer);
}

mainExecution();
