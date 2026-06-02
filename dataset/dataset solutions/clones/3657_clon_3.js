var rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n");
var numericStringElements = rawInputLines[1].split(" ");

const computeRemainderSum = (currentDivisor, elementsForModulo) => {
    let accumulatedSum = 0;
    for (const elementStringValue of elementsForModulo) {
        const parsedNumericValue = Number(elementStringValue);
        accumulatedSum += currentDivisor % parsedNumericValue;
    }
    return accumulatedSum;
};

let greatestRemainderSum = 0;
let iterationCounter = 1;
let continueProcessing = true;

while (continueProcessing) {
    const currentSumOfRemainders = computeRemainderSum(iterationCounter, numericStringElements);

    if (currentSumOfRemainders === 0) {
        continueProcessing = false;
    } else {
        if (greatestRemainderSum < currentSumOfRemainders) {
            greatestRemainderSum = currentSumOfRemainders;
        }
        iterationCounter++;
    }
}

console.log(greatestRemainderSum);
