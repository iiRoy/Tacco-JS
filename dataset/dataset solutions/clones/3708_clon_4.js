function processData(inputPayload) {
    const dataLines = inputPayload.split('\n');
    const elementCount = parseInt(dataLines[0]);
    const numericArray = dataLines[1].split(' ').map(Number);

    let runningTotal = 0;
    const prefixSumCollection = numericArray.map(value => (runningTotal += value));

    let minimumOverallDifference = Infinity;

    // Pointers for the internal split points.
    // `firstPartitionEndIndex` marks the end of the first segment (P).
    // `thirdPartitionEndIndex` marks the end of the third segment (R).
    let firstPartitionEndIndex = 0;
    let thirdPartitionEndIndex = 2; // Initial guess for the third split point when the middle split (idx2) is at its minimum (1).
                                    // The third partition must start after the middle split, so thirdPartitionEndIndex >= middleSplitIndex + 1.

    // Iterate through all possible positions for the middle split point (`middleSplitIndex`).
    // `middleSplitIndex` is the index of the last element of the second segment (Q).
    // It can range from 1 (P=A[0], Q=A[1]) to `elementCount - 3` (S=A[elementCount-1], R=A[elementCount-2]).
    for (let middleSplitIndex = 1; middleSplitIndex <= elementCount - 3; ++middleSplitIndex) {
        // --- Determine sums for the first two segments (P and Q) ---
        // The segment to split is `A[0...middleSplitIndex]`. Its total sum is `prefixSumCollection[middleSplitIndex]`.
        // `firstPartitionEndIndex` is the end index of P. It can range from `0` to `middleSplitIndex - 1`.
        // This pointer only moves forward.
        while (firstPartitionEndIndex < middleSplitIndex - 1 &&
               Math.abs(prefixSumCollection[middleSplitIndex] - 2 * prefixSumCollection[firstPartitionEndIndex + 1]) <=
               Math.abs(prefixSumCollection[middleSplitIndex] - 2 * prefixSumCollection[firstPartitionEndIndex])) {
            firstPartitionEndIndex++;
        }
        const sumP = prefixSumCollection[firstPartitionEndIndex];
        const sumQ = prefixSumCollection[middleSplitIndex] - sumP;

        // --- Determine sums for the last two segments (R and S) ---
        // The segment to split is `A[middleSplitIndex + 1 ... elementCount - 1]`.
        // Its total sum is `prefixSumCollection[elementCount - 1] - prefixSumCollection[middleSplitIndex]`.
        // `thirdPartitionEndIndex` is the end index of R. It can range from `middleSplitIndex + 1` to `elementCount - 2`.
        // This pointer also only moves forward.
        // Ensure `thirdPartitionEndIndex` is not behind `middleSplitIndex + 1`.
        if (thirdPartitionEndIndex < middleSplitIndex + 1) {
            thirdPartitionEndIndex = middleSplitIndex + 1;
        }
        // Ensure `thirdPartitionEndIndex` does not exceed `elementCount - 2`.
        // The segment `A[middleSplitIndex + 1 ... elementCount - 1]` must be split into two non-empty parts.
        // So `thirdPartitionEndIndex` can be at most `elementCount - 2`.
        while (thirdPartitionEndIndex < elementCount - 2 &&
               Math.abs(2 * (prefixSumCollection[thirdPartitionEndIndex + 1] - prefixSumCollection[middleSplitIndex]) - (prefixSumCollection[elementCount - 1] - prefixSumCollection[middleSplitIndex])) <=
               Math.abs(2 * (prefixSumCollection[thirdPartitionEndIndex] - prefixSumCollection[middleSplitIndex]) - (prefixSumCollection[elementCount - 1] - prefixSumCollection[middleSplitIndex]))) {
            thirdPartitionEndIndex++;
        }
        const sumR = prefixSumCollection[thirdPartitionEndIndex] - prefixSumCollection[middleSplitIndex];
        const sumS = prefixSumCollection[elementCount - 1] - prefixSumCollection[thirdPartitionEndIndex];

        const currentMaximum = Math.max(sumP, sumQ, sumR, sumS);
        const currentMinimum = Math.min(sumP, sumQ, sumR, sumS);
        const currentDifference = currentMaximum - currentMinimum;

        if (minimumOverallDifference === Infinity || currentDifference < minimumOverallDifference) {
            minimumOverallDifference = currentDifference;
        }
    }

    console.log(minimumOverallDifference);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
