const processInputData = (rawContent) => {
    const [firstLine] = rawContent.split('\n');
    const [requiredCount, targetValue] = firstLine.split(' ').map(Number);
    return { requiredCount, targetValue };
};

const calculatePrimeFrequency = (numberToFactor) => {
    const factorMap = new Map();
    let currentDivisorCandidate = 2;
    let remainingValue = numberToFactor;

    while (remainingValue % currentDivisorCandidate === 0) {
        factorMap.set(currentDivisorCandidate, (factorMap.get(currentDivisorCandidate) || 0) + 1);
        remainingValue /= currentDivisorCandidate;
    }
    currentDivisorCandidate++;

    while (currentDivisorCandidate * currentDivisorCandidate <= remainingValue) {
        while (remainingValue % currentDivisorCandidate === 0) {
            factorMap.set(currentDivisorCandidate, (factorMap.get(currentDivisorCandidate) || 0) + 1);
            remainingValue /= currentDivisorCandidate;
        }
        currentDivisorCandidate += 2;
    }

    if (remainingValue > 1) {
        factorMap.set(remainingValue, (factorMap.get(remainingValue) || 0) + 1);
    }

    return factorMap;
};

const executeSolution = (sourceString) => {
    const { requiredCount, targetValue } = processInputData(sourceString);

    if (requiredCount === 1) {
        console.log(1);
        return;
    }

    let resultantProduct = 1;
    const primeOccurrences = calculatePrimeFrequency(targetValue);

    for (const [factorValue, occurrenceCount] of primeOccurrences.entries()) {
        if (occurrenceCount >= requiredCount) {
            resultantProduct *= factorValue;
        }
    }

    console.log(resultantProduct);
};

executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));