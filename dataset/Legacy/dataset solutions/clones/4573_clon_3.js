process.stdin.resume();
process.stdin.setEncoding('utf8');

const parseNumericValue = (inputString) => {
    return parseInt(inputString, 10);
};

const checkValueWithinInclusiveBounds = (valueToTest, lowerLimit, upperLimit) => {
    const isAboveOrEqualLower = valueToTest >= lowerLimit;
    const isBelowOrEqualUpper = valueToTest <= upperLimit;
    return isAboveOrEqualLower && isBelowOrEqualUpper;
};

const handleIncomingData = (inputBuffer) => {
    const dataDelimiter = ' ';
    const stringSegments = inputBuffer.toString().split(dataDelimiter);

    const firstParsedNumber = parseNumericValue(stringSegments[0]);
    const secondParsedNumber = parseNumericValue(stringSegments[1]);
    const thirdParsedNumber = parseNumericValue(stringSegments[2]);

    const rangeMinimum = firstParsedNumber;
    const rangeMaximum = secondParsedNumber;
    const valueToVerify = thirdParsedNumber;

    const conditionSatisfied = checkValueWithinInclusiveBounds(valueToVerify, rangeMinimum, rangeMaximum);

    const resultOutput = conditionSatisfied ? "Yes" : "No";
    console.log(resultOutput);
};

process.stdin.on('data', handleIncomingData);
