const calculatePrimesUpTo = (upperLimit) => {
    const isComposite = new Array(upperLimit + 1).fill(false);
    isComposite[0] = true;
    isComposite[1] = true;

    const collectedPrimes = [];
    for (let currentNumber = 2; currentNumber <= upperLimit; currentNumber += 1) {
        if (!isComposite[currentNumber]) {
            collectedPrimes.push(currentNumber);
            let multiple = currentNumber * currentNumber;
            while (multiple <= upperLimit) {
                isComposite[multiple] = true;
                multiple += currentNumber;
            }
        }
    }
    return collectedPrimes;
};

const findCommonDivisor = (firstNum, secondNum) => {
    while (secondNum !== 0) {
        const temp = secondNum;
        secondNum = firstNum % secondNum;
        firstNum = temp;
    }
    return firstNum;
};

function* generateNumberTokens(rawStringContent) {
    const lines = rawStringContent.split("\n");
    for (const currentLine of lines) {
        if (currentLine.trim() === "") continue;
        const tokens = currentLine.trim().split(" ");
        for (const token of tokens) {
            if (token !== "") {
                yield Number(token);
            }
        }
    }
}

const verifyPrimeCondition = (candidatePrime, valueArray, limitIndex) => {
    if (valueArray[0] % candidatePrime !== 0) {
        return false;
    }

    for (let currentOffset = 1; currentOffset < candidatePrime; currentOffset++) {
        let cumulativeSum = 0;
        let traversalIndex = currentOffset;
        while (traversalIndex <= limitIndex) {
            cumulativeSum += valueArray[traversalIndex];
            traversalIndex += (candidatePrime - 1);
        }
        if (cumulativeSum % candidatePrime !== 0) {
            return false;
        }
    }
    return true;
};

const executeProgram = (programInput) => {
    const tokenIterator = generateNumberTokens(programInput);

    const dataSize = tokenIterator.next().value;
    const dataCollection = Array.from({ length: dataSize + 1 }, () => tokenIterator.next().value);
    dataCollection.reverse();

    const maximumDivisor = dataCollection.reduce((accumulator, currentElement) =>
        findCommonDivisor(accumulator, currentElement)
    );

    const scaledDataCollection = dataCollection.map(val => val / maximumDivisor);

    const primeNumberCache = calculatePrimesUpTo(100000);

    const derivedFactors = primeNumberCache.filter(p => p <= dataSize)
                                         .filter(p => verifyPrimeCondition(p, scaledDataCollection, dataSize));

    let remainingCommonDivisor = maximumDivisor;
    let commonDivisorFactors = [];
    let primeIteratorIndex = 0;

    while (remainingCommonDivisor > 1 && primeIteratorIndex < primeNumberCache.length) {
        const currentPrimeFactor = primeNumberCache[primeIteratorIndex];
        if (remainingCommonDivisor % currentPrimeFactor === 0) {
            commonDivisorFactors.push(currentPrimeFactor);
            while (remainingCommonDivisor % currentPrimeFactor === 0) {
                remainingCommonDivisor /= currentPrimeFactor;
            }
        }
        primeIteratorIndex++;
    }
    if (remainingCommonDivisor > 1) {
        commonDivisorFactors.push(remainingCommonDivisor);
    }

    const allCandidateFactors = [...derivedFactors, ...commonDivisorFactors];

    const uniqueSortedFactors = Array.from(new Set(allCandidateFactors)).sort((a, b) => a - b);

    let lastPrintedValue;
    uniqueSortedFactors.forEach(currentFactor => {
        if (lastPrintedValue !== currentFactor) {
            console.log(currentFactor);
        }
        lastPrintedValue = currentFactor;
    });
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));