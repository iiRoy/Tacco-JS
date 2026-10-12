"use strict";

const processInputData = (rawData) => {
    const lines = rawData.trim().split("\n");
    const [totalBillCount, targetAmount] = lines[0].split(" ").map(Number);
    return { totalBillCount, targetAmount };
};

const determineBillDenominations = (totalBillCount, targetAmount) => {
    // We are seeking counts for 10000, 5000, and 1000 yen bills.
    // Let these be c10k, c5k, c1k respectively.
    // Conditions:
    // 1. c10k + c5k + c1k = totalBillCount
    // 2. 10000 * c10k + 5000 * c5k + 1000 * c1k = targetAmount
    // 3. c10k, c5k, c1k >= 0

    // From (1), we can express c1k = totalBillCount - c10k - c5k.
    // Substitute c1k into (2):
    // 10000 * c10k + 5000 * c5k + 1000 * (totalBillCount - c10k - c5k) = targetAmount
    // 10000 * c10k + 5000 * c5k + 1000 * totalBillCount - 1000 * c10k - 1000 * c5k = targetAmount
    // 9000 * c10k + 4000 * c5k + 1000 * totalBillCount = targetAmount
    // 9000 * c10k + 4000 * c5k = targetAmount - 1000 * totalBillCount

    const remainingValueForHigherDenominations = targetAmount - 1000 * totalBillCount;

    let solutionTuple = [-1, -1, -1];

    // Iterate through possible counts for the 10000 yen bill (c10k)
    for (let current10kCount = 0; current10kCount <= totalBillCount; current10kCount++) {
        const valueAfter10k = remainingValueForHigherDenominations - 9000 * current10kCount;

        // Check if the remaining value is non-negative and perfectly divisible by 4000 (for c5k)
        if (valueAfter10k >= 0 && valueAfter10k % 4000 === 0) {
            const current5kCount = valueAfter10k / 4000;

            // Ensure that the combined count of 10000 and 5000 yen bills does not exceed the total allowed bills
            // This also implicitly ensures c1k >= 0
            if (current10kCount + current5kCount <= totalBillCount) {
                const current1kCount = totalBillCount - current10kCount - current5kCount;

                // A valid combination is found. Since any valid solution is acceptable, return it.
                solutionTuple = [current10kCount, current5kCount, current1kCount];
                return solutionTuple;
            }
        }
    }

    // If the loop completes without finding a solution
    return solutionTuple;
};

const runApplication = (inputString) => {
    const { totalBillCount, targetAmount } = processInputData(inputString);
    const finalCounts = determineBillDenominations(totalBillCount, targetAmount);
    console.log(finalCounts.join(" "));
};

runApplication(require('fs').readFileSync('/dev/stdin', 'utf8'));
