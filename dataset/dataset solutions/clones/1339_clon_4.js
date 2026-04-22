let sourceData = '';
process.stdin.on('data', (fragment) => {
    sourceData += fragment;
});

process.stdin.on('end', () => {
    const initialNumericValue = parseInt(sourceData.trim(), 10);
    const retainedOriginalValue = initialNumericValue;

    function recursivelyFactorize(numberToAnalyze, currentDivisor = 2, collectedPrimeFactors = []) {
        if (numberToAnalyze === 1) {
            return collectedPrimeFactors;
        }

        // Equivalent to checking up to Math.sqrt(numberToAnalyze)
        // If currentDivisor squared exceeds numberToAnalyze, and numberToAnalyze is still > 1,
        // then numberToAnalyze itself must be the remaining prime factor.
        if (currentDivisor * currentDivisor > numberToAnalyze) {
            if (numberToAnalyze > 1) {
                return [...collectedPrimeFactors, numberToAnalyze];
            }
            return collectedPrimeFactors;
        }

        if (numberToAnalyze % currentDivisor === 0) {
            // currentDivisor is a factor, add it and continue with the quotient
            return recursivelyFactorize(
                numberToAnalyze / currentDivisor,
                currentDivisor,
                [...collectedPrimeFactors, currentDivisor]
            );
        } else {
            // currentDivisor is not a factor, try the next candidate
            const subsequentDivisor = currentDivisor === 2 ? 3 : currentDivisor + 2; // Check 2, then only odd numbers
            return recursivelyFactorize(numberToAnalyze, subsequentDivisor, collectedPrimeFactors);
        }
    }

    const ultimateFactorCollection = recursivelyFactorize(initialNumericValue);

    console.log(`${retainedOriginalValue}: ${ultimateFactorCollection.join(' ')}`);
});