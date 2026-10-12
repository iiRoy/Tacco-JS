"use strict";

const processInput = (rawInputContent) => {
    const inputNumber = Number(rawInputContent.trim().split("\n")[0]);

    if (inputNumber < 100) {
        console.log(0);
        return;
    }

    const lastTwoDigits = inputNumber % 100;

    if (lastTwoDigits === 0) {
        console.log(1);
        return;
    }

    const necessaryOperations = (lastTwoDigits === 1)
        ? 2
        : Math.ceil(lastTwoDigits / 5);

    const availableHundreds = Math.floor(inputNumber / 100);

    const finalOutcome = (necessaryOperations <= availableHundreds) ? 1 : 0;

    console.log(finalOutcome);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
