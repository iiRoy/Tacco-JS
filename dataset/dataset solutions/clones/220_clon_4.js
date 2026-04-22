const calculateDivisorGreatest = (valA, valB) => {
    if (valB === 0) {
        return valA;
    }
    return calculateDivisorGreatest(valB, valA % valB);
};

const fileSystemModule = require('fs');
const rawContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawContent.trim().split('\n').filter(Boolean);

processedLines.forEach(currentLine => {
    const lineComponents = currentLine.split(' ').map(Number);
    const firstOperand = lineComponents[0];
    const secondOperand = lineComponents[1];
    const decimalCountLimit = lineComponents[2];

    // The original code calculates GCD but then uses it in a way that cancels out:
    // (arr[0]/gcd)/(arr[1]/gcd) simplifies to arr[0]/arr[1].
    // To strictly clone the functionality, we still perform the GCD calculation.
    const commonFactor = calculateDivisorGreatest(firstOperand, secondOperand);
    const fractionValue = (firstOperand / commonFactor) / (secondOperand / commonFactor);

    // The original loop sums digits at specific decimal places.
    // When `n` in `while(n--)` is `k`, `toFixed(k+2)` is used, and `slice(-2)[0]` extracts the `(k+1)`-th digit.
    // So, it sums digits from decimal place `1` up to `decimalCountLimit + 1` (1-indexed).
    // The rounding behavior of `toFixed` must be replicated.
    const digitIndicesToSum = Array.from(
        { length: decimalCountLimit + 1 },
        (_, idx) => idx + 1
    ); // Generates [1, 2, ..., decimalCountLimit + 1]

    const totalAccumulatedDigits = digitIndicesToSum.reduce((currentTotal, placeIndex) => {
        // `placeIndex` represents the 1-indexed decimal place whose digit we want to sum.
        // In the original, this corresponds to `n+1`.
        // The `toFixed` parameter in the original was `n+2`, which is `(placeIndex - 1) + 2 = placeIndex + 1`.
        const roundingTargetDepth = placeIndex + 1;

        // Step 1: Mathematically round the fractionValue to `roundingTargetDepth` decimal places.
        const roundingScale = 10 ** roundingTargetDepth;
        const roundedEquivalentValue = Math.round(fractionValue * roundingScale) / roundingScale;

        // Step 2: Extract the digit at `placeIndex` from the *mathematically rounded* value.
        const extractionScale = 10 ** placeIndex;
        const isolatedDigit = Math.floor(roundedEquivalentValue * extractionScale) % 10;

        return currentTotal + isolatedDigit;
    }, 0);

    console.log(totalAccumulatedDigits);
});