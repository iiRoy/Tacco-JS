var rawInput = readline();

function getNumericValue(inputString) {
    return parseInt(inputString);
}

function convertNumberToString(num) {
    return num.toString();
}

function doesStringContainDigit(sourceStr, digitToFind) {
    var digitChar = String(digitToFind);
    var foundPosition = sourceStr.indexOf(digitChar);
    return foundPosition >= 0;
}

var parsedNumber = getNumericValue(rawInput);
var numberAsString = convertNumberToString(parsedNumber);
var result = doesStringContainDigit(numberAsString, 7);

console.log(result);
