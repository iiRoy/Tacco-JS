function calculateStandardDeviation(numericValues) {
    const dataLength = numericValues.length;

    if (dataLength === 0) {
        return 0.0;
    }

    let totalSum = 0.0;
    for (let idx = 0; idx < dataLength; idx++) {
        totalSum += numericValues[idx];
    }

    const meanValue = totalSum / dataLength;

    let squaredDifferencesSum = 0.0;
    for (let idx = 0; idx < dataLength; idx++) {
        const differenceFromMean = numericValues[idx] - meanValue;
        squaredDifferencesSum += (differenceFromMean * differenceFromMean);
    }

    const variance = squaredDifferencesSum / dataLength;
    return Math.sqrt(variance);
}

function processInputData(rawDataContent) {
    const inputSourcePath = "/dev/stdin";

    const allParsedNumbers = rawDataContent.trim().split(/\s|\n/).map(Number);

    let currentNumberIndex = 0;

    while (true) {
        const currentSetCount = allParsedNumbers[currentNumberIndex++];

        if (currentSetCount === 0) {
            break;
        }

        const currentDataPoints = [];
        for (let i = 0; i < currentSetCount; i++) {
            currentDataPoints.push(allParsedNumbers[currentNumberIndex++]);
        }

        const standardDeviationResult = calculateStandardDeviation(currentDataPoints);
        console.log(standardDeviationResult);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
