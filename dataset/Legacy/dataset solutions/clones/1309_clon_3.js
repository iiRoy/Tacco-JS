const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const lineArray = rawInputData.split('\n');

const TERMINATION_VALUE_STRING = '0';
const collectedSums = [];

const calculateDigitsSum = (numericString) => {
    const digitCharacters = numericString.split('');
    const parsedDigits = digitCharacters.map(char => parseInt(char, 10));
    const totalSumOfDigits = parsedDigits.reduce((accumulator, currentDigitValue) => accumulator + currentDigitValue, 0);
    return totalSumOfDigits;
};

for (let currentLineIndex = 0; currentLineIndex < lineArray.length; currentLineIndex++) {
    const activeLineContent = lineArray[currentLineIndex];

    if (activeLineContent === TERMINATION_VALUE_STRING) {
        break;
    }

    const lineDigitSum = calculateDigitsSum(activeLineContent);
    collectedSums.push(lineDigitSum);
}

const finalOutputString = collectedSums.join('\n').trim();
console.log(finalOutputString);
