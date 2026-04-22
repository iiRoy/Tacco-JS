let receivedTextualData = acquireUserInputString();

const TARGET_DIGIT_CHARACTER = '7';

function doesNumberContainDigit(rawStringValue, desiredDigit) {
    let convertedNumericForm = parseInt(rawStringValue, 10);

    if (Number.isNaN(convertedNumericForm)) {
        return false;
    }

    let numericValueAsString = String(convertedNumericForm);

    let isDigitPresent = numericValueAsString.includes(desiredDigit);

    return isDigitPresent;
}

let finalResultIndicator = doesNumberContainDigit(receivedTextualData, TARGET_DIGIT_CHARACTER);

console.log(finalResultIndicator);