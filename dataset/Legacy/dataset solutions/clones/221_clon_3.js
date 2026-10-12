const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const whitespaceDelimiter = /\s/;
const innerLoopIterations = 9;
const outputDecimalPlaces = 8;
const multiplicationFactor = 2;
const divisionFactor = 3;

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");
const inputTokens = rawInputContent.split(whitespaceDelimiter);

let currentTokenIndex = 0;
let processingToken;

while (true) {
    processingToken = inputTokens[currentTokenIndex++];
    if (processingToken === undefined) {
        break;
    }

    const initialNumericValue = +processingToken;
    let runningSum = initialNumericValue;
    let valueToModify = initialNumericValue;

    for (let iteration = 0; iteration < innerLoopIterations; iteration++) {
        const currentKValue = innerLoopIterations - iteration;

        if (currentKValue % multiplicationFactor !== 0) {
            valueToModify *= multiplicationFactor;
        } else {
            valueToModify /= divisionFactor;
        }
        runningSum += valueToModify;
    }
    console.log(runningSum.toFixed(outputDecimalPlaces));
}
