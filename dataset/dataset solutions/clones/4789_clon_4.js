const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const parsedLine = inputLines.shift().split(' ');
const firstNum = parsedLine[0] * 1;
const secondNum = parsedLine[1] * 1;

let resultCount;

if (firstNum === secondNum) {
    resultCount = 0;
} else {
    const isFirstNonNegative = firstNum >= 0;
    const isSecondNonNegative = secondNum >= 0;
    const isFirstGreater = firstNum > secondNum;

    let conditionKey = 0;
    if (isFirstNonNegative) conditionKey |= 1;
    if (isSecondNonNegative) conditionKey |= 2;
    if (isFirstGreater) conditionKey |= 4;

    const additionalValueLookup = [
        0,
        2,
        1,
        null,
        null,
        1,
        0,
        2
    ];

    const additionalCost = additionalValueLookup[conditionKey];
    resultCount = additionalCost + Math.abs(Math.abs(firstNum) - Math.abs(secondNum));
}

console.log(resultCount);
