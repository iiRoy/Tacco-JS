const processInputData = (rawInputContent) => {
    const dataLines = rawInputContent.split('\n');
    const totalElementQuantity = Number(dataLines[0]);
    const originalValues = dataLines[1].split(' ').map(Number);

    const accumulatedSums = originalValues.reduce((accumulator, currentValue, index) => {
        const previousTotal = index === 0 ? 0 : accumulator[index - 1];
        accumulator.push(previousTotal + currentValue);
        return accumulator;
    }, []);

    const extractSubarraySum = (beginIndex, finishIndex, sumCollection) => {
        if (beginIndex > finishIndex) return 0;
        if (beginIndex < 0 || finishIndex >= sumCollection.length) {
            if (beginIndex === 0) return sumCollection[finishIndex];
            return 0;
        }
        const sumBeforeBegin = beginIndex > 0 ? sumCollection[beginIndex - 1] : 0;
        return sumCollection[finishIndex] - sumBeforeBegin;
    };

    const findOptimalInsertionPoint = (dataArr, lowerBound, upperExclBound, targetValue) => {
        let currentLower = lowerBound;
        let currentUpper = upperExclBound; // This upper bound is exclusive

        while (currentLower < currentUpper) {
            const middlePoint = Math.floor((currentLower + currentUpper) / 2);
            if (dataArr[middlePoint] < targetValue) {
                currentLower = middlePoint + 1;
            } else {
                currentUpper = middlePoint;
            }
        }
        return currentLower;
    };

    let overallMinimumDifference = Infinity;

    const evaluateSegmentation = (endPosA, endPosB, endPosC) => {
        // Validate segment boundaries to ensure all four segments are non-empty
        if (endPosA < 0 || endPosA >= endPosB || endPosB >= endPosC || endPosC >= totalElementQuantity - 1) {
            return;
        }

        const valueSegmentA = extractSubarraySum(0, endPosA, accumulatedSums);
        const valueSegmentB = extractSubarraySum(endPosA + 1, endPosB, accumulatedSums);
        const valueSegmentC = extractSubarraySum(endPosB + 1, endPosC, accumulatedSums);
        const valueSegmentD = extractSubarraySum(endPosC + 1, totalElementQuantity - 1, accumulatedSums);

        if (valueSegmentA === 0 || valueSegmentB === 0 || valueSegmentC === 0 || valueSegmentD === 0) {
            return;
        }

        const currentSegmentValues = [valueSegmentA, valueSegmentB, valueSegmentC, valueSegmentD];
        const currentMaximum = Math.max(...currentSegmentValues);
        const currentMinimum = Math.min(...currentSegmentValues);

        overallMinimumDifference = Math.min(overallMinimumDifference, currentMaximum - currentMinimum);
    };

    let middleSplitEndIndex = 1;
    while (middleSplitEndIndex <= totalElementQuantity - 3) {
        const sumOfLeadingSegments = accumulatedSums[middleSplitEndIndex];
        const grandTotalSum = accumulatedSums[totalElementQuantity - 1];

        const desiredSumFirstSegment = sumOfLeadingSegments >> 1;
        const desiredSumFirstThreeSegments = (grandTotalSum + sumOfLeadingSegments) >> 1;

        const firstBoundaryCandidate = findOptimalInsertionPoint(
            accumulatedSums,
            1, // Search from index 1 (corresponds to original `a`)
            middleSplitEndIndex, // Exclusive upper bound, search up to middleSplitEndIndex - 1
            desiredSumFirstSegment
        );

        const thirdBoundaryCandidate = findOptimalInsertionPoint(
            accumulatedSums,
            middleSplitEndIndex + 1, // Search from index (middleSplitEndIndex + 1)
            totalElementQuantity - 1, // Exclusive upper bound, search up to totalElementQuantity - 2
            desiredSumFirstThreeSegments
        );

        // Evaluate four primary configurations based on the binary search results
        // Configuration 1: (firstBoundaryCandidate - 1, middleSplitEndIndex, thirdBoundaryCandidate - 1)
        evaluateSegmentation(
            firstBoundaryCandidate - 1,
            middleSplitEndIndex,
            thirdBoundaryCandidate - 1
        );

        // Configuration 2: (firstBoundaryCandidate, middleSplitEndIndex, thirdBoundaryCandidate - 1)
        // Only if extending segment A is valid (i.e., segment B would not become empty)
        if (firstBoundaryCandidate < middleSplitEndIndex) {
            evaluateSegmentation(
                firstBoundaryCandidate,
                middleSplitEndIndex,
                thirdBoundaryCandidate - 1
            );
        }

        // Configuration 3: (firstBoundaryCandidate - 1, middleSplitEndIndex, thirdBoundaryCandidate)
        // Only if extending segment C is valid (i.e., segment D would not become empty)
        if (thirdBoundaryCandidate < totalElementQuantity - 1) {
            evaluateSegmentation(
                firstBoundaryCandidate - 1,
                middleSplitEndIndex,
                thirdBoundaryCandidate
            );
        }

        // Configuration 4: (firstBoundaryCandidate, middleSplitEndIndex, thirdBoundaryCandidate)
        // Only if both extensions are valid
        if (firstBoundaryCandidate < middleSplitEndIndex && thirdBoundaryCandidate < totalElementQuantity - 1) {
            evaluateSegmentation(
                firstBoundaryCandidate,
                middleSplitEndIndex,
                thirdBoundaryCandidate
            );
        }

        middleSplitEndIndex++;
    }

    return overallMinimumDifference;
};

const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processInputData(fileContents));