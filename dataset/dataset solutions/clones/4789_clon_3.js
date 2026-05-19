const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = inputData.split('\n');
const firstInputLine = allInputLines.shift();
const lineParts = firstInputLine.split(' ');

const firstNum = Number(lineParts[0]);
const secondNum = Number(lineParts[1]);

let totalCount = 0;

if (firstNum === secondNum) {
    // If numbers are equal, totalCount remains 0.
} else {
    let initialAdjustment = 0;
    const isFirstNumNonNegative = firstNum >= 0;
    const isSecondNumNonNegative = secondNum >= 0;

    if (isFirstNumNonNegative === isSecondNumNonNegative) { // Both numbers have the same sign (or one/both are zero)
        if (firstNum > secondNum) {
            // Example: (5, 2) or (-2, -5)
            initialAdjustment = 2;
        }
        // If firstNum < secondNum (e.g., 2, 5 or -5, -2), initialAdjustment remains 0.
    } else { // Numbers have different signs
        // Example: (5, -2) or (-2, 5)
        initialAdjustment = 1;
    }
    
    totalCount += initialAdjustment;

    const absoluteValueOfFirst = Math.abs(firstNum);
    const absoluteValueOfSecond = Math.abs(secondNum);
    const absoluteDifferenceOfAbsolutes = Math.abs(absoluteValueOfFirst - absoluteValueOfSecond);
    
    totalCount += absoluteDifferenceOfAbsolutes;
}

console.log(totalCount);
