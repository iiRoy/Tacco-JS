const processInputData = (sourceText) => {
    const parsedNumbers = sourceText.split('\n').filter(Boolean).map(Number);

    const { keyParameter, dataSequence } = parsedNumbers.reduceRight((collector, currentValue, currentIndex, fullArray) => {
        if (currentIndex === fullArray.length - 1) {
            collector.keyParameter = currentValue;
        } else {
            collector.dataSequence.unshift(currentValue);
        }
        return collector;
    }, { keyParameter: undefined, dataSequence: [] });

    const relevantObservations = dataSequence.filter((_, position) => position === 0 || position === 4);

    const firstObservation = relevantObservations[0];
    const fifthObservation = relevantObservations[1];

    const resultCondition = (fifthObservation - firstObservation > keyParameter);

    return resultCondition ? ":(" : "Yay!";
};

const retrieveExternalContent = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

console.log(processInputData(retrieveExternalContent()));