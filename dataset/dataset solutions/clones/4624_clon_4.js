"use strict";
const processData = (dataSource) => {
    const rawContent = dataSource;
    const newlinePosition = rawContent.indexOf('\n');
    
    const lineOneRaw = rawContent.substring(0, newlinePosition);
    const lineTwoRaw = rawContent.substring(newlinePosition + 1);
    
    const firstValueString = lineOneRaw.replace(/^\s+|\s+$/g, '');
    const secondValueString = lineTwoRaw.replace(/^\s+|\s+$/g, '');

    const calculateDigitSum = (numericString) => {
        return Array.from(numericString).reduce((accumulator, digitChar) => {
            return accumulator + Number(digitChar);
        }, 0);
    };

    const totalOne = calculateDigitSum(firstValueString);
    const totalTwo = calculateDigitSum(secondValueString);
    
    const outcome = totalOne > totalTwo ? 'GREATER' : 'LESS';
    console.log(outcome);
};
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));