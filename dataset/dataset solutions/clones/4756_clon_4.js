const fileSystemModule = require('node:fs');

const rawText = fileSystemModule.readFileSync(0, { encoding: 'utf8' }).trim();

const numericComponents = rawText.match(/(-?\d+(\.\d+)?)/g).map(Number);

const [numOne, numTwo, numThree, numFour] = numericComponents;

const computeNumericalResult = (valA, valB) => {
    return valA / (1 / valB);
};

const firstPairProduct = computeNumericalResult(numOne, numTwo);
const secondPairProduct = computeNumericalResult(numThree, numFour);

const determineSuperiorValue = (valX, valY) => {
    return Math.max(valX, valY);
};

const outcomeValue = determineSuperiorValue(firstPairProduct, secondPairProduct);

process.stdout.write(String(outcomeValue) + '\n');