const calculateBinomialCoefficient = (totalCount, chosenCount) => {
    const n = BigInt(totalCount);
    let k = BigInt(chosenCount);

    if (k < 0n || k > n) {
        return 0n;
    }
    if (k === 0n || k === n) {
        return 1n;
    }
    if (k > n / 2n) {
        k = n - k;
    }

    let currentResult = 1n;
    for (let i = 1n; i <= k; ++i) {
        currentResult = currentResult * (n - i + 1n) / i;
    }
    return currentResult;
};

const processInputData = (incomingLines) => {
    const [initialParameters, elementValues] = incomingLines;

    const [totalElementsQuantity, minimumChosenSize, maximumChosenSize] = initialParameters.split(" ").map(Number);
    const numericDataElements = elementValues.split(" ").map(Number);

    const sortedNumericData = [...numericDataElements].sort((firstVal, secondVal) => secondVal - firstVal);

    const topElementsSum = sortedNumericData.slice(0, minimumChosenSize).reduce((accumulator, current) => accumulator + current, 0);
    const resultingAverage = topElementsSum / minimumChosenSize;

    console.log(resultingAverage);

    const valueFrequencies = new Map();
    for (const itemValue of sortedNumericData) {
        valueFrequencies.set(itemValue, (valueFrequencies.get(itemValue) || 0) + 1);
    }

    let finalCombinationTotal;
    const peakValue = sortedNumericData[0];
    const upperLimitValue = sortedNumericData[maximumChosenSize - 1];

    if (peakValue !== upperLimitValue) {
        const thresholdValue = sortedNumericData[minimumChosenSize - 1];
        const countOfLargerValues = sortedNumericData.slice(0, minimumChosenSize).filter(val => val > thresholdValue).length;
        const requiredFromThresholdGroup = minimumChosenSize - countOfLargerValues;
        
        finalCombinationTotal = calculateBinomialCoefficient(valueFrequencies.get(thresholdValue), requiredFromThresholdGroup);
    } else {
        finalCombinationTotal = Array.from({ length: maximumChosenSize - minimumChosenSize + 1 }, (_, idx) => minimumChosenSize + idx)
            .reduce((cumulativeSum, currentChoiceCount) => {
                return cumulativeSum + calculateBinomialCoefficient(valueFrequencies.get(peakValue), currentChoiceCount);
            }, 0n);
    }

    console.log(finalCombinationTotal.toString());
};

const collectedInputSegments = [];
const stdinHook = require('readline');

const interactiveInputHandler = stdinHook.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interactiveInputHandler.on('line', (individualLine) => {
    collectedInputSegments.push(individualLine);
});

interactiveInputHandler.on('close', () => {
    processInputData(collectedInputSegments);
});