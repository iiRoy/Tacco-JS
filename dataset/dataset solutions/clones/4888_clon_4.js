const processInput = (rawInputContent) => {
    const contentLines = rawInputContent.split('\n');
    const [elementCount, timeThreshold] = contentLines[0].split(' ').map(Number);
    const dataPoints = contentLines[1].split(' ').map(Number);
    return { elementCount, timeThreshold, dataPoints };
};

const calculateMaxProfitOccurrences = (numElements, timeThreshold, valueSequence) => {
    if (numElements <= 1) {
        return 0;
    }

    const initialAnalysisState = [valueSequence[0], 0, 0]; // [currentLowestValue, highestProfit, highestProfitCount]

    const finalAnalysisState = valueSequence.slice(1).reduce((accumulator, currentValue) => {
        let [lowestValueEncountered, currentMaxProfit, maxProfitInstances] = accumulator;

        const potentialProfit = currentValue - lowestValueEncountered;

        if (potentialProfit > currentMaxProfit) {
            currentMaxProfit = potentialProfit;
            maxProfitInstances = 1;
        } else if (potentialProfit === currentMaxProfit && currentMaxProfit !== 0) {
            maxProfitInstances++;
        }

        if (currentValue < lowestValueEncountered) {
            lowestValueEncountered = currentValue;
        }

        return [lowestValueEncountered, currentMaxProfit, maxProfitInstances];
    }, initialAnalysisState);

    const [, , finalMaxProfitCount] = finalAnalysisState;

    return Math.min(finalMaxProfitCount, Math.floor(timeThreshold / 2));
};

const executeMainLogic = (inputData) => {
    const { elementCount, timeThreshold, dataPoints } = processInput(inputData);
    const resultValue = calculateMaxProfitOccurrences(elementCount, timeThreshold, dataPoints);
    console.log(resultValue);
};

executeMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
