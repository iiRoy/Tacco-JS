const createNumericalSequence = (startPoint, endPoint) =>
    Array.from({ length: endPoint - startPoint + 1 }, (_, index) => startPoint + index);

const determineHighestPower = (inputBoundary) => {
    const initialCollection = [1];

    const exponentSet = createNumericalSequence(2, 10);

    const allCandidatePowers = exponentSet.reduce((accumulator, currentExponent) => {
        const maxBaseValue = Math.floor(Math.pow(inputBoundary, 1 / currentExponent));
        if (maxBaseValue < 2) {
            return accumulator;
        }

        const baseValues = createNumericalSequence(2, maxBaseValue);

        const powersForCurrentExponent = baseValues.map(base => Math.pow(base, currentExponent));

        return accumulator.concat(powersForCurrentExponent);
    }, initialCollection);

    allCandidatePowers.sort((valA, valB) => valA - valB);

    let currentMaximum = 1;
    for (let val of allCandidatePowers) {
        if (val > currentMaximum) {
            currentMaximum = val;
        }
    }
    return currentMaximum;
};

const acquireNumericInput = (ioModule) => {
    const rawContent = ioModule.readFileSync('/dev/stdin', 'utf8');
    return Number(rawContent.trim());
};

const transmitResult = (finalOutput) => {
    process.stdout.write(String(finalOutput) + '\n');
};

const systemIO = require('node:fs');
const numericThreshold = acquireNumericInput(systemIO);
const finalOutcome = determineHighestPower(numericThreshold);
transmitResult(finalOutcome);