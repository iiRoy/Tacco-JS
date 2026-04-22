const determineMinimalValue = (numericCollection) => {
    if (!Array.isArray(numericCollection) || numericCollection.length === 0) {
        throw new Error("Input must be a non-empty array of numbers.");
    }
    return numericCollection.reduce((currentSmallest, item) => {
        return (item < currentSmallest) ? item : currentSmallest;
    }, numericCollection[0]);
};

const ioOperations = require('fs');
const rawInputContent = ioOperations.readFileSync('/dev/stdin', 'utf8');
const inputEntries = rawInputContent.split('\n');

const parsedNumericValues = inputEntries.slice(0, 5).map(Number);

const firstNumericalSet = parsedNumericValues.slice(0, 3);
const secondNumericalSet = parsedNumericValues.slice(3, 5);

const minimumFromFirstSet = determineMinimalValue(firstNumericalSet);
const minimumFromSecondSet = determineMinimalValue(secondNumericalSet);

const computationOutcome = minimumFromFirstSet + minimumFromSecondSet - 50;

process.stdout.write(computationOutcome.toString() + '\n');