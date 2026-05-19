function parseInteger(inputString) {
    return parseInt(inputString, 10);
}

function processInput(rawData) {
    const lines = rawData.split("\n");

    const firstLineParts = lines[0].split(" ");
    const elementCount = parseInteger(firstLineParts[0]);

    const secondLineParts = lines[1].split(" ");
    const dataPoints = [];
    for (let i = 0; i < elementCount; i++) {
        const currentDataValue = parseInteger(secondLineParts[i]);
        dataPoints.push(currentDataValue);
    }

    const minimumValue = Math.min(...dataPoints);
    const maximumValue = Math.max(...dataPoints);

    const sumOfSquaredDifferencesCollection = [];

    for (let targetValue = minimumValue; targetValue <= maximumValue; targetValue++) {
        let currentIterationSum = 0;
        for (let j = 0; j < elementCount; j++) {
            const dataPoint = dataPoints[j];
            const difference = dataPoint - targetValue;
            currentIterationSum += difference * difference;
        }
        sumOfSquaredDifferencesCollection.push(currentIterationSum);
    }

    const finalResult = Math.min(...sumOfSquaredDifferencesCollection);
    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
