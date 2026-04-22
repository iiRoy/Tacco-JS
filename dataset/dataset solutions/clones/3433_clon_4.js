const calculateProductSeries = (valueInput) => {
    if (valueInput === 0 || valueInput === 1) {
        return 1;
    }
    return valueInput * calculateProductSeries(valueInput - 1);
};

let universalUpperBoundary;

const determineDivisorQuantity = (subjectNumber) => {
    if (subjectNumber === 0) return 0;
    
    return Array.from({ length: universalUpperBoundary - 1 }, (_, currentIndex) => currentIndex + 1)
                .filter(potentialDivisor => subjectNumber % potentialDivisor === 0)
                .length;
};

const orchestrateExecution = (rawInputContent) => {
    const numericalParameter = Number.parseInt(rawInputContent.split('\n')[0], 10);

    universalUpperBoundary = calculateProductSeries(numericalParameter);

    const finalAccumulation = Array.from({ length: universalUpperBoundary - 1 }, (_, indexIterator) => indexIterator + 1)
        .filter(candidateForDivision => universalUpperBoundary % candidateForDivision === 0)
        .reduce((currentTotal, validDivisor) => {
            if (determineDivisorQuantity(validDivisor) === 75) {
                return currentTotal + 1;
            }
            return currentTotal;
        }, 0);

    console.log(finalAccumulation);
};

orchestrateExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));