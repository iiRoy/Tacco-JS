const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = inputContent.split('\n');

const processingState = {
    highestNumericString: '',
    lowestNumericString: '',
    encounteredFirstValidNumber: false,
    containsEmptyLine: false,
    containsNonNumericLine: false
};

const finalState = lineSegments.reduce((accumulator, currentSegment) => {
    if (currentSegment === '') {
        accumulator.containsEmptyLine = true;
        return accumulator;
    }

    const numericValue = Number(currentSegment);

    if (isNaN(numericValue)) {
        accumulator.containsNonNumericLine = true;
        return accumulator;
    }

    if (!accumulator.encounteredFirstValidNumber) {
        accumulator.highestNumericString = currentSegment;
        accumulator.lowestNumericString = currentSegment;
        accumulator.encounteredFirstValidNumber = true;
    } else {
        if (numericValue > Number(accumulator.highestNumericString)) {
            accumulator.highestNumericString = currentSegment;
        }
        if (numericValue < Number(accumulator.lowestNumericString)) {
            accumulator.lowestNumericString = currentSegment;
        }
    }
    return accumulator;
}, processingState);

let resultMaxOperand;
let resultMinOperand;

if (finalState.containsNonNumericLine || !finalState.encounteredFirstValidNumber) {
    resultMaxOperand = NaN;
    resultMinOperand = NaN;
} else {
    resultMaxOperand = parseFloat(finalState.highestNumericString);
    resultMinOperand = finalState.containsEmptyLine ? parseFloat('') : parseFloat(finalState.lowestNumericString);
}

console.log((resultMaxOperand - resultMinOperand).toFixed(2));
