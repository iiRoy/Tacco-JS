const locateSplitPoint = (dataArr, beginIdx, endIdx, desiredVal) => {
    let lowPointer = beginIdx;
    let highPointer = endIdx; // Exclusive upper bound
    let bestFitIndex = endIdx; 

    while (lowPointer < highPointer) {
        const midPoint = lowPointer + Math.floor((highPointer - lowPointer) / 2);
        if (dataArr[midPoint] >= desiredVal) {
            bestFitIndex = midPoint;
            highPointer = midPoint;
        } else {
            lowPointer = midPoint + 1;
        }
    }
    return bestFitIndex;
};

const calculateSegmentSpread = (firstCut, secondCut, thirdCut, totalItems, sumAccumulator) => {
    if (firstCut < 1 || secondCut <= firstCut || thirdCut <= secondCut || thirdCut >= totalItems) {
        return Number.MAX_SAFE_INTEGER; 
    }

    const segA = sumAccumulator[firstCut];
    const segB = sumAccumulator[secondCut] - sumAccumulator[firstCut];
    const segC = sumAccumulator[thirdCut] - sumAccumulator[secondCut];
    const segD = sumAccumulator[totalItems] - sumAccumulator[thirdCut];

    const allSegments = [segA, segB, segC, segD];
    const minimumSegment = Math.min(...allSegments);
    const maximumSegment = Math.max(...allSegments);
    return maximumSegment - minimumSegment;
};

const executePartitionAnalysis = (inputData) => {
    const dataLines = inputData.split('\n');
    const totalElementsCount = parseInt(dataLines[0], 10);
    const sequenceOfNumbers = dataLines[1].split(' ').map(Number);

    const partialSums = new Array(totalElementsCount + 1).fill(0);
    for (let k = 0; k < totalElementsCount; ++k) {
        partialSums[k + 1] = partialSums[k] + sequenceOfNumbers[k];
    }

    let minimalRange = Number.MAX_SAFE_INTEGER;

    for (let centralCut = 2; centralCut <= totalElementsCount - 2; ++centralCut) {
        const targetLeftBoundary = Math.ceil(partialSums[centralCut] / 2);
        const targetRightBoundary = Math.ceil((partialSums[totalElementsCount] + partialSums[centralCut]) / 2);

        const candidateFirstCutBase = locateSplitPoint(partialSums, 1, centralCut, targetLeftBoundary);
        const candidateThirdCutBase = locateSplitPoint(partialSums, centralCut + 1, totalElementsCount, targetRightBoundary);

        const firstCutOptions = [candidateFirstCutBase];
        if (candidateFirstCutBase > 1) {
            firstCutOptions.push(candidateFirstCutBase - 1);
        }

        const thirdCutOptions = [candidateThirdCutBase];
        if (candidateThirdCutBase > centralCut + 1) {
            thirdCutOptions.push(candidateThirdCutBase - 1);
        }

        for (const currentFirstCut of firstCutOptions) {
            for (const currentThirdCut of thirdCutOptions) {
                minimalRange = Math.min(minimalRange,
                    calculateSegmentSpread(currentFirstCut, centralCut, currentThirdCut, totalElementsCount, partialSums));
            }
        }
    }

    console.log(minimalRange);
};

executePartitionAnalysis(require("fs").readFileSync("/dev/stdin","utf8"));