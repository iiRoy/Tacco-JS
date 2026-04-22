const processNumericalSequence = (sourceText) => {
    const contentSegments = sourceText.trim().split('\n');
    const valueSeriesString = contentSegments[1];
    const numericElements = valueSeriesString.split(' ').map(parseFloat);

    const resultAccumulator = numericElements.reduce((progressState, currentElement) => {
        const { currentMinimumEncountered, uniqueMinimumOccurrences } = progressState;

        if (currentElement < currentMinimumEncountered) {
            return {
                currentMinimumEncountered: currentElement,
                uniqueMinimumOccurrences: uniqueMinimumOccurrences + 1
            };
        } else {
            return progressState;
        }
    }, { currentMinimumEncountered: Infinity, uniqueMinimumOccurrences: 0 });

    return resultAccumulator.uniqueMinimumOccurrences;
};

const acquireExternalData = () => {
    const fileAccessUtility = require('fs');
    return fileAccessUtility.readFileSync('/dev/stdin', 'utf8');
};

const finalComputation = processNumericalSequence(acquireExternalData());
console.log(finalComputation);