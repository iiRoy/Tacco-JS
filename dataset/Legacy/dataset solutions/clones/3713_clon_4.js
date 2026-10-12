const calculateSegmentDifference = (firstCutIndex, middleCutIndex, thirdCutIndex, allPrefixSums, finalArrayElementIndex) => {
    const segmentOneSum = allPrefixSums[firstCutIndex];
    const segmentTwoSum = allPrefixSums[middleCutIndex] - allPrefixSums[firstCutIndex];
    const segmentThreeSum = allPrefixSums[thirdCutIndex] - allPrefixSums[middleCutIndex];
    const segmentFourSum = allPrefixSums[finalArrayElementIndex] - allPrefixSums[thirdCutIndex];
    
    const currentSegmentSums = [segmentOneSum, segmentTwoSum, segmentThreeSum, segmentFourSum].sort((valA, valB) => valA - valB);
    return currentSegmentSums[3] - currentSegmentSums[0];
};

function findFirstGreaterOrEqual(dataArray, searchRangeStart, searchRangeEndExclusive, targetValue) {
    let lowBoundary = searchRangeStart;
    let highBoundary = searchRangeEndExclusive;
    while (lowBoundary < highBoundary) {
        const midPoint = Math.floor((lowBoundary + highBoundary) / 2);
        if (dataArray[midPoint] < targetValue) {
            lowBoundary = midPoint + 1;
        } else {
            highBoundary = midPoint;
        }
    }
    return lowBoundary;
}

function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    const elementCount = Number(inputLines[0]);
    const finalArrayElementIndex = elementCount - 1;

    const numericSequence = inputLines[1].split(' ').map(Number);

    const prefixSums = numericSequence.reduce((accumulator, currentElement, currentIndex) => {
        const previousCumulativeSum = currentIndex === 0 ? 0 : accumulator[currentIndex - 1];
        accumulator.push(previousCumulativeSum + currentElement);
        return accumulator;
    }, []);

    let optimalRangeDiff = Number.MAX_SAFE_INTEGER;

    Array.from({ length: finalArrayElementIndex - 1 }).forEach((_, k) => {
        const midpointIndex = k + 1; // Corresponds to 'i' in original, ranges from 1 to finalArrayElementIndex - 1

        if (midpointIndex >= finalArrayElementIndex - 1) return; // Adjust loop to match original 'i < n - 1'

        const totalSum = prefixSums[finalArrayElementIndex];
        const sumUpToMidpoint = prefixSums[midpointIndex];

        const targetSumForLeftHalf = sumUpToMidpoint / 2;
        const targetSumForRightHalf = (totalSum + sumUpToMidpoint) / 2;

        const initialLeftSplitCandidate = findFirstGreaterOrEqual(prefixSums, 0, midpointIndex, targetSumForLeftHalf);
        
        const potentialLeftSplitIndices = new Set();
        if (initialLeftSplitCandidate >= 0 && initialLeftSplitCandidate < midpointIndex) {
            potentialLeftSplitIndices.add(initialLeftSplitCandidate);
        }
        if (initialLeftSplitCandidate > 0 && (initialLeftSplitCandidate - 1) < midpointIndex) {
            potentialLeftSplitIndices.add(initialLeftSplitCandidate - 1);
        }

        const initialRightSplitCandidate = findFirstGreaterOrEqual(prefixSums, midpointIndex + 1, finalArrayElementIndex, targetSumForRightHalf);

        const potentialRightSplitIndices = new Set();
        if (initialRightSplitCandidate > midpointIndex && initialRightSplitCandidate < finalArrayElementIndex) {
            potentialRightSplitIndices.add(initialRightSplitCandidate);
        }
        if (initialRightSplitCandidate > midpointIndex + 1 && (initialRightSplitCandidate - 1) < finalArrayElementIndex) {
            potentialRightSplitIndices.add(initialRightSplitCandidate - 1);
        }
        
        for (const currentLeftSplit of potentialLeftSplitIndices) {
            for (const currentRightSplit of potentialRightSplitIndices) {
                optimalRangeDiff = Math.min(
                    optimalRangeDiff,
                    calculateSegmentDifference(currentLeftSplit, midpointIndex, currentRightSplit, prefixSums, finalArrayElementIndex)
                );
            }
        }
    });

    console.log(optimalRangeDiff);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
