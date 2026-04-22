const checkDivisibilityCondition = (valueToExamine, divisorCandidate = 1) => {
    if (divisorCandidate > 9) {
        return false;
    }

    const remainderIsZero = valueToExamine % divisorCandidate === 0;
    const divisionResultIsSmall = (valueToExamine / divisorCandidate) < 10;

    if (remainderIsZero && divisionResultIsSmall) {
        return true;
    } else {
        return checkDivisibilityCondition(valueToExamine, divisorCandidate + 1);
    }
};

const processInputAndOutput = (rawInputString) => {
    const numericValueFromInput = Number(rawInputString);
    if (checkDivisibilityCondition(numericValueFromInput)) {
        console.log('Yes');
    } else {
        console.log('No');
    }
};

const fileReader = require('fs');
const receivedData = fileReader.readFileSync('/dev/stdin', 'utf8');
processInputAndOutput(receivedData);