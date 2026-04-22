function processInputData(rawData) {
    // Stage 1: Input parsing and initial data setup
    // Clean and split the raw input string into individual lines.
    const dataLines = rawData.trim().split('\n');

    // Parse the total number of elements from the first line.
    const totalElements = parseInt(dataLines[0], 10);

    // Validate the parsed number of elements.
    // For four partitions, we need at least 4 elements.
    if (isNaN(totalElements) || totalElements < 4) {
        console.error("Error: The total number of elements must be an integer and at least 4.");
        return; // Exit if input is invalid
    }

    // Parse the array of numerical values from the second line.
    const numericalValues = dataLines[1].split(' ').map(strVal => parseInt(strVal, 10));

    // Validate the actual length of the numerical array against the specified totalElements.
    if (numericalValues.length !== totalElements) {
        console.error("Error: Mismatch between specified total elements and actual array length.");
        return;
    }

    // Stage 2: Compute prefix sums (cumulative sums)
    // This array will store cumulative sums, where cumulativeSums[k] = numericalValues[0] + ... + numericalValues[k].
    let currentCumulativeSum = 0;
    const cumulativeSums = new Array(totalElements);
    for (let k = 0; k < totalElements; ++k) {
        currentCumulativeSum += numericalValues[k];
        cumulativeSums[k] = currentCumulativeSum;
    }

    // Store the grand total sum for convenience in later calculations.
    const grandTotalSum = cumulativeSums[totalElements - 1];

    // Stage 3: Initialize arrays to store the sums of the four partitions (P, Q, R, S).
    let firstPartitionSums = [];
    let secondPartitionSums = [];
    let thirdPartitionSums = [];
    let fourthPartitionSums = [];

    // Initialize the greedy split points, which will be updated iteratively.
    // `leftSplitPointIdx` is the index for the split between P and Q.
    // `rightSplitPointIdx` is the index for the split between R and S.
    let leftSplitPointIdx = 0;
    let rightSplitPointIdx = 0;

    // Stage 4: Iterate through all possible main split points (between Q and R).
    // `mainSplitIdx` represents the index such that `cumulativeSums[mainSplitIdx]` is the sum of P and Q.
    // The range for `mainSplitIdx` is from 1 (P=A[0], Q=A[1]) to `totalElements - 3` (S needs at least one element).
    for (let mainSplitIdx = 1; mainSplitIdx <= totalElements - 3; ++mainSplitIdx) {

        // --- Determine the optimal split for the left side (P and Q) ---
        // The segment for P and Q spans from index 0 to `mainSplitIdx`.
        const sumOfPQSegment = cumulativeSums[mainSplitIdx];

        // The greedy search for `leftSplitPointIdx` (split between P and Q)
        // `leftSplitPointIdx` can range from 0 to `mainSplitIdx - 1`.
        // We advance `leftSplitPointIdx` as long as moving it right improves or maintains balance.
        while (leftSplitPointIdx < mainSplitIdx - 1) {
            // Calculate current P and Q sums and their difference.
            const pSum_current = cumulativeSums[leftSplitPointIdx];
            const qSum_current = sumOfPQSegment - pSum_current;
            const currentBalanceDiff = Math.abs(pSum_current - qSum_current);

            // Calculate potential next P and Q sums and their difference.
            const pSum_next = cumulativeSums[leftSplitPointIdx + 1];
            const qSum_next = sumOfPQSegment - pSum_next;
            const nextBalanceDiff = Math.abs(pSum_next - qSum_next);

            // If moving the split point right improves or maintains balance, do so.
            if (nextBalanceDiff <= currentBalanceDiff) {
                leftSplitPointIdx++;
            } else {
                break; // Local optimum found for this `mainSplitIdx`.
            }
        }
        firstPartitionSums.push(cumulativeSums[leftSplitPointIdx]);
        secondPartitionSums.push(sumOfPQSegment - cumulativeSums[leftSplitPointIdx]);

        // --- Determine the optimal split for the right side (R and S) ---
        // The segment for R and S spans from `mainSplitIdx + 1` to `totalElements - 1`.
        const sumBeforeRS = cumulativeSums[mainSplitIdx];
        const sumOfRSSegment = grandTotalSum - sumBeforeRS;

        // Initialize or adjust `rightSplitPointIdx` for the current `mainSplitIdx`.
        // `rightSplitPointIdx` is the index for the split between R and S.
        // It must be at least `mainSplitIdx + 1` (R needs at least one element).
        // It must be at most `totalElements - 2` (S needs at least one element).
        if (mainSplitIdx === 1) { // For the very first `mainSplitIdx`
            rightSplitPointIdx = mainSplitIdx + 1;
        } else {
            // Ensure `rightSplitPointIdx` is not less than the start of the R segment.
            rightSplitPointIdx = Math.max(rightSplitPointIdx, mainSplitIdx + 1);
        }
        // Ensure `rightSplitPointIdx` does not go beyond the valid range.
        rightSplitPointIdx = Math.min(rightSplitPointIdx, totalElements - 2);

        // The greedy search for `rightSplitPointIdx` (split between R and S)
        // We advance `rightSplitPointIdx` as long as moving it right improves or maintains balance.
        while (rightSplitPointIdx < totalElements - 2) {
            // Calculate current R and S sums and their difference.
            const rSum_current = cumulativeSums[rightSplitPointIdx] - sumBeforeRS;
            const sSum_current = grandTotalSum - cumulativeSums[rightSplitPointIdx];
            const currentBalanceDiff = Math.abs(rSum_current - sSum_current);

            // Calculate potential next R and S sums and their difference.
            const rSum_next = cumulativeSums[rightSplitPointIdx + 1] - sumBeforeRS;
            const sSum_next = grandTotalSum - cumulativeSums[rightSplitPointIdx + 1];
            const nextBalanceDiff = Math.abs(rSum_next - sSum_next);

            // If moving the split point right improves or maintains balance, do so.
            if (nextBalanceDiff <= currentBalanceDiff) {
                rightSplitPointIdx++;
            } else {
                break; // Local optimum found for this `mainSplitIdx`.
            }
        }
        thirdPartitionSums.push(cumulativeSums[rightSplitPointIdx] - sumBeforeRS);
        fourthPartitionSums.push(grandTotalSum - cumulativeSums[rightSplitPointIdx]);
    }

    // Stage 5: Calculate the minimum difference among all partition combinations.
    let minimumOverallDifference = -1; // Initialize with a value indicating no result yet.

    // A final check: if no partitions were generated (e.g., due to N < 4), handle it.
    if (firstPartitionSums.length === 0) {
        console.error("Internal error: Partition arrays are empty. Check input constraints and logic.");
        return;
    }

    // Iterate through the collected partition sums for each `mainSplitIdx`.
    for (let currentCombinationIndex = 0; currentCombinationIndex < firstPartitionSums.length; ++currentCombinationIndex) {
        // Retrieve the four partition sums for the current configuration.
        const pValue = firstPartitionSums[currentCombinationIndex];
        const qValue = secondPartitionSums[currentCombinationIndex];
        const rValue = thirdPartitionSums[currentCombinationIndex];
        const sValue = fourthPartitionSums[currentCombinationIndex];

        // Find the maximum and minimum values among these four partitions.
        const currentMaxPartition = Math.max(pValue, qValue, rValue, sValue);
        const currentMinPartition = Math.min(pValue, qValue, rValue, sValue);

        // Calculate the difference for the current configuration.
        const calculatedDifference = currentMaxPartition - currentMinPartition;

        // Update the overall minimum difference if the current one is smaller,
        // or if it's the first valid difference found.
        if (minimumOverallDifference < 0 || calculatedDifference < minimumOverallDifference) {
            minimumOverallDifference = calculatedDifference;
        }
    }

    // Stage 6: Output the final result.
    console.log(minimumOverallDifference);
}

// Entry point for execution: reads input from stdin and passes it to the processing function.
// This line typically assumes a Node.js environment for file system access.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));