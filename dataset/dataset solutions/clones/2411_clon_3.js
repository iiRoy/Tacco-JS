function ProcessInput(rawData) {
    const inputLines = rawData.split("\n");
    const elementCount = Number(inputLines[0]);
    const dataArray = inputLines[1].split(" ").map(item => Number(item));

    // Type III change: Replace Array.prototype.reduce with a traditional for loop
    // for calculating prefix sums. This is a structural modification.
    const prefixSums = new Array(elementCount + 1);
    prefixSums[0] = 0; // The sum before the first element is 0.
    for (let idx = 0; idx < elementCount; idx++) {
        prefixSums[idx + 1] = prefixSums[idx] + dataArray[idx];
    }

    // Preserve the exact intermediate console output
    console.log(prefixSums);

    // Type III change: Introduce a helper constant for the total sum
    // and use a different loop variable name for clarity.
    const totalSumOfElements = prefixSums[elementCount];
    const finalAbsoluteDifferences = [];

    // The loop iterates through possible split points.
    // 'splitIndex' represents the number of elements in the first segment.
    // The original loop `i < n - 1` means `i` goes from `0` to `n-2`.
    // This means the first segment can have `0` to `n-2` elements.
    for (let splitIndex = 0; splitIndex < elementCount - 1; splitIndex++) {
        // The sum of the first 'splitIndex' elements is prefixSums[splitIndex].
        // This corresponds to original `cumulativeSum[i]`.
        const sumOfLeftSegment = prefixSums[splitIndex];

        // The sum of the remaining elements is totalSumOfElements - sumOfLeftSegment.
        // This corresponds to original `cumulativeSum[n] - cumulativeSum[i]`.
        const sumOfRightSegment = totalSumOfElements - sumOfLeftSegment;

        finalAbsoluteDifferences.push(Math.abs(sumOfLeftSegment - sumOfRightSegment));
    }

    // Preserve the exact final console output
    console.log(Math.min(...finalAbsoluteDifferences));
}

// The entry point and input reading mechanism remain unchanged to preserve external behavior.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
