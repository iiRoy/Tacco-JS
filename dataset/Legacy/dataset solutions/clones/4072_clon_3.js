const fileSourcePath = '/dev/stdin';
const fileEncoding = 'utf8';
const parseRadix = 10;
const charToStrip = ' ';
const positiveResult = 'Yes';
const negativeResult = 'No';

function obtainFileContent(path, encoding) {
    return require('fs').readFileSync(path, encoding);
}

function processStringForParsing(inputStr, charToRemove) {
    return inputStr.replace(charToRemove, '');
}

function convertStringToNumeric(strValue, radix) {
    return parseInt(strValue, radix);
}

function deriveSquareRoot(value) {
    return Math.sqrt(value);
}

function isValueAnInteger(num) {
    return Number.isInteger(num);
}

const rawContent = obtainFileContent(fileSourcePath, fileEncoding);
const processedContent = processStringForParsing(rawContent, charToStrip);
const targetNumber = convertStringToNumeric(processedContent, parseRadix);
const calculatedRoot = deriveSquareRoot(targetNumber);
const isRootInteger = isValueAnInteger(calculatedRoot);

const finalOutput = isRootInteger ? positiveResult : negativeResult;

console.log(finalOutput);
