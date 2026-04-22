'use strict'

const calculateOutcome = (fullInputText) => {
    let numOneStr = '';
    let numTwoStr = '';

    const newlinePosition = fullInputText.indexOf('\n');
    let primaryLineContent;
    let secondaryContent;

    if (newlinePosition !== -1) {
        primaryLineContent = fullInputText.substring(0, newlinePosition);
        secondaryContent = fullInputText.substring(newlinePosition + 1);
    } else {
        primaryLineContent = fullInputText;
        secondaryContent = '';
    }

    let primaryLineScanIndex = 0;
    while (primaryLineScanIndex < primaryLineContent.length && /\s/.test(primaryLineContent[primaryLineScanIndex])) {
        primaryLineScanIndex++;
    }

    while (primaryLineScanIndex < primaryLineContent.length && /\d/.test(primaryLineContent[primaryLineScanIndex])) {
        numOneStr += primaryLineContent[primaryLineScanIndex];
        primaryLineScanIndex++;
    }

    let secondaryLineScanIndex = 0;
    while (secondaryLineScanIndex < secondaryContent.length && /\s/.test(secondaryContent[secondaryLineScanIndex])) {
        secondaryLineScanIndex++;
    }

    while (secondaryLineScanIndex < secondaryContent.length && /\d/.test(secondaryContent[secondaryLineScanIndex])) {
        numTwoStr += secondaryContent[secondaryLineScanIndex];
        secondaryLineScanIndex++;
    }

    const firstOperandValue = numOneStr.length > 0 ? Number(numOneStr) : NaN;
    const secondOperandValue = numTwoStr.length > 0 ? Number(numTwoStr) : NaN;

    const finalResult = Math.pow(firstOperandValue, 2) - secondOperandValue;

    console.log(finalResult);
};

calculateOutcome(require('fs').readFileSync('/dev/stdin', 'utf8'));