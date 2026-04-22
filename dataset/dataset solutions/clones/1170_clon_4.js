const dataAcquirer = require('readline');

const squareValue = (inputVal) => Math.pow(inputVal, 2);
const computeRoot = (inputVal) => Math.sqrt(inputVal);

const calculateSquaredDifference = (valA, valB) => squareValue(valA - valB);

const performDistanceMeasurement = (numericValues) => {
    const [alphaX, alphaY, betaX, betaY] = numericValues;
    const deltaXSquared = calculateSquaredDifference(alphaX, betaX);
    const deltaYSquared = calculateSquaredDifference(alphaY, betaY);
    return computeRoot(deltaXSquared + deltaYSquared);
};

const lineProcessor = dataAcquirer.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

lineProcessor.on('line', (incomingLine) => {
    const parsedNumerics = incomingLine.split(' ').map(Number);
    const calculatedResult = performDistanceMeasurement(parsedNumerics);
    process.stdout.write(calculatedResult.toString() + '\n');
});