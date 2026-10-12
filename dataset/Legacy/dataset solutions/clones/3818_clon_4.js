const fileSystem = require('fs');

function* numericTokenIterator(sourceText) {
    const rawTokens = sourceText.trim().split(/\s+/g);
    for (const currentToken of rawTokens) {
        yield parseInt(currentToken, 10);
    }
}

function analyzeNumericSequence(sequenceData) {
    if (sequenceData[0] !== 0) {
        console.log(-1);
        return;
    }

    const sequenceReducer = (accumulator, currentElement) => {
        if (accumulator.hasError) {
            return accumulator;
        }

        const priorElement = accumulator.lastValue;

        if (priorElement <= currentElement) {
            const difference = currentElement - priorElement;
            if (difference > 1) {
                return { totalOperations: 0, lastValue: 0, hasError: true };
            } else if (difference === 1) {
                return { totalOperations: accumulator.totalOperations + 1, lastValue: currentElement, hasError: false };
            } else {
                return { totalOperations: accumulator.totalOperations + currentElement, lastValue: currentElement, hasError: false };
            }
        } else {
            return { totalOperations: accumulator.totalOperations + currentElement, lastValue: currentElement, hasError: false };
        }
    };

    const initialReductionState = { totalOperations: 0, lastValue: 0, hasError: false };

    const finalState = sequenceData.slice(1).reduce(sequenceReducer, initialReductionState);

    if (finalState.hasError) {
        console.log(-1);
    } else {
        console.log(finalState.totalOperations);
    }
}

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numberGenerator = numericTokenIterator(rawInputContent);

const sequenceLength = numberGenerator.next().value;
const numericArray = Array.from({ length: sequenceLength }, () => numberGenerator.next().value);

analyzeNumericSequence(numericArray);
