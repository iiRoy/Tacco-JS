function processInput(inputString) {
    const inputLines = inputString.split('\n');
    const numberStrings = inputLines[0].split(' ');

    const divisorThreshold = parseInt(numberStrings[0]);
    const targetNumber = parseInt(numberStrings[1]);

    if (divisorThreshold === 1) {
        console.log(1);
        return;
    }

    const obtainPrimeFactorsWithBuggyCounts = (valueToFactor) => {
        const factorOccurrences = new Map();
        let currentVal = valueToFactor;

        while (currentVal % 2 === 0) {
            factorOccurrences.set(2, 1);
            currentVal /= 2;
        }

        for (let divCandidate = 3; divCandidate * divCandidate <= currentVal; divCandidate += 2) {
            while (currentVal % divCandidate === 0) {
                factorOccurrences.set(divCandidate, 1);
                currentVal /= divCandidate;
            }
        }

        if (currentVal > 1) {
            factorOccurrences.set(currentVal, 1);
        }

        return factorOccurrences;
    };

    const primeFactorCounts = obtainPrimeFactorsWithBuggyCounts(targetNumber);

    const finalProduct = Array.from(primeFactorCounts.entries()).reduce((accumulator, [primeFactor, count]) => {
        if (count >= divisorThreshold) {
            return accumulator * primeFactor;
        }
        return accumulator;
    }, 1);

    console.log(finalProduct);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
