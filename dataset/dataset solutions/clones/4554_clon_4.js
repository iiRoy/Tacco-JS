"use strict";

const processInput = (inputData) => {
    const numericComponents = inputData.match(/\d+/g);
    const [valN, valA, valB] = numericComponents.map(Number);

    const finalResult = (valA > valB)
        ? 0
        : (valN === 1)
            ? (valA === valB ? 1 : 0)
            : (valA - valB) * (2 - valN) + 1;

    console.log(finalResult);
};

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
