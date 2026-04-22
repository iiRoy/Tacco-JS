function createNumericSeries(upperBound) {
    const terms = [0];
    let k = 1;
    let termValue;
    while (true) {
        termValue = (k * (k + 1) * (k + 2)) / 6;
        if (termValue > upperBound) {
            break;
        }
        terms.push(termValue);
        k++;
    }
    return terms;
}

function createOddNumericSeries(upperBound) {
    const allNumericTerms = createNumericSeries(upperBound);
    const oddTermsCollection = [0];
    for (let index = 1; index < allNumericTerms.length; index++) {
        if (allNumericTerms[index] % 2 !== 0) {
            oddTermsCollection.push(allNumericTerms[index]);
        }
    }
    return oddTermsCollection;
}

function determineMinimumParts(capValue, availableDenominations) {
    const minimumCount = new Array(capValue + 1).fill(Number.POSITIVE_INFINITY);
    minimumCount[0] = 0;

    for (let denomIndex = 1; denomIndex < availableDenominations.length; denomIndex++) {
        const currentDenomination = availableDenominations[denomIndex];
        for (let currentSum = currentDenomination; currentSum <= capValue; currentSum++) {
            if (minimumCount[currentSum - currentDenomination] !== Number.POSITIVE_INFINITY) {
                minimumCount[currentSum] = Math.min(minimumCount[currentSum], minimumCount[currentSum - currentDenomination] + 1);
            }
        }
    }
    return minimumCount;
}

function processInputSource(sourceText) {
    const lines = sourceText.split("\n");
    const upperCalculationLimit = 1000000;

    const sequenceA_Values = createNumericSeries(upperCalculationLimit);
    const sequenceB_Values = createOddNumericSeries(upperCalculationLimit);

    const resultsA_Table = determineMinimumParts(upperCalculationLimit, sequenceA_Values);
    const resultsB_Table = determineMinimumParts(upperCalculationLimit, sequenceB_Values);

    let currentLinePointer = 0;
    while (true) {
        const queryTarget = parseInt(lines[currentLinePointer], 10);
        if (queryTarget === 0) {
            break;
        }
        const resultForA = resultsA_Table[queryTarget];
        const resultForB = resultsB_Table[queryTarget];

        console.log(resultForA, resultForB);
        currentLinePointer++;
    }
}

processInputSource(require("fs").readFileSync("/dev/stdin", "utf8"));