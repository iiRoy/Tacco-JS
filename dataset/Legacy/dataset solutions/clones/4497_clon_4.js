'use strict';

function processSequence(inputData) {
    const parsedLines = inputData.split('\n').map(segment => segment.split(' '));
    const totalElements = parseInt(parsedLines[0][0], 10);
    const sourceElements = parsedLines[1];

    const resultElements = sourceElements.slice(1, totalElements).reduce((currentAccumulator, currentItem, iterationIndex) => {
        const originalPosition = iterationIndex + 1;
        const totalParity = totalElements % 2;
        const currentParity = originalPosition % 2;

        if (currentParity === totalParity) {
            currentAccumulator.push(currentItem);
        } else {
            currentAccumulator.unshift(currentItem);
        }
        return currentAccumulator;
    }, [sourceElements[0]]);

    console.log(resultElements.join(' '));
}

processSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
