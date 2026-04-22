const fileSystemInterface = require('fs');
const rawDataString = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const numericalStringsArray = rawDataString
    .trim()
    .split('\n');

const obtainCeilingResult = (numericValue) => Math.ceil(numericValue);

const processSingleValue = (individualLineText) => {
    // Using Number() to replicate the behavior of the unary '+' operator for type conversion,
    // including handling of empty strings (Number('') is 0, just like +'' is 0).
    const parsedNumber = Number(individualLineText);
    const squaredNumber = parsedNumber * parsedNumber; // Replaces Math.pow(x, 2)
    const incrementedNumber = squaredNumber + 1;
    return obtainCeilingResult(incrementedNumber);
};

numericalStringsArray
    .map(processSingleValue)
    .forEach(finalOutput => process.stdout.write(finalOutput + '\n'));