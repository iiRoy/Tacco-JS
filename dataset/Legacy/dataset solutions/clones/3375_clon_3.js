function processInput(rawData) {
    const lines = rawData.split('\n');
    const numParts = lines[0].split(' ');

    const factorCountThreshold = parseInt(numParts[0], 10);
    const targetNumber = parseInt(numParts[1], 10);

    if (factorCountThreshold === 1) {
        console.log(factorCountThreshold);
        return 0;
    }

    let currentPrimeCandidate = 7;
    let primeStepIncrement = 4;

    const decomposeIntoPrimeFactors = (numberToFactor) => {
        if (numberToFactor < 2) {
            return [];
        }
        if (numberToFactor === 2 || numberToFactor === 3 || numberToFactor === 5) {
            return [numberToFactor];
        }

        const checkAndRecurse = (divisor) => {
            if (numberToFactor % divisor === 0) {
                return [divisor, ...decomposeIntoPrimeFactors(numberToFactor / divisor)];
            }
            return null;
        };

        let initialFactorResult = checkAndRecurse(2);
        if (initialFactorResult !== null) {
            return initialFactorResult;
        }
        initialFactorResult = checkAndRecurse(3);
        if (initialFactorResult !== null) {
            return initialFactorResult;
        }
        initialFactorResult = checkAndRecurse(5);
        if (initialFactorResult !== null) {
            return initialFactorResult;
        }

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

    const allFactors = decomposeIntoPrimeFactors(targetNumber);

    const factorFrequencies = {};

    for (const currentFactor of allFactors) {
        factorFrequencies[currentFactor] = (factorFrequencies[currentFactor] || 0) + 1;
    }

    let resultProduct = 1;

    const uniqueFactors = Object.keys(factorFrequencies);

    for (const factorKey of uniqueFactors) {
        const factorValue = parseInt(factorKey, 10);
        const factorCount = factorFrequencies[factorKey];

        if (factorCount >= factorCountThreshold) {
            resultProduct *= factorValue;
        }
    }

    console.log(resultProduct);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
