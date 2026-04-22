let collectedStreamData = '';

process.stdin.on('data', (dataChunk) => {
    collectedStreamData += dataChunk.toString();
});

process.stdin.on('end', () => {
    initiateProcessing(
        collectedStreamData
            .trim()
            .split('\n')
    );
});

const checkPrimaryStatus = (numericItem) => {
    if (numericItem < 2) return false;
    if (numericItem === 2) return true;
    if (numericItem % 2 === 0) return false;

    for (let currentDivisor = 3; currentDivisor * currentDivisor <= numericItem; currentDivisor += 2) {
        if (numericItem % currentDivisor === 0) return false;
    }
    return true;
};

const buildCumulativePrimeSums = (upperBoundForPrimes, desiredCollectionSize) => {
    const cumulativeCollection = new Array(desiredCollectionSize + 1).fill(0);
    let runningTotalOfPrimes = 0;
    let primeCounterForIndex = 0;
    let currentCandidateNumber = 2;

    while (currentCandidateNumber <= upperBoundForPrimes) {
        if (checkPrimaryStatus(currentCandidateNumber)) {
            primeCounterForIndex++;
            runningTotalOfPrimes += currentCandidateNumber;

            if (primeCounterForIndex <= desiredCollectionSize) {
                cumulativeCollection[primeCounterForIndex] = runningTotalOfPrimes;
            }
        }
        currentCandidateNumber++;
    }
    return cumulativeCollection;
};

const initiateProcessing = (dataInputLines) => {
    const allPrimeCumulativeValues = buildCumulativePrimeSums(104729, 104729);

    for (let dataIndex = 0; dataIndex < dataInputLines.length; dataIndex++) {
        const individualLine = dataInputLines[dataIndex];
        const numericalValue = parseInt(individualLine, 10);

        if (isNaN(numericalValue) || numericalValue === 0) {
            return;
        }

        console.log(allPrimeCumulativeValues[numericalValue]);
    }
};