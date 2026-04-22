function* numberSequenceGenerator(sourceText) {
    const textLines = sourceText.split('\n');
    for (const singleLine of textLines) {
        const lineParts = singleLine.trim().split(' ');
        for (const part of lineParts) {
            if (part) yield Number(part);
        }
    }
}

const producePrimesEfficiently = (maximumValue) => {
    if (maximumValue < 2) return [];
    let potentialPrimes = new Set();
    for (let i = 2; i <= maximumValue; i++) {
        potentialPrimes.add(i);
    }

    let currentPrimeCandidate = 2;
    while (currentPrimeCandidate * currentPrimeCandidate <= maximumValue) {
        if (potentialPrimes.has(currentPrimeCandidate)) {
            for (let multiple = currentPrimeCandidate * currentPrimeCandidate; multiple <= maximumValue; multiple += currentPrimeCandidate) {
                potentialPrimes.delete(multiple);
            }
        }
        currentPrimeCandidate++;
    }
    return Array.from(potentialPrimes).sort((a,b)=>a-b);
};

const findCommonDivisor = (valOne, valTwo) => {
    let currentA = Math.abs(valOne);
    let currentB = Math.abs(valTwo);
    while (currentB !== 0) {
        const tempHolder = currentB;
        currentB = currentA % currentB;
        currentA = tempHolder;
    }
    return currentA;
};

const decomposeIntoPrimeFactors = (targetNumber, availablePrimes, accumulatedFactors = new Set()) => {
    if (targetNumber <= 1) return accumulatedFactors;

    for (const primeCandidate of availablePrimes) {
        if (primeCandidate * primeCandidate > targetNumber) { 
            if (targetNumber > 1) accumulatedFactors.add(targetNumber);
            return accumulatedFactors;
        }
        if (targetNumber % primeCandidate === 0) {
            accumulatedFactors.add(primeCandidate);
            return decomposeIntoPrimeFactors(targetNumber / primeCandidate, availablePrimes, accumulatedFactors);
        }
    }
    if (targetNumber > 1) accumulatedFactors.add(targetNumber);
    return accumulatedFactors;
};

const primaryPrimeList = producePrimesEfficiently(100000);

function processDataEntry(dataContent) {
    const inputNumbers = numberSequenceGenerator(dataContent);

    const dataCount = inputNumbers.next().value;
    const numberContainer = [];
    for (let countIdx = 0; countIdx <= dataCount; ++countIdx) {
        numberContainer.push(inputNumbers.next().value);
    }

    const invertedSequence = numberContainer.reverse();

    const overallGreatestCommonDivisor = invertedSequence.reduce((accumulator, currentElement) =>
        findCommonDivisor(accumulator, currentElement),
        invertedSequence[0]
    );

    const normalizedElements = invertedSequence.map(val => val / overallGreatestCommonDivisor);

    let finalResultsCollection = new Set();

    const primesForTesting = primaryPrimeList.filter(candidatePrime => candidatePrime <= dataCount);

    primesForTesting.forEach(currentTestPrime => {
        if (normalizedElements[0] % currentTestPrime !== 0) {
            return;
        }

        const allSumsSatisfied = Array.from({ length: currentTestPrime - 1 }, (_, startOffset) => startOffset + 1)
            .every(initialPosition => {
                let currentTotal = 0;
                let currentPointer = initialPosition;
                while (currentPointer <= dataCount) {
                    currentTotal += normalizedElements[currentPointer];
                    currentPointer += (currentTestPrime - 1);
                }
                return currentTotal % currentTestPrime === 0;
            });

        if (allSumsSatisfied) {
            finalResultsCollection.add(currentTestPrime);
        }
    });

    const gcdPrimeFactors = decomposeIntoPrimeFactors(overallGreatestCommonDivisor, primaryPrimeList);
    gcdPrimeFactors.forEach(factor => finalResultsCollection.add(factor));

    const sortedUniqueResults = Array.from(finalResultsCollection).sort((itemA, itemB) => itemA - itemB);
    
    for (const res of sortedUniqueResults) {
        console.log(res);
    }
}

processDataEntry(require("fs").readFileSync("/dev/stdin", "utf8"));