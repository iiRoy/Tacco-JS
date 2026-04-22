'use strict';

const processNumericPayload = (textualData) => {
    const numericCandidates = textualData.split('\n')
                                         .slice(1)
                                         .map(item => Number(item));

    const numericCollection = numericCandidates.filter(val => !Number.isNaN(val));

    if (numericCollection.length === 0) {
        return Number.NaN;
    }

    const aggregatedSum = numericCollection.reduce((currentTotal, valueEntry) => currentTotal + valueEntry, 0);
    const supremeValue = Math.max(...numericCollection);

    const ultimateResult = aggregatedSum - (supremeValue / 2);

    return ultimateResult;
};

const orchestrateExecution = (sourceOfData) => {
    const computedOutcome = processNumericPayload(sourceOfData);
    console.log(computedOutcome);
};

orchestrateExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));