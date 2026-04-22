(function computationEngine() {
    const inputHandler = require('fs');
    const rawData = inputHandler.readFileSync(process.stdin.fd, 'utf8');
    const dataRows = rawData.trim().split('\n');

    let [itemCount, partitionCount] = dataRows.shift().split(' ').map(Number);
    const itemLoads = dataRows.map(Number);

    let entireLoadSum = itemLoads.reduce((accumulator, current) => accumulator + current, 0);

    if (partitionCount === 1) {
        console.log(entireLoadSum);
        return;
    }

    const partitionSums = new Map();
    const partitionContents = new Map();
    for (let i = 0; i < partitionCount; i++) {
        partitionSums.set(i, 0);
        partitionContents.set(i, []);
    }

    let currentPartitionIndex = 0;
    let maximumAchievedPartitionSum = 0;
    let remainingLoadTotal = entireLoadSum;

    // This variable mirrors the complex behavior of `avg` in the original.
    // For the first item's comparison, it is `entireLoadSum / partitionCount`.
    // For subsequent items, it is `remainingLoadTotal / (partitionCount - currentPartitionIndex - 1)`
    // as calculated at the *end* of the previous iteration.
    let dynamicSplitThreshold = entireLoadSum / partitionCount;

    let processingIndex = 0;
    while (processingIndex < itemLoads.length) {
        const currentItemWeight = itemLoads[processingIndex];

        const currentPartitionLoad = partitionSums.get(currentPartitionIndex);
        const nextItemThreshold = currentPartitionLoad + currentItemWeight / 2;

        // The original condition was `avg - (2 * t[cnt] + e) / 2 > 0`
        // which simplifies to `avg > t[cnt] + e/2`.
        // So, if `avg <= t[cnt] + e/2`, a new partition is started.
        if (dynamicSplitThreshold <= nextItemThreshold) {
            maximumAchievedPartitionSum = Math.max(maximumAchievedPartitionSum, currentPartitionLoad);
            currentPartitionIndex++;
        }

        // The `dynamicSplitThreshold` is always re-calculated based on `remainingLoadTotal`
        // and `currentPartitionIndex` *before* `currentItemWeight` is subtracted from `remainingLoadTotal`.
        // This mirrors the original's timing where `sum` is used before `sum -= e`.
        const divisor = partitionCount - currentPartitionIndex - 1;
        dynamicSplitThreshold = (divisor === 0) ? (remainingLoadTotal > 0 ? Infinity : NaN) : remainingLoadTotal / divisor;

        remainingLoadTotal -= currentItemWeight;
        partitionSums.set(currentPartitionIndex, (partitionSums.get(currentPartitionIndex) || 0) + currentItemWeight);
        (partitionContents.get(currentPartitionIndex) || []).push(currentItemWeight);

        processingIndex++;
    }

    // Final update for the last partition that was being filled
    maximumAchievedPartitionSum = Math.max(maximumAchievedPartitionSum, partitionSums.get(currentPartitionIndex));

    console.log(maximumAchievedPartitionSum);
})();