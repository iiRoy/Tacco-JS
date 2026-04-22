const findValueBoundary = (sourceArray, startPosition, endPosition, soughtValue) => {
  let lowPointer = startPosition;
  let highPointer = endPosition; // Exclusive upper bound for search
  while (lowPointer < highPointer) {
    const midPoint = Math.floor((lowPointer + highPointer) / 2);
    if (sourceArray[midPoint] < soughtValue) {
      lowPointer = midPoint + 1;
    } else {
      highPointer = midPoint;
    }
  }
  return lowPointer;
};

const appExecutor = (inputPayload) => {
    const dataSegments = inputPayload.trim().split('\n');
    const elementCount = parseInt(dataSegments[0], 10);
    const numericSeries = dataSegments[1].split(' ').map(Number);

    const partialSums = Array(elementCount);
    let currentTotal = 0;
    for (let currentIdx = 0; currentIdx < elementCount; ++currentIdx) {
        currentTotal += numericSeries[currentIdx];
        partialSums[currentIdx] = currentTotal;
    }

    let leastDifference = Number.MAX_VALUE;

    // The second division point (0-indexed start of the third segment)
    // Let the four segments be S1, S2, S3, S4.
    // S1 = numericSeries[0 ... p1-1]
    // S2 = numericSeries[p1 ... k-1]
    // S3 = numericSeries[k ... p3-1]
    // S4 = numericSeries[p3 ... elementCount-1]
    // Each segment must have at least one element.
    // This implies:
    // p1 >= 1 (S1 has at least 1 element) => p1_end_index >= 0
    // k >= p1 + 1 (S2 has at least 1 element) => p2_end_index (which is k-1) >= p1_end_index + 1
    // p3 >= k + 1 (S3 has at least 1 element) => p3_end_index >= k
    // elementCount-1 >= p3 + 1 (S4 has at least 1 element) => elementCount-1 >= p3_end_index + 1
    //
    // So, k (start of S3) must be at least 2 (S1, S2 exist).
    // And k must be at most elementCount - 2 (S3, S4 exist).
    for (let k = 2; k <= elementCount - 2; ++k) {
        const sumOfFirstTwoSegments = partialSums[k - 1]; // Sum of S1 and S2
        const totalOverallSum = partialSums[elementCount - 1]; // Sum of all segments

        // Target sum for S1 to balance S1 and S2
        const optimalTargetForFirstCut = sumOfFirstTwoSegments / 2;
        // Target sum for (S1+S2+S3) to balance (S1+S2+S3) and S4
        const optimalTargetForThirdCut = (totalOverallSum + sumOfFirstTwoSegments) / 2;

        // Find candidate end index for the first segment (p1_end_index)
        // Search range for p1_end_index: [0, k-2] (inclusive)
        const p1CeilingIndex = findValueBoundary(partialSums, 0, k - 1, optimalTargetForFirstCut);

        // Find candidate end index for the third segment (p3_end_index)
        // Search range for p3_end_index: [k, elementCount-2] (inclusive)
        const p3CeilingIndex = findValueBoundary(partialSums, k, elementCount - 1, optimalTargetForThirdCut);

        const firstCutOptions = new Set();
        // Check p1CeilingIndex
        if (p1CeilingIndex >= 0 && p1CeilingIndex <= k - 2) {
            firstCutOptions.add(p1CeilingIndex);
        }
        // Check p1CeilingIndex - 1
        if (p1CeilingIndex - 1 >= 0 && p1CeilingIndex - 1 <= k - 2) {
            firstCutOptions.add(p1CeilingIndex - 1);
        }

        const thirdCutOptions = new Set();
        // Check p3CeilingIndex
        if (p3CeilingIndex >= k && p3CeilingIndex <= elementCount - 2) {
            thirdCutOptions.add(p3CeilingIndex);
        }
        // Check p3CeilingIndex - 1
        if (p3CeilingIndex - 1 >= k && p3CeilingIndex - 1 <= elementCount - 2) {
            thirdCutOptions.add(p3CeilingIndex - 1);
        }

        firstCutOptions.forEach(p1ActualEnd => {
            thirdCutOptions.forEach(p3ActualEnd => {
                const segmentOneValue = partialSums[p1ActualEnd];
                const segmentTwoValue = partialSums[k - 1] - partialSums[p1ActualEnd];
                const segmentThreeValue = partialSums[p3ActualEnd] - partialSums[k - 1];
                const segmentFourValue = totalOverallSum - partialSums[p3ActualEnd];

                const currentSegmentValues = [segmentOneValue, segmentTwoValue, segmentThreeValue, segmentFourValue];
                const maximumValue = Math.max(...currentSegmentValues);
                const minimumValue = Math.min(...currentSegmentValues);
                leastDifference = Math.min(leastDifference, maximumValue - minimumValue);
            });
        });
    }
    console.log(leastDifference);
};

appExecutor(require("fs").readFileSync("/dev/stdin","utf8"));