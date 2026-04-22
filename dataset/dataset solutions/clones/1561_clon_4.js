const interpretDataStream = (rawData) => {
    const lines = rawData.trim().split('\n');
    const totalCount = Number(lines[0]);
    const numberSeries = lines[1].split(' ').map(Number);
    return { totalCount, numberSeries };
};

const obtainLowerPrimes = (upperBoundary) => {
    const potentialPrimes = new Array(upperBoundary + 1).fill(true);
    potentialPrimes[0] = potentialPrimes[1] = false;
    const collectedPrimes = [];

    for (let candidate = 2; candidate * candidate <= upperBoundary; candidate++) {
        if (potentialPrimes[candidate]) {
            collectedPrimes.push(candidate);
            for (let multiple = candidate * candidate; multiple <= upperBoundary; multiple += candidate) {
                potentialPrimes[multiple] = false;
            }
        }
    }
    return collectedPrimes;
};

const collectUniquePrimeDivisors = (targetValue, smallFactorList) => {
    const identifiedDivisors = new Set();
    let currentRemainder = targetValue;

    if (currentRemainder === 1) {
        return [];
    }

    for (const factorCandidate of smallFactorList) {
        if (currentRemainder < factorCandidate) break;
        if (currentRemainder % factorCandidate === 0) {
            identifiedDivisors.add(factorCandidate);
            while (currentRemainder % factorCandidate === 0) {
                currentRemainder /= factorCandidate;
            }
        }
    }

    if (currentRemainder > 1) {
        identifiedDivisors.add(currentRemainder);
    }
    return Array.from(identifiedDivisors);
};

const findCommonDivisor = (valueA, valueB) => {
    while (valueB !== 0) {
        const temporary = valueB;
        valueB = valueA % valueB;
        valueA = temporary;
    }
    return valueA;
};

const processNumberProperties = (inputContent) => {
    const { totalCount, numberSeries } = interpretDataStream(inputContent);

    const maximumValue = Math.max(...numberSeries);
    const primaryDivisorList = obtainLowerPrimes(maximumValue);

    const encounteredOverallDivisors = new Set();
    let areItemsMutuallyExclusive = true;

    for (const item of numberSeries) {
        const itemDivisors = collectUniquePrimeDivisors(item, primaryDivisorList);
        for (const singleDivisor of itemDivisors) {
            if (encounteredOverallDivisors.has(singleDivisor)) {
                areItemsMutuallyExclusive = false;
                break;
            }
        }
        if (!areItemsMutuallyExclusive) break;
        itemDivisors.forEach(singleDivisor => encounteredOverallDivisors.add(singleDivisor));
    }

    if (areItemsMutuallyExclusive) {
        console.log("pairwise coprime");
        return;
    }

    const overallDivisorResult = numberSeries.reduce((accumulatedDivisor, currentNumber) => {
        return findCommonDivisor(accumulatedDivisor, currentNumber);
    });

    if (overallDivisorResult === 1) {
        console.log("setwise coprime");
        return;
    }

    console.log("not coprime");
};

processNumberProperties(require("fs").readFileSync("/dev/stdin", "utf8"));