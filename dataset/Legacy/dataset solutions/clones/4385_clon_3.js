'use strict';

function processInputData(rawData) {
    const NEWLINE_DELIMITER = '\n';
    const VALUE_DELIMITER = ' ';

    const dataLines = rawData.split(NEWLINE_DELIMITER);
    const numberStringArray = dataLines[1].split(VALUE_DELIMITER);
    const numberSequence = numberStringArray.map(str => Number(str));

    let swapOperationsCount = 0;

    for (let currentIndex = 0; currentIndex < numberSequence.length; currentIndex++) {
        const targetValueForPosition = currentIndex + 1;

        if (numberSequence[currentIndex] === targetValueForPosition) {
            const nextElementIndex = currentIndex + 1;
            const previousElementIndex = currentIndex - 1;

            const valueAtNextPosition = numberSequence[nextElementIndex];

            if (valueAtNextPosition) { // Checks if next element exists and is truthy (not 0 or undefined)
                // Perform a swap with the element at the next position
                const currentElementOriginalValue = numberSequence[currentIndex];
                numberSequence[currentIndex] = valueAtNextPosition;
                numberSequence[nextElementIndex] = currentElementOriginalValue;
                swapOperationsCount++;
            } else {
                // This branch is taken if nextElementIndex is out of bounds or valueAtNextPosition is 0.
                // In this case, swap with the element at the previous position.
                const currentElementOriginalValue = numberSequence[currentIndex];
                const valueAtPreviousPosition = numberSequence[previousElementIndex];
                numberSequence[currentIndex] = valueAtPreviousPosition;
                numberSequence[previousElementIndex] = currentElementOriginalValue;
                swapOperationsCount++;
            }
        }
    }
    console.log(swapOperationsCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
