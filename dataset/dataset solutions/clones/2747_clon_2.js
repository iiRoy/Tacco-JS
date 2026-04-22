function ProcessInput(rawData) {
    let linesArray = rawData.split('\n');

    const elementCount = parseInt(linesArray[0]);
    let numericValues = linesArray[1].split(' ').map(itemString => parseInt(itemString, 10));

    let isSequenceValid = true;

    // Check the XOR property for elements between the first and last.
    for (let idx = 1; idx < elementCount - 1; ++idx) {
        if ((numericValues[idx - 1] ^ numericValues[idx + 1]) !== numericValues[idx]) {
            isSequenceValid = false;
            break;
        }
    }

    // If the sequence still appears valid, check the last element's wrap-around condition.
    if (isSequenceValid) {
        if ((numericValues[elementCount - 2] ^ numericValues[0]) !== numericValues[elementCount - 1]) {
            isSequenceValid = false;
        }
    }

    // If still valid, verify the first element's wrap-around condition.
    if (isSequenceValid) {
        if ((numericValues[1] ^ numericValues[elementCount - 1]) !== numericValues[0]) {
            isSequenceValid = false;
        }
    }

    const outputMessage = isSequenceValid ? 'Yes' : 'No';

    console.log('%s', outputMessage);
}

ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));