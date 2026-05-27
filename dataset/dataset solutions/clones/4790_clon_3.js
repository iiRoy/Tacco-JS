const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const linesArray = fileContent.split('\n');

const firstLine = linesArray.shift();
const lineParts = firstLine.split(' ');

const firstNum = Number(lineParts[0]);
const secondNum = Number(lineParts[1]);

let resultCount = 0;

if (firstNum === secondNum) {
    // No change to resultCount
} else {
    let intermediateCount = 0;

    if (firstNum > secondNum) {
        // Case where firstNum is strictly greater than secondNum
        if (secondNum >= 0) {
            // Both positive or firstNum positive and secondNum zero
            intermediateCount = 2;
        } else { // secondNum is negative
            if (firstNum > 0) {
                // firstNum positive, secondNum negative
                intermediateCount = 1;
            } else {
                // firstNum non-positive (zero or negative), secondNum negative
                // (e.g., 0, -5 or -2, -5)
                intermediateCount = 2;
            }
        }
    } else { // firstNum < secondNum
        // Case where firstNum is strictly less than secondNum
        if (firstNum < 0 && secondNum > 0) {
            // firstNum negative, secondNum positive
            intermediateCount = 1;
        }
        // For other scenarios (e.g., both positive, both negative, firstNum zero and secondNum positive, firstNum negative and secondNum zero),
        // intermediateCount remains 0 as per original logic.
    }
    
    resultCount = intermediateCount;

    const absFirst = Math.abs(firstNum);
    const absSecond = Math.abs(secondNum);
    resultCount += Math.abs(absFirst - absSecond);
}

console.log(resultCount);
