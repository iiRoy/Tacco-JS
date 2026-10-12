const createSourceReader = (allText) => {
    let lines = allText.trim().split('\n');
    let lineIndex = 0;
    let currentLineTokens = [];

    const ensureCurrentLineTokens = () => {
        if (currentLineTokens.length === 0 && lineIndex < lines.length) {
            currentLineTokens = lines[lineIndex].split(' ');
        }
    };

    const extractNextElement = (asStringFormat = false) => {
        ensureCurrentLineTokens();
        if (currentLineTokens.length === 0) {
            return undefined;
        }
        const extractedValue = currentLineTokens.shift();
        if (currentLineTokens.length === 0) {
            lineIndex++;
        }
        return asStringFormat ? extractedValue : Number(extractedValue);
    };

    const extractFullLine = (asStringFormat = false) => {
        if (lineIndex >= lines.length) return undefined;
        currentLineTokens = [];
        const lineContent = lines[lineIndex];
        lineIndex++;
        const parts = lineContent.split(' ');
        return asStringFormat ? parts : parts.map(Number);
    };

    const extractGridData = (count, asStringFormat = false) => {
        const collectedRows = [];
        currentLineTokens = [];
        for (let i = 0; i < count; i++) {
            if (lineIndex >= lines.length) break;
            const lineContent = lines[lineIndex];
            lineIndex++;
            collectedRows.push(lineContent.split(' '));
        }
        return asStringFormat ? collectedRows : collectedRows.map(row => row.map(Number));
    };

    const extractSequenceData = (count, asStringFormat = false) => {
        const collectedItems = [];
        currentLineTokens = [];
        for (let i = 0; i < count; i++) {
            if (lineIndex >= lines.length) break;
            const lineContent = lines[lineIndex];
            lineIndex++;
            collectedItems.push(lineContent);
        }
        return asStringFormat ? collectedItems : collectedItems.map(Number);
    };

    return {
        fetchElement: extractNextElement,
        fetchLine: extractFullLine,
        fetchGrid: extractGridData,
        fetchSequence: extractSequenceData
    };
};

const inputReader = createSourceReader(require("fs").readFileSync("/dev/stdin","utf8"));

const determineHighestCommonFactor = (valOne, valTwo) => {
    while (valTwo !== 0) {
        let tempRemainder = valOne % valTwo;
        valOne = valTwo;
        valTwo = tempRemainder;
    }
    return valOne;
};

const recursivelyFindPrimeDivisors = (currentNumber, potentialDivisor = 2, foundDivisors = new Set()) => {
    if (currentNumber <= 1) return foundDivisors;
    if (potentialDivisor * potentialDivisor > currentNumber) {
        foundDivisors.add(currentNumber);
        return foundDivisors;
    }
    if (currentNumber % potentialDivisor === 0) {
        foundDivisors.add(potentialDivisor);
        while (currentNumber % potentialDivisor === 0) {
            currentNumber /= potentialDivisor;
        }
        return recursivelyFindPrimeDivisors(currentNumber, potentialDivisor, foundDivisors);
    } else {
        return recursivelyFindPrimeDivisors(currentNumber, potentialDivisor + 1, foundDivisors);
    }
};

const generatePrimeSet = (limitValue) => {
    if (limitValue < 2) return new Set();

    const primalityMap = new Map();
    for (let currentNum = 2; currentNum <= limitValue; currentNum++) {
        primalityMap.set(currentNum, true);
    }

    for (let primeCandidate = 2; primeCandidate * primeCandidate <= limitValue; primeCandidate++) {
        if (primalityMap.get(primeCandidate)) {
            for (let multipleOfPrime = primeCandidate * primeCandidate; multipleOfPrime <= limitValue; multipleOfPrime += primeCandidate) {
                primalityMap.set(multipleOfPrime, false);
            }
        }
    }

    const collectedPrimes = new Set();
    primalityMap.forEach((isPrimary, numberValue) => {
        if (isPrimary) {
            collectedPrimes.add(numberValue);
        }
    });
    return collectedPrimes;
};

const executeMainProcess = () => {
    const mainCount = inputReader.fetchElement();
    const dataValues = inputReader.fetchSequence(mainCount + 1);

    const overallCommonDivisor = dataValues.reduce((accumulator, currentElement) =>
        determineHighestCommonFactor(accumulator, currentElement)
    );

    const resultingPrimeFactors = recursivelyFindPrimeDivisors(Math.abs(overallCommonDivisor));

    const scaledData = dataValues.map(item => item / overallCommonDivisor);

    let auxiliaryPrimeFactors = (scaledData[mainCount] === 0)
        ? generatePrimeSet(mainCount)
        : recursivelyFindPrimeDivisors(Math.abs(scaledData[mainCount]));

    auxiliaryPrimeFactors.forEach(candidateNumber => {
        if (resultingPrimeFactors.has(candidateNumber) || mainCount < candidateNumber) {
            return;
        }

        const conditionSatisfied = Array.from({ length: candidateNumber - 1 }, (_, startIndex) => startIndex).every(startPoint => {
            let sumAccumulator = 0;
            for (let currentPosition = startPoint; currentPosition < mainCount; currentPosition += (candidateNumber - 1)) {
                sumAccumulator += scaledData[currentPosition];
            }
            return sumAccumulator % candidateNumber === 0;
        });

        if (conditionSatisfied) {
            resultingPrimeFactors.add(candidateNumber);
        }
    });

    if (resultingPrimeFactors.size > 0) {
        console.log(
            Array.from(resultingPrimeFactors)
                 .sort((valueA, valueB) => valueA - valueB)
                 .join("\n")
        );
    }
};

executeMainProcess();