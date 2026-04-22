const fileSystemModule = require('fs');

const extractAndConvertData = (rawTextContent) =>
    rawTextContent
        .trim()
        .split('\n')
        .map(parseFloat)
        .filter(val => !Number.isNaN(val));

const deriveShapeAreaMetric = (dimensionOne, dimensionTwo) => {
    const termComponentA = dimensionOne * Math.sqrt(4 * Math.pow(dimensionTwo, 2) + Math.pow(dimensionOne, 2));
    const termComponentB = Math.pow(dimensionOne, 2);
    return termComponentA + termComponentB;
};

const executeComputationFlow = (inputDatumSet, accumulatedResults = []) => {
    if (inputDatumSet.length < 2) {
        return accumulatedResults;
    }

    const currentXValue = inputDatumSet[0];
    const currentYValue = inputDatumSet[1];

    if (currentXValue === 0 && currentYValue === 0) {
        return accumulatedResults;
    }

    const calculatedOutcome = deriveShapeAreaMetric(currentXValue, currentYValue);
    accumulatedResults.push(calculatedOutcome.toFixed(5));

    const remainingDatumSet = inputDatumSet.slice(2);
    return executeComputationFlow(remainingDatumSet, accumulatedResults);
};

const rawDataStream = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedNumericalSeries = extractAndConvertData(rawDataStream);
const finalRenderedValues = executeComputationFlow(processedNumericalSeries);

console.log(finalRenderedValues.join('\n'));