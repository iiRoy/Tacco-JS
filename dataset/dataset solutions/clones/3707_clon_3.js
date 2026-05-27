function solveProblem(inputString) {
    const inputLines = inputString.split('\n');
    const numElements = Number(inputLines[0]);
    const initialNumbers = inputLines[1].split(' ').map(Number);

    let runningTotal = 0;
    const prefixSums = initialNumbers.map((num) => {
        runningTotal += num;
        return runningTotal;
    });

    const part1Sums = [];
    const part2Sums = [];
    const part3Sums = [];
    const part4Sums = [];

    // Process left partitions (P and Q)
    // `leftSplitPointer` corresponds to `l` in the original code.
    // It's the index in `prefixSums` that marks the split point for the first two segments.
    let leftSplitPointer = 0;
    for (let i = 1; i < numElements - 2; ++i) {
        // The current segment being considered for splitting into P and Q is A[0...i].
        // Its total sum is `prefixSums[i]`.
        // We are looking for a split point `leftSplitPointer` such that
        // P = A[0...leftSplitPointer] (sum = `prefixSums[leftSplitPointer]`)
        // Q = A[leftSplitPointer+1...i] (sum = `prefixSums[i] - prefixSums[leftSplitPointer]`)

        // The original condition `leftArr.length > 2` is equivalent to `i + 1 > 2`, or `i > 1`.
        // The `leftSplitPointer` must be less than `i-1` to allow `leftSplitPointer+1` to be a valid split point
        // (i.e., ensuring Q has at least one element).
        while (leftSplitPointer < i - 1) {
            const currentP_sum = prefixSums[leftSplitPointer];
            const currentQ_sum = prefixSums[i] - prefixSums[leftSplitPointer];

            const nextP_sum = prefixSums[leftSplitPointer + 1];
            const nextQ_sum = prefixSums[i] - prefixSums[leftSplitPointer + 1];

            // If moving the split point one step to the right (`leftSplitPointer + 1`)
            // results in a better or equally balanced split (smaller or equal absolute difference),
            // then we advance the split pointer.
            if (Math.abs(nextQ_sum - nextP_sum) <= Math.abs(currentQ_sum - currentP_sum)) {
                leftSplitPointer++;
            } else {
                // Otherwise, the current `leftSplitPointer` is optimal for this `i`.
                break;
            }
        }
        part1Sums.push(prefixSums[leftSplitPointer]);
        part2Sums.push(prefixSums[i] - prefixSums[leftSplitPointer]);
    }

    // Process right partitions (R and S)
    // `rightSplitRelativeIndex` corresponds to `r` in the original code.
    // It's a relative index into the segment A[i...numElements-1].
    // The absolute index in `prefixSums` for the split point is `i + rightSplitRelativeIndex - 1`.
    let rightSplitRelativeIndex = 1;
    for (let i = numElements - 2; i > 1; --i) {
        // `totalArraySum` is the sum of all elements A[0...numElements-1].
        const totalArraySum = prefixSums[numElements - 1];
        // `sumBeforeRightSegment` is the sum of elements A[0...i-1].
        const sumBeforeRightSegment = prefixSums[i - 1];

        // The current segment being considered for splitting into R and S is A[i...numElements-1].
        // We are looking for a split point `i + rightSplitRelativeIndex - 1` such that
        // R = A[i...i+rightSplitRelativeIndex-1] (sum = `prefixSums[i+rightSplitRelativeIndex-1] - sumBeforeRightSegment`)
        // S = A[i+rightSplitRelativeIndex...numElements-1] (sum = `totalArraySum - prefixSums[i+rightSplitRelativeIndex-1]`)

        // The original condition `rightArr.length > 2` is equivalent to `numElements - i > 2`.
        // The `rightSplitRelativeIndex` must be greater than 1 to allow `rightSplitRelativeIndex - 1` to be a valid split point
        // (i.e., ensuring R has at least one element and the comparison is valid).
        if (numElements - i > 2 && rightSplitRelativeIndex > 1) {
            const currentSplitAbsIndex = i + rightSplitRelativeIndex - 1;
            const prevSplitAbsIndex = i + rightSplitRelativeIndex - 2; // This corresponds to `r-1` in the original's `rightArr`

            const currentR_sum = prefixSums[currentSplitAbsIndex] - sumBeforeRightSegment;
            const currentS_sum = totalArraySum - prefixSums[currentSplitAbsIndex];

            const prevR_sum = prefixSums[prevSplitAbsIndex] - sumBeforeRightSegment;
            const prevS_sum = totalArraySum - prefixSums[prevSplitAbsIndex];

            // If moving the split point one step to the left (`rightSplitRelativeIndex - 1`)
            // results in a better or equally balanced split, we decrement the split pointer.
            if (Math.abs(prevS_sum - prevR_sum) <= Math.abs(currentS_sum - currentR_sum)) {
                rightSplitRelativeIndex--;
            }
        }
        const finalSplitAbsIndex = i + rightSplitRelativeIndex - 1;
        part3Sums.unshift(prefixSums[finalSplitAbsIndex] - sumBeforeRightSegment);
        part4Sums.unshift(totalArraySum - prefixSums[finalSplitAbsIndex]);

        // Increment `rightSplitRelativeIndex` for the next iteration of `i`.
        // This mimics the `++r` in the original loop header, which implements a sliding window optimization.
        rightSplitRelativeIndex++;
    }

    // Helper function to calculate the difference between the maximum and minimum of four values.
    const calculateMinMaxDifference = (val1, val2, val3, val4) => {
        const maxVal = Math.max(val1, val2, val3, val4);
        const minVal = Math.min(val1, val2, val3, val4);
        return maxVal - minVal;
    };

    let overallMinDifference = Infinity; // Initialize with a very large value
    for (let k = 0; k < part1Sums.length; ++k) {
        const currentPartitionDifference = calculateMinMaxDifference(
            part1Sums[k],
            part2Sums[k],
            part3Sums[k],
            part4Sums[k]
        );
        overallMinDifference = Math.min(overallMinDifference, currentPartitionDifference);
    }

    console.log(overallMinDifference);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
