const isDevelopmentMode = false;

const STANDARD_INPUT_FILE_PATH = '/dev/stdin';

const createDevInputReader = function () {
    const mockInputReader = function () {
        return '431 321';
    };
    return mockInputReader;
};

const createProdInputReader = function () {
    const fileSystemModule = require('fs');
    const fileInputReader = function (optionalLogText) {
        if (optionalLogText) console.log(optionalLogText);
        return fileSystemModule.readFileSync(STANDARD_INPUT_FILE_PATH, 'utf8');
    };
    return fileInputReader;
};

const determineActiveInputSource = (isDevMode) => {
    return isDevMode ? createDevInputReader() : createProdInputReader();
};

const activeInputSource = determineActiveInputSource(isDevelopmentMode);

const rawInputString = activeInputSource();
const inputLines = rawInputString.split('\n');

const parseLineToInt = (lineContent) => {
    return parseInt(lineContent.trim(), 10);
};

const parsedNumericInputs = inputLines.map(parseLineToInt);

const firstValue = parsedNumericInputs[0];
const secondValue = parsedNumericInputs[1];

const divisionRemainder = firstValue % secondValue;

let outputResult;

if (divisionRemainder === 0) {
    outputResult = -1;
} else {
    outputResult = firstValue;
}

console.log(outputResult);
