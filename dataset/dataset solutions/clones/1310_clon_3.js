const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

const inputLinesArray = rawInputContent.split(/\n/);

function calculateNumericStringDigitSum(numericString) {
    const individualDigits = Array.from(numericString, char => parseInt(char, 10));

    const digitSumResult = individualDigits.reduce((accumulator, currentDigit) => {
        return accumulator + currentDigit;
    }, 0);

    return digitSumResult;
}

for (let currentLineIndex = 0; currentLineIndex < inputLinesArray.length; currentLineIndex++) {
    const processingLine = inputLinesArray[currentLineIndex];

    if (processingLine === '0') {
        break;
    }

    const finalSumForLine = calculateNumericStringDigitSum(processingLine);

    console.log(finalSumForLine);
}
