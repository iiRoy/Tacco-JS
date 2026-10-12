function calculateGreatestCommonDivisor(firstNumber, secondNumber) {
    let currentLarger = firstNumber;
    let currentSmaller = secondNumber;

    // Ensure currentLarger is always greater than or equal to currentSmaller
    // This is a structural modification to the initial setup.
    if (currentSmaller > currentLarger) {
        const tempSwap = currentLarger;
        currentLarger = currentSmaller;
        currentSmaller = tempSwap;
    }

    while (currentSmaller !== 0) {
        // Introduce a temporary variable for the remainder
        const remainderValue = currentLarger % currentSmaller;
        currentLarger = currentSmaller;
        currentSmaller = remainderValue;
    }
    return currentLarger;
}

// Introduce a temporary constant for the 'fs' module for clarity
const fileSystemHandler = require('fs');

// Helper function to extract a specific decimal digit based on original logic
function extractNthDecimalDigit(valueToProcess, decimalPlacesCount) {
    // The original logic was `(num.toFixed(n+2)).slice(-2)[0]`.
    // `decimalPlacesCount` here corresponds to `n+2` from the original code.
    // `toFixed(X)` formats the number to X decimal places.
    // `slice(-2)` gets the last two characters of the string.
    // `[0]` gets the first of those two characters (which is the second-to-last character of the full string).
    // This effectively extracts the digit at the `(decimalPlacesCount - 1)`-th position after the decimal point.
    const formattedString = valueToProcess.toFixed(decimalPlacesCount);
    const lastTwoChars = formattedString.slice(-2);
    // Convert the character digit to a number
    return parseInt(lastTwoChars[0], 10);
}

const rawInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputContent.trim().split('\n');

for (let lineIndex = 0; lineIndex < inputLinesArray.length; lineIndex++) {
    // Split the current line into string components
    const stringComponents = inputLinesArray[lineIndex].split(' ');
    // Convert string components to numerical values
    const numericalValues = stringComponents.map(component => Number(component));

    const operandA = numericalValues[0];
    const operandB = numericalValues[1];
    const initialLoopCount = numericalValues[2];

    const greatestCommonDivisor = calculateGreatestCommonDivisor(operandA, operandB);

    // Calculate the fractional result, preserving the original structure of division by GCD
    const reducedNumerator = operandA / greatestCommonDivisor;
    const reducedDenominator = operandB / greatestCommonDivisor;
    const finalFractionalResult = reducedNumerator / reducedDenominator;

    let accumulatedDigitSum = 0;

    // Rewrite the `while(n--)` loop as a `for` loop for structural modification.
    // The original `n` in `toFixed(n+2)` decreased from `initialLoopCount - 1` down to `0`.
    // So `n+2` decreased from `initialLoopCount + 1` down to `2`.
    // In this `for` loop, `k` goes from `0` to `initialLoopCount - 1`.
    // The equivalent `decimalPlacesCount` for `toFixed` is `initialLoopCount + 1 - k`.
    for (let k = 0; k < initialLoopCount; k++) {
        const currentDecimalPrecision = initialLoopCount + 1 - k;
        const digitToAdd = extractNthDecimalDigit(finalFractionalResult, currentDecimalPrecision);
        accumulatedDigitSum += digitToAdd;
    }

    console.log(accumulatedDigitSum);
}
