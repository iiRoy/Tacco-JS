"use strict";

const processInput = (inputData) => {
    const [firstLine] = inputData.trim().split('\n');
    const [countVal, startVal] = firstLine.split(' ').map(Number);

    let excludedValue;
    if (startVal >= 0) {
        excludedValue = startVal;
    } else if (startVal + countVal - 1 <= 0) {
        excludedValue = startVal + countVal - 1;
    } else {
        excludedValue = 0;
    }

    const totalSum = (countVal / 2) * (startVal + (startVal + countVal - 1));

    console.log(totalSum - excludedValue);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
