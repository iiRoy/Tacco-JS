const splitAndTrimLine = (inputString) => inputString.trim().split(" ");

const parseSpaceSeparatedStrings = (inputLineString) => {
    const elements = splitAndTrimLine(inputLineString);
    // Original loop (arr[i]=arr[i];) was a no-op and has been removed.
    return elements;
};

const parseSpaceSeparatedNumbers = (inputLineString) => {
    const elements = splitAndTrimLine(inputLineString);
    return elements.map(Number);
};

const getSmallerValue = (valueOne, valueTwo) => Math.min(valueOne, valueTwo);

const calculateProfitMetrics = (currentObservation, currentMinimumValue, currentMaximumProfit, currentProfitOccurrences) => {
    const calculatedPotentialProfit = currentObservation - currentMinimumValue;

    if (calculatedPotentialProfit > currentMaximumProfit) {
        currentMaximumProfit = calculatedPotentialProfit;
        currentProfitOccurrences = 1;
    } else if (calculatedPotentialProfit === currentMaximumProfit) {
        currentProfitOccurrences++;
    }
    return { newMaxProfit: currentMaximumProfit, newProfitCount: currentProfitOccurrences };
};

function processInputData(rawInputContent) {
    const allInputLines = rawInputContent.split("\n");

    const firstLineParsed = parseSpaceSeparatedNumbers(allInputLines[0]);
    const totalDataPoints = firstLineParsed[0];
    const timeLimitValue = firstLineParsed[1];

    const dataSeries = parseSpaceSeparatedNumbers(allInputLines[1]);

    let maximumAchievedProfit = 0;
    let profitScenarioCount = 0;
    let runningMinimumPrice = dataSeries[0];

    if (totalDataPoints === 1) {
        console.log("0");
    }

    for (let dataIndex = 0; dataIndex < totalDataPoints; ++dataIndex) {
        const currentPricePoint = dataSeries[dataIndex];

        const updatedMetrics = calculateProfitMetrics(currentPricePoint, runningMinimumPrice, maximumAchievedProfit, profitScenarioCount);
        maximumAchievedProfit = updatedMetrics.newMaxProfit;
        profitScenarioCount = updatedMetrics.newProfitCount;

        runningMinimumPrice = getSmallerValue(currentPricePoint, runningMinimumPrice);
    }

    const halfTimeLimitFloor = Math.floor(timeLimitValue / 2);
    const finalOutputValue = getSmallerValue(profitScenarioCount, halfTimeLimitFloor);

    console.log(finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
