const streamFacilitator = require('readline');
let collectedPayload = [];

const interactionAgent = streamFacilitator.createInterface({
    input: process.stdin,
    output: process.stdout
});

const acquisitionPromise = new Promise(resolveCallback => {
    interactionAgent.on('line', (currentObservation) => {
        collectedPayload.push(currentObservation);
    });
    interactionAgent.on('close', () => {
        resolveCallback(collectedPayload);
    });
});

const calculateMetric = (valueOne, valueTwo, valueDenominator) => {
    const baseDifferenceQuotient = (valueTwo - valueOne) / valueDenominator;
    const isValueOneDivisible = Number.isInteger(valueOne / valueDenominator);
    const adjustmentFactor = Number(isValueOneDivisible);
    return baseDifferenceQuotient + adjustmentFactor;
};

acquisitionPromise.then((processedData) => {
    const numericalElements = processedData[0].split(' ').map(Number);
    const primaryTerm = numericalElements[0];
    const secondaryTerm = numericalElements[1];
    const divisionOperand = numericalElements[2];

    const finalComputation = calculateMetric(primaryTerm, secondaryTerm, divisionOperand);
    process.stdout.write(finalComputation.toString() + '\n');
});