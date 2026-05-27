function processInput(inputStr) {
    const inputLines = inputStr.split("\n");
    const arrayLength = +inputLines[0];
    const initialArray = inputLines[1].split(" ").map(val => +val);

    const prefixSums = new Array(arrayLength);
    if (arrayLength > 0) {
        prefixSums[0] = initialArray[0];
        for (let k = 1; k < arrayLength; k++) {
            prefixSums[k] = prefixSums[k - 1] + initialArray[k];
        }
    }

    const MAX_POSSIBLE_DIFF = Number.MAX_SAFE_INTEGER;
    let minDifference = MAX_POSSIBLE_DIFF;

    const calculateRangeDifference = (values) => {
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        return maxValue - minValue;
    };

    for (let splitIndex = 2; splitIndex < arrayLength - 1; splitIndex++) {
        const targetLeftSum = prefixSums[splitIndex - 1] / 2;
        const targetRightSum = (prefixSums[arrayLength - 1] + prefixSums[splitIndex - 1]) / 2;

        const leftSplitPoint = findLowerBoundIndex(prefixSums, 1, splitIndex - 1, targetLeftSum);
        const rightSplitPoint = findLowerBoundIndex(prefixSums, splitIndex + 1, arrayLength - 1, targetRightSum);

        const getSegmentSums = (currentLeftSplitIdx, currentRightSplitIdx) => {
            const segment1 = prefixSums[currentLeftSplitIdx - 1];
            const segment2 = prefixSums[splitIndex - 1] - prefixSums[currentLeftSplitIdx - 1];
            const segment3 = prefixSums[currentRightSplitIdx - 1] - prefixSums[splitIndex - 1];
            const segment4 = prefixSums[arrayLength - 1] - prefixSums[currentRightSplitIdx - 1];
            return [segment1, segment2, segment3, segment4];
        };

        let currentParts = getSegmentSums(leftSplitPoint, rightSplitPoint);
        minDifference = Math.min(minDifference, calculateRangeDifference(currentParts));

        if (splitIndex - leftSplitPoint > 1) {
            currentParts = getSegmentSums(leftSplitPoint + 1, rightSplitPoint);
            minDifference = Math.min(minDifference, calculateRangeDifference(currentParts));

            if (arrayLength - rightSplitPoint > 1) {
                currentParts = getSegmentSums(leftSplitPoint + 1, rightSplitPoint + 1);
                minDifference = Math.min(minDifference, calculateRangeDifference(currentParts));
            }
        }

        if (arrayLength - rightSplitPoint > 1) {
            currentParts = getSegmentSums(leftSplitPoint, rightSplitPoint + 1);
            minDifference = Math.min(minDifference, calculateRangeDifference(currentParts));
        }
    }

    console.log(minDifference);
}

function findLowerBoundIndex(dataArray, startIndex, endIndex, targetValue) {
    let currentLow = startIndex;
    let currentHigh = endIndex;
    let currentMid;
    while (1 < currentHigh - currentLow) {
        currentMid = Math.floor((currentLow + currentHigh) / 2);
        if (dataArray[currentMid] < targetValue) {
            currentLow = currentMid;
        } else {
            currentHigh = currentMid;
        }
    }
    return dataArray[currentLow] < targetValue ? currentHigh : currentLow;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
