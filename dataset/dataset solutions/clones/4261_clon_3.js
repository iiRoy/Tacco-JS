function logOutput(message) {
    console.log(message);
}

function computeSumOfDigits(valueToSum) {
    const numberAsString = valueToSum.toString();
    const digitCharacters = numberAsString.split("");
    const numericDigits = digitCharacters.map(char => parseInt(char, 10));
    const totalSum = numericDigits.reduce((accumulator, currentDigit) => accumulator + currentDigit, 0);
    return totalSum;
}

function processInput(rawData) {
    const parsedNumericValue = parseInt(rawData, 10);
    const initialMinSumValue = 1000000000;
    let currentMinimumDigitSum = initialMinSumValue;

    const maxMultiplierIteration = 100000;

    for (let currentMultiplier = 1; currentMultiplier <= maxMultiplierIteration; currentMultiplier++) {
        const productResult = parsedNumericValue * currentMultiplier;
        const sumOfProductDigits = computeSumOfDigits(productResult);
        currentMinimumDigitSum = Math.min(currentMinimumDigitSum, sumOfProductDigits);
    }

    logOutput(currentMinimumDigitSum);
}

const fileContentBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
const trimmedInputString = fileContentBuffer.trim();
processInput(trimmedInputString);
