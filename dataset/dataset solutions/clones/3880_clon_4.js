const extractNumericSequence = (sourceText) => {
    const tokenizedValues = sourceText.split(/\s|\n/);
    const numericalComponents = tokenizedValues.slice(0, 5).map(Number);
    return {
        unitAlpha: numericalComponents[0],
        unitBeta: numericalComponents[1],
        unitGamma: numericalComponents[2],
        unitDelta: numericalComponents[3],
        unitEpsilon: numericalComponents[4]
    };
};

const determinePrimaryContribution = (dataPoints) => {
    const averageOfFirstTwo = (dataPoints.unitAlpha + dataPoints.unitBeta) / 2;
    const minimumOfLastTwo = Math.min(dataPoints.unitDelta, dataPoints.unitEpsilon);

    const conditionSatisfied = (averageOfFirstTwo > dataPoints.unitGamma) ? 1 : 0;
    const conditionNotSatisfied = 1 - conditionSatisfied;

    const outcomeA = dataPoints.unitGamma * 2 * minimumOfLastTwo;
    const outcomeB = (dataPoints.unitAlpha + dataPoints.unitBeta) * minimumOfLastTwo;

    return (conditionSatisfied * outcomeA) + (conditionNotSatisfied * outcomeB);
};

const determineSecondaryContribution = (dataPoints) => {
    const deltaIsLarger = (dataPoints.unitDelta > dataPoints.unitEpsilon) ? 1 : 0;
    const epsilonIsLargerOrEqualToDelta = 1 - deltaIsLarger;

    const termX = dataPoints.unitAlpha * (dataPoints.unitDelta - dataPoints.unitEpsilon);
    const termY = dataPoints.unitBeta * (dataPoints.unitEpsilon - dataPoints.unitDelta);

    return (deltaIsLarger * termX) + (epsilonIsLargerOrEqualToDelta * termY);
};

const performOverallCalculation = (inputPayload) => {
    const processedComponents = extractNumericSequence(inputPayload);
    const initialSummand = determinePrimaryContribution(processedComponents);
    const subsequentSummand = determineSecondaryContribution(processedComponents);
    return initialSummand + subsequentSummand;
};

const executeComputation = (dataSource) => {
    const finalCalculatedValue = performOverallCalculation(dataSource);
    console.log(finalCalculatedValue);
};

executeComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));