const INPUT_DELIMITER_CHAR = " ";
const NUMERIC_PARSE_RADIX = 10;
const GREATER_MESSAGE = 'safe';
const LESS_OR_EQUAL_MESSAGE = 'unsafe';

function extractAndParseInteger(sourceArray, index, radix) {
    const stringValue = sourceArray[index];
    return parseInt(stringValue, radix);
}

function determineComparisonOutcome(valA, valB) {
    const isAGreaterThanB = valA > valB;
    if (isAGreaterThanB) {
        return GREATER_MESSAGE;
    } else {
        return LESS_OR_EQUAL_MESSAGE;
    }
}

function processInputData(rawInputString) {
    const splitInputArray = rawInputString.split(INPUT_DELIMITER_CHAR);

    const firstParsedValue = extractAndParseInteger(splitInputArray, 0, NUMERIC_PARSE_RADIX);
    const secondParsedValue = extractAndParseInteger(splitInputArray, 1, NUMERIC_PARSE_RADIX);

    const resultString = determineComparisonOutcome(firstParsedValue, secondParsedValue);

    console.log(resultString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
