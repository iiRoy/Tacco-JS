function processInputData(rawData) {
    const lines = rawData.split('\n');
    const arrayLength = parseInt(lines[0]);
    const initialNumbers = lines[1].split(' ').map(numStr => parseInt(numStr));

    const prefixSums = [];
    let cumulativeSum = 0;
    for (let k = 0; k < arrayLength; ++k) {
        cumulativeSum += initialNumbers[k];
        prefixSums.push(cumulativeSum);
    }

    const partOne = [];
    const partTwo = [];
    const partThree = [];
    const partFour = [];

    const calculateOptimalLeftSplitIndex = (pSumsArray, currentSplitCandidateIdx, segmentEndIndex) => {
        if (segmentEndIndex < 2) { // Equivalent to leftArr.length <= 2
            return currentSplitCandidateIdx;
        }
        const totalSegmentSum = pSumsArray[segmentEndIndex];
        
        const currentSplitValueA = pSumsArray[currentSplitCandidateIdx];
        const currentSplitValueB = totalSegmentSum - currentSplitValueA;

        const nextSplitCandidateIdx = currentSplitCandidateIdx + 1;
        const nextSplitValueA = pSumsArray[nextSplitCandidateIdx];
        const nextSplitValueB = totalSegmentSum - nextSplitValueA;

        if (Math.abs(nextSplitValueB - nextSplitValueA) <= Math.abs(currentSplitValueB - currentSplitValueA)) {
            return nextSplitCandidateIdx;
        }
        return currentSplitCandidateIdx;
    };

    for (let segmentEndIdx = 1, currentLeftSplitIdx = 0; segmentEndIdx < arrayLength - 2; ++segmentEndIdx) {
        currentLeftSplitIdx = calculateOptimalLeftSplitIndex(prefixSums, currentLeftSplitIdx, segmentEndIdx);

        const currentLeftSegmentTotal = prefixSums[segmentEndIdx];
        const firstPartitionSum = prefixSums[currentLeftSplitIdx];
        const secondPartitionSum = currentLeftSegmentTotal - firstPartitionSum;

        partOne.push(firstPartitionSum);
        partTwo.push(secondPartitionSum);
    }

    let currentRightSplitIdx = 1;
    for (let segmentStartIdx = arrayLength - 2; segmentStartIdx > 1; --segmentStartIdx) {
        const segmentBoundaryValue = prefixSums[segmentStartIdx - 1];
        const totalSumOfAllElements = prefixSums[arrayLength - 1];

        const isRightSegmentLongEnough = (arrayLength - segmentStartIdx) > 2;

        const currentSplitRightPartSum = totalSumOfAllElements - prefixSums[segmentStartIdx + currentRightSplitIdx - 1];
        const currentSplitLeftPartSum = prefixSums[segmentStartIdx + currentRightSplitIdx] - segmentBoundaryValue;

        if (isRightSegmentLongEnough) {
            const potentialSplitRightPartSum = totalSumOfAllElements - prefixSums[segmentStartIdx + currentRightSplitIdx - 2];
            const potentialSplitLeftPartSum = prefixSums[segmentStartIdx + currentRightSplitIdx - 1] - segmentBoundaryValue;

            if (Math.abs(potentialSplitRightPartSum - potentialSplitLeftPartSum) <= Math.abs(currentSplitRightPartSum - currentSplitLeftPartSum)) {
                currentRightSplitIdx--;
            }
        }
        
        const finalRightSplitLeftPart = prefixSums[segmentStartIdx + currentRightSplitIdx - 1] - segmentBoundaryValue;
        const finalRightSplitRightPart = totalSumOfAllElements - prefixSums[segmentStartIdx + currentRightSplitIdx - 1];

        partThree.unshift(finalRightSplitLeftPart);
        partFour.unshift(finalRightSplitRightPart);

        currentRightSplitIdx++;
    }

    let minOverallDifference = Infinity;

    for (let k = 0; k < partOne.length; ++k) {
        const currentPartitionValues = [partOne[k], partTwo[k], partThree[k], partFour[k]];
        const maxVal = Math.max(...currentPartitionValues);
        const minVal = Math.min(...currentPartitionValues);
        const currentDifference = maxVal - minVal;

        if (currentDifference < minOverallDifference) {
            minOverallDifference = currentDifference;
        }
    }

    console.log(minOverallDifference);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
