const RADIX_DECIMAL = 10;
const SUCCESS_MESSAGE = 'OK';

function parseNumericValue(valueString) {
    return parseInt(valueString, RADIX_DECIMAL);
}

function extractRangeBounds(rangeString) {
    const rangeParts = rangeString.split(" ");
    const lower = parseNumericValue(rangeParts[0]);
    const upper = parseNumericValue(rangeParts[1]);
    return { lower, upper };
}

function processInputData(rawInputString) {
    const linesArray = rawInputString.split("\n");

    const divisorVal = parseNumericValue(linesArray[0]);
    const { lowerBound, upperBound } = extractRangeBounds(linesArray[1]);

    if (lowerBound === upperBound) {
        console.log(SUCCESS_MESSAGE);
    } else {
        for (let currentNum = lowerBound; currentNum <= upperBound; currentNum++) {
            if (currentNum % divisorVal === 0) {
                console.log(SUCCESS_MESSAGE);
            }
            // The original `else if (i === B && B % K === 0)` branch is unreachable
            // because if `B % K === 0`, then when `currentNum` equals `upperBound`,
            // the condition `currentNum % divisorVal === 0` would be true,
            // causing the `if` block to execute. Therefore, this `else if`
            // is dead code and has been removed to simplify the structure.
        }
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
