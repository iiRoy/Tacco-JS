const fileSystemUtility = require('fs');
const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputContent.trim().split('\n');

const _ = processedLines.shift();
const initialSequence = processedLines.shift();

const cleanedSequence = initialSequence.replace(/ /g, '');

const evaluateLogicalImplication = (firstOperand, secondOperand) => {
    const isFirstTrue = (firstOperand === 'T');
    const isSecondTrue = (secondOperand === 'T');
    const resultBoolean = (!isFirstTrue || isSecondTrue);
    return resultBoolean ? 'T' : 'F';
};

const sequenceElements = cleanedSequence.split('');

if (sequenceElements.length === 0) {
    console.log('');
} else if (sequenceElements.length === 1) {
    console.log(sequenceElements[0]);
} else {
    const finalOutcome = sequenceElements.slice(1).reduce((currentResult, nextElement) => {
        return evaluateLogicalImplication(currentResult, nextElement);
    }, sequenceElements[0]);

    console.log(finalOutcome);
}