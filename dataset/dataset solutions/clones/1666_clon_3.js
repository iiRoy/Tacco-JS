function calculateDivisibleCount(rawInputString) {
    const parseNumericValue = (strValue) => {
        return parseInt(strValue, 10);
    };

    const cleanedInput = rawInputString.trim();
    const inputLineSegments = cleanedInput.split('\n');

    const primaryInputLine = inputLineSegments[0];
    const numericStringParts = primaryInputLine.split(' ');

    const lowerBoundary = parseNumericValue(numericStringParts[0]);
    const upperBoundary = parseNumericValue(numericStringParts[1]);
    const targetDivisor = parseNumericValue(numericStringParts[2]);

    const isNumberDivisible = (num, divisor) => {
        return num % divisor === 0;
    };

    let totalDivisibleNumbers = 0;

    for (let currentIterationNumber = lowerBoundary; currentIterationNumber <= upperBoundary; currentIterationNumber++) {
        if (isNumberDivisible(currentIterationNumber, targetDivisor)) {
            totalDivisibleNumbers += 1;
        }
    }

    console.log(totalDivisibleNumbers);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const inputEncoding = "utf8";

const inputContent = fileSystemModule.readFileSync(standardInputPath, inputEncoding);
calculateDivisibleCount(inputContent);
