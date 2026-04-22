const acquireData = require('node:fs').readFileSync;
const textData = acquireData(0, 'utf8');

const transformTextToNumbers = (textSegment) => {
    return textSegment.split('\n').map(s => s.trim()).filter(Boolean).map(Number);
};

const numericCollection = transformTextToNumbers(textData);

function* createBlockIterator(sourceNumbers) {
    let currentPosition = 0;
    while (currentPosition < sourceNumbers.length) {
        const blockDimension = sourceNumbers[currentPosition];
        if (blockDimension === 0) {
            break;
        }
        const blockContent = sourceNumbers.slice(currentPosition + 1, currentPosition + 1 + blockDimension);
        yield { count: blockDimension, values: blockContent };
        currentPosition += (1 + blockDimension);
    }
}

for (const currentChunk of createBlockIterator(numericCollection)) {
    const sourceElements = currentChunk.values;

    const resultantSequence = sourceElements.reduce((accumulatedSequence, currentVal, currentIdx) => {
        if (currentIdx % 2 === 0) {
            return [...accumulatedSequence, currentVal];
        } else {
            const lastElementInAccumulated = accumulatedSequence[accumulatedSequence.length - 1];
            if (lastElementInAccumulated === currentVal) {
                return [...accumulatedSequence, currentVal];
            } else {
                const effectiveFillBoundary = accumulatedSequence.reduceRight((foundIdx, sequenceVal, sequenceIdx) => 
                    (foundIdx === -1 && sequenceVal === currentVal) ? sequenceIdx : foundIdx, 
                -1);

                const unaffectedPrefix = accumulatedSequence.slice(0, effectiveFillBoundary + 1);
                const elementsToPropagate = Array(accumulatedSequence.length - (effectiveFillBoundary + 1)).fill(currentVal);
                return [...unaffectedPrefix, ...elementsToPropagate, currentVal];
            }
        }
    }, []);

    const nullValueCount = resultantSequence.filter(val => val === 0).length;
    console.log(nullValueCount);
}