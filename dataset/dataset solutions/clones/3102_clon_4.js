"use strict";

const processInputAndCompute = (sourceText) => {
    const numericData = sourceText.match(/\d+/g).map(Number);
    const characterString = sourceText.match(/[A-Z]+/)[0];

    const sequenceLength = numericData[0];
    const queryQuantity = numericData[1];

    let numberCursor = 2;
    const queryRequests = Array.from({length: queryQuantity}, (_, i) => [
        numericData[numberCursor + i * 2],
        numericData[numberCursor + i * 2 + 1]
    ]);

    const charElements = characterString.split('');

    const cumulativeCounts = charElements.slice(0, sequenceLength)
        .reduce((accumulator, currentElement, elementIndex) => {
            if (elementIndex === 0) {
                accumulator.push(0);
            } else {
                let priorCount = accumulator[elementIndex - 1];
                let currentTotal = priorCount;
                if (charElements[elementIndex - 1] === 'A' && currentElement === 'C') {
                    currentTotal++;
                }
                accumulator.push(currentTotal);
            }
            return accumulator;
        }, []);

    const responseArray = queryRequests.map(bounds => {
        const [lowerIndex, upperIndex] = bounds;
        return cumulativeCounts[upperIndex - 1] - cumulativeCounts[lowerIndex - 1];
    });

    return responseArray.join('\n');
};

console.log(processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8')));