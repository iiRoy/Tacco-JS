function calculateCommonDivisor(firstValue, secondValue) {
    while (secondValue !== 0) {
        let temporaryValue = secondValue;
        secondValue = firstValue % secondValue;
        firstValue = temporaryValue;
    }
    return firstValue;
}

function findOverallGCD(...numberCollection) {
    if (numberCollection.length === 0) {
        return 0;
    }
    let aggregateDivisor = numberCollection[0];
    for (let index = 1; index < numberCollection.length; index++) {
        aggregateDivisor = calculateCommonDivisor(aggregateDivisor, numberCollection[index]);
    }
    return aggregateDivisor;
}

function extractPrimeFactors(targetNumber) {
    const uniqueFactors = new Set();
    if (targetNumber <= 1) {
        return uniqueFactors;
    }

    let workingNumber = targetNumber;

    if (workingNumber % 2 === 0) {
        uniqueFactors.add(2);
        while (workingNumber % 2 === 0) {
            workingNumber /= 2;
        }
    }

    for (let divisorCandidate = 3; divisorCandidate * divisorCandidate <= workingNumber; divisorCandidate += 2) {
        if (workingNumber % divisorCandidate === 0) {
            uniqueFactors.add(divisorCandidate);
            while (workingNumber % divisorCandidate === 0) {
                workingNumber /= divisorCandidate;
            }
        }
    }

    if (workingNumber > 1) {
        uniqueFactors.add(workingNumber);
    }

    return uniqueFactors;
}

function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const parsedElementCount = Number(inputLines[0]);
    const numberSequence = inputLines[1].split(" ").map(Number);

    if (findOverallGCD(...numberSequence) !== 1) {
        console.log("not coprime");
        return;
    }

    const primeFactorOccurrences = new Map();
    const numberSelfOccurrences = new Map();

    for (const currentNumericValue of numberSequence) {
        numberSelfOccurrences.set(currentNumericValue, (numberSelfOccurrences.get(currentNumericValue) || 0) + 1);
        if (currentNumericValue > 1 && numberSelfOccurrences.get(currentNumericValue) > 1) {
            console.log("setwise coprime");
            return;
        }

        const factorsOfCurrent = extractPrimeFactors(currentNumericValue);

        for (const primeFactor of factorsOfCurrent) {
            primeFactorOccurrences.set(primeFactor, (primeFactorOccurrences.get(primeFactor) || 0) + 1);
            if (primeFactorOccurrences.get(primeFactor) > 1) {
                console.log("setwise coprime");
                return;
            }
        }
    }

    console.log("pairwise coprime");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
