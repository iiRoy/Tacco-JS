const processData = (rawData) => {
    const dataLines = rawData.split('\n');
    const elementCount = Number(dataLines[0]);
    const initialNumbers = dataLines[1].split(' ').map(Number);

    if (elementCount < 4) {
        return -1;
    }

    const cumulativeValues = initialNumbers.reduce((accumulator, currentVal, idx) => {
        const previousSum = idx > 0 ? accumulator[idx - 1] : 0;
        accumulator.push(previousSum + currentVal);
        return accumulator;
    }, []);

    let currentLeftPartitionBoundary = 0;
    const pqPairs = Array.from({ length: elementCount - 3 }, (_, index) => {
        const boundaryQREnd = index + 1;

        const totalPQSegmentSum = cumulativeValues[boundaryQREnd];

        while (currentLeftPartitionBoundary + 1 < boundaryQREnd) {
            const currentPVal = cumulativeValues[currentLeftPartitionBoundary];
            const currentQVal = totalPQSegmentSum - currentPVal;
            const nextPVal = cumulativeValues[currentLeftPartitionBoundary + 1];
            const nextQVal = totalPQSegmentSum - nextPVal;

            if (Math.abs(nextPVal - nextQVal) <= Math.abs(currentPVal - currentQVal)) {
                currentLeftPartitionBoundary++;
            } else {
                break;
            }
        }
        return [cumulativeValues[currentLeftPartitionBoundary], totalPQSegmentSum - cumulativeValues[currentLeftPartitionBoundary]];
    });

    const firstPortionSums = pqPairs.map(pair => pair[0]);
    const secondPortionSums = pqPairs.map(pair => pair[1]);

    let currentRightPartitionOffset = 1;
    const rsPairs = Array.from({ length: elementCount - 3 }, (_, index) => {
        const boundaryQRStart = elementCount - 2 - index;

        const totalRSSegmentSum = cumulativeValues[elementCount - 1] - cumulativeValues[boundaryQRStart - 1];
        let localRightOffset = currentRightPartitionOffset;

        if (elementCount - boundaryQRStart > 2 && localRightOffset - 1 >= 0) {
            const currentRVal = cumulativeValues[boundaryQRStart + localRightOffset] - cumulativeValues[boundaryQRStart - 1];
            const currentSVal = cumulativeValues[elementCount - 1] - cumulativeValues[boundaryQRStart + localRightOffset];
            const prevRVal = cumulativeValues[boundaryQRStart + localRightOffset - 1] - cumulativeValues[boundaryQRStart - 1];
            const prevSVal = cumulativeValues[elementCount - 1] - cumulativeValues[boundaryQRStart + localRightOffset - 1];

            if (Math.abs(prevRVal - prevSVal) <= Math.abs(currentRVal - currentSVal)) {
                localRightOffset--;
            }
        }
        currentRightPartitionOffset++;

        return [
            cumulativeValues[boundaryQRStart + localRightOffset - 1] - cumulativeValues[boundaryQRStart - 1],
            cumulativeValues[elementCount - 1] - cumulativeValues[boundaryQRStart + localRightOffset - 1]
        ];
    }).reverse();

    const thirdPortionSums = rsPairs.map(pair => pair[0]);
    const fourthPortionSums = rsPairs.map(pair => pair[1]);

    let overallMinimumDifference = Number.MAX_SAFE_INTEGER;

    for (let k = 0; k < firstPortionSums.length; ++k) {
        const groupValues = [
            firstPortionSums[k],
            secondPortionSums[k],
            thirdPortionSums[k],
            fourthPortionSums[k]
        ];
        const maxVal = Math.max(...groupValues);
        const minVal = Math.min(...groupValues);
        const currentDifference = maxVal - minVal;

        if (currentDifference < overallMinimumDifference) {
            overallMinimumDifference = currentDifference;
        }
    }

    return overallMinimumDifference;
};

const runApplication = (inputString) => {
    const finalResult = processData(inputString);
    console.log(finalResult);
};

runApplication(require("fs").readFileSync("/dev/stdin", "utf8"));