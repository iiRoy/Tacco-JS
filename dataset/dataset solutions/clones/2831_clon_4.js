function solveProblem(rawData) {
    const dataLines = rawData.split("\n");

    const dimensionsData = dataLines[0].split(" ").map(Number);
    const firstLength = dimensionsData[0];
    const secondLength = dimensionsData[1];

    const firstSequence = dataLines[1].split(" ").map(Number);
    const secondSequence = dataLines[2].split(" ").map(Number);

    const primeModulo = 1000000007;

    const memoizationGrid = Array(firstLength + 1).fill(null).map(() => Array(secondLength + 1).fill(undefined));

    function calculateSubsequenceCount(idxA, idxB) {
        if (idxA === 0 || idxB === 0) {
            return 0;
        }

        if (memoizationGrid[idxA][idxB] !== undefined) {
            return memoizationGrid[idxA][idxB];
        }

        let currentCount;
        if (firstSequence[idxA - 1] === secondSequence[idxB - 1]) {
            currentCount = (calculateSubsequenceCount(idxA - 1, idxB) +
                            calculateSubsequenceCount(idxA, idxB - 1) +
                            1) % primeModulo;
        } else {
            currentCount = (calculateSubsequenceCount(idxA - 1, idxB) +
                            calculateSubsequenceCount(idxA, idxB - 1) -
                            calculateSubsequenceCount(idxA - 1, idxB - 1) +
                            primeModulo) % primeModulo;
        }

        memoizationGrid[idxA][idxB] = currentCount;
        return currentCount;
    }

    const finalCalculatedCount = calculateSubsequenceCount(firstLength, secondLength);

    const ultimateResult = (finalCalculatedCount + 1) % primeModulo;

    console.log('%s', ultimateResult);
    return ultimateResult;
}

const executionInput = require("node:fs").readFileSync("/dev/stdin", "utf8");
solveProblem(executionInput);