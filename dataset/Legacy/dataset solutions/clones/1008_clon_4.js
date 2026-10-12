const ioSettings = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

const fileContent = require('fs').readFileSync(ioSettings.sourcePath, 'utf-8');
const inputLines = fileContent.split(ioSettings.lineDelimiter);

const performSortAndCountSwaps = (numericSequence) => {
    let swapCounter = 0;

    numericSequence.forEach((_val, outerIndex, fullSequence) => {
        let smallestElementIndex = outerIndex;

        const remainingSegment = fullSequence.slice(outerIndex);
        
        const relativeMinimumOffset = remainingSegment.reduce((currentMinRelativeIdx, segmentValue, segmentRelativeIdx) => {
            if (segmentValue < fullSequence[outerIndex + currentMinRelativeIdx]) {
                return segmentRelativeIdx;
            }
            return currentMinRelativeIdx;
        }, 0);

        smallestElementIndex = outerIndex + relativeMinimumOffset;

        if (outerIndex !== smallestElementIndex) {
            [fullSequence[outerIndex], fullSequence[smallestElementIndex]] = [fullSequence[smallestElementIndex], fullSequence[outerIndex]];
            swapCounter++;
        }
    });
    
    console.log(numericSequence.map(elementValue => elementValue.toString()).join(' '));

    return swapCounter;
};

const numbersToProcess = inputLines[1].split(' ').map(strVal => parseInt(strVal, 10));

console.log(performSortAndCountSwaps(numbersToProcess));
