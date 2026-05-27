function processInput(rawData) {
    const lines = rawData.split('\n');
    const numParts = lines[0].split(' ');

    const parseNumericValue = (str) => parseInt(str, 10);

    const [targetCountStr, productValueStr] = numParts;
    const targetCount = parseNumericValue(targetCountStr);
    const productValue = parseNumericValue(productValueStr);

    if (targetCount === 1) {
        console.log(targetCount);
        return 0;
    }

    let currentPrimeCandidate = 7;
    let primeStepIncrement = 4;

    const decomposeIntoPrimeFactors = (numberToFactor) => {
        if (numberToFactor < 2) return [];
        if (numberToFactor === 2 || numberToFactor === 3 || numberToFactor === 5) return [numberToFactor];

        if (numberToFactor % 2 === 0) return [2, ...decomposeIntoPrimeFactors(numberToFactor / 2)];
        if (numberToFactor % 3 === 0) return [3, ...decomposeIntoPrimeFactors(numberToFactor / 3)];
        if (numberToFactor % 5 === 0) return [5, ...decomposeIntoPrimeFactors(numberToFactor / 5)];

        const sqrtLimit = Math.sqrt(numberToFactor);

        while (currentPrimeCandidate <= sqrtLimit) {
            if (numberToFactor % currentPrimeCandidate === 0) {
                return [currentPrimeCandidate, ...decomposeIntoPrimeFactors(numberToFactor / currentPrimeCandidate)];
            }
            currentPrimeCandidate += primeStepIncrement;
            primeStepIncrement = 6 - primeStepIncrement;
        }
        return [numberToFactor];
    };

    const allFactors = decomposeIntoPrimeFactors(productValue);

    const factorFrequencies = allFactors.reduce((accumulator, factor) => {
        accumulator[factor] = (accumulator[factor] || 0) + 1;
        return accumulator;
    }, {});

    console.log(factorFrequencies.length);

    if (factorFrequencies.length === 0) {
        console.log(productValue);
        return 0;
    }

    let resultProduct = 1;

    for (const [factorStr, count] of Object.entries(factorFrequencies)) {
        const factorValue = parseNumericValue(factorStr);
        if (count >= targetCount) {
            resultProduct *= factorValue;
        }
    }

    console.log(resultProduct);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
