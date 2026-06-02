const fs = require('fs');
let inputStr = fs.readFileSync('/dev/stdin', 'utf8').trim();

let lessCount = 0;
let greaterCount = 0;
let finalSum = 0;

const startsWithGreaterThan = inputStr[0] === '>';
if (startsWithGreaterThan) {
    inputStr = '<' + inputStr;
}

const calculateSumUpTo = (limit, inclusive) => {
    if (limit < 0) {
        return 0;
    }
    const actualLimit = inclusive ? limit : limit - 1;
    if (actualLimit < 0) {
        return 0;
    }
    return actualLimit * (actualLimit + 1) / 2;
};

const getConsecutiveCharCount = (sourceString, currentPosition, charToMatch) => {
    let count = 0;
    let tempPosition = currentPosition;
    while (tempPosition < sourceString.length && sourceString[tempPosition] === charToMatch) {
        count++;
        tempPosition++;
    }
    return { count: count, nextPosition: tempPosition };
};

let idx = 0;
while (idx < inputStr.length) {
    const lessThanResult = getConsecutiveCharCount(inputStr, idx, '<');
    lessCount = lessThanResult.count;
    idx = lessThanResult.nextPosition;

    const greaterThanResult = getConsecutiveCharCount(inputStr, idx, '>');
    greaterCount = greaterThanResult.count;
    idx = greaterThanResult.nextPosition;

    if (lessCount > greaterCount) {
        finalSum += calculateSumUpTo(lessCount, true);
        finalSum += calculateSumUpTo(greaterCount, false);
    } else {
        finalSum += calculateSumUpTo(lessCount, false);
        finalSum += calculateSumUpTo(greaterCount, true);
    }
}

console.log(finalSum);
