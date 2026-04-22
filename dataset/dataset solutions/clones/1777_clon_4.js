function executeNumericalAnalysis(sourceInputText) {
    const numericContentMatch = sourceInputText.match(/\n([\d\s]+)/);
    if (!numericContentMatch || !numericContentMatch[1]) {
        console.log(0);
        return;
    }

    const processedIntegers = numericContentMatch[1].split(' ').map(val => parseInt(val, 10));

    const resultantTally = processedIntegers.filter((elementUnderTest, currentIndex) => {
        return !processedIntegers.some((comparisonCandidate, otherIndex) => {
            const positionsAreDistinct = (currentIndex !== otherIndex);
            const divisorIsNonZero = (comparisonCandidate !== 0);
            const isPerfectlyDivisible = Number.isInteger(elementUnderTest / comparisonCandidate);

            return positionsAreDistinct && divisorIsNonZero && isPerfectlyDivisible;
        });
    }).length;

    console.log(resultantTally);
}

executeNumericalAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));