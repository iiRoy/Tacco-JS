function ProcessInputData(rawDataString) {

    const inputLines = rawDataString.split('\n');

    const dataElementCount = Number.parseInt(inputLines[0], 10);

    const sourceDataElements = inputLines[1].split(' ').map(Number);

    const cumulativeSumsArray = new Array(dataElementCount + 1).fill(0);
    let currentRunningSum = 0;
    for (let elementIndex = 0; elementIndex < dataElementCount; ++elementIndex) {
        currentRunningSum += sourceDataElements[elementIndex];
        cumulativeSumsArray[elementIndex + 1] = currentRunningSum;
    }

    const sumsForSegmentOne = [];
    const sumsForSegmentTwo = [];
    const sumsForSegmentThree = [];
    const sumsForSegmentFour = [];

    let optimalInnerLeftSplitIdx = 1;
    for (let splitIdxK = 2; splitIdxK <= dataElementCount - 2; ++splitIdxK) {
        while (optimalInnerLeftSplitIdx < splitIdxK - 1) {
            const currentSplitS1 = cumulativeSumsArray[optimalInnerLeftSplitIdx];
            const currentSplitS2 = cumulativeSumsArray[splitIdxK] - cumulativeSumsArray[optimalInnerLeftSplitIdx];

            const candidateSplitS1 = cumulativeSumsArray[optimalInnerLeftSplitIdx + 1];
            const candidateSplitS2 = cumulativeSumsArray[splitIdxK] - cumulativeSumsArray[optimalInnerLeftSplitIdx + 1];

            if (Math.abs(candidateSplitS1 - candidateSplitS2) <= Math.abs(currentSplitS1 - currentSplitS2)) {
                optimalInnerLeftSplitIdx++;
            } else {
                break;
            }
        }
        sumsForSegmentOne.push(cumulativeSumsArray[optimalInnerLeftSplitIdx]);
        sumsForSegmentTwo.push(cumulativeSumsArray[splitIdxK] - cumulativeSumsArray[optimalInnerLeftSplitIdx]);
    }

    let optimalInnerRightSplitIdx = dataElementCount - 1;
    for (let splitIdxK = dataElementCount - 2; splitIdxK >= 2; --splitIdxK) {
        while (optimalInnerRightSplitIdx > splitIdxK + 1) {
            const currentSplitS3 = cumulativeSumsArray[optimalInnerRightSplitIdx] - cumulativeSumsArray[splitIdxK];
            const currentSplitS4 = cumulativeSumsArray[dataElementCount] - cumulativeSumsArray[optimalInnerRightSplitIdx];

            const candidateSplitS3 = cumulativeSumsArray[optimalInnerRightSplitIdx - 1] - cumulativeSumsArray[splitIdxK];
            const candidateSplitS4 = cumulativeSumsArray[dataElementCount] - cumulativeSumsArray[optimalInnerRightSplitIdx - 1];

            if (Math.abs(candidateSplitS3 - candidateSplitS4) <= Math.abs(currentSplitS3 - currentSplitS4)) {
                optimalInnerRightSplitIdx--;
            } else {
                break;
            }
        }
        sumsForSegmentThree.unshift(cumulativeSumsArray[optimalInnerRightSplitIdx] - cumulativeSumsArray[splitIdxK]);
        sumsForSegmentFour.unshift(cumulativeSumsArray[dataElementCount] - cumulativeSumsArray[optimalInnerRightSplitIdx]);
    }

    const computeValueRange = (valueSet) => {
        if (valueSet.length === 0) {
             return 0;
        }
        const maximumValue = Math.max(...valueSet);
        const minimumValue = Math.min(...valueSet);
        return maximumValue - minimumValue;
    };

    let minimumOverallDifference = -1;

    for (let index = 0; index < sumsForSegmentOne.length; ++index) {
        const currentPartitionSet = [
            sumsForSegmentOne[index],
            sumsForSegmentTwo[index],
            sumsForSegmentThree[index],
            sumsForSegmentFour[index]
        ];

        const currentPartitionDifference = computeValueRange(currentPartitionSet);

        if (minimumOverallDifference === -1 || currentPartitionDifference < minimumOverallDifference) {
            minimumOverallDifference = currentPartitionDifference;
        }
    }

    console.log(minimumOverallDifference);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));