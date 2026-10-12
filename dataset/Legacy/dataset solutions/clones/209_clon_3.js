const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const textEncodingFormat = "utf8";

const rawInputData = fileSystemModule.readFileSync(standardInputFilePath, textEncodingFormat);
const inputDataLines = rawInputData.split('\n');

/**
 * Computes the number of trailing zeros in the factorial of a given non-negative integer.
 * This is based on Legendre's formula, which counts factors of 5.
 * @param {number} inputNumber The number for which to calculate factorial trailing zeros.
 * @returns {number} The count of trailing zeros.
 */
function computeFactorialZeroCount(inputNumber) {
    let currentDivisor = inputNumber;
    let totalZeroCount = 0;

    // A guard clause: Factorials of non-positive numbers are not typically defined in this context,
    // or result in 0 trailing zeros. The original code implicitly handles this by not processing/printing.
    if (currentDivisor <= 0) {
        return 0;
    }

    // The loop continues as long as currentDivisor, after division by 5, is still greater than 0.
    // Each iteration adds the floor of currentDivisor / 5 to the total count.
    while (true) {
        currentDivisor = Math.floor(currentDivisor / 5);
        if (currentDivisor === 0) {
            break; // Exit condition: no more factors of 5
        }
        totalZeroCount += currentDivisor;
    }

    return totalZeroCount;
}

inputDataLines.forEach(function(lineContent) {
    const numericValue = Number(lineContent); // Explicitly convert string to number

    // The original code only performs calculation and prints if the number is truthy (non-zero).
    // This condition ensures exact behavioral equivalence.
    if (numericValue > 0) {
        const calculatedZeros = computeFactorialZeroCount(numericValue);
        console.log(calculatedZeros);
    }
    // If numericValue is 0 or less, the original code does nothing, so we also do nothing.
});
