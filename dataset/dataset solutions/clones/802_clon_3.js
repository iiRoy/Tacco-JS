function parseNumbersFromLine(lineContent) {
    return lineContent.split(" ").map(Number);
}

function calculateDiscountedSum(initialSum, discountRate) {
    const discountFactor = (100 - discountRate) / 100;
    return initialSum * discountFactor;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineData = rawData.trim().split("\n");

let currentLineIndex = 0;

while (true) {
    const paramsLine = lineData[currentLineIndex++];
    const params = parseNumbersFromLine(paramsLine);

    const numEntries = params[0];
    const targetIndex = params[1] - 1;
    const discountPercentage = params[2];

    if (numEntries === 0 && targetIndex === -1 && discountPercentage === 0) {
        break;
    }

    const valuesArray = [];
    let initialSumOfWeightedValues = 0;

    for (let idx = 0; idx < numEntries; idx++) {
        const valueStr = lineData[currentLineIndex++];
        const numericValue = parseInt(valueStr, 10);
        valuesArray.push(numericValue);
        initialSumOfWeightedValues += (numericValue * 100);
    }

    const effectiveSum = calculateDiscountedSum(initialSumOfWeightedValues, discountPercentage);

    let finalResult = 0;
    const divisorValue = valuesArray[targetIndex];

    if (divisorValue !== 0) {
        finalResult = Math.floor(effectiveSum / divisorValue);
    }

    console.log(finalResult);
}
