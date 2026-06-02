const processInputHandler = (() => {
    let processingBuffer = [];

    const calculateIndividualDifference = (currentValue, currentIndex) => {
        return currentValue - currentIndex - 1;
    };

    const computeDifferences = (inputArray) => {
        const intermediateDifferences = [];
        for (let k = 0; k < inputArray.length; k++) {
            intermediateDifferences.push(calculateIndividualDifference(inputArray[k], k));
        }
        return intermediateDifferences;
    };

    const findMedian = (dataArray) => {
        const middleIndex = Math.floor(dataArray.length / 2);
        return dataArray[middleIndex];
    };

    const calculateTotalSadness = (inputArray, differenceArray, baseValue) => {
        let totalAccumulatedSadness = 0;
        for (let k = 0; k < inputArray.length; k++) {
            totalAccumulatedSadness += Math.abs(differenceArray[k] - baseValue);
        }
        return totalAccumulatedSadness;
    };

    const performCalculationsAndOutput = (dataContainer) => {
        const actualInputArray = dataContainer[1];
        const computedDifferences = computeDifferences(actualInputArray);
        const medianOfDifferences = findMedian(computedDifferences);
        const finalSadnessResult = calculateTotalSadness(actualInputArray, computedDifferences, medianOfDifferences);

        console.log(finalSadnessResult);
    };

    return (inputData) => {
        if (processingBuffer.length === 0) {
            const parsedN = parseInt(inputData, 10);
            processingBuffer.push(parsedN);
        } else if (processingBuffer.length === 1) {
            const parsedArrayElements = inputData.split(' ').map(element => parseInt(element, 10));
            processingBuffer.push(parsedArrayElements);

            performCalculationsAndOutput(processingBuffer);
            processingBuffer = [];
        }
    };
})();

process.stdin.setEncoding('utf-8');
process.stdin.on('data', inputDataChunk => processInputHandler(inputDataChunk));
