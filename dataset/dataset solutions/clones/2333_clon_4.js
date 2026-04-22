const obtainPrimeFactorSum = (valueToProcess, primeDivisor) => {
    if (valueToProcess < primeDivisor) {
        return 0n;
    }
    const nextDividend = valueToProcess / primeDivisor;
    return nextDividend + obtainPrimeFactorSum(nextDividend, primeDivisor);
};

const determineFactorialCount = (providedText) => {
    const textSegments = providedText.trim().split("\n");
    const inputNumericalValue = BigInt(textSegments[0]);

    if (inputNumericalValue % 2n !== 0n) {
        console.log(0);
        return;
    }

    const derivedHalfValue = inputNumericalValue / 2n;
    const cumulativeFactorTotal = obtainPrimeFactorSum(derivedHalfValue, 5n);

    console.log(cumulativeFactorTotal.toString());
};

determineFactorialCount(require('fs').readFileSync('/dev/stdin', 'utf8'));