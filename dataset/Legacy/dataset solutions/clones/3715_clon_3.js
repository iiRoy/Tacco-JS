function ProcessInput(rawInputData) {
    let lines = rawInputData.split("\n");
    let totalElements = +lines[0];
    let inputNumbers = lines[1].split(" ").map(val => +val);

    // Type III change: Refactor prefix sum calculation from a dense reduce to an explicit loop
    let cumulativeSums = new Array(totalElements);
    let runningTotal = 0;
    for (let k = 0; k < totalElements; k++) {
        runningTotal += inputNumbers[k];
        cumulativeSums[k] = runningTotal;
    }
    // At this point, cumulativeSums[idx] holds the sum of inputNumbers[0]...inputNumbers[idx].
    // cumulativeSums[totalElements - 1] holds the total sum of all elements.

    let minimumRangeDiff = 9e9; // Initialize with a very large number

    // Type III change: Introduce a small helper function to encapsulate the difference calculation and update
    const calculateAndUpdateMinDiff = (currentMin, partitionValues) => {
        const maxVal = Math.max(...partitionValues);
        const minVal = Math.min(...partitionValues);
        return Math.min(currentMin, maxVal - minVal);
    };

    // The main loop iterates through possible second split points (index 'i' in original)
    // The loop range is from 2 up to totalElements - 2 (exclusive of totalElements - 1)
    for (let currentSplitIndex = 2; currentSplitIndex < totalElements - 1; currentSplitIndex++) {
        // Calculate target sums for the first and third partitions for binary search
        // targetLeftSum is half of the sum up to currentSplitIndex - 1
        const targetLeftSum = cumulativeSums[currentSplitIndex - 1] >> 1;
        // targetRightSum is half of (total sum + sum up to currentSplitIndex - 1)
        const targetRightSum = (cumulativeSums[totalElements - 1] + cumulativeSums[currentSplitIndex - 1]) >> 1;

        // Find the optimal first and third split points using binary search
        // Search range for leftSplitPoint: [1, currentSplitIndex - 1)
        let leftSplitPoint = findLowerBoundIndex(cumulativeSums, 1, currentSplitIndex - 1, targetLeftSum);
        // Search range for rightSplitPoint: [currentSplitIndex + 1, totalElements - 1)
        let rightSplitPoint = findLowerBoundIndex(cumulativeSums, currentSplitIndex + 1, totalElements - 1, targetRightSum);

        // Calculate the four partition sums based on the initial found split points (using index-1 for sums)
        let p1_val = cumulativeSums[leftSplitPoint - 1];
        let p2_val = cumulativeSums[currentSplitIndex - 1] - p1_val;
        let p3_val = cumulativeSums[rightSplitPoint - 1] - cumulativeSums[currentSplitIndex - 1];
        let p4_val = cumulativeSums[totalElements - 1] - cumulativeSums[rightSplitPoint - 1];
        let currentPartitions = [p1_val, p2_val, p3_val, p4_val];

        // Update the minimum difference with this combination
        minimumRangeDiff = calculateAndUpdateMinDiff(minimumRangeDiff, currentPartitions);

        // Type III change: Introduce boolean flags for clearer conditional logic
        const canAdjustLeftSplitPoint = (currentSplitIndex - leftSplitPoint > 1);
        const canAdjustRightSplitPoint = (totalElements - rightSplitPoint > 1);

        // Check alternative split points by adjusting the left split point (l+1 in original)
        if (canAdjustLeftSplitPoint) {
            // Recalculate partition sums using leftSplitPoint (instead of leftSplitPoint - 1)
            p1_val = cumulativeSums[leftSplitPoint];
            p2_val = cumulativeSums[currentSplitIndex - 1] - p1_val;
            // p3_val and p4_val remain based on rightSplitPoint - 1
            currentPartitions = [p1_val, p2_val, p3_val, p4_val];
            minimumRangeDiff = calculateAndUpdateMinDiff(minimumRangeDiff, currentPartitions);

            // If both left and right split points can be adjusted
            if (canAdjustRightSplitPoint) {
                // Recalculate p3_val and p4_val using rightSplitPoint (instead of rightSplitPoint - 1)
                p3_val = cumulativeSums[rightSplitPoint] - cumulativeSums[currentSplitIndex - 1];
                p4_val = cumulativeSums[totalElements - 1] - cumulativeSums[rightSplitPoint];
                currentPartitions = [p1_val, p2_val, p3_val, p4_val];
                minimumRangeDiff = calculateAndUpdateMinDiff(minimumRangeDiff, currentPartitions);
            }
        }

        // Check alternative split points by adjusting only the right split point (r+1 in original)
        // This block ensures we cover the case where only the right split point is adjusted,
        // using the original (leftSplitPoint - 1) for the first partition.
        if (canAdjustRightSplitPoint) {
            // Revert p1_val and p2_val to use leftSplitPoint - 1
            p1_val = cumulativeSums[leftSplitPoint - 1];
            p2_val = cumulativeSums[currentSplitIndex - 1] - p1_val;
            // Adjust p3_val and p4_val to use rightSplitPoint
            p3_val = cumulativeSums[rightSplitPoint] - cumulativeSums[currentSplitIndex - 1];
            p4_val = cumulativeSums[totalElements - 1] - cumulativeSums[rightSplitPoint];
            currentPartitions = [p1_val, p2_val, p3_val, p4_val];
            minimumRangeDiff = calculateAndUpdateMinDiff(minimumRangeDiff, currentPartitions);
        }
    }

    console.log(minimumRangeDiff);
}

// Type III change: Renamed parameters for clarity and used Math.floor for explicit integer division
function findLowerBoundIndex(searchArray, searchStart, searchEnd, searchValue) {
    let lowIndex = searchStart;
    let highIndex = searchEnd;
    let midPointIndex;

    // Standard binary search to find the first element >= searchValue
    while (1 < highIndex - lowIndex) {
        midPointIndex = Math.floor((lowIndex + highIndex) / 2); // Type III: Use Math.floor
        if (searchArray[midPointIndex] < searchValue) {
            lowIndex = midPointIndex;
        } else {
            highIndex = midPointIndex;
        }
    }
    // After the loop, lowIndex and highIndex are adjacent.
    // Determine which one is the lower bound.
    return searchArray[lowIndex] < searchValue ? highIndex : lowIndex;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
