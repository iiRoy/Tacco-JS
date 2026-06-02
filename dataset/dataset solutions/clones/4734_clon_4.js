'use strict'

const processInputContent = (sourceData) => {
    const targetSequence = sourceData.split('\n')[0];
    let initialPosition = -1;
    let finalPosition;

    // Determine the index of the first 'A' character
    for (let currentIdx = 0; currentIdx < targetSequence.length; currentIdx++) {
        if (targetSequence[currentIdx] === 'A') {
            initialPosition = currentIdx;
            break;
        }
    }

    // Determine the 0-based index of the last 'Z' character
    let actualLastZIndex = -1;
    for (let currentIdx = targetSequence.length - 1; currentIdx >= 0; currentIdx--) {
        if (targetSequence[currentIdx] === 'Z') {
            actualLastZIndex = currentIdx;
            break;
        }
    }

    // Adjust the final position to match the original's calculation:
    // Original Zindex = strLen - strArrR.indexOf('Z')
    // If 'Z' is not found, strArrR.indexOf('Z') is -1, so Zindex = strLen + 1.
    // If 'Z' is found at 0-based index `k` in the original string,
    // it's at `strLen - 1 - k` in the reversed array.
    // So, strArrR.indexOf('Z') would be `strLen - 1 - k`.
    // Zindex = strLen - (strLen - 1 - k) = 1 + k.
    // This means Zindex is (last 0-based 'Z' index) + 1.
    if (actualLastZIndex !== -1) {
        finalPosition = actualLastZIndex + 1;
    } else {
        finalPosition = targetSequence.length + 1;
    }

    console.log(finalPosition - initialPosition);
};

processInputContent(require('fs').readFileSync('/dev/stdin', 'utf-8'));
