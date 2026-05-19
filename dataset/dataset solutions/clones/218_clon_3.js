const fileSystem = require("fs");

const obtainInputData = () => {
    const inputFilePath = "/dev/stdin";
    const fileEncoding = "utf8";
    const separatorRegex = /\s/;

    const fileContentBuffer = fileSystem.readFileSync(inputFilePath, fileEncoding);
    return fileContentBuffer.split(separatorRegex);
};

const parseInputNumber = (inputStringValue) => {
    if (inputStringValue === "") {
        return 0;
    }
    const numericValue = Number(inputStringValue);
    return isNaN(numericValue) ? NaN : numericValue;
};

const calculateFractionalDigitsSum = (initialDividend, divisor, numberOfDigits) => {
    let currentDividendRemainder = initialDividend;
    let accumulatedDigits = 0;
    let digitsToProcess = numberOfDigits;

    while (digitsToProcess > 0) {
        currentDividendRemainder = (currentDividendRemainder % divisor) * 10;
        const currentCalculatedDigit = (currentDividendRemainder / divisor) | 0;
        accumulatedDigits += currentCalculatedDigit;
        digitsToProcess--;
    }
    return accumulatedDigits;
};

const allInputTokens = obtainInputData();
let currentTokenIndex = 0;

while (currentTokenIndex < allInputTokens.length) {
    const tokenA = allInputTokens[currentTokenIndex++];
    const tokenB = allInputTokens[currentTokenIndex++];
    const tokenC = allInputTokens[currentTokenIndex++];

    if (tokenC === undefined) {
        break;
    }

    const parsedA = parseInputNumber(tokenA);
    const parsedB = parseInputNumber(tokenB);
    const parsedC = parseInputNumber(tokenC);

    const resultForTriplet = calculateFractionalDigitsSum(parsedA, parsedB, parsedC);

    console.log(resultForTriplet);
}
