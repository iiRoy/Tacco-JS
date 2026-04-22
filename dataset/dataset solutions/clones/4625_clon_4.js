const { readFileSync: dataReader } = require('node:fs');
const sourceIdentifier = '/dev/stdin';
const entireInputBuffer = dataReader(sourceIdentifier, 'utf8');

const lineBreaks = [];
for (let charPointer = 0; charPointer < entireInputBuffer.length; charPointer++) {
    if (entireInputBuffer[charPointer] === '\n') {
        lineBreaks.push(charPointer);
    }
}

const relevantLineStart = lineBreaks[0] + 1;
const relevantLineEnd = lineBreaks[1];
const targetStringContent = entireInputBuffer.substring(relevantLineStart, relevantLineEnd);

const numericalComponents = targetStringContent.split(' ').filter(segment => segment.length > 0).map(strVal => +strVal);

const processSequenceWithInitialState = (startingCondition) => {
    let cumulativeValue = 0;
    let totalModifications = 0;
    let currentProcessingState = startingCondition ? 'expect_negative' : 'expect_positive';

    const processingStrategies = {
        'expect_negative': (itemValue) => {
            cumulativeValue += itemValue;
            if (cumulativeValue >= 0) {
                totalModifications += (1 + cumulativeValue);
                cumulativeValue = -1;
            }
            currentProcessingState = 'expect_positive';
        },
        'expect_positive': (itemValue) => {
            cumulativeValue += itemValue;
            if (cumulativeValue <= 0) {
                totalModifications += (1 - cumulativeValue);
                cumulativeValue = 1;
            }
            currentProcessingState = 'expect_negative';
        }
    };

    let currentItemIndex = 0;
    while (currentItemIndex < numericalComponents.length) {
        const currentItem = numericalComponents[currentItemIndex];
        processingStrategies[currentProcessingState](currentItem);
        currentItemIndex++;
    }

    return totalModifications;
};

const resultForPositiveStart = processSequenceWithInitialState(false);
const resultForNegativeStart = processSequenceWithInitialState(true);
console.log(Math.min(resultForPositiveStart, resultForNegativeStart));