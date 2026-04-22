function SolvePartitionProblem(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const totalElementCount = Number(inputLines[0]);
    if (totalElementCount < 4) {
        console.log(0);
        return;
    }

    const dataElements = inputLines[1].split(" ").map(elementStr => Number(elementStr));

    const cumulativeSums = new Array(totalElementCount + 1).fill(0);
    for (let k = 0; k < totalElementCount; k++) {
        cumulativeSums[k + 1] = cumulativeSums[k] + dataElements[k];
    }

    let minDifferenceFound = Number.MAX_SAFE_INTEGER;

    const overallSum = cumulativeSums[totalElementCount];

    for (let middleCutIdx = 2; middleCutIdx < totalElementCount - 1; middleCutIdx++) {
        const targetSumForFirstTwoParts = cumulativeSums[middleCutIdx] / 2;
        const targetSumForFirstThreeParts = (overallSum + cumulativeSums[middleCutIdx]) / 2;

        let leftCutIdx = findSplitPoint(cumulativeSums, 1, middleCutIdx - 1, targetSumForFirstTwoParts);
        let rightCutIdx = findSplitPoint(cumulativeSums, middleCutIdx + 1, totalElementCount - 1, targetSumForFirstThreeParts);

        const evaluateAndMinimize = (lIdx, rIdx) => {
            const part1Sum = cumulativeSums[lIdx];
            const part2Sum = cumulativeSums[middleCutIdx] - cumulativeSums[lIdx];
            const part3Sum = cumulativeSums[rIdx] - cumulativeSums[middleCutIdx];
            const part4Sum = overallSum - cumulativeSums[rIdx];

            const currentPartitionSums = [part1Sum, part2Sum, part3Sum, part4Sum];

            const maxPartSum = Math.max(...currentPartitionSums);
            const minPartSum = Math.min(...currentPartitionSums);

            minDifferenceFound = Math.min(minDifferenceFound, maxPartSum - minPartSum);
        };

        evaluateAndMinimize(leftCutIdx, rightCutIdx);

        if (leftCutIdx + 1 < middleCutIdx) {
            evaluateAndMinimize(leftCutIdx + 1, rightCutIdx);
            if (rightCutIdx + 1 < totalElementCount) {
                evaluateAndMinimize(leftCutIdx + 1, rightCutIdx + 1);
            }
        }

        if (rightCutIdx + 1 < totalElementCount) {
            evaluateAndMinimize(leftCutIdx, rightCutIdx + 1);
        }
    }

    console.log(minDifferenceFound);
}

const findSplitPoint = (searchArray, startIndex, endIndex, targetValue) => {
    let low = startIndex;
    let high = endIndex;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (searchArray[mid] < targetValue) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
};

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
SolvePartitionProblem(inputData);