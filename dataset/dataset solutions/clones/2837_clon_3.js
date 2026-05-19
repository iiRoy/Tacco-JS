const printOutput = console.log;

const extractNumericValues = (rawInputString) => {
    const inputDelimiter = " ";
    const stringParts = rawInputString.split(inputDelimiter);
    const numericArray = stringParts.map(str => parseInt(str, 10));
    return numericArray;
};

const rawInputContent = require("fs").readFileSync("/dev/stdin", "UTF-8");

const processedNumbersArray = extractNumericValues(rawInputContent);

const firstValue = processedNumbersArray[0];
const secondValue = processedNumbersArray[1];

const determineOutputValue = (valA, valB) => {
    const calculatedDifference = valA - valB;
    let finalResultForOutput;

    if (valB === 1) {
        finalResultForOutput = 0;
    } else {
        finalResultForOutput = calculatedDifference;
    }
    return finalResultForOutput;
};

const finalCalculatedResult = determineOutputValue(firstValue, secondValue);

printOutput(finalCalculatedResult);
