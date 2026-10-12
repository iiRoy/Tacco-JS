const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const trimmedInput = rawInputData.trim();

const inputLines = trimmedInput.split('\n');

let totalSum = 0;

const calculateLineSum = (lineContent) => {
    const numberStrings = lineContent.split(/\D+/);
    const currentLineNumericSum = numberStrings.reduce((accumulator, currentNumberString) => {
        const numericValue = Number(currentNumberString);
        return accumulator + numericValue;
    }, 0);
    return currentLineNumericSum;
};

let currentLineSegment;
while ((currentLineSegment = inputLines.shift()) !== undefined && currentLineSegment !== null) {
    const lineContribution = calculateLineSum(currentLineSegment);
    totalSum = totalSum + lineContribution;
}

console.log(totalSum);
