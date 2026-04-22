function processNumericalCriterion(dataInput) {
    const valueConsidered = Number(dataInput);

    const computeIntegerDigitSum = (subjectNumber) => {
        let accumulatingSum = 0;
        let workingNumber = subjectNumber;
        while (workingNumber > 0) {
            accumulatingSum += workingNumber % 10;
            workingNumber = Math.floor(workingNumber / 10);
        }
        return accumulatingSum;
    };

    const totalDigitSum = computeIntegerDigitSum(valueConsidered);

    if (valueConsidered % totalDigitSum === 0) {
        console.log('True');
    } else {
        console.log('False');
    }
}

const systemFileModule = require('fs');
const standardInputPathway = '/dev/stdin';
const rawDataString = systemFileModule.readFileSync(standardInputPathway, 'utf8');
processNumericalCriterion(rawDataString);