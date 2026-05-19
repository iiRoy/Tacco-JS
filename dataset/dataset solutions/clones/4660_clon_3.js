const parseNumericStringData = (sourceString) => {
    const cleanedString = sourceString.trim();
    const stringSegments = cleanedString.split(" ");
    const numericalArray = stringSegments.map(Number);
    return numericalArray;
};

function processInputData(rawDataContent) {
    const numericValues = parseNumericStringData(rawDataContent);

    const firstElement = numericValues[0];
    const secondElement = numericValues[1];

    const totalSum = firstElement + secondElement;

    const MODULO_CONSTANT = 24;
    const finalCalculatedValue = totalSum % MODULO_CONSTANT;

    console.log(finalCalculatedValue);
}

const fileSystemUtility = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileBufferContent = fileSystemUtility.readFileSync(standardInputFilePath, 'utf8');

processInputData(fileBufferContent);
