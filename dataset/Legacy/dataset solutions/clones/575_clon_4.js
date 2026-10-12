var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = input.trim().split("\n").map(Number);

function propagateValueBackward(sequenceState, valueToPropagate) {
    let searchPosition = sequenceState.length - 2; // Start search from the element just before the last one
    while (searchPosition >= 0 && sequenceState[searchPosition] !== valueToPropagate) {
        searchPosition--;
    }
    const fillStartBoundary = searchPosition < 0 ? 0 : searchPosition + 1;
    const updatedSequence = [...sequenceState]; // Create a new array to avoid direct mutation of the reducer's accumulator
    for (let k = fillStartBoundary; k < updatedSequence.length - 1; k++) {
        updatedSequence[k] = valueToPropagate;
    }
    return updatedSequence;
}

while (true) {
    const blockSize = dataLines.shift();
    if (blockSize === 0) break;

    const blockElements = Array.from({ length: blockSize }, () => dataLines.shift());

    const finalProcessedElements = blockElements.reduce((accumulatorArray, currentElementValue, elementPosition) => {
        const oneBasedPosition = elementPosition + 1;
        if (oneBasedPosition % 2 === 1) { // Odd position (1st, 3rd, 5th, etc.)
            return [...accumulatorArray, currentElementValue];
        } else { // Even position (2nd, 4th, 6th, etc.)
            if (accumulatorArray.length > 0 && accumulatorArray[accumulatorArray.length - 1] === currentElementValue) {
                return [...accumulatorArray, currentElementValue];
            } else {
                // Value is different from the previous one at an even position, trigger backward propagation
                const tempAccumulator = [...accumulatorArray, currentElementValue]; // Append current value first
                return propagateValueBackward(tempAccumulator, currentElementValue);
            }
        }
    }, []);

    const zeroOccurrences = finalProcessedElements.filter(item => item === 0).length;
    console.log(zeroOccurrences);
}
