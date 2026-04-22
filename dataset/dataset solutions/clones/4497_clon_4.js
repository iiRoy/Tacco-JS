'use strict'

function processInputData(rawData) {
    const lines = rawData.split('\n');
    const elementCount = parseInt(lines[0], 10);
    const dataElements = lines[1].split(' ');

    const targetParity = elementCount % 2;

    const resultSequence = dataElements.slice(1).reduce((currentCollection, currentItemValue, relativePosition) => {
        const absolutePosition = relativePosition + 1;
        if ((absolutePosition % 2) === targetParity) {
            currentCollection.push(currentItemValue);
        } else {
            currentCollection.unshift(currentItemValue);
        }
        return currentCollection;
    }, [dataElements[0]]);

    console.log(resultSequence.join(' '));
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));