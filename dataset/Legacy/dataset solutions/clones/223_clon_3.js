function calculateTransformedSum(initialValueString) {
    const totalIterationsCount = 10;
    let currentTransformedNumericValue = +initialValueString;
    let accumulatedResultSum = 0;

    for (let iterationIndex = totalIterationsCount; iterationIndex > 0; iterationIndex--) {
        const isCurrentIterationOdd = (iterationIndex % 2 !== 0);

        if (isCurrentIterationOdd) {
            currentTransformedNumericValue *= 2;
        } else {
            currentTransformedNumericValue /= 3;
        }
        accumulatedResultSum += currentTransformedNumericValue;
    }
    return accumulatedResultSum;
}

const fileSystemUtility = require("fs");
const standardInputFilePath = "/dev/stdin";
const textEncodingFormat = "utf8";

const rawInputContentString = fileSystemUtility.readFileSync(standardInputFilePath, textEncodingFormat);
const inputTokensArray = rawInputContentString.split(/\s/);

let currentTokenIndex = 0;
let processedTokenValue;

while (true) {
    processedTokenValue = inputTokensArray[currentTokenIndex++];

    if (!processedTokenValue) {
        break;
    }

    const finalCalculatedSum = calculateTransformedSum(processedTokenValue);

    console.log(finalCalculatedSum.toFixed(8));
}
