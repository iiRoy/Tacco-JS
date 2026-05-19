let totalProductSum = 0;
let totalSum = 0;

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const fileEncoding = "utf8";
const inputDelimiterRegex = /\s|,/;

const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);
const numericStringValues = rawInputContent.split(inputDelimiterRegex);

let originalMaxIndex = numericStringValues.length - 1;
let loopCounter = originalMaxIndex;

while (true) {
    const jPreDecrementCondition = loopCounter;
    loopCounter--;
    if (!jPreDecrementCondition) {
        break;
    }

    const innerLoopIndex = loopCounter;
    loopCounter--;
    const currentNumericValue = Number(numericStringValues[innerLoopIndex]);
    
    totalSum += currentNumericValue;
    
    totalProductSum += currentNumericValue * Number(numericStringValues[loopCounter]);
}

const roundHalfUpTruncate = (value) => {
    return ~~(value + 0.5);
};

const divisorForAverage = originalMaxIndex * 2;
const finalAverageResult = roundHalfUpTruncate(totalSum / divisorForAverage);

console.log(totalProductSum + '\n' + finalAverageResult);
