function performCalculation(rawEntry) {
    const subjectNumber = Number.parseInt(rawEntry, 10);

    function locateSmallestMaxDigitCount(currentAttempt, bestResultSoFar) {
        if (currentAttempt * currentAttempt > subjectNumber) {
            return bestResultSoFar;
        }

        let updatedBestResult = bestResultSoFar;

        if (subjectNumber % currentAttempt === 0) {
            const firstFactor = currentAttempt;
            const secondFactor = subjectNumber / currentAttempt;

            const digitsOfFirst = String(firstFactor).length;
            const digitsOfSecond = String(secondFactor).length;

            const currentPairMaxDigits = Math.max(digitsOfFirst, digitsOfSecond);

            updatedBestResult = Math.min(bestResultSoFar, currentPairMaxDigits);
        }

        return locateSmallestMaxDigitCount(currentAttempt + 1, updatedBestResult);
    }

    const finalOutcome = locateSmallestMaxDigitCount(1, Infinity);

    console.log(finalOutcome);
}

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));