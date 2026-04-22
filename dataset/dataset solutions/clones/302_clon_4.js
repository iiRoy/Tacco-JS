const calculateEpochValidity = (yearValue) => {
    const isFactorOfFour = (yearValue % 4 === 0);
    const isFactorOfHundred = (yearValue % 100 === 0);
    const isFactorOfFourHundred = (yearValue % 400 === 0);
    return isFactorOfFourHundred || (isFactorOfFour && !isFactorOfHundred);
};

let accumulatedData = '';

process.stdin.on('data', (incomingData) => {
    accumulatedData += incomingData.toString();
});

process.stdin.on('end', () => {
    const rawEntries = accumulatedData.trim().split('\n');

    const processedOutputs = rawEntries
        .reduce((acc, entryLine) => {
            const boundaryValues = entryLine.split(' ').map(Number);
            const lowerBound = boundaryValues[0];
            const upperBound = boundaryValues[1];

            if (lowerBound === 0 && upperBound === 0) {
                return acc;
            }

            const yearSequence = Array.from({ length: upperBound - lowerBound + 1 }, (_, index) => lowerBound + index);

            const validEpochs = yearSequence.filter(calculateEpochValidity);

            if (validEpochs.length > 0) {
                acc.push(validEpochs.join('\n'));
            } else {
                acc.push('NA');
            }
            return acc;
        }, []);

    console.log(processedOutputs.join('\n\n'));
});