function findFirstGreaterOrEqual(arr, startIdx, endIdx, targetVal) {
    let low = startIdx;
    let high = endIdx;
    while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        if (arr[mid] < targetVal) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
}

function calculatePartitionDifference(sumPart1, sumPart2, sumPart3, sumPart4) {
    const partitionSums = [sumPart1, sumPart2, sumPart3, sumPart4];
    partitionSums.sort((a, b) => a - b);
    return partitionSums[3] - partitionSums[0];
}

function solveProblem(inputString) {
    const lines = inputString.split("\n");
    const arrayLengthMinusOne = parseInt(lines[0], 10) - 1;
    const dataValues = lines[1].split(" ").map(val => parseInt(val, 10));

    const prefixSums = new Array(arrayLengthMinusOne + 1);
    let currentRunningSum = 0;
    for (let k = 0; k <= arrayLengthMinusOne; k++) {
        currentRunningSum += dataValues[k];
        prefixSums[k] = currentRunningSum;
    }
    const totalSum = prefixSums[arrayLengthMinusOne];

    let minDifference = 9e15;

    for (let splitPoint2Index = 1; splitPoint2Index < arrayLengthMinusOne - 1; splitPoint2Index++) {
        const currentPrefixSumAtP2 = prefixSums[splitPoint2Index];

        const targetSumForFirstTwoParts = (currentPrefixSumAtP2 + 1) >>> 1;
        const targetSumForFirstThreeParts = (totalSum + currentPrefixSumAtP2 + 1) >>> 1;

        let splitPoint1Index = findFirstGreaterOrEqual(prefixSums, 0, splitPoint2Index - 1, targetSumForFirstTwoParts);
        let splitPoint3Index = findFirstGreaterOrEqual(prefixSums, splitPoint2Index + 1, arrayLengthMinusOne - 1, targetSumForFirstThreeParts);

        const sumPart1_base = prefixSums[splitPoint1Index];
        const sumPart2_base = currentPrefixSumAtP2 - sumPart1_base;
        const sumPart3_base = prefixSums[splitPoint3Index] - currentPrefixSumAtP2;
        const sumPart4_base = totalSum - prefixSums[splitPoint3Index];

        minDifference = Math.min(minDifference, calculatePartitionDifference(sumPart1_base, sumPart2_base, sumPart3_base, sumPart4_base));

        if (splitPoint1Index > 0) {
            const alternativeSplitPoint1Index = splitPoint1Index - 1;
            const altSumPart1 = prefixSums[alternativeSplitPoint1Index];
            const altSumPart2 = currentPrefixSumAtP2 - altSumPart1;
            minDifference = Math.min(minDifference, calculatePartitionDifference(altSumPart1, altSumPart2, sumPart3_base, sumPart4_base));

            if (splitPoint3Index - splitPoint2Index > 1) {
                const alternativeSplitPoint3Index = splitPoint3Index - 1;
                const altSumPart3 = prefixSums[alternativeSplitPoint3Index] - currentPrefixSumAtP2;
                const altSumPart4 = totalSum - prefixSums[alternativeSplitPoint3Index];
                minDifference = Math.min(minDifference, calculatePartitionDifference(altSumPart1, altSumPart2, altSumPart3, altSumPart4));
            }
        }

        if (splitPoint3Index - splitPoint2Index > 1) {
            const alternativeSplitPoint3Index = splitPoint3Index - 1;
            const altSumPart3 = prefixSums[alternativeSplitPoint3Index] - currentPrefixSumAtP2;
            const altSumPart4 = totalSum - prefixSums[alternativeSplitPoint3Index];
            minDifference = Math.min(minDifference, calculatePartitionDifference(sumPart1_base, sumPart2_base, altSumPart3, altSumPart4));
        }
    }

    console.log(minDifference);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
