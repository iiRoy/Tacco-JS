const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputLines = rawInputData.trim().split('\n');
const numericValues = inputLines.map(Number);

let dataCursor = -1;
const ZERO_VALUE = 0;

while (true) {
    dataCursor++;
    const currentBlockSize = numericValues[dataCursor];

    if (currentBlockSize === ZERO_VALUE) {
        break;
    }

    const processedElements = [];
    let shouldAlternatePush = false;

    for (let elementIndex = 0; elementIndex < currentBlockSize; ++elementIndex) {
        dataCursor++;
        const currentElementValue = numericValues[dataCursor];
        let sequencePosition = elementIndex;

        shouldAlternatePush = !shouldAlternatePush;

        if (shouldAlternatePush) {
            processedElements.push(currentElementValue);
        } else {
            const lastProcessedElement = processedElements[processedElements.length - 1];
            if (lastProcessedElement === currentElementValue) {
                processedElements.push(currentElementValue);
            } else {
                processedElements.push(currentElementValue);
                sequencePosition--;

                while (sequencePosition >= ZERO_VALUE && processedElements[sequencePosition] !== currentElementValue) {
                    processedElements[sequencePosition] = currentElementValue;
                    sequencePosition--;
                }
            }
        }
    }

    const zeroOccurrences = processedElements.filter(val => val === ZERO_VALUE).length;
    console.log(zeroOccurrences);
}
