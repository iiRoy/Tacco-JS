function obtainSmallestSumOfDigits(sourceText) {
    const initialLineContent = sourceText.split('\n')[0];
    const baseMultiplierValue = Number.parseInt(initialLineContent.split(' ')[0], 10);

    const finalMinimumSum = Array.from({ length: 100000 }, (_, idx) => idx + 1)
        .reduce((currentMin, cycleCount) => {
            const calculatedProduct = baseMultiplierValue * cycleCount;

            let numericalValue = calculatedProduct;
            let digitTotal = 0;
            while (numericalValue > 0) {
                digitTotal += numericalValue % 10;
                numericalValue = Math.floor(numericalValue / 10);
            }
            return Math.min(currentMin, digitTotal);
        }, Number.POSITIVE_INFINITY);

    console.log(finalMinimumSum);
}

obtainSmallestSumOfDigits(require('fs').readFileSync('/dev/stdin', 'utf8'));