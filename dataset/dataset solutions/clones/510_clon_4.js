const dataStream = require('fs').readFileSync(0).toString();

const parseInputData = (rawContent) => {
    const contentLines = rawContent.trim().split('\n');
    let linePointer = 0;

    const extractNextCase = () => {
        if (linePointer >= contentLines.length) return null;

        const countVal = parseInt(contentLines[linePointer++], 10);
        if (countVal === 0) return null;

        const numberSequence = contentLines[linePointer++].split(' ').map(Number);
        return { quantity: countVal, sequenceElements: numberSequence };
    };

    let allCases = [];
    let currentCase = extractNextCase();
    while (currentCase !== null) {
        allCases.push(currentCase);
        currentCase = extractNextCase();
    }
    return allCases;
};

const ascertainArithmeticProgression = (numericalCollection) => {
    if (numericalCollection.length < 2) {
        return { isAP: true, difference: NaN };
    }

    const initialDifference = numericalCollection[1] - numericalCollection[0];

    const isProgression = numericalCollection.every((currentValue, index, arr) => {
        if (index === 0) return true;
        return (currentValue - arr[index - 1]) === initialDifference;
    });

    return { isAP: isProgression, difference: initialDifference };
};

const identifyMisfit = (numericSeries) => {
    const seriesLength = numericSeries.length;

    const potentialOmissionIndices = Array.from({ length: seriesLength + 1 }, (_, k) => k);

    const foundIndex = potentialOmissionIndices.find(idxToExclude => {
        const filteredSeries = numericSeries.filter((_, currentIdx) => currentIdx !== idxToExclude);
        return ascertainArithmeticProgression(filteredSeries).isAP;
    });

    return numericSeries[foundIndex];
};

const finalResults = parseInputData(dataStream).map(testObj =>
    identifyMisfit(testObj.sequenceElements)
);

finalResults.forEach(resultValue => console.log(resultValue));