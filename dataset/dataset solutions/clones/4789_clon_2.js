let inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

let firstLineParts = inputLines.shift().split(' ');

let firstValue = firstLineParts[0] * 1;
let secondValue = firstLineParts[1] * 1;

let operationCount = 0;

if (firstValue == secondValue) {
    // If the two numbers are identical, no initial operations are needed.
    // This block is intentionally left empty, mirroring the original logic.
} else {
    // If the numbers are different, we proceed with conditional adjustments.
    if (firstValue > secondValue) {
        // Case where the first number is greater than the second.
        if (firstValue >= 0 && secondValue >= 0) {
            // Both numbers are non-negative.
            operationCount += 2;
        } else if (firstValue >= 0 && secondValue < 0) {
            // First number is non-negative, second number is negative.
            operationCount += 1;
        } else {
            // Both numbers are negative (e.g., -2 > -5).
            operationCount += 2;
        }
    } else {
        // Case where the first number is less than the second.
        if (firstValue >= 0 && secondValue >= 0) {
            // Both numbers are non-negative. No initial operations.
        } else if (firstValue < 0 && secondValue >= 0) {
            // First number is negative, second number is non-negative.
            operationCount += 1;
        }
        // If both are negative (e.g., -5 < -2), this inner block is skipped.
    }
    // Finally, add the absolute difference of their absolute values to the total count.
    operationCount += Math.abs(Math.abs(firstValue) - Math.abs(secondValue));
}

console.log(operationCount);
