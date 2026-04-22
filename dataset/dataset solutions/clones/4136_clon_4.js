'use strict';

const dissectInputString = (incomingPayload) => incomingPayload.split(' ').map(Number);

const tallyDigitsNumerically = (numericalSubject) => {
    let cumulativeTally = 0;
    let workingSubject = numericalSubject;
    while (workingSubject > 0) {
        cumulativeTally += workingSubject % 10;
        workingSubject = Math.floor(workingSubject / 10);
    }
    return cumulativeTally;
};

const aggregateEligibleQuantities = (primaryDataSource) => {
    const extractedParameters = dissectInputString(primaryDataSource);
    const upperLimitIndex = extractedParameters[0];
    const minimumThreshold = extractedParameters[1];
    const maximumThreshold = extractedParameters[2];

    const sequentialRange = Array.from({ length: upperLimitIndex }, (_, index) => index + 1);

    const filteredSet = sequentialRange.filter(candidateNumber => {
        const digitOccurrenceSum = tallyDigitsNumerically(candidateNumber);
        return digitOccurrenceSum >= minimumThreshold && digitOccurrenceSum <= maximumThreshold;
    });

    return filteredSet.reduce((accumulatedResult, itemValue) => accumulatedResult + itemValue, 0);
};

function InitiateProcessing(systemInputData) {
  console.log(aggregateEligibleQuantities(systemInputData));
}
InitiateProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));